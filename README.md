<div align="center">

![Aetherion — A Horsekeeper's Chronicle, Version 2.0](docs/assets/aetherion-banner.svg)

**Version 2.0.0 · The Symphony of the Wilds**

**A local fantasy horse sanctuary you can make your own.**

Explore woodland realms, collect companions, and customize your world through visual editors.

[Get Started](#get-started) · [Features](#features) · [Customization](#make-it-yours) · [Backups](#backups) · [Roadmap](#remaining-features)

</div>

---

> **Version 2.0 introduces The Symphony of the Wilds: a themed title screen, continuous music, saved audio settings, a themed Escape menu, and smooth transitions.** Local saves, weighted spawning, horse profiles, skill tracking, and visual configuration editing work today. Skill training, breeding, equipment gameplay, and Town activities remain planned.

## Version History

Versions follow **major.minor.patch**: major for breaking changes, minor for compatible features, patch for fixes. Commits are grouped by release rather than each receiving a new version.

| Version | Changes |
| --- | --- |
| **2.0.0 — current** | Themed title screen; continuous soundtrack; saved volume and mute controls; themed Escape menu and audio settings; smoother transitions; isolated development saves/caches; mutation emoji HTML escaping; smoke tests before release publication; pinned workflow actions. |
| **1.7.0** | Windows desktop installer; themed splash and app icon; isolated AppData saves; existing-save migration; GitHub Releases updater; packaged smoke tests. |
| **1.6.0** | Live global and per-palette color variance; persistent Wilds encounters with single-slot replacements; selling during taming; individual skill XP progression; Compendium navigation; updated economy defaults; animated gold feedback; Windows launch/stop shortcuts. |
| **1.5.0** | Palette card/modal redesign; definition JSON transfers; collapsible Personality and Mutation cards; section/page expansion controls; searchable emoji picker; completed themed palettes; responsive controls and navigation; autosaving stable Notes. |
| **1.4.0** | Two-tab profiles and full-horse artwork viewer; per-horse skills and XP bars; 3–6-column stable grid; configurable rarity borders; Cosmic species tier; skill/wing sale bonuses; refreshed Wilds navigation and manager forms; 105 Hauntmare trait options. |
| **1.3.0** | Adds searchable eye color cards, rarity groups and percentage display controls, modal CRUD, random color creation, personality cards/emojis and modal editing, separate Traits navigation, and grouped horse traits with four mutation slots. |
| **1.2.0** | Adds five file-backed Horse Definitions managers, tier/zone weight synchronization, Cosmic/Wild spawning, nineteen mutation token weights, duplicate lockout, thresholds, size generation, and recoverable configuration saves. |
| **1.1.0** | Adds catch-time naming, per-horse notes and editable details, text deletion/restoration, independent equal-odds species spawning, and profile/navigation refinements. Includes gameplay/UI commits through `6aec655`. |
| **1.0.0 — initial preview** | Local collection and saves, editable definitions and zones, themes, website text editing, profiles, search, and backups. Baseline commit: `4b18fa7`. |

Existing player saves migrate automatically with a dated backup. Breeding and executable gameplay effects remain planned. The current automated suite has **190 passing tests**; browser visual QA remains pending.

## Desktop Release

Download the installer from [GitHub Releases](https://github.com/zanderlx/Aetherion/releases/latest). No Node.js or Git is needed for the installed app. Music starts at the title screen and continues during gameplay, with saved mute/volume controls (35% default). Escape opens Back To Game, Settings, Main Menu, and Exit Game. Development uses separate saves. See the [desktop guide](desktop/README.md).

## Horse Updates

**Developer Settings → Horse Updates** adds versioned horse records and preview-first, backed-up updates for existing stable horses. Keep, set, or regenerate individual fields—including species traits and mutation slots—with Cosmic identity protection. Definitions added later can be applied to existing horses explicitly. [Horse Updates guide](docs/horse-updates.md).

## Get Started

### 1. Install the prerequisites

| You need | How to get it |
| --- | --- |
| **Node.js 22 or newer, with npm** | Download an **LTS** installer for your operating system from [nodejs.org](https://nodejs.org/en/download). On Windows, run the `.msi` installer with its default Node.js/npm components, then reopen your terminal. |
| **A modern browser** | Use an up-to-date Edge, Chrome, Firefox, or Safari. Windows includes Edge. |
| **Project files** | Download the ZIP below, or clone with Git. |
| **Git — optional** | Only needed for cloning and Git-based updates. Install from [git-scm.com](https://git-scm.com/install/windows) on Windows, or choose your platform on that site. ZIP users do not need Git. |

Check the installation in PowerShell, Command Prompt, or your terminal:

```text
node --version
npm --version
```

Node must report `v22` or higher. No Python, database, API key, paid account, or build tool is required.

### 2. Get the project

**Easy option:** On this GitHub repository, choose **Code → Download ZIP**, then extract the archive into a writable folder. [GitHub's download guide](https://docs.github.com/en/repositories/working-with-files/using-files/downloading-source-code-archives) shows the steps.

**Git option:**

```sh
git clone https://github.com/zanderlx/Aetherion.git
cd Aetherion
```

### 3. Start your sanctuary

**Windows, no terminal needed:** double-click **Launch Aetherion.vbs** in the project folder. It starts the server in the background, waits until it is ready, then opens your default browser. Double-clicking again reuses the running server. Double-click **Stop Aetherion.vbs** when finished; closing the browser alone leaves the server running. Both shortcuts work from folders containing spaces.

Startup errors are shown in a dialog; server logs are in `data/desktop-launcher.log` (not committed). Node.js 22+ must be available on PATH. These shortcuts use Windows Script Host; managed computers may disable it.

**Terminal alternative (all platforms):** open a terminal **inside the extracted or cloned folder containing `package.json`**:

```sh
npm start
```

Open **[http://127.0.0.1:4173](http://127.0.0.1:4173)** in your browser.

**Browser edition:** no `npm install` is needed; the browser server uses Node built-ins. **Desktop development:** run `npm ci`, then `npm run desktop`. See the [desktop guide](desktop/README.md) for Windows installers, save migration, and GitHub Releases updates.

Keep the terminal open while playing. Press **Ctrl+C** to stop the server. Start it again with `npm start`; your saved world is retained.

<details>
<summary><strong>Troubleshooting & alternate ports</strong></summary>

- **“node” or “npm” is not recognized:** reopen the terminal after installing Node. If necessary, rerun the installer and ensure Node is added to PATH.
- **PowerShell blocks `npm.ps1`:** use `npm.cmd start`, or run `node server.js`. No execution-policy change is necessary.
- **“package.json not found”:** navigate into the project folder, not its parent or the unopened ZIP archive.
- **Port 4173 is in use:** stop the existing server, or choose another port.

PowerShell:

```powershell
$env:PORT = "4174"
npm start
```

macOS/Linux:

```sh
PORT=4174 npm start
```

Then open `http://127.0.0.1:4174`. The server listens only on your computer's loopback address.

- **The browser cannot connect:** confirm the terminal says “Aetherion is ready,” and use its URL. Opening `public/index.html` directly will not run the game.
- **The save cannot be read:** preserve the existing `data` folder before investigating. The app stops rather than silently replacing your progress.

</details>

## Features

| 🌿 Explore & collect | ✨ Build & customize |
| --- | --- |
| Wilds encounters with inspectable horse profiles | Create, edit, randomize, and delete zones with editable tags |
| Tame, rename, favorite, sell, import, and export horses | Define species, traits, palettes, eyes, and personalities |
| Stable search, sorting, favorites, and preserved sale records | Maintain mutation, item, item-theme, and atmosphere definitions |
| Nine-region color swatches and saved characteristics | Edit website wording without changing source code |
| Current gold editor and transaction history | Nine website themes, plus custom theme editing |
| Site-wide search with **Ctrl+K / Cmd+K** | Profile name, About Me, and twelve avatar color choices |
| Automatic JSON saving, exports, and backups | Grouped, alphabetized navigation that retains its scroll position |

Save and Cancel controls appear when a form has changes; horse Notes instead save when focus leaves the editor. Deletion requires confirmation. Existing horse snapshots are preserved when definitions change.


### What's new in 1.5

- **Matching managers:** Palettes now uses searchable cards, Type/Scope filters, compact dropdowns, direction controls, and create/edit modals like Eye Colors and Mutations. Shared import, export, and centered confirmed-delete buttons keep the editors consistent.
- **Definition transfers:** export one palette, eye color, or mutation as versioned JSON and import the same file. Review and edit it before clicking **Import**; **Cancel Import** adds nothing. Invalid files are rejected and duplicate names receive a distinct imported name. Palette species links must exist in the target registry. Files preserve editable fields and regenerate local identifiers; full-world backups remain separate.
- **Palettes:** nine distinct swatch segments with subtle dividers and instant region/hex tooltips. Notes are hidden on previews and appear last in the editor. Global and Species Linked follow the colors; Global hides the linked list. Type is a dropdown, Natural classification is no longer used, and internal IDs/unused skin metadata stay hidden. Twelve incomplete palettes now have themed placeholder colors, with red Tomato and orange Carrot. The former Mutated Horse group is **Mutated**.
- **Collapsible cards:** Personalities and Mutations start minimized, expand with smooth animation, and offer centered Edit buttons. Personality descriptions have a scrollable fixed area. Mutation grids use five columns on larger screens and reduce columns responsively; open cards size to the tallest open description in their own section. Type sections have **Show/Hide** controls; the page button says **Hide All** only when all cards are open. Names stay fixed and aligned with emojis, while type and description text scale responsively.
- **Shared emoji picker:** Personality and Mutation editors open a searchable modal with category filters, nearly 400 distinct emoji choices, official Unicode-name tooltips, and a paste-any-emoji option. Existing Personality choices are retained; duplicate assignments are allowed. Custom Mutation emojis persist and travel with definition exports.
- **Horse Notes:** stable Notes and wild descriptions fill their sections. Notes save on clicking away or pressing Esc without Save/Cancel buttons; clearing a note immediately restores the centered empty prompt.
- **Navigation and controls:** refresh preserves the current page and opens only its navigation folder. Wilds text toggles its dropdown. Website & Profile is now **User Interface**. Dropdown arrows are inset consistently; manager search fields and filters are compact and responsive.

### What's new in 1.4

- **Horse profiles:** matching Info and Traits pages with external bookmark tabs. Info contains horse details, equipment placeholders, Notes for owned horses or Description for wild horses, and Skills. Traits contains a centered 3×3 Palette, grouped appearance traits, and four mutation slots with locks for unused slots. Click the headshot to open a padded full-horse artwork viewer.
- **Skills:** each horse stores its own Agility, Strength, Jump, Bond, and Wing levels and XP. Colored bars fill by current XP divided by the requirement for that level, rounded down to whole percentages. Level 10 remains numbered until it reaches 34,000 XP, then displays MAX. Training gameplay is not implemented yet.
- **My Horses:** compact headshot cards, colored gender icons, favorite hearts, rarity sorting, ascending/descending controls, and a live grid-size slider from 3 to 6 columns (default 5, reduced on small screens). Import is beside the heading; imports require confirmation before entering the stable.
- **Wilds:** expandable zone navigation with Aetherion Wilds as its main link; no duplicate zone tabs or Event markers. Tame opens the optional rename prompt, then redirects to the new horse's stable profile.
- **Rarities:** editable Common, Uncommon, Rare, Ultra Rare, and Cosmic border colors apply to preview cards and profile modals. Species Manager now offers Cosmic with a default weight of 10, below Ultra Rare's 40.
- **Managers:** Mutations uses searchable cards, type groups, optional weights, direction controls, and CRUD modals. Eye Colors and Personalities retain their card/modal editors. Species hides internal IDs and base attributes, uses Description (optional), and shows rarity names without numbers. Hauntmare now has 105 exclusive appearance options.
- **Game Settings:** larger title-case labels, right-aligned typed numbers without spinner arrows, responsive descriptions, right-aligned Save/Cancel, success popups, and red validation errors. Allow Duplicate Mutations applies to natural spawning only.

### Mutated palettes

Available under **Horse Definitions → Palettes**:

| Solar | Lunar | Astral | Heavenly | Void |
| --- | --- | --- | --- | --- |
| Gold, orange & red | Icy blues | Lavender & violet | White in all nine regions | Black in all nine regions |

Every supplied hex value is preserved. Cosmic mutations use the matching palette automatically: Solar, Lunar, Heavenly, Void, or Astral. Existing horses are synchronized with a backup. These palettes are excluded from zone palette pools; a palette name alone does not grant a mutation or sale multiplier.

### Data-driven spawning

Horse Definitions has separate **Species**, **Traits**, **Palettes**, **Eye Colors**, **Mutations**, **Personalities**, and **Rarities** pages. CRUD saves local JSON configuration files. Species expose rarity tiers and zone assignments; Traits edits species-linked appearance options separately. Palette scopes and skin metadata remain available. File paths appear in the top breadcrumb. Internal eye/personality identifiers and unused visual/behavior metadata stay hidden from their forms.

Each search runs the **0.325% Cosmic / 99.675% Wild** split. Cosmic selects uniformly from all registered species in every zone, including Aetherion Wilds, ignoring zone species whitelists and rarity weights. Wild selects by zone ticket weights, initially **10 / 40 / 100 / 250 / 500** for Cosmic / Ultra Rare / Rare / Uncommon / Common. Chained mutation slots stop on failure; the nineteen standard mutations start with **10,101 tokens**. Gender is 50/50, size follows the eleven-step weighted ladder with mutation shifts, and colors/eyes/personality are selected from the current files. Repeated species are allowed.

See [Spawning & Configuration](docs/SPAWNING.md) for exact probabilities, file paths, thresholds, assets, migration, and recovery. Existing horses retain their snapshots; new searches use saved configuration changes.

Taming or selling a wild horse replaces only that horse's slot, preserving the other encounters. Taming keeps you in the Wilds. Browser reloads and navigation preserve encounters; only Search the Wilds replaces the whole group.

Horse Definitions → **Rarities** controls five display ranks: **Common → no border**, **Uncommon → green**, **Rare → blue**, **Ultra Rare → purple**, and **Cosmic → gold**. Edit each rank’s color or disable its border/glow, then save; Restore Default Colors fills the form without saving immediately. Ultra Rare has a stronger glow, and Cosmic is strongest. Solar, Lunar, Heavenly, Void, and Astral map to Cosmic. Event species remain borderless unless Cosmic. These color settings save in `data/config/rarities.json` and do not change species spawn weights or selling prices. Current species definitions govern ranks, with saved metadata as fallback for unknown/deleted species.

Aetherion Wilds uses this **25-species whitelist** as its source of truth. Ordinary Wild encounters in Aetherion use the listed species. Cosmic encounters bypass this whitelist and can select any registered species equally, including the other 21 species and event species. The same unrestricted Cosmic rule applies to every zone.

| Tier | Weight per species | Aetherion species |
| --- | ---: | --- |
| 4 · Common | 500 | Bisorse, Caprine, Equus, Friesian, Horse, Peryton, Pony |
| 3 · Uncommon | 250 | Akhal Teke, Clydesdale, Donkey, Fjord, Flora, Gargoyle, Lusitano, Marwari |
| 2 · Rare | 100 | Anticorn, Cactaline, Fae, Felorse, Hippocampus, Kelpie, Unicorn |
| 1 · Ultra Rare | 40 | Caniquine, Nephyrian, Serpentine |

The Wild pool totals **6,320 tickets**. Weights are relative per-species tickets, not fixed rarity percentages. Edit rarity assignments in Species Manager and zone membership in My Zones.


Ghoulsteed and Hauntmare have complete supplied species-specific trait lists. Other species use explicit missing-data labels until you add their traits. The illustrations are replaceable SVG artwork, not exact renders of every species, trait, or mutation.

Starting gold and stable limits are provisional settings. **Current Gold** changes your balance; the Economy section within Game Settings includes a sale history table (newest first). The header gold display is informational. The internal Starting Gold value is reserved for future new-game/reset functionality and is hidden from settings. Mutation selection, thresholds, and size shifts are active. Speed, stamina, fertility, item effects, and exact asset rendering remain separate gameplay work.

### Horse sale pricing

Economy Settings exposes **Base Horse Price** and nine editable modifiers. A sale uses **(Base Price + Trait Bonuses + Mutation Bonuses + Skill Bonuses + Wing Bonuses) × Special Multiplier**, rounded to whole gold. Defaults are **+15 per optional trait**, **+50 per assigned mutation**, **+8 per Agility/Strength/Jump/Bond level**, and **+8 per Wing level**, followed by Solar **×10**, Lunar **×15**, Heavenly **×20**, Void **×25**, or Astral **×30**. Wing is counted separately, once; level 0 adds nothing.

Mane, Tail, Eye Color, empty values, and missing-data placeholders do not earn trait bonuses. Cosmic mutations also count toward the mutation bonus. Special types are identified from the horse's saved special-spawn/mutation data; palette names alone do not activate multipliers. If an imported horse has several special types, the strongest applicable multiplier is used once. Use a multiplier of 1 for no special increase, or a bonus of 0 to disable that bonus.

The profile sale button and confirmation show the calculated price. Confirmation includes a breakdown; the server recalculates from the horse and current settings when selling. The archived horse and sale transaction retain the amount and modifier breakdown used at sale time. Changing settings affects future sales only.

### Horse view and preview refinements

Edit Mode covers horse-profile headings, labels, and descriptive wording. The Wilds encounter heading and count sentence have been removed. Profile copy is shared across horses and can use `{horseName}`, `{species}`, `{gender}`, `{birthday}`, `{personality}`, `{personalityDescription}`, and `{specialSpawn}`. Editing these templates does not change the underlying horse record. Delete Text saves an empty override; Use Original Wording restores it. Deleted text stays reachable through its pencil while edit mode is enabled.

Preview cards show a headshot, a name truncated after 13 characters, and a colored gender icon. Full names remain available in profiles. Owned cards also include a favorite heart. Palette swatches and detailed traits appear inside the two-tab profile rather than on preview cards. Horse IDs remain internal.

In horse profiles, Birthday is the date the horse entered your stable (MM-DD-YYYY), and Age counts calendar days since that date. Existing horses use their saved catch timestamp; newly imported horses start at 0 days. Uncaught horses show Not caught yet. Editing Birthday updates the acquisition date used by Age. The life-stage value (Adult/Foal/Elder) remains internal for compatibility.

### Horse names, notes, and details

Select Tame to review the prefilled name, optionally change it, and select Save to add the horse to My Horses and open its owned profile. The default name is grey until changed; the prompt has Save and Cancel with no X. Click an owned horse’s name to rename it; clicking outside or pressing Esc saves it. Owned profiles display editable Notes, with overflow scrolling. Wild profiles show the personality description in that space, and Tame without Sell or Notes.

Enable Edit Mode to change an individual horse's birthday, origin, size, personality, or eye color. Most choices are alphabetized; sizes run smallest to largest; Origin offers Wild plus origins already in saved horses. Birthdays display as MM-DD-YYYY. These controls save actual horse values, separately from shared page wording.

Stables contains My Horses and Breeding. Use the heart on a horse card to favorite it; choose Favorites in Sort by to show only favorite horses, with an empty-state message when there are none. Owned profiles offer Export Horse instead of Release Horse. Wilds expands to an alphabetized list of zones; clicking its heading opens Aetherion Wilds. The separate Breeding navigation and history page are removed; breeding gameplay remains planned. Existing sale records are preserved.

## Make It Yours

| Navigation section | Contents |
| --- | --- |
| **Stables** | My Horses, Breeding; Favorites available in the sort menu |
| **Developer Settings** | Edit Mode, Game Settings (including Economy), Save Management, Remaining Features |
| **Horse Definitions** | Species, Traits, Palettes, Eye Colors, Mutations, Personalities, and Rarities with local files |
| **World & Items** | Zones, Zone Atmospheres, Items & Potions, Item Themes |
| **User Interface** | Appearance & Themes, My Profile |

**My Zones:** existing zone cards appear above the editor. Use the trash icon to request deletion. The editor includes an Event checkbox and a checkbox to show the zone in Wilds navigation; Short Tagline is no longer a field.

**Zone tags:** zone creation and editing include a Tags field (one per line). New drafts include The evergreen realm and Free exploration. Add, replace, or remove tags, including all tags; they display without icons on Wilds pages and in the live preview. Existing zones keep their previous tag defaults.

**Website themes:** Aetherion Original, Rosewater, Lavender Cloud, Mint Meadow, Bluebell Morning, Peach Blossom, Lemon Chiffon, Sea Glass, and Silver Mist. The original remains the default. Other presets offer dark and light variants, with dark selected by default. The Aetherion crest follows your theme colors.

**Edit Mode:** enable it from its dedicated page, visit a section, and use the pencils. Save one section immediately, or preview multiple changes and choose **Save Page**. Discard drafts or restore default wording. Text supports live values such as `{gold}`, `{horseCount}`, and `{sellingPrice}`.

**My Profile:** click the avatar at the top right. Choose a named horse-crest color, enter a display name and About Me text, then save. Avatar selection is deterministic; there is no random avatar generator.

### Horse import and export

Choose **Import Horse** beside the My Horses search field to select a horse JSON file. Review the preview, then choose **Confirm Import** to save it or **Cancel Import** to leave your stable unchanged. Closing the preview also cancels. Open an owned horse and choose **Export Horse** at the bottom right to download the same format. Exporting keeps the horse in your stable. Confirmed imports create new IDs, preserve supported horse details, respect stable capacity, and leave existing horses intact.

See the [version 1 format specification](docs/HORSE-FORMAT.md) and [complete importable example](docs/horse-format.example.json). These individual horse files are separate from full save backups. Importing species, colors, and traits does not change your shared definition library.

## Backups

Your primary save lives on disk, **not in browser localStorage**.

| Location | Contents |
| --- | --- |
| `data/player/save.json` | Horses, gold, settings, profile, custom definitions/zones, and website wording |
| `data/backups/previous-save.json` | The save immediately preceding the latest successful change |
| `data/backups/save-*.json` | Dated backups made from Save Management |
| `data/config/` | Authoritative local species/palette/eye/mutation/personality/spawn and zone files |
| `data/backups/pre-spawning-*.json` | Player save preserved before the first configuration migration |
| `data/definitions/catalog.json` | Bootstrap definitions used when config files are first created |
| `docs/references/` | Original reference documents, preserved as supplied |

Copy the entire **`data` folder** before updating the project or making major changes. Save Management also offers **Export All Data** and **Create Backup**. Saves use serialized writes, a temporary file, and atomic replacement.

An exported bundle includes state, definitions, and defaults. It is **not** interchangeable with `save.json`. Automated import and restore are planned. For manual player restoration, stop the server, keep a copy of the current data, replace `data/player/save.json` with a standalone player backup, then restart. To restore world definitions too, restore the matching `data/config/` folder; player backups alone do not replace those files.

Deleting a zone removes its wild encounters, but preserves collected horses. Deleting a horse gives no gold and does not reverse earlier sales. Definition deletion updates future-use references and closes zones left with empty pools. The original website theme and the last required generator entries remain protected.

## Remaining Features

The same roadmap is available in **Developer Settings → Remaining Features**.

| Remaining feature | Information or decisions needed |
| --- | --- |
| **Horse Editor & custom creator** | Versioned records and preview-first stable updates now cover identity, palette colors, species traits, mutation slots, and skills, with backups and Cosmic locks. Remaining: standalone horse creation, deliberate invalid-combination sandbox overrides, and advanced import options. |
| **Generator refinements** | The specified pipeline is implemented. Remaining: exact species artwork, additional species-specific appearance traits, and any future gameplay rules beyond generation. |
| **Mutation effects & exact artwork** | Selection, duplicate control, thresholds, Cosmic slots, and size shifts work. Define speed/stamina/fertility effects, visual stacking, wings, and supply matching artwork/assets. |
| **Breeding & family history** | Parent eligibility, costs, timing, regional color mixing, trait/mutation inheritance, special-spawn inheritance, twins, and lineage restrictions. Cross-species 50/50 species inheritance is already confirmed. |
| **Inventory, gacha & shop** | Final tack/potion lists, equip slots, effects, consumption, duplicates, and prices. The 50-gold gacha price and main reward splits are already supplied. |
| **Town activities & events** | Costs, rewards, progression, and success rules for Spirit Tame, Plush Machine, Ancient Cave, and Digsite; event schedules and eligible pools. |
| **Import, restore & resets** | Merge versus replace, duplicate handling, reset scope, and backup retention. No additional horse rules are needed. |
| **Collection tools & release polish** | Filter/statistics priorities, bulk actions, final catching/economy defaults, artwork, and browser/accessibility testing. |

See [the detailed open questions](docs/OPEN-QUESTIONS.md) and [development progress](docs/PROGRESS.md).

## For Developers

| Command | Purpose |
| --- | --- |
| `npm start` | Run the local game |
| `npm run dev` | Restart the server when source files change; refresh the browser after UI changes |
| `npm test` | Run isolated automated tests without touching your player save |
| `npm run import:references` | Rebuild the baseline catalog from reference documents plus the supplied Mutated Horse palettes |

The importer replaces the bootstrap catalog; preserve manual catalog edits first. Existing `data/config/` registries remain authoritative and are edited through Horse Definitions. It does not replace player saves.

```text
Aetherion/
├── public/             Browser UI, editors, styles, SVG artwork
├── src/                Save/configuration transactions and spawning pipeline
├── data/               Bootstrap data, live config files, player save, backups
├── docs/               Reference rules, roadmap, project notes
├── scripts/            Reference importer
├── tests/              Persistence, validation, HTTP, template checks
└── server.js           Local HTTP server and JSON API
```

The automated suite checks persistence, deletion, palettes, theme contrast, profiles, search, and form behavior. **Visual browser QA remains unverified** because the available browser tool blocked localhost observation; desktop/mobile layout and full click-through checks remain on the release checklist.

---

<div align="center">

✦ **A little world of your own.** ✦

</div>
