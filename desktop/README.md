# Gallorin Desktop

The Electron build wraps the same local game/server. The browser launchers and `npm start` still work.

## Develop and package (Windows x64)

1. Install Node.js 22.12+ and run `npm ci`.
2. `npm run desktop` opens the desktop app.
3. `npm run desktop:build` creates `dist/Gallorin Setup <version>.exe`.
4. Install that file. Players do not need Node, npm, Git, or the repository.

The splash uses the existing gold horse emblem, dark woodland tones, and a 4.5-second minimum reveal. It does not claim a fake loading percentage. The game must finish loading before it appears. Reduced-motion preferences are respected.

If a graphics driver causes problems, set `AETHERION_SOFTWARE_RENDERING=1` before launching. This compatibility switch disables hardware acceleration. The icon generator uses software rendering; regenerate with `npx electron scripts/build-desktop-icon.cjs`.

## Gallorin version series

Gallorin starts at **v1.0.0 — The Symphony of the Wilds**. Aetherion releases are legacy history. Gallorin tags use gallorin-v followed by major.minor.patch to avoid collisions with legacy tags. The updater accepts only this series. Legacy Aetherion users need a one-time manual Gallorin install because the version resets from 2.0.0 to 1.0.0; saves remain compatible.

## Saves and configuration

Windows data is stored independently of the installation:

- `%APPDATA%\Gallorin\data\player\save.json`: horses, gold, encounters, and player settings.
- `%APPDATA%\Gallorin\data\config\`: editable Compendium and spawning JSON.
- `%APPDATA%\Gallorin\data\backups\`: save backups.
- `%APPDATA%\Gallorin\desktop.log`: startup/update diagnostics.

Development launches with npm run desktop use %APPDATA%\Gallorin Development instead, with independent saves and Chromium caches. You can copy existing data on first launch. Installed player data stays in %APPDATA%\Gallorin.

Existing installations keep using their original Aetherion data folder when no Gallorin folder exists; no player files are moved or reset. New installations use the paths above. The Windows application ID, JSON format identifiers, and GitHub update repository retain their legacy identifiers for compatibility.

The Gallorin menu opens these folders. Updates replace application files only. Uninstalling retains app data.

On first launch, choose **Start New** or **Copy Existing Data**. For migration, stop the browser server first and choose the original repository's `data` folder. The app validates a staged copy of player/config/backups, then activates it. It never overwrites the source or an existing desktop data folder. Each edition subsequently has independent saves.

## GitHub Releases and updates

The repository is public, so players need no GitHub account or token.

1. Before a release, increment package.json using major.minor.patch, update README features/version, run tests, and commit. The website footer uses that version automatically.
2. When ready, push the approved changes to main.
3. Create and push a matching tag, for example `gallorin-v1.0.0` for version `1.0.0`.
4. **Actions → Windows Desktop Release** builds and tests the Windows installer, smoke-tests the packaged app before creating a GitHub Release using the workflow's built-in GITHUB_TOKEN. No personal token belongs in the app.
5. After successful checks, the workflow uploads the installer, blockmap, and latest.yml, then publishes the release and explicitly marks it latest.
6. Installed Gallorin apps can now discover it. A normal code push alone does not publish an app update.

The workflow can also be started manually. Repository Actions must be enabled; its job requests contents:write to create the draft release.

At startup, the packaged app checks in the background. Users approve downloading and restarting. Offline/update failures do not stop gameplay. Closing the app does not install a deferred update automatically. **Gallorin → Check for Updates** retries manually. Pending writes finish before installation.

Local builds are unsigned unless a signing identity is configured. Windows may show an unknown-publisher warning. For signed distribution, configure an appropriate Windows code-signing service/certificate in GitHub Actions before publishing; do not commit private keys. No paid signing service has been configured by this change.

Release downloads/installations require an actual published newer version to test end to end. The automated tests cover check availability, consent, deferral, offline failure, and save-before-install ordering.

## Isolated desktop smoke test

Set `AETHERION_TEST_DATA` to a new temporary directory, then run `npx electron . --smoke-test`. It uses that directory exclusively, skips migration/update dialogs, validates renderer startup and Node isolation, captures the game and splash, drains saves, and exits. Never point this variable at real player data.

Desktop startup now opens a woodland start menu after the splash. Play enters the game; Exit Game closes it. Settings > Audio adjusts saved menu-music volume, with a mute button on the menu. Music starts at the title screen and continues during gameplay. Escape opens the themed menu and audio settings. Audio preferences are stored in the edition's Chromium storage.
