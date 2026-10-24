# Music player

Open **User Interface → Music** to import MP3 files and choose music for
Stables, Town, each zone, and the default/main-menu track.

- MP3s are copied into the active game data folder, not referenced from Downloads.
- The library and assignments are saved in data/music/library.json.
- Songs are stored alongside it with unique filenames. Their display names remain
  the original filenames without the .mp3 extension.
- Each import accepts up to 50 MB. Multiple files can be selected together.
- Assignments and crossfade duration save automatically. Crossfades range from
  0 to 10 seconds and default to 2 seconds.
- Unassigned locations use the default song. Compendium/settings keep the current
  location's music.
- Songs loop. Play/pause, stop, restart, seeking, volume, and mute are available
  in the full-width bottom player.
- Desktop playback continues through page reloads and menu transitions.
  Volume/mute are shared with the menu and ESC audio settings.
- Browser playback may require pressing Play once because of browser autoplay rules.
- Delete confirms first and removes both the copied file and its assignments.
- Music files are local and excluded from Git and the save JSON export.
  Copy the music folder separately when transferring a library.

Desktop storage: %APPDATA%/Gallorin/data/music.
Development desktop storage: %APPDATA%/Gallorin Development/data/music.
Browser edition: the project's data/music folder (or HORSE_DATA_DIR/music).
The built-in song stays bundled with the app and cannot be deleted.
