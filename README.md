<div align="center">

![Aetherion — A Horsekeeper's Chronicle, Version 1](docs/assets/aetherion-banner.svg)

**A local fantasy horse sanctuary you can make your own.**

Explore woodland realms, collect companions, and customize your world through visual editors.

[Get Started](#get-started) · [Features](#version-1-features) · [Customization](#make-it-yours) · [Backups](#backups) · [Roadmap](#remaining-features)

</div>

---

> **Version 1 is a working collection and customization preview.** Catching, saving, editing definitions, and website customization work today. The full probability-based Horse Generator, individual Horse Editor, breeding, inventory gameplay, and Town activities are still planned.

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
git clone https://github.com/zanderlx/HorseGenerator.git
cd HorseGenerator
```

### 3. Start your sanctuary

Open a terminal **inside the extracted or cloned folder containing `package.json`**:

```sh
npm start
```

Open **[http://127.0.0.1:4173](http://127.0.0.1:4173)** in your browser.

**No `npm install` is needed:** version 1 uses Node's built-in modules and has no package dependencies. After downloading Node and the project, the game runs offline.

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

## Version 1 Features

| 🌿 Explore & collect | ✨ Build & customize |
| --- | --- |
| Wilds encounters with inspectable horse profiles | Create, edit, randomize, and delete zones |
| Catch, rename, favorite, sell, and delete horses | Define species, traits, palettes, eyes, and personalities |
| Stable search, sorting, and sold-horse history | Maintain mutation, item, item-theme, and atmosphere definitions |
| Nine-region color swatches and saved characteristics | Edit website wording without changing source code |
| Current gold editor and transaction history | Nine website themes, plus custom theme editing |
| Site-wide search with **Ctrl+K / Cmd+K** | Profile name, About Me, and twelve avatar color choices |
| Automatic JSON saving, exports, and backups | Grouped, alphabetized navigation that retains its scroll position |

Save and Cancel controls appear when a form has changes. Deletion requires confirmation. Existing horse snapshots are preserved when definitions change.

### Mutated Horse palettes

Available under **Horse Definitions → Horse Palettes**:

| Solar | Lunar | Astral | Heavenly | Void |
| --- | --- | --- | --- | --- |
| Gold, orange & red | Icy blues | Lavender & violet | White in all nine regions | Black in all nine regions |

Every supplied hex value is preserved. These are palette definitions; choosing one does **not** activate a special-spawn probability or mutation effect.

### What the preview does

Encounters cycle through configured species, complete palette pools, eye definitions, and personalities. They are **not weighted random spawns**. Preview horses are adult, normal-sized, mutation-free, and free to catch.

Only Ghoulsteed has a complete supplied species-specific trait list. Other species use explicit missing-data labels until you add their traits. The illustrations are replaceable SVG artwork, not exact renders of every species, trait, or mutation.

Starting gold and stable limits are provisional settings. **Current Gold** changes your balance; **Starting Gold** is reserved for future new-game/reset functionality. Editing mutation and item descriptions does not execute their effects.

## Make It Yours

| Navigation section | Contents |
| --- | --- |
| **Developer Settings** | Game Settings, Economy, Save Management, Remaining Features |
| **Horse Definitions** | Species & Traits, Horse Palettes, Eye Colors, Personalities, Mutations |
| **Horse Tools** | Planned Horse Editor, Horse Generator, Spawn Rates |
| **World & Items** | Zones, Zone Atmospheres, Items & Potions, Item Themes |
| **Website & Profile** | Appearance & Themes, Edit Mode, My Profile |

**Website themes:** Aetherion Original, Rosewater, Lavender Cloud, Mint Meadow, Bluebell Morning, Peach Blossom, Lemon Chiffon, Sea Glass, and Silver Mist. The original remains the default. Other presets offer dark and light variants, with dark selected by default. The Aetherion crest follows your theme colors.

**Edit Mode:** enable it from its dedicated page, visit a section, and use the pencils. Save one section immediately, or preview multiple changes and choose **Save Page**. Discard drafts or restore default wording. Text supports live values such as `{gold}`, `{horseCount}`, and `{sellingPrice}`.

**My Profile:** click the avatar at the top right. Choose a named horse-crest color, enter a display name and About Me text, then save. Avatar selection is deterministic; there is no random avatar generator.

## Backups

Your primary save lives on disk, **not in browser localStorage**.

| Location | Contents |
| --- | --- |
| `data/player/save.json` | Horses, gold, settings, profile, custom definitions/zones, and website wording |
| `data/backups/previous-save.json` | The save immediately preceding the latest successful change |
| `data/backups/save-*.json` | Dated backups made from Save Management |
| `data/definitions/catalog.json` | Baseline definitions |
| `docs/references/` | Original reference documents, preserved as supplied |

Copy the entire **`data` folder** before updating the project or making major changes. Save Management also offers **Export All Data** and **Create Backup**. Saves use serialized writes, a temporary file, and atomic replacement.

An exported bundle includes state, definitions, and defaults. It is **not** interchangeable with `save.json`. Automated import and restore are planned. For manual restoration, stop the server, keep a copy of the current data, replace `data/player/save.json` with a standalone player backup, then restart.

Deleting a zone removes its wild encounters, but preserves collected horses. Deleting a horse gives no gold and does not reverse earlier sales. Definition deletion updates future-use references and closes zones left with empty pools. The original website theme and the last required generator entries remain protected.

## Remaining Features

The same roadmap is available in **Developer Settings → Remaining Features**.

| Remaining feature | Information or decisions needed |
| --- | --- |
| **Horse Editor & custom creator** | Editable fields, validation versus sandbox overrides, duplicate IDs, and import behavior. A basic editor can start with the existing schema; spawn probabilities are not a prerequisite. |
| **Horse Generator & Spawn Rates** | Correct or approve relative weights totaling 115% for uncommon species and 101.01% for standard mutations; define special-spawn splits/order, restricted species, age/gender/size distributions, palette/eye odds, and trait counts. |
| **Mutation effects & exact artwork** | Stacking, repeats, wings, special-spawn slots, the two uses of “Astral,” base stats, and visual references/assets. The five fixed mutation palettes are now supplied. |
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

The importer replaces the baseline catalog; preserve manual catalog edits first. It does not replace player saves or their editable library snapshots.

```text
HorseGenerator/
├── public/             Browser UI, editors, styles, SVG artwork
├── src/                Save transactions and preview encounters
├── data/               Definitions, settings, player save, backups
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
