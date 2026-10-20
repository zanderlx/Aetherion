# Rules to confirm before the probability-based generator

These questions do not block the Phase 1 interface. The current sampler is explicitly labeled as preview data. No ambiguous probabilities have been silently normalized or treated as final rules.

1. **Uncommon species:** Game Logic lists 30% Felorse, 20% Friesan, 30% Clydesdale, and 35% Akhal Teke: a total of 115%. Are these relative weights, or should one or more values change?
2. **Rarity groups:** Game Logic makes those four species uncommon; Species labels them “Rare Spawn.” We will follow Game Logic as requested, but should the label in Species be corrected? Is the remaining ordinary species tier 65%?
3. **Special spawn rates:** Is 0.1% shared by Solar/Lunar, and 0.05% shared by Heavenly/Void, or does each named variant have that chance? What exact split makes Lunar and Void slightly rarer? Are these one exclusive special-spawn roll, or independent rolls with precedence?
4. **Special species pool:** Does “ANY species” include Kirin, Plush, Saurequine, Seraph, and Cybred, whose normal acquisition routes are restricted or undefined?
5. **Age and gender:** What are their probabilities?
6. **Size:** What are the weights for each of the 11 sizes? Mammoth and Teacup are each below 1%, but the precise bell curve is unspecified.
7. **Optional traits:** What determines how many traits each category receives? What ordering or selection method resolves the shared 13-trait ceiling?
8. **Species-specific data:** Only Ghoulsteed has a complete supplied list. Should other species be disabled until defined, or use an explicitly approved generic baseline mane/tail?
9. **Color selection:** What is the natural/unnatural split? Are complete palettes equally likely? Which event palettes may occur at which locations? Several palettes contain blank colors or headings only.
10. **Eye colors:** “Crystal Blue” is supplied as `#942803`, the same as “Blood.” Is this intended? The importer preserves the original value.
11. **Mutation slots:** We read 80%, 40%, 15%, and 5% as conditional rolls that stop after the first failure, as stated in Game Logic. Does a special-spawn mutation occupy one of those slots? Are repeats possible? How are wings selected?
12. **Special mutations:** Are the 25 special mutations equally likely? Is the ordinary special mutation named “Astral” distinct from the Astral special spawn?
13. **Events and acquisition:** What schedule enables event locations, and how are Town activities priced and resolved? No mechanics are provided for Spirit Tame, Plush Machine, Ancient Cave, or Digsite.
14. **Economy and catching:** What starting gold, stable capacity, and catch behavior should the actual game use? Phase 1 uses clearly marked provisional settings.
15. **Breeding:** Species inheritance is confirmed at 50/50. We still need parent eligibility, costs, timing, color mixing probabilities, trait inheritance, mutation inheritance, special-spawn inheritance, and any restrictions.

Additional source observations:

- The supplied species file contains **46 species**, while Game Logic says approximately 48.
- The natural palette file contains one complete palette. The unnatural file includes 15 complete palettes and several incomplete entries.
- Standard mutation percentages total **101.01%**. Confirm corrected values or whether these should be treated as relative weights.
- Item names and effects are explicitly examples; real tack and potion definitions are still needed.
- No layout screenshot was supplied. Phase 1 follows the written design brief.

## Confirmed for version 1

Solar, Lunar, Astral, Heavenly, and Void now have the supplied fixed nine-region palettes, grouped as Mutated Horse. Heavenly is all #FFFFFF; Void is all #000000. Their color values no longer need clarification. Special-spawn probabilities, mutation slot behavior, texture/glow rendering, and breeding inheritance remain open as listed above.

A basic Horse Editor can begin using the existing horse schema. Before expanding it, decide which fields can change, strict validation versus sandbox overrides, and duplication/import ID handling. This is separate from resolving the probability-based generator.
