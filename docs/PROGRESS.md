# Aetherion — Version 1 Progress

## Implemented

- Local Node HTTP server, browser interface, offline SVG artwork, and persistent JSON saves.
- Preview Wilds encounters; catch, rename, favorite, sell, delete, search, and sort horses.
- Stable and sold history, current-gold editing, sale prices, encounter count, and stable limits.
- Create/edit/randomize/delete zones with editable species, palette, and atmosphere pools.
- Create/edit/duplicate/delete species, traits, palettes, eyes, personalities, mutations, items, item themes, atmospheres, and website themes.
- Five supplied **Mutated Horse** palettes: Solar, Lunar, Astral, Heavenly, Void. All nine colors are preserved; old editable libraries receive missing entries without replacing custom data.
- Nine website themes, dark/light variants, custom theme colors, and a crest that follows theme tokens.
- Page-specific editor guidance; Economy and Game Settings show their relevant controls.
- Dedicated text Edit Mode with section/page saves, drafts, resets, and shared website labels.
- Profiles with display name, About Me, and twelve named avatar color choices. Random avatar generation has been removed; previously saved colors are preserved.
- Alphabetized navigation grouped by setting type, scroll retention, uppercase option labels, horizontal Wilds tabs, and change-only Save/Cancel controls.
- Cached/debounced site search, avoiding unnecessary horse-art rendering and repeat visit saves.
- Automatic/dated backups, data export, confirmation before deletions, reference cleanup, and preservation of collected horse snapshots.
- Version-1 README with local banner, prerequisite/download links, startup/troubleshooting steps, feature list, and roadmap.
- In-app **Developer Settings → Remaining Features** page.

## Remaining systems

See [README — Remaining Features](../README.md#remaining-features) for the feature-by-feature requirements and [OPEN-QUESTIONS.md](OPEN-QUESTIONS.md) for detailed rule ambiguities.

- [ ] Individual Horse Editor, duplication/import, and custom horse creator.
- [ ] Probability-based Horse Generator and spawn controls.
- [ ] Executable mutation/item effects and exact species/trait artwork.
- [ ] Breeding, color/trait inheritance, and family history.
- [ ] Inventory, equipment, consumables, gacha, and shop.
- [ ] Town activities and event scheduling.
- [ ] Save import/restore, reset controls, and backup retention options.
- [ ] Advanced collection filters, statistics, bulk actions, final game defaults.
- [ ] Desktop/mobile browser, keyboard, accessibility, and visual QA.

A basic Horse Editor can begin with the existing schema. Generator probabilities, trait rules, breeding rules, and activity mechanics need the specific decisions listed in the roadmap. Fixed special-spawn palette colors have now been supplied; their probabilities and effects remain unresolved.

## Verification

**45 automated tests pass.** Tests use isolated save folders and a temporary local server; the user's save is not modified by tests. Coverage includes palette values and migration, deletion/reference cleanup, profiles, theme contrast, contextual templates, navigation, form state, persistence, export, backups, and same-origin API restrictions.

Browser observation was blocked by the browser tool's localhost policy. No alternate browser workaround was used. Visual appearance and full interaction behavior are therefore not claimed as verified.

### Manual browser checklist

1. Review desktop, tablet, and phone layout, including navigation and horizontal location tabs.
2. Change themes in both modes; confirm the crest and dialogs match.
3. Select profile colors, save About Me, refresh, and verify persistence.
4. Edit Game Settings and Economy separately; ensure Save/Cancel track real changes.
5. Add/edit/delete definitions and zones; check confirmation text and reference updates.
6. Catch, inspect, rename, favorite, sell, and delete a horse; verify balances and history.
7. Search via the header or Ctrl+K; follow page, definition, zone, and horse results.
8. Enable Edit Mode; preview/save/discard/reset wording and verify after refresh.
9. Check keyboard navigation, Escape, dialog focus, mobile drawer focus, and reduced motion.
10. Create a dated backup and export; verify saved data and restart retention.

## Horse view refinements

Implemented editable profile wording and encounter counter, reversible text deletion, nine-color previews without palette names, simplified Wilds/profile labels, larger fonts, and saved random adult birthdays displayed as MM-DD-YYYY. Existing birthdays remain unchanged. Changes are committed separately and remain unpushed per the current workflow preference. Browser visual checks remain unverified.

