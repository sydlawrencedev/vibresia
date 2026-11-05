/* The copy button, wherever the page has one.
 *
 * A page with a command to copy — the install command, an agent's config —
 * has the same button on it, and the button has the same three ways to go
 * wrong:
 *
 *   - The Clipboard API is not there at all. It needs a secure context, and
 *     `navigator.clipboard` is simply undefined without one. Calling
 *     `.writeText` on it throws a TypeError, and the button does nothing and
 *     says nothing.
 *   - The write is refused. The browser can refuse it — a permission, or
 *     the document not being focused — and the promise rejects. Unhandled,
 *     that is a console error and a button that says nothing.
 *   - It works. Then the button says "Copied".
 *
 * So the text is shown either way: "Copied" when it worked, and the text to
 * copy by hand when it did not. A button that silently does nothing is
 * worse than one that shows the command.
 */
(function () {
  "use strict";

  function say(button, text) {
    button.textContent = text;
    setTimeout(function () { button.textContent = "Copy"; }, 1500);
  }

  function copyText(text, button) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        say(button, "Copied");
      }).catch(function () {
        say(button, "Copy this: " + text);
      });
    } else {
      say(button, "Copy this: " + text);
    }
  }

  document.querySelectorAll("[data-copy]").forEach(function (button) {
    button.addEventListener("click", function () {
      var code = button.parentElement && button.parentElement.querySelector("code");
      if (!code) return;
      copyText(code.textContent, button);
    });
  });
})();
