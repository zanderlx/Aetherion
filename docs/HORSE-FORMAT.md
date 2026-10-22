# Horse JSON format · Version 1

Use **My Horses → Import Horse** to select a `.json` file. Open an owned horse and choose **Export Horse** to download the same format as `<name>.horse.json`. Exporting keeps the horse in your stable.

Selecting a valid file opens a read-only preview. Only **Confirm Import** saves the horse. **Cancel Import**, X, or Esc closes the preview without changing your stable. Sell and Export are unavailable in this preview.

See [the complete importable example](horse-format.example.json).

```json
{
  "format": "aetherion-horse",
  "version": 1,
  "exportedAt": "2026-10-20T00:00:00.000Z",
  "horse": {
    "id": "original-horse-id",
    "name": "Moonbeam",
    "species": "Unicorn"
  }
}
```

This excerpt shows the envelope; the example file contains all required horse fields. `format`, `version`, and `horse` are required. `exportedAt` and `horse.id` are informational. One file holds one horse, with a maximum file size of 512 KB.

## Horse fields

| Field | Format |
| --- | --- |
| `name` | Text, up to 60 characters; empty uses the species as the display name. |
| `species`, `origin` | Nonempty text, up to 100 characters. Imported species do not need an existing library definition. |
| `age` | Internal life-stage value: `Foal`, `Adult`, or `Elder`. The profile instead displays days since acquisition. |
| `gender` | `Female` or `Male`. |
| `size` | Mammoth, Draft, Giant, Huge, Big, Normal, Little, Small, Tiny, Teeny, or Teacup. |
| `sizePercent` | Optional; must match the size: 125, 120, 115, 110, 105, 100, 95, 90, 85, 80, or 75 respectively. |
| `birthday` | A real `YYYY-MM-DD` date, no later than today. |
| `createdAt` | A timestamp beginning with `YYYY-MM-DDT`, including a time zone; exports use UTC ISO format. |
| `personality` | Object with `name` (up to 100 characters) and `description` (up to 4,000); optional definition `id`. |
| `personalityDescription` | Optional per-horse description, up to 4,000 characters. Defaults to the personality description; an empty string stays empty. |
| `notes` | Optional plain text, up to 4,000 characters. Line breaks are retained. |
| `palette` | Object with `name`, optional `id`, `group`, `natural`, and the nine-region `colors` object below. |
| `eye` | Object with `name` and 1–6 `colors`; optional `id` and `rarity`. |
| `traits` | Object mapping up to 40 category names (up to 60 characters each) to arrays of up to 30 trait names (up to 120 characters each). Empty arrays are allowed. |
| `mutations` | Array of up to 30 names or objects with `name`, optional `description` (up to 4,000 characters), and optional `type`. Recorded mutations do not execute gameplay effects. |
| `specialSpawn` | Optional text or `null`. |
| `favorite`, `preview`, `traitsComplete` | Optional booleans; defaults are `false`, `true`, and `false`. |
| `locationId` | Optional original zone ID, up to 100 characters; defaults to `imported`. The zone need not exist locally. |

Palette `colors` requires these exact keys: `Coat Top`, `Coat Bottom`, `Hair`, `Hoof`, `Nose`, `Sock`, `Keratin`, `Paint`, and `Pattern`. All palette and eye colors must use six-digit `#RRGGBB` values. Exports normalize colors to uppercase.

Spawned horse files also preserve optional species/palette/eye/personality registry IDs, personality system ID and behavior tags, palette skin/scope metadata, selected skin ID, and eye texture/layer data. Older version-1 files remain valid.

Optional `rarityTier` (integer 1–4) and `speciesEvent` (event name or null) preserve card-ranking metadata. Special mutation names or `specialSpawn` determine gold glows. Files without these fields remain valid and use matching local species data when available.

## Import rules

- Every import creates a fresh local horse ID and a new stable-arrival timestamp and Birthday date. Profile Age starts at 0 days. Importing the same file again creates a separate copy; it never replaces an existing horse.
- Stable capacity applies unless Ignore Stable Limit is enabled. Imports do not change gold, transactions, or encounters.
- Horse appearance and personality are self-contained snapshots. Importing does not add or modify library definitions or zones.
- Unknown fields are ignored; recognized fields are validated and normalized. Unsupported format versions, invalid dates/colors, or malformed records reject the entire import without saving.
- Internal sale metadata, original stable-arrival timestamps, and unrecognized mutation metadata are not transferred. Player saves and full backup bundles are different formats.
