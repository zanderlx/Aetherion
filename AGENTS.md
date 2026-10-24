# Project workflow preferences

- Make separate local commits with clear messages for specific requested changes. Do not push unless the user explicitly asks to push.
- Check available account usage before substantial work, at meaningful milestones, and before finishing, when the usage-limit tool is available. Report remaining five-hour and weekly percentages; do not guess unavailable limits or exact future token costs.
- Keep work in small, reviewable units. If remaining allowance becomes too low to finish a unit with validation, leave its implementation as a concrete plan for the next session and finish/commit completed units first.
- Preserve player saves and backups; automated tests use isolated temporary directories.
- Before each requested push, update the release version in package.json and the README to reflect the included changes. The sidebar reads package.json automatically; verify its Gallorin version label matches the release. Use major.minor.patch version numbers, and never push without the user's explicit request.

# Changelog and release consistency

- CHANGELOG.md is the canonical in-game history and GitHub release-note source. Before every requested push, update its current entry with meaningful changes and verify package.json, package-lock.json, README, banner, and runtime version agree.
- The next Gallorin release is 1.0.0, The Symphony of the Wilds. Keep this version until that first Gallorin release is published; do not increment it merely because another pre-release snapshot is pushed.
- Legacy milestones use 0.1.0–0.9.0 in the changelog; original Aetherion version labels are retained only as historical mapping. Never rewrite old source tags or invent historical dates.
- Before publishing, finalize the current Unreleased date with scripts/release-notes.js --finalize YYYY-MM-DD using the user's local date, then run npm run release:check. Generate release-specific notes from the changelog; do not hardcode or copy the full history into each release.
- Gallorin release tags use gallorin-v followed by major.minor.patch. Never push or publish without explicit user authorization.
- Before releases, verify both the main-menu footer and in-game sidebar footer show Gallorin v<current package version> | Changelog and both links open the same versioned history. The desktop smoke test checks these labels automatically.
