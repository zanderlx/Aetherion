The typical flow of the game would be:

    - Select a map/location
    - Look for a horse -> a horse gets spawned via the logic below
    - Catch or sell (selling is default 300 gold)
    - Look for a horse or change map/location etc

I would like a breeding system if its possible, any species can breed together it just picks 50/50 which one. Colors mix too, but its not right in the middle (so a black mixing with white could be either black OR white or some kind of middle). Traits are the tricky part but I know how it works if we can do it o.o

Would need an inventory system to track money and items, also a stable for all horses collected? Worst case I can track it myself :)

There is a gacha machine in town, put in 50 gold and spin for a random tack or potion item. 95% for tack, 5% for a potion. The tack is 60% chance to be unthemed, 40% for a theme (event themes are a 30% chance, 70% for non-event). Will send a tack list and potions list once they're ready, for now placeholders should be okay!!

---

There are ~48 current species in the game. Alot of them are event specific and will be in their own spawn pools.

    The zones for catching horses are:
    - Town (only map not for horses but for the shop)
    - Aetherion Wilds (all of the non-event horses are here)
    - Hallowhoof (Halloween event map)
    - UNNAMED (Alien event map)
    - UNNAMED (Christmas event map)
    - UNNAMED (Medieval event map)
    - UNNAMED (Valentines event map)
    - UNNAMED (Carnival event map)
    - UNNAMED (Royal event map)
    - UNNAMED (Easter event map)

---

When rolling for a horse, roll for species first

    - 25% to roll an uncommon species (felorse at 30%, friesan at 20%, clydesdale at 30%, or akhal teke at 35%)
    - 10% to roll a rare species (nephyrian at 25%, caniquine at 40%, or serpentine at 35%)
    - 0.1% chance of Solar or Lunar (Lunar is the slightly rarer of the two)
    - 0.05% chance of Heavenly or Void (Void is the slightly rarer of the two)
    - 0.025% chance to spawn and Astral and is the rarest. 
    
    When a Solar/Lunar/Heavenly/Void/Astral mutation spawns, the species can be ANY species, rolled equally. This includes event species!

---

When a horse is created, the following information is needed:

    Age (foal, adult, or elder)
    
    Origins (usually just "Wild" but may have others in the future)
    
    Gender (either male or female)

    Size (mammoth and teacup have a less than 1% chance of occuring but I do not know the actual values, I am assuming a bell curve from normal)
        - Mammoth (125%)
        - Draft (120%)
        - Giant (115%)
        - Huge (110%)
        - Big (105%)
        - Normal (100%)
        - Little (95%)
        - Small (90%)
        - Tiny (85%)
        - Teeny (80%)
        - Teacup (75%)
        
    Species (Ghoulsteed, Peryton, Clydesdale, etc)
    
    Birthday (always the current date, if possible)
    
    Traits (13 total max, 3 are baseline), traits are unique for each species without overlap
           - Patterns: choose 0 to 4 from the patterns section
           - Paints: choose 0 to 2 from the pains section
           - Cosmetics: choose 0 to 4 from the cosmetics section
           - Keratin: 0 to 1 (only when applicable - not all species have traits for this)
           - Ears: 0 to 1 (only when applicable - not all species have traits for this)
           - Whiskers: 0 to 1 (only when applicable - not all species have traits for this)
           - Every horse must have 1 Mane, 1 Tail, and 1 Eye Color by default.
           
    Personalities (draw one from the personality list)
    
    Mutation slots (0 to 4. roll for the first, if it passes roll again, etc). Wings take up a mutation slot.
         1 mutation = 80%
         2 mutations = 40%
         3 mutations = 15%
         4 mutations = 5%
         
    Mutations (if they get rolled. 95% for standard mutation, 5% for special mutation)
    
    Horse colors (take from the color palettes file, all spots are set)