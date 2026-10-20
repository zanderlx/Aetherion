# Project: Fantasy Horse Collection & Breeding Game

You are my lead game developer, website designer, and software architect.

I want you to help me turn my existing GitHub repository into a fully functional, visually polished, fantasy horse-collecting game that runs entirely on **localhost**.

This is a personal hobby project, not a commercial game. I want to have fun collecting, generating, customizing, and breeding unique horses.

You have creative freedom to improve the design, gameplay experience, and project organization.

**Your goal is to build a real, working application, not simply produce a design mockup or development plan.**

## 1. Project Resources

I will provide you with:

1. My existing GitHub repository.
2. Eleven Markdown files describing the game.
3. A screenshot showing a rough example of the website layout.

Start by examining my existing repository. Preserve useful work and reorganize the project where appropriate.

The Markdown files are not yet included in the repository.

The most important document is `Game Logic.md`. Treat this as the main source of truth for gameplay mechanics.

The supporting files are:

- `Species.md`
- `Ghoulsteed Traits.md`
- `Mutations.md`
- `Natural Palettes.md`
- `Unnatural Palettes.md`
- `Eye Colors.md`
- `Personalities.md`
- `Themes.md`
- `Horse Items.md`
- `Horse Template.md`

Use these files to understand the game's systems and convert their information into structured game data.

Preserve the original Markdown files as references.

If information is incomplete or contradictory, identify it and ask me rather than silently inventing important gameplay rules.

## 2. Overall Game Concept

Create a fantasy horse-collecting game centered around randomly generated horses.

The basic gameplay loop is:

1. Choose a location to explore.
2. Discover randomly generated wild horses.
3. Inspect their appearance and characteristics.
4. Catch or sell horses.
5. Collect horses in a stable.
6. Earn and spend gold.
7. Obtain equipment and potions.
8. Breed collected horses to produce offspring.
9. Search for increasingly rare and interesting combinations.

Each horse should feel unique through its species, colors, size, traits, mutations, personality, and other characteristics.

The main attraction is the **random horse generation and collection system**.

I want the game to be enjoyable even when I'm simply generating horses to see what unusual combinations appear.

## 3. Visual Design and Atmosphere

Create an immersive fantasy equestrian aesthetic.

The game should feel like a magical stable, fantasy horse sanctuary, or equestrian adventure.

Suggested design elements:

- Dark mahogany and rich burgundy.
- Warm charcoal and dark brown backgrounds.
- Antique gold accents.
- Ivory or parchment-colored typography.
- Decorative fantasy-inspired borders.
- Subtle leather, wood, and parchment textures.
- Elegant headings with readable body text.
- Horse, horseshoe, saddle, stable, and fantasy-inspired icons.
- Smooth transitions and subtle animations.
- Attractive horse cards and detailed horse profiles.
- Atmospheric backgrounds for different locations.

Use the screenshot I provide as a reference for the general navigation and Wild Horses layout.

However, the screenshot is only a rough draft. You may substantially improve the layout, styling, spacing, colors, and visual presentation.

Avoid making the website look like a generic business dashboard.

Make it feel like an actual game.

Use replaceable placeholder images where artwork is unavailable. Do not misrepresent stock photographs as accurate depictions of generated fantasy species.

The design should be polished on desktop, tablet, and mobile.

## 4. Main Navigation

Create a persistent sidebar on desktop with expandable navigation sections.

The sidebar should include:

**Town**
- Gacha Machine
- Spirit Tame
- Plush Machine
- Ancient Cave
- Digsite

**Stables**
- My Horses
- Favorites
- Horse Management

**Inventory**
- Accessories
- Potions

**Wilds**
- Aetherion Wilds
- Hallowhoof
- Other event locations as they are added

**Breeding**
- Breeding Stable
- Breeding History

**Developer Settings**
- Game Settings
- Horse Generator
- Horse Editor
- Species & Traits
- Colors & Palettes
- Mutations
- Spawn Rates
- Economy
- Inventory & Items
- Events & Locations
- Save Management

The exact grouping can be improved if necessary.

The player's current gold balance should always be visible.

The sidebar should have working dropdowns, clear active-page highlighting, and smooth navigation.

On mobile, use a responsive navigation drawer or another mobile-friendly design.

## 5. Wild Horse Discovery

This is the most important initial gameplay feature.

When I visit a location such as Aetherion Wilds, display three randomly generated wild horses.

Use the screenshot as a reference for the three-card layout.

Each horse card should show:

- Species name
- Gender
- Horse image or placeholder
- Important rarity information
- Special spawn or mutation indicators
- An option to inspect the horse

Clicking a horse should open a detailed horse profile.

The profile should include:

- Species
- Age
- Origin
- Gender
- Size
- Birthday
- Personality
- Mane and tail
- Patterns
- Paints
- Cosmetics
- Keratin
- Ears and whiskers
- Eye color
- Body color palette
- Mutations
- Special spawn status

Use `Horse Template.md` as a reference, but improve its layout and responsiveness.

Provide functional actions to:

- Catch the horse.
- Sell the horse.
- Return to the Wilds.
- Search for new horses.

The default horse selling price is 300 gold.

Keep generated horses consistent while they are being inspected. Do not regenerate their characteristics simply because I reopen their profiles.

Allow the number of horses displayed per search to be changed in Developer Settings.

## 6. Random Horse Generation

Implement the generation rules from `Game Logic.md`.

The system should generate:

- Species
- Age
- Origin
- Gender
- Size
- Birthday
- Species-specific traits
- Eye colors
- Natural and unnatural color palettes
- Personality
- Mutation slots
- Standard and special mutations
- Special spawns

Respect the supplied probabilities and restrictions.

Every horse must receive its required baseline characteristics, including one mane, one tail, and one eye color.

Optional traits must follow the category limits and overall trait limit.

Mutations must respect the mutation slot rules.

Special spawns such as Solar, Lunar, Heavenly, Void, and Astral should follow the supplied rules.

Do not assume that every species has the same available traits.

The generator should use the species-specific trait information.

When a species does not yet have a complete trait list, handle it gracefully and clearly indicate that its data is incomplete.

**The generator must be controlled by configurable settings rather than hardcoded values wherever practical.**

Changes made through Developer Settings should affect future generated horses.

Existing collected horses should retain their characteristics unless I deliberately edit them.

## 7. Stables and Horse Collection

Create a functional stable for managing collected horses.

I want to:

- View all collected horses.
- Inspect their detailed profiles.
- Rename horses.
- Favorite or unfavorite horses.
- Search and filter horses.
- Sort by species, size, rarity, birthday, and other characteristics.
- Edit individual horses.
- Sell horses.
- View collection statistics.
- View previously sold horses.

Every horse must have a unique ID.

Collected horses should never disappear after refreshing or restarting the application.

Selling a horse should remove it from the active stable but preserve its complete information in a sold-horse history.

Include confirmation dialogs for destructive actions.

## 8. Inventory, Economy, and Gacha

Create a persistent gold and inventory system.

I should be able to earn gold by selling horses and spend it on items or activities.

The gacha machine should follow the rules in `Game Logic.md`:

- 50 gold per spin.
- 95% chance for tack.
- 5% chance for a potion.
- Tack has a 60% chance to be unthemed.
- Tack has a 40% chance to have a theme.
- Themed tack has a 30% chance for an event theme and a 70% chance for a non-event theme.

The reward should be displayed with an attractive animation or reveal.

Obtained items should be added to inventory.

The inventory should support:

- Equipment
- Accessories
- Potions
- Item quantities
- Item descriptions
- Item rarity
- Event themes

Some items are currently placeholders.

Make it easy to add new items later through Developer Settings.

## 9. Breeding System

I eventually want to breed collected horses.

The supplied rules establish that:

- Different species can breed together.
- Offspring have a 50/50 chance of inheriting either parent's species.
- Colors can inherit from either parent or form intermediate combinations.
- Traits and mutations may be inherited.

The full inheritance rules have not been provided yet.

Prepare the breeding interface and data structure, but do not invent complicated inheritance mechanics without asking me.

Eventually, I want to select two horses, view their characteristics, breed them, and receive a generated offspring.

Breeding history and parent relationships should be saved.

## 10. Local JSON Files and Saving

**Everything must be stored locally in files. Do not use a database.**

Use JSON files for game definitions, configuration, and saved progress.

I want all game information and player progress to remain available after closing and reopening the application.

Save information such as:

- Current gold
- Collected horses
- Sold horses
- Horse modifications
- Inventory
- Items
- Gacha history
- Breeding history
- Game settings
- Developer settings
- Custom species
- Custom traits
- Custom color palettes
- Custom mutations
- Custom locations

Keep the files organized, readable, and easy to back up.

You have freedom to determine the best file structure based on the existing repository.

For example, you may separate game definitions, configuration, and player saves into different folders.

Do not create unnecessary complexity.

Do not use SQLite, PostgreSQL, MongoDB, or another database.

Do not rely on browser localStorage as the primary save system.

Use a suitable local file-writing approach so changes made in the website are actually written to JSON files on my computer.

Saving should be automatic.

Use safe file-writing methods and maintain backups when appropriate.

I should be able to back up my entire game simply by copying the relevant data folder.

## 11. Developer Settings — Full Game Customization

**This is one of the most important features in the entire project.**

I want a dedicated Developer Settings section that allows me to customize almost everything directly through the website.

I should not need to manually open or edit JSON files for normal customization.

The website should provide intuitive settings pages, sliders, dropdowns, checkboxes, number inputs, color pickers, and editors.

Every change should be saved to the appropriate local JSON file.

The Developer Settings section should feel like a built-in game editor.

### A. General Game Settings

Allow me to customize:

- Number of wild horses generated per search.
- Default selling price.
- Starting gold.
- Catching behavior.
- Stable capacity.
- Enabled locations.
- Enabled game features.
- Gameplay restrictions.
- Other general rules.

### B. Spawn Rate Editor

Create a visual editor for spawn probabilities.

I want to adjust:

- Common species probabilities.
- Uncommon species probabilities.
- Rare species probabilities.
- Individual species spawn weights.
- Solar spawn chance.
- Lunar spawn chance.
- Heavenly spawn chance.
- Void spawn chance.
- Astral spawn chance.
- Location-specific spawn pools.
- Event species availability.

For example, I might want to increase the chance of an Astral horse from 0.025% to 25% just for fun.

The interface should clearly display the current probabilities.

Explain when probabilities must add up to 100%, when values are relative weights, and when rolls are independent.

Validate settings so that impossible configurations are not accidentally saved.

Allow intentional extreme settings for experimentation.

### C. Horse Characteristics Editor

I want to customize the characteristics of any collected horse directly from its profile.

Include an **Edit Horse** button.

When clicked, open a full horse editor.

Allow me to change:

- Horse name
- Species
- Age
- Origin
- Gender
- Size
- Birthday
- Personality
- Mane
- Tail
- Patterns
- Paints
- Cosmetics
- Keratin
- Ears
- Whiskers
- Eye color
- Body colors
- Mutations
- Special spawn status

Use appropriate controls for each characteristic.

For example:
- Dropdowns for species and personality.
- Searchable selectors for traits.
- Color pickers for coat and hair colors.
- Checkboxes or multiselects for mutations.
- Sliders or numeric inputs for size.

Changes should immediately update the horse's profile and save to its JSON data.

Provide a **Reset Changes** option before saving.

Allow me to duplicate an existing horse and modify the copy.

Allow me to export an individual horse as JSON and import one later.

### D. Custom Horse Creator

Create a dedicated Custom Horse Creator.

This should let me create a horse entirely from scratch without relying on random generation.

I want to choose every characteristic manually.

Include options to:

- Select any available species.
- Select gender, age, and size.
- Choose a personality.
- Choose mane and tail.
- Add or remove traits.
- Select eye colors.
- Choose or manually create body colors.
- Add mutations.
- Add special spawn mutations.
- Name the horse.
- Save it directly to my stable.

Include a **Randomize** button for individual categories.

For example, I might manually select the species and mutations but randomize everything else.

Also include a **Randomize All** button.

### E. Species and Trait Editor

I want to manage the game's species and trait definitions through the website.

Allow me to:

- View all species.
- Add new species.
- Edit existing species.
- Disable species.
- Assign species to locations.
- Change spawn weights.
- Add and remove traits.
- Edit trait categories.
- Configure trait limits.
- Add descriptions.
- Associate artwork with species or traits.

For example, I should be able to add a completely new species without editing application code.

The new species should become available to the generator once it has valid configuration.

Preserve existing collected horses when species definitions change.

### F. Colors and Palettes Editor

Create a visual color palette editor.

I want to:

- View natural and unnatural palettes.
- Create new palettes.
- Edit existing palettes.
- Delete or disable palettes.
- Assign palettes to locations or events.
- Change palette selection probabilities.
- Edit individual color regions.
- Add new eye colors.
- Change eye color rarity.

Provide color pickers and hexadecimal inputs.

Display live color swatches.

The color regions should include Coat Top, Coat Bottom, Hair, Hoof, Nose, Sock, Keratin, Paint, and Pattern.

Allow me to create a palette from scratch or duplicate an existing palette.

### G. Mutation Editor

Allow me to manage mutations.

I want to:

- View all standard mutations.
- View all special mutations.
- View special spawn mutations.
- Enable or disable mutations.
- Adjust their probabilities.
- Edit mutation descriptions.
- Change mutation slot probabilities.
- Change the maximum number of mutations.
- Assign mutations to individual horses.
- Remove mutations from individual horses.

For mutations with gameplay effects, expose their configurable values when supported.

For example, allow me to change a +10% speed mutation to +50%.

### H. Economy Editor

Allow me to change:

- Current gold balance.
- Starting gold.
- Horse selling prices.
- Gacha costs.
- Item prices.
- Gold rewards.
- Other economy settings.

Include an option for unlimited gold.

### I. Inventory and Item Editor

Allow me to:

- Add items.
- Edit items.
- Delete or disable items.
- Change item quantities.
- Create custom equipment.
- Create custom potions.
- Assign themes.
- Adjust item rarity.
- Change gacha probabilities.
- Give myself items directly.

Allow custom items to be created through the website.

### J. Locations and Events Editor

Allow me to:

- View all locations.
- Add new locations.
- Rename locations.
- Enable or disable locations.
- Assign available species.
- Change location-specific spawn rates.
- Enable event species outside their normal events.
- Change location descriptions.
- Assign background artwork.

New locations should automatically become available in navigation when enabled.

### K. Cheats and Sandbox Mode

Since this is my personal game, I want optional cheats.

Include toggles or settings for:

- Unlimited gold.
- Free gacha spins.
- Guaranteed rare species.
- Guaranteed special spawns.
- Increased mutation chances.
- Maximum traits.
- Unlock all event locations.
- Allow all species in every location.
- Ignore stable limits.
- Ignore normal trait restrictions when manually editing horses.
- Create custom horses instantly.

These should be optional and easy to turn on or off.

I want to experiment freely without the game preventing me from having fun.

### L. Save Management

Create a Save Management page.

Include:

- Export all game data.
- Import a saved game.
- Create a backup.
- Restore a backup.
- View save information.
- View collected horse count.
- View sold horse count.
- View transaction history.
- Reset selected settings to defaults.
- Reset player progress with confirmation.

Dangerous actions must require confirmation.

Never silently delete or overwrite existing save data.

### M. Developer Settings Usability

The Developer Settings interface should be organized and easy to navigate.

Use clear categories, search fields, descriptions, and helpful controls.

For probability editors, show percentages clearly.

For color editors, show visual previews.

For horse editors, show the current values and preview changes before saving.

Include Save, Cancel, Reset, and Restore Default actions where appropriate.

Clearly distinguish between:

- Global settings affecting future horses.
- Game definitions shared by all horses.
- Individual horse modifications.
- Player save data.

Make sure changes persist after restarting the application.

## 12. Customization Rules

The game should have sensible default rules based on the provided Markdown files.

However, I want the freedom to override those rules through Developer Settings.

For example, if the normal maximum is four mutations, I may want to allow more in sandbox mode.

If a species normally cannot have a particular trait, I may want to assign it manually.

If an event species normally appears only during Halloween, I may want it available year-round.

The system should support both normal gameplay and experimental sandbox behavior.

Do not build anti-cheat restrictions.

When custom settings conflict with normal rules, clearly indicate that an override is active.

Keep the normal default values available so I can restore them.

## 13. Responsiveness, Accessibility, and Performance

The entire application must work well on:

- Smartphones
- Tablets
- Laptops
- Desktop monitors

Use responsive layouts, readable typography, and touch-friendly controls.

Follow WCAG AA accessibility guidelines where practical.

Include:
- High text contrast.
- Keyboard navigation.
- Accessible dialogs.
- Clear form labels.
- Visible focus indicators.
- Proper error messages.
- Reduced-motion support.
- Fast loading and smooth interactions.

Use optimized assets and avoid unnecessary dependencies.

## 14. Project Organization

Review my existing repository before deciding on the final structure.

You may reorganize folders and files if doing so makes the project cleaner and easier to maintain.

Keep game definitions separate from saved player progress.

Keep gameplay rules separate from visual components.

Avoid giant files containing unrelated functionality.

Make the project easy to expand as I provide more species, traits, items, and mechanics.

Document how the project is organized in plain English.

I want to be able to understand where everything is without needing extensive programming knowledge.

## 15. Development Phases

Build the application incrementally.

Do not try to implement every system in one enormous step.

### Phase 1 — Website Foundation

- Review the existing repository.
- Review the screenshot.
- Establish the visual design.
- Build the main layout.
- Create sidebar navigation.
- Add the gold display.
- Create the main pages.
- Build the three-card Wild Horses interface.
- Make navigation functional.
- Ensure mobile responsiveness.
- Present a working preview.

### Phase 2 — Horse Generation

- Convert the Markdown files into JSON.
- Implement the random horse generator.
- Add species and rarity rules.
- Add traits, colors, personalities, and mutations.
- Connect the generator to the Wild Horses interface.
- Test generation behavior.

### Phase 3 — Collection and Saving

- Implement catching.
- Implement selling.
- Create the stable.
- Implement horse profiles.
- Add persistent JSON saves.
- Add collection management.

### Phase 4 — Developer Settings

- Build the Developer Settings interface.
- Implement global game settings.
- Add spawn rate controls.
- Add horse editing.
- Add the Custom Horse Creator.
- Add species and trait management.
- Add color and palette editing.
- Add mutation editing.
- Add economy and inventory controls.
- Add cheats and sandbox mode.
- Ensure all changes save to JSON files.

### Phase 5 — Economy and Inventory

- Complete inventory management.
- Implement the gacha machine.
- Add item and potion functionality.
- Implement transaction history.

### Phase 6 — Breeding and Expansion

- Build the breeding interface.
- Ask for missing inheritance rules.
- Implement breeding mechanics.
- Expand event locations.
- Add more species and content.
- Improve artwork and animations.

You may reorganize these phases if necessary to keep the application functional.

Developer Settings are a core requirement, not an optional future enhancement.

## 16. Development Expectations

Please follow these principles:

1. Build actual working features.
2. Do not stop after creating a plan.
3. Preserve useful existing repository content.
4. Do not delete existing work without justification.
5. Keep the application functional after each phase.
6. Test features before claiming they work.
7. Avoid buttons that appear functional but do nothing.
8. Use clear placeholders for unfinished features.
9. Do not invent major gameplay rules without asking.
10. Use the supplied files as the source of truth for default gameplay.
11. Make customization accessible through the website.
12. Save all persistent information to local files.
13. Avoid unnecessary technical complexity.
14. Explain important decisions in plain English.
15. Ask questions only when clarification is genuinely necessary.
16. Keep track of completed and unfinished features.
17. Make reasonable design decisions independently.
18. Keep future expansion in mind.

## 17. Begin Construction

Start by examining my existing GitHub repository, the 11 Markdown files, and the screenshot.

Then begin building **Phase 1: Website Foundation**.

Create a polished horse-themed layout with functional navigation and an interactive Wild Horses page.

Prioritize a beautiful interface, smooth navigation, and a foundation that can support the complete game.

Present a live interactive preview if your environment supports it.

If live preview is unavailable, provide simple instructions for launching the application on localhost.

**Do not stop at a written plan. Begin implementing the game.**
