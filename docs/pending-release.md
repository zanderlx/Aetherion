# Pending release notes

Planned patches: Gallorin v1.0.1 and v1.0.2 (not released).

Keep the published v1.0.0 changelog unchanged until the next release is prepared.
Merge these notes into CHANGELOG.md and synchronize package/lockfile, README,
banner, and displayed versions before the next authorized push/release.

## v1.0.1

### Fixed

- Gallorin now always uses its own save folders instead of automatically
  falling back to legacy Aetherion data. Installed builds use
  %APPDATA%\Gallorin; development uses %APPDATA%\Gallorin Development.

Implementation: desktop/data-paths.js. Local cleanup also removed obsolete
Aetherion test environments, updater cache, and the old installer; that cleanup
was specific to this computer and is not an automatic app feature.

## v1.0.2

### Changed

- Imported 28 categorized palettes: 23 additions and 5 replacements, including
  updated Bisorse 1 colors and its supplied species links/global setting.
