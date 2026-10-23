# Project workflow preferences

- Make separate local commits with clear messages for specific requested changes. Do not push unless the user explicitly asks to push.
- Check available account usage before substantial work, at meaningful milestones, and before finishing, when the usage-limit tool is available. Report remaining five-hour and weekly percentages; do not guess unavailable limits or exact future token costs.
- Keep work in small, reviewable units. If remaining allowance becomes too low to finish a unit with validation, leave its implementation as a concrete plan for the next session and finish/commit completed units first.
- Preserve player saves and backups; automated tests use isolated temporary directories.
- Before each requested push, update the release version in package.json and the README to reflect the included changes. The sidebar reads package.json automatically; verify its Gallorin version label matches the release. Use major.minor.patch version numbers, and never push without the user's explicit request.
