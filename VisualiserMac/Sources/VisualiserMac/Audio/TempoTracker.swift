import Foundation
import Accelerate

/// Estimates tempo from raw audio.
///
/// Works in audio time, not render time: samples are cut into fixed hops, each
/// hop gives one value of an onset envelope (spectral flux — how much louder
/// the spectrum got since the last hop, summed over frequency), and the tempo
/// is the period that envelope repeats at, found by autocorrelation over the
/// last few seconds.
///
/// Autocorrelation looks at every onset against every other, not just
/// neighbours, so syncopated kicks, missed hits and off-beat hats all still
/// line up on the beat period, where gaps between consecutive kicks don't.
final class TempoTracker {
    let sampleRate: Double

    private static let frameSize = 1024
    private static let hopSize = 512
    /// Envelope kept for the autocorrelation.
    private static let windowSeconds = 8.0
    /// Envelope needed before the first estimate.
    private static let warmupSeconds = 4.0
    /// Re-estimate this often.
    private static let analysisSeconds = 0.25
    private static let minBPM = 60.0
    private static let maxBPM = 200.0
    /// Tempos are folded towards this, a log-normal prior an octave wide,
    /// so a pulse that fits 64 and 128 equally well reads as 128.
    private static let preferredBPM = 120.0
    /// Below this (peak autocorrelation over energy) there's no steady pulse.
    private static let minConfidence: Float = 0.2
    /// Silence or no pulse for this long forgets the tempo.
    private static let timeout = 3.0
    /// Time-domain RMS below which a hop counts as silence.
    private static let gate: Float = 0.002

    private static let blur: [Float] = (-4...4).map { expf(-0.5 * Float($0 * $0) / 4) }

    private(set) var bpm: Double = 0
    private(set) var confidence: Float = 0

    private let fps: Double
    private let log2n: vDSP_Length
    private let fftSetup: FFTSetup
    private let window: [Float]
    private var frame: [Float]
    private var real: [Float]
    private var imag: [Float]
    private var mags: [Float]
    private var prevMags: [Float]
    /// Bins above this carry little rhythm and a lot of noise.
    private let maxBin: Int

    /// Samples waiting to fill the next frame.
    private var pending: [Float] = []

    private var envelope: [Float]
    private var envCount = 0
    private var hopsSinceAnalysis = 0
    private var quietHops = 0
    private var weakHops = 0

    /// A tempo far from the current one has to win this many analyses in a
    /// row before it replaces it, so a fill or a break doesn't flip the reading.
    private static let switchVotes = 6
    /// Agreeing analyses needed for the first reading.
    private static let lockVotes = 3
    private var candidate: Double = 0
    private var candidateVotes = 0

    init(sampleRate: Double) {
        self.sampleRate = sampleRate
        self.fps = sampleRate / Double(Self.hopSize)
        self.log2n = vDSP_Length(log2(Double(Self.frameSize)))
        self.fftSetup = vDSP_create_fftsetup(log2n, FFTRadix(kFFTRadix2))!
        var w = [Float](repeating: 0, count: Self.frameSize)
        vDSP_hann_window(&w, vDSP_Length(Self.frameSize), Int32(vDSP_HANN_NORM))
        self.window = w
        let half = Self.frameSize / 2
        self.frame = [Float](repeating: 0, count: Self.frameSize)
        self.real = [Float](repeating: 0, count: half)
        self.imag = [Float](repeating: 0, count: half)
        self.mags = [Float](repeating: 0, count: half)
        self.prevMags = [Float](repeating: 0, count: half)
        self.maxBin = min(half, Int(8000 / (sampleRate / Double(Self.frameSize))))
        self.envelope = [Float](repeating: 0, count: Int(Self.windowSeconds * fps))
        pending.reserveCapacity(Self.frameSize * 4)
    }

    deinit { vDSP_destroy_fftsetup(fftSetup) }

    func reset() {
        pending.removeAll(keepingCapacity: true)
        for i in prevMags.indices { prevMags[i] = 0 }
        envCount = 0
        hopsSinceAnalysis = 0
        quietHops = 0
        weakHops = 0
        candidate = 0
        candidateVotes = 0
        bpm = 0
        confidence = 0
    }

    /// Feed the next consecutive samples of the stream.
    func push(_ samples: UnsafePointer<Float>, count: Int) {
        pending.append(contentsOf: UnsafeBufferPointer(start: samples, count: count))
        var start = 0
        while pending.count - start >= Self.frameSize {
            pending.withUnsafeBufferPointer { processFrame($0.baseAddress! + start) }
            start += Self.hopSize
        }
        if start > 0 { pending.removeFirst(start) }
    }

    // MARK: - Onset envelope

    private func processFrame(_ x: UnsafePointer<Float>) {
        let n = Self.frameSize
        let half = n / 2
        var rms: Float = 0
        vDSP_rmsqv(x, 1, &rms, vDSP_Length(n))

        vDSP_vmul(x, 1, window, 1, &frame, 1, vDSP_Length(n))
        real.withUnsafeMutableBufferPointer { rp in
            imag.withUnsafeMutableBufferPointer { ip in
                var split = DSPSplitComplex(realp: rp.baseAddress!, imagp: ip.baseAddress!)
                frame.withUnsafeBufferPointer { fp in
                    fp.baseAddress!.withMemoryRebound(to: DSPComplex.self, capacity: half) {
                        vDSP_ctoz($0, 2, &split, 1, vDSP_Length(half))
                    }
                }
                vDSP_fft_zrip(fftSetup, &split, 1, log2n, FFTDirection(FFT_FORWARD))
                vDSP_zvabs(&split, 1, &mags, 1, vDSP_Length(half))
            }
        }
        // Log compression makes the flux about relative change, so a quiet
        // hi-hat counts for something next to a loud bass.
        var flux: Float = 0
        for i in 1..<maxBin {
            let m = logf(1 + 100 * mags[i] / Float(n))
            let d = m - prevMags[i]
            if d > 0 { flux += d }
            prevMags[i] = m
        }

        let quiet = rms < Self.gate
        quietHops = quiet ? quietHops + 1 : 0
        appendEnvelope(quiet ? 0 : flux)
    }

    private func appendEnvelope(_ v: Float) {
        if envCount < envelope.count {
            envelope[envCount] = v
            envCount += 1
        } else {
            envelope.removeFirst()
            envelope.append(v)
        }
        if Double(quietHops) > Self.timeout * fps {
            envCount = 0
            bpm = 0
            confidence = 0
            candidateVotes = 0
            return
        }
        hopsSinceAnalysis += 1
        if hopsSinceAnalysis >= Int(Self.analysisSeconds * fps),
           Double(envCount) >= Self.warmupSeconds * fps {
            hopsSinceAnalysis = 0
            analyse()
        }
    }

    // MARK: - Tempo

    private func analyse() {
        let n = envCount
        // Blur the envelope a little (Gaussian, ~20ms) so a beat whose
        // period falls between two lags peaks on both rather than being
        // split across them and losing to a cleaner multiple of the period.
        var e = [Float](repeating: 0, count: n)
        envelope.withUnsafeBufferPointer { src in
            for i in 0..<n {
                var s: Float = 0, w: Float = 0
                for (k, kw) in Self.blur.enumerated() {
                    let j = i + k - Self.blur.count / 2
                    if j >= 0 && j < n { s += src[j] * kw; w += kw }
                }
                e[i] = s / w
            }
        }
        var mean: Float = 0
        vDSP_meanv(e, 1, &mean, vDSP_Length(n))
        var neg = -mean
        vDSP_vsadd(e, 1, &neg, &e, 1, vDSP_Length(n))

        let minLag = Int(floor(60 / Self.maxBPM * fps))
        let maxLag = Int(ceil(60 / Self.minBPM * fps))
        // Room for the comb's doubled lag and the multi-period refinement.
        let topLag = min(n / 2, 4 * maxLag + 2)
        guard topLag > maxLag * 2 else { return }
        var ac = [Float](repeating: 0, count: topLag + 1)
        e.withUnsafeBufferPointer { ep in
            let p = ep.baseAddress!
            for lag in 0...topLag {
                var s: Float = 0
                vDSP_dotpr(p, 1, p + lag, 1, &s, vDSP_Length(n - lag))
                // Unbiased: long lags overlap fewer samples.
                ac[lag] = s / Float(n - lag)
            }
        }
        guard ac[0] > 1e-9 else { return }

        // A beat period also shows up at twice the lag, so reward lags whose
        // double is strong too; the prior then settles the octave.
        var bestLag = 0
        var bestScore = -Float.greatestFiniteMagnitude
        for lag in minLag...maxLag {
            let bpmAtLag = 60 * fps / Double(lag)
            let octaves = log2(bpmAtLag / Self.preferredBPM)
            let prior = Float(exp(-0.5 * octaves * octaves))
            let score = prior * (ac[lag] + 0.5 * ac[min(topLag, 2 * lag)])
            if score > bestScore { bestScore = score; bestLag = lag }
        }
        guard bestLag > minLag, bestLag < maxLag else { return }
        confidence = ac[bestLag] / ac[0]

        guard confidence >= Self.minConfidence else {
            weakHops += Int(Self.analysisSeconds * fps)
            if Double(weakHops) > Self.timeout * fps { bpm = 0; candidateVotes = 0 }
            return
        }
        weakHops = 0

        // One lag step is several percent of the period, so measure the peak
        // at the furthest multiple of it that fits: the error shrinks with k.
        var period = Double(bestLag)
        for k in stride(from: 4, through: 1, by: -1) {
            let centre = Int((period * Double(k)).rounded())
            guard centre + k + 1 <= topLag else { continue }
            var peak = centre
            for lag in (centre - k)...(centre + k) where ac[lag] > ac[peak] { peak = lag }
            guard peak > 0, peak < topLag else { continue }
            let a = ac[peak - 1], b = ac[peak], c = ac[peak + 1]
            let denom = a - 2 * b + c
            let offset = denom < 0 ? Double(0.5 * (a - c) / denom) : 0
            period = (Double(peak) + offset) / Double(k)
            break
        }
        update(with: 60 * fps / period)
    }

    private func update(with estimate: Double) {
        if bpm > 0, abs(estimate - bpm) / bpm < 0.04 {
            candidateVotes = 0
            bpm += (estimate - bpm) * 0.3
            return
        }
        if candidateVotes > 0, abs(estimate - candidate) / candidate < 0.04 {
            candidateVotes += 1
        } else {
            candidate = estimate
            candidateVotes = 1
        }
        if candidateVotes >= (bpm > 0 ? Self.switchVotes : Self.lockVotes) {
            bpm = estimate
            candidateVotes = 0
        }
    }
}
