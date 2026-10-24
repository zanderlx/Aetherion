# Gallorin v1.1.0 review

**Release title:** The Melodies of Gallorin
**Status:** Changelog wording reviewed by the user. Updated README/presentation review is pending; post-preparation validation has not started.

## Prepared

1. Reviewed 30 pending implementation commits against the locally recorded origin/main baseline.
2. Chose minor version 1.1.0 for compatible music and sound-effect features, including the unreleased storage/palette fixes.
3. Updated package/lockfile, README features/history/setup, banner, music/desktop guides, and the canonical changelog.

The main-menu footer, in-game sidebar, window title, and in-game changelog read their version from package.json or the canonical changelog.

No player saves, ignored configuration files, local music libraries, or backups are tracked.
The included audio is the bundled soundtrack. Personal local data remains separate.

## Default settings

| Setting | Previous repo default | Prepared default |
| --- | --- | --- |
| Music volume | 35% | 25% |
| Aetherion Wilds | Default song | Aetherion Wilds |
| Hallowhoof | Default song | Halloween 1 → Halloween 2 |
| All Town | Default song | Town |
| Sound Effects / Crossfade | 100% / 2 seconds | Unchanged |
| Cosmic spawn cue | Magic Twinkle | Unchanged |

New installations receive these defaults. Existing saved choices are preserved.

## Review

- [Release changelog](../CHANGELOG.md)
- [README](../README.md)
- [Banner](assets/gallorin-banner.svg)
- [Music guide](music.md)
- [Desktop guide](../desktop/README.md)

Review the version/title, release-note wording, feature descriptions, and defaults.

## After explicit approval

4. Run automated tests, desktop smoke checks, and release/version consistency validation.
5. Commit any final approved preparation changes and push to main when authorized.

A GitHub release/tag/installer publication requires a separate explicit release request.
Keep the changelog Unreleased until publication is authorized and its date is finalized.

This review checkpoint is mandatory for future pushes and is recorded in AGENTS.md.
