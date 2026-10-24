# Changelog

All notable changes to Gallorin are documented here.
Entries use Added, Changed, Fixed, Removed, and Security sections where relevant.
Gallorin uses major.minor.patch versioning. Gallorin begins at version 1.0.0.
Legacy milestones are archived as 0.1.0–0.7.0 under Aetherion (Legacy).
Dates for legacy entries come from their release commits.

## [1.0.0] - The Symphony of the Wilds - 2026-10-23

The first Gallorin release brings forward the Aetherion collection game with new branding and tools for updating existing horses.

### Timeline: Desktop Foundations

#### Added

- Windows desktop installer with a themed splash and application icon.
- Separate AppData storage and safe migration from browser-edition saves.
- GitHub Releases update checks with download and restart confirmation.
- Packaged desktop smoke tests for startup, saves, export, and reload.

### Timeline: Music & Main Menu

#### Added

- Woodland title screen with Play, Settings, and Exit Game.
- Continuous looping music with saved volume, mute controls, and a 35% default.
- Themed Escape menu with Back To Game, Settings, Main Menu, and Exit Game.
- Audio settings and a music toggle during gameplay.
- Longer silent splash and smooth transitions between title screen and gameplay.

#### Changed

- Matched Escape-menu and in-game audio colors to the selected theme.
- Simplified menu and theme-page wording.
- Moved release publication after packaged smoke testing and pinned workflow actions.

#### Fixed

- Separated development saves and Chromium caches from the installed app.
- Fixed slider travel, saved-volume handling, and music starting before the title screen.

#### Security

- Escaped mutation emoji content in card and editor HTML.

### Timeline: Gallorin Updates

#### Added

- New Gallorin logo across the title screen, splash, sidebar, Escape menu, favicon, README, and desktop icons.
- Versioned horse records with schema, generation, and revision metadata preserved through imports and exports.
- Developer Settings → Horse Updates (work in progress): keep, set, or reroll selected details for individual horses or batches of up to 100. Further refinements are planned.
- Preview exact changes before applying, with automatic backups and protection against stale previews.
- Species-aware trait regeneration, individual mutation-slot controls, Cosmic identity locks, and skill editing.
- A shared Changelog popup beside the version in both the main menu and in-game sidebar, with the complete historical change log.

#### Changed

- Renamed the application to Gallorin while retaining Aetherion Wilds as a zone.
- Started fresh Gallorin versioning at 1.0.0 and archived earlier milestones as 0.x releases.
- Updated window titles to show the game name, full version, and current page.
- Preserved existing saves and JSON compatibility through the rebrand.
- Unified in-game history and GitHub release notes around this changelog.
- Release builds validate version consistency and packaged behavior before publication.

#### Fixed

- Corrected Friesian spelling, including existing species and horse records.
- Prevented incompatible traits from being retained when changing a horse's species.
- Protected Solar, Lunar, Heavenly, Void, and Astral mutations when rerolling existing horses.
- Prevented legacy Aetherion releases from being offered as Gallorin updates.

## [0.7.0] - Aetherion (Legacy) - 2026-10-23

### Added

- Global and per-palette color variation controls.
- Individual horse skill XP progression.
- Selling from the taming name dialog.
- Windows double-click launch and stop shortcuts.
- Animated gold gain and spending feedback.

### Changed

- Preserved Wilds encounters across page refreshes and replaced only tamed or sold slots.
- Consolidated definition navigation under Compendium.
- Updated economy defaults and streamlined numeric settings controls.

## [0.6.0] - Aetherion (Legacy) - 2026-10-22

### Added

- JSON import/export for palettes, eye colors, and mutations.
- Collapsible Personality and Mutation cards with section and page controls.
- Shared searchable emoji picker.

### Changed

- Redesigned palette cards and editing modals.
- Added colors to incomplete themed palettes.
- Improved responsive manager controls and navigation.
- Autosaved stable notes.

## [0.5.0] - Aetherion (Legacy) - 2026-10-22

### Added

- Two-tab horse profiles and full-horse artwork viewer.
- Per-horse skill/XP displays and sale bonuses.
- Configurable 3–6-column stable grid.
- Editable rarity border colors.
- Cosmic species tier and 105 Hauntmare trait options.

### Changed

- Refreshed Wilds navigation and definition-manager forms.

## [0.4.0] - Aetherion (Legacy) - 2026-10-21

### Added

- Searchable Eye Color cards, rarity sections, and percentage controls.
- Modal CRUD and random eye color creation.
- Personality cards with emojis and modal editing.
- Separate Traits navigation.
- Grouped horse traits and four mutation slots.

## [0.3.0] - Aetherion (Legacy) - 2026-10-21

### Added

- Five local JSON definition managers with complete CRUD.
- Zone/species weight synchronization.
- Cosmic and Wild spawning paths.
- Nineteen standard mutation weights, duplicate lockout, and thresholds.
- Weighted size generation and recoverable configuration transactions.

## [0.2.0] - Aetherion (Legacy) - 2026-10-20

### Added

- Catch-time naming and per-horse notes.
- Editable horse details and website text deletion/restoration.

### Changed

- Updated species spawning, profiles, and navigation.

## [0.1.0] - Aetherion (Legacy) - 2026-10-20

### Added

- Local horse collection and JSON saves.
- Editable definitions and zones.
- Themes, website text editing, profiles, and search.
- Save exports and backups.
