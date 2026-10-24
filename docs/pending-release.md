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

- Named the protected default track Glades of Gallorin.
- Added nested playlist collapse controls, MP3 duration columns, and per-playlist removal that preserves library files.
- Empty playlists use Default without adding song rows; renamed Default and replaced inheritance notes with song counts.
- Unified Audio Settings across menu/game with Music and Sound Effects sliders and crossfade; simplified modal controls and header alignment.

- Moved playlist song counts beside chevrons and removed add/reorder controls.
- Playlist rows reveal play/trash controls on hover and keep controls visible for the current song.
- Added contextual row playback and repaired missing/blank MP3 duration metadata, with left-aligned duration columns.

- Removed reset rows, implicit default-song entries, default suffix labels, and the Location Music heading.
- Moved music import to All Songs with a music-note icon.
- Added highlighted current rows, hover-only play/trash controls, full-button clicks, and row double-click playback.

- Added smooth, reversible expand/collapse animations to music folders and playlists, respecting reduced-motion preferences.
- Removed the playlist/table gap and duplicate divider.

- Added ascending/descending column sorting to playlist and All Songs tables without changing saved playback order.

- Added three-state column sorting with default ascending row numbers and adjacent active-only arrows.
- Added page-level folder and per-folder playlist Show All/Hide All controls.

- Crossfade now uses a snapped 0–10 second slider with a live seconds readout.
- Refined player volume controls with speaker mute icons, a longer centered slider, and no trailing settings icon.
- Music tables start without active sorting arrows until a column is clicked.

- Renamed the music page Background Music and made playlists start closed.
- Fixed lost/rapid mute clicks with stable SVG hit targets, optimistic controls, and ordered preference writes.
- Player song name/artwork now reveal the current track in All Songs.
- Simplified crossfade readouts, aligned audio values left, matched playlist title sizing, and styled song-delete actions consistently.

- Added All Songs options menus with searchable multi-playlist assignment, inline song/artist editing with save/discard confirmation, and library-wide delete confirmation.
- Playlist trash buttons only remove that playlist membership; duration and MP3 files remain unchanged by metadata edits.
- Hid the page scrollbar while preserving scrolling.
- Refined playlist assignment with sidebar ordering, section filtering, centered actions, and a hover-only edge scrollbar; added a row checkmark to save all edited song metadata together.
