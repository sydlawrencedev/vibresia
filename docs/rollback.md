# Rolling back a release

A release goes out in two pieces, and they are undone separately:

| Piece | What it is | Where it lives |
|---|---|---|
| The app | `Vibresia.zip`, attached to a GitHub release | GitHub releases |
| The site and Worker | The Worker serves `site/` and the share API | Cloudflare |

The app is the one people install, so it is the one that matters most.

## Before anything goes out

The release script refuses to publish a release that cannot be taken back
cleanly:

- The working tree must be clean (`release.sh` checks this before it builds).
- The commit the release names must already be on `origin/main`.
- The version bump is committed and pushed before the release is created, so
  the tag, the artefact and the commit all name the same tree.

So the first question after a bad release is always: **which commit is
good?**

```bash
git log --oneline -10
```

## Rolling back the app

A release that should not be the latest one is made a prerelease. The
installer and the in-app update checker both ask for `releases/latest`, so
taking the bad release out of that channel stops it reaching anybody who has
not already installed it:

```bash
# The bad release stops being what `releases/latest` points at.
gh release edit v0.11.0311 -R sydlawrencedev/vibresia --prerelease

# Check what "latest" now resolves to.
gh release view -R sydlawrencedev/vibresia --json tagName,isPrerelease
```

For the people who already have the bad build, the fix is a new release with
a higher version. The version is the build's date, so running the release
script again on the same day produces a new version (`version.sh` counts the
builds of the day), and it becomes the latest release:

```bash
NOTES="Fixes the problem with v0.11.0311" ./VisualiserMac/release.sh
```

That is the way out for an installed copy: the update check finds the newer
release and installs it. There is no "uninstall and go back" path in the
app, and there is not meant to be — a fixed version is faster than an
argument about versions.

If the *repository* itself is what went wrong — a secret, a commit with
something in it that should not be there — see
[Rolling back a commit](#rolling-back-a-commit).

## Rolling back the Worker

The Worker is deployed with Wrangler, and every deployment is kept. To go
back to the version before the bad one:

```bash
npx wrangler deployments list
npx wrangler rollback <version-id>
npx wrangler deployments list   # check it says what you expect
```

If no previous deployment is listed — a fresh database, or a Wrangler
account that has been cleaned out — redeploy a known-good commit instead:

```bash
git checkout <good-commit>
npx wrangler deploy
```

The Worker and the site are served from the same deployment, so this rolls
back the landing page at the same time. If only the site changed and the
Worker did not, deploying the old commit still puts the old site back.

### The database

The Worker deploys separately from the database. **Migrations are not
reverted by a rollback**, and they should not be: they are additive, and
the Worker works against a database that has columns it does not need.

Before any migration is applied to production, take a copy:

```bash
npx wrangler d1 export vibresia-shares --remote --output backup-$(date +%Y%m%d).sql
```

To put one back:

```bash
npx wrangler d1 execute vibresia-shares --remote --file backup-20261105.sql
```

A share that was deleted by the admin is gone. The export is the only copy
of it.

## Rolling back a commit

A commit that should never have been published — a secret, a licence, some
body else's code — is removed from the history:

```bash
git rebase -i <the commit before it>
# mark the commit as 'drop' (or 'edit' and empty the commit)
git push --force-with-lease origin main
```

Then rotate whatever the commit contained. Removing a commit from the
history does not un-publish it: if it was in a release zip, or in a public
repository's packfile, or in somebody's clone, it is already out. The
credential has to be treated as compromised and replaced, and the release
that carried it has to be dealt with as well.

## The order to do it in

1. Stop the bad release reaching anybody new — `gh release edit --prerelease`.
2. Roll the Worker back if the site or the API is the problem —
   `npx wrangler rollback`.
3. Roll the commit back if the repository is the problem, and rotate
   anything it contained.
4. Publish a fixed release, so anybody who already installed the bad one
   gets the fix.
5. Take a database export, if the bad release wrote anything to the shares
   table that has to be kept.
