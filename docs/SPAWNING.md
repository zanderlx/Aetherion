# Data-driven spawning · Version 1.2

## Horse Definitions dashboard

Open **Horse Definitions** and choose one of the five managers in the main navigation. Each manager lists saved entries and supports Add, Edit, Save, Duplicate, and Delete. Saved horses keep their original snapshots.

| Manager | Editable data |
| --- | --- |
| Species | Name, system ID, integer rarity tier, numeric base attributes and zone checkboxes. |
| Palettes | Nine hex colors, global/species scope, species links, and asset skin IDs. |
| Eye Color | Color combinations, texture ID, and visual layers with texture, optional color, and opacity. |
| Mutations | Name, category, integer weight tokens, attribute thresholds, and size-index shift. The global `ALLOW_DUPLICATE_MUTATIONS` toggle appears at the top. |
| Personalities | Name, system ID, description, and behavior tags. Every horse selects exactly one record. |

Internal `id` values stay stable when an entry is renamed. `systemId` is an editable identifier and must be unique within a registry. Use the web forms for changes that affect zone references.

Eye Color Manager displays a responsive card grid with names, rarities, and color swatches. Click a card (also available by keyboard or touch) to open the editing modal, or Create Eye Color near the header. Deletion from the modal requires confirmation.

## Traits

The separate **Traits** navigation page selects a species and edits its appearance categories and options. Add or remove categories and trait names, then save. Traits stay linked to species in the same local species file; existing horse snapshots remain unchanged.

## Local files

First startup creates these files from existing definitions and zones, preserving current saved horses:

```text
data/config/
  index.json                # schema version and registered zone IDs
  species.json
  palettes.json
  eyes.json
  mutations.json
  personalities.json
  spawn-settings.json
  zones/
    aetherion.json
    hallowhoof.json
    zone-<id>.json
```

The five registries are JSON arrays. Each zone stores its metadata, tags, palette pool, and a `creatures` list:

```json
{
  "creatures": [
    { "speciesId": "unicorn", "weight": 500 },
    { "speciesId": "ghoulsteed", "weight": 100 }
  ]
}
```

The excerpt shows the creature list, not a complete zone file. The matching `speciesPool` name list is maintained for the UI; spawning uses the IDs and absolute weights. Zero-weight entries are excluded. In **My Zones → Creatures Per Zone**, weights can be adjusted independently.

Aetherion’s default species list and tiers are documented in the README. The other registered species remain available to other zones.

Species zone checkboxes append/remove the ID in each selected zone file. Changing a species rarity tier updates its assigned zone weights. Saving other species fields preserves manually adjusted weights. Deleting a species removes its references; deleting a zone removes its JSON file. Empty zones close to exploration.

Every spawn trigger rereads the master and zone files. Editing a file directly also affects future spawns; invalid files reject the request without replacing existing encounters. Refreshing the page reloads valid configuration into the managers.

## Pipeline

1. Roll `0–100`. A result **≤ 0.325** enters the Cosmic path. Cosmic intervals are Solar **0.1%**, Lunar **0.1%**, Heavenly **0.05%**, Void **0.05%**, and Astral **0.025%**.
2. Cosmic species are uniform across the registry, except Aetherion Wilds: its explicit 25-species whitelist also restricts Cosmic spawns. Wild species use the zone's absolute ticket sum. Initial tier weights are **1: 40**, **2: 100**, **3: 250**, **4: 500**.
3. Cascade up to four mutation slots, accepting rolls **≤** each chance. Failure ends the chain immediately:

   | Path | Slot 1 | Slot 2 | Slot 3 | Slot 4 |
   | --- | --- | --- | --- | --- |
   | Cosmic | 100%, selected Cosmic mutation | 80% | 40% | 15% |
   | Wild | 80% | 40% | 15% | 5% |

4. Remaining successful slots use the eligible **Standard** mutation pool. The nineteen initial weights total **10,101 tokens**. With duplicates disabled, selected IDs are removed from the active pool for that horse. Exhausted pools stop safely.
5. Roll gender **50/50**. Roll size with weights **5, 15, 45, 120, 220, 250, 220, 120, 45, 15, 5** from Teacup to Mammoth. Dwarfism shifts down one index; Gigantism shifts up one. Bounds are clamped to `0–10`; repeated copies of the same mutation do not multiply its shift.
6. Randomly select a complete eligible palette, an eye definition, and one personality. Wild palettes must also belong to the zone's palette pool. Cosmic palettes ignore zone restrictions. Palette species scopes still apply on both paths. Skin IDs, texture/layer data, registry IDs, personality system ID, and mutation snapshots are saved with the horse.

`spawn-settings.json` contains the chances, slot arrays, tier weights, size ladder, gender chance, and duplicate flag. Bootstrap defaults live in `public/spawn-config.js`; the generated JSON files become authoritative after migration. Standard mutation tokens are seeded from the supplied table on first migration only. Later CRUD edits and deletions are retained. Cosmic configuration rows reference stable mutation IDs; deleting one of those definitions disables its Cosmic chance rather than silently generating a deleted entry.

## Thresholds and visual data

Species base attributes are numeric JSON, for example `{"stamina": 12}`. A mutation threshold such as `{"stamina": {"min": 10, "max": 20}}` makes that mutation eligible only for species whose base stamina is within that range. Missing required attributes make it ineligible. Thresholds inspect base attributes before gender and size rolls.

An eye layer can be `{"textureId":"eye-glow","color":"#AABBCC","opacity":0.6}`. Asset and texture IDs are metadata; supplied SVG horse art remains illustrative until matching art assets and rendering are added. Mutation descriptions do not execute speed, stamina, fertility, or other gameplay mechanics. The configured size shift is applied during spawning.

## Persistence and recovery

Before the first migration, an existing player save receives a dated `backups/pre-spawning-*.json` copy. Configuration changes use atomic file replacement and a temporary transaction journal. The player save's configuration revision is the commit marker; startup completes committed writes or rolls back interrupted writes. Failed CRUD does not partially update player state or zone files.

Back up the **entire `data/` folder**, including `config/`. Standalone player backups do not contain the authoritative configuration files. Local generated config files are Git-ignored so personal world settings are not published accidentally.
