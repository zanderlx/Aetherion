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

## Next release — Music player (version pending)

### Added

- Full-width themed music player with play/pause, stop, restart, seeking, volume, and mute.
- User Interface → Music: local MP3 import/deletion, per-zone/Stables/Town/default assignments, and configurable crossfades.
- Shared desktop menu/game audio preferences and persistent playback across navigation.

- Bundled ten supplied soundtrack files plus the original main-menu song in one music asset folder.
- Added an independent Main Menu song selection and one-time local soundtrack seeding.

### Changed

- Organized location music into playlist tables grouped by navigation section and subsection.
- Added multi-song assignments, reordering, automatic playlist advance, and previous/next player controls.
- Player metadata uses formatted MP3 names and Gallorin Studios; renamed Import Music and default-song labels.
