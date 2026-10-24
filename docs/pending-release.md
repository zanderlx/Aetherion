# Pending release notes

Target: Gallorin v1.0.1 (not released).

Keep the published v1.0.0 changelog unchanged until the next release is prepared.
Merge these notes into CHANGELOG.md and synchronize package/lockfile, README,
banner, and displayed versions before the next authorized push/release.

## Fixed

- Gallorin now always uses its own save folders instead of automatically
  falling back to legacy Aetherion data. Installed builds use
  %APPDATA%\Gallorin; development uses %APPDATA%\Gallorin Development.

Implementation: desktop/data-paths.js. Local cleanup also removed obsolete
Aetherion test environments, updater cache, and the old installer; that cleanup
was specific to this computer and is not an automatic app feature.
