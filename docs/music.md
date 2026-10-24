# Music player

Open **User Interface → Music** to import MP3 files and build ordered playlists for
navigation sections, their individual pages, each zone, and the main menu.

- MP3s are copied into the active game data folder, not referenced from Downloads.
- The library and assignments are saved in data/music/library.json.
- Songs are stored alongside it with unique filenames. Their display names remain
  the original filenames without the .mp3 extension.
- Each import accepts up to 50 MB. Multiple files can be selected together.
- Assignments save automatically. Audio Settings (also in the main menu and ESC
  menu) contains Music, Sound Effects, and Crossfade. Crossfade ranges from
  0 to 10 seconds and defaults to 2 seconds.
- Unassigned pages inherit their section playlist, then Default Music. Compendium,
  User Interface, and Developer Settings keep the current music unless explicitly assigned.
- Playlists advance in order and wrap at the end, with crossfades between songs.
  Play/pause, previous/next, stop, restart, seeking, volume, and mute are available
  in the full-width bottom player. One-song playlists loop that song.
- Each folder and playlist can collapse independently. Tables show MP3 durations.
- Playlist rows show a number that becomes Play on hover or while the song is current.
  Trash controls follow the same hover/current-song behavior and remove a song only
  from that playlist. The protected default uses the same trash icon.
- Playlist headers show song counts next to their collapse arrow. Add/reorder
  controls are intentionally absent; playlist assignment remains supported by the data/API.
- Deleting from Your Music still confirms and removes a song from the whole library.
- Empty playlists remain empty/silent. Use Default restores section/default inheritance.
- Song titles are formatted from MP3 filenames; the player artist is Gallorin Studios.
- Existing single-song assignments become one-song playlists without losing settings.
- Desktop playback continues through page reloads and menu transitions.
  Volume/mute are shared with the menu and ESC audio settings.
- Browser playback may require pressing Play once because of browser autoplay rules.
- Delete confirms first and removes both the copied file and its assignments.
- User-imported music files are local and excluded from Git and the save JSON export. Bundled soundtrack sources are tracked in the repository.
  Copy the music folder separately when transferring a library.

Desktop storage: %APPDATA%/Gallorin/data/music.
Development desktop storage: %APPDATA%/Gallorin Development/data/music.
Browser edition: the project's data/music folder (or HORSE_DATA_DIR/music).
The built-in song stays bundled with the app and cannot be deleted.

The bundled soundtrack is organized under desktop/assets/music, including
main-menu.mp3. The ten additional songs are registered in data/defaults/music.json
and copied into each local library once. Deleted songs remain deleted on restart.
The original main-menu song, Glades of Gallorin, is always available as the protected default.
Main Menu can be configured independently from Default Music.

Music and Sound Effects levels are independent and save automatically. The sound-effect
channel is available for game effects; changing it does not change the music level.
Audio Settings has an X close button, with no Done or mute control; music mute remains
available on the player and main-menu footer.

Missing or blank duration values are backfilled from MP3 metadata at startup,
including existing libraries. Durations align left in the table.
