# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Calligra activity
- Tutorial step 9: integrate a tutorial
- Add a fullscreen button in Gears activity #411
- Add new Fonts for Write Activity
- Add an option to choose board size of Game of Life activity #381
- Allow to control speed generation in Game of Life activity #380
- Add a fullscreen button in Memorize activity #401
- Add a fullscreen button in XO Editor activity #415
- Add a fullscreen button in TamTam micro activity #409
- Add a fullscreen button in Clock activity #412
- Add a fullscreen button in Moon activity #413
- Add a fullscreen button in BlockRain activity #416
- Add a fullscreen button in ColorMyWorld activity #414
- Add a fullscreen button in Abacus activity #402
- Add a tutorial to the Memorize activity #427
- Add a tutorial to the VideoViewer activity #435
- Add a fullscreen button in the Maze activity #400
- Add a fullscreen button in Constellation activity #417
- Add a tutorial to the Fototoon activity #443
- Add a tutorial to the Paint activity #425
- Add a tutorial to the Moon activity #432
- Add a tutorial to the SprintMath activity #444
- Add a tutorial to the Record activity #433
- Add a tutorial to the Constellation activity #446
- Add a tutorial to the Reflection activity #440
- Add superscript and subscript features to Write activity
- Add a fullscreen button in Abecedarium activity #406
- Add a tutorial to the XOEditor activity #439
- Add a fullscreen button in LastOneLose activity #418
- Add a tutorial to the LastOneLose activity #447
- Add a tutorial to the Write activity #445
- Add a tutorial to the Abacus activity #441
- Add a fullscreen button in Calculate activity #408
- Add a tutorial to the MazeWeb activity #424
- Add a tutorial to the TamTam Micro activity #426
- Add a tutorial to the Clock activity #430
- Support for no signup mode
- Add a tutorial to the Flip activity #442
- Add a tutorial to the PhysicsJS activity #428

### Changed
- Double size of Record images in WebApp and electron App
- Add a message when disconnected by the server or by another device
- Improve Gears Tutorial #396
- Improve Exerciser UI to avoid accidental deletion #455
- Changing server URL at login need one more click now

### Fixed
- Activity palette not visible on Tank Operation activity #371
- Record images don't fit the thumbnail size in iOS/Android
- Long touch on Memory items don't work on Android
- Jump in generation in Game of Life activity on Chrome #388
- Long name hide text in Chat activity #383
- Image selection error in Write activity after scrolling #390
- Board is not drawn correctly in LastOneLost activity when open from the Journal #419
- Clear icon in Game of Life activity is non standard #397
- Image insertion don't work in shared mode in Paint activity #384
- Close the presence palette when the activity is shared #398
- Board size in Flip activity is not optimized #405


## [1.2.0] - 2019-09-26
### Added
- Write activity
- Constellation activity
- Pomodoro activity
- QR Code for scanning server URL on iOS/Android
- Update to official Scratch 3.3 release
- Support for localization in Scratch
- Improved Exerciser activity: multimedia support, new templates, results detail
- Dynamically generate favicon and title
- Architecture page and schemas
- Tutorial step 7: use journal chooser dialog
- Tutorial step 8: create your own palette
- Use IndexedDB instead of localStorage for storing Journal items content
- Support for TXT/DOC/ODT/PDF files in Journal
- Support for MP3/MP4 files in Journal
- Add export sound to Journal feature in Abecedarium activity
- Add export video to Journal feature in VideoViewer activity
- Click on a PDF in Journal now open a preview window
- Add access to Abecedarium database (image/sound) from Journal Chooser popup
- Allow move/resize of inserted image in Paint activity

### Changed
- Improve consistency about shared palette position in toolbar

### Fixed
- QRCode and Record no longer work on Chrome 71
- Add a delete button in the new idea input field of Labyrinth activity #262
- Increase size of items in StopWatch activity #261
- Save Maze level in Journal #260
- Bad localization for some countries name in Color My World activity #265
- Integrate presence in Labyrinth activity #263
- Improve Record activity to see picture in real time #266
- Allow clicking on Abacus balls to move it #146
- Memorize responsive seems broken on phones #106
- Stopwatch Activity, lap Timings vanish after a few recordings #280
- Turtle Blocks Activity hangs on Android App #185
- Sugarizer OS hang when multiple click on an icon #338
- Message overlaps with user name in Chat Activity #328
- Jappy Activity print preview popup #326
- Toolbar overlap issue in Speak Activity #324
- Smileys not displayed properly in chat prototype activity #322
- Cursor issue in calculator activity on Chrome #318
- Duplicated text in QR Code Activity history #314
- Audio bar not displaying in chrome when opening a audio file #312
- Display language settings in 2 languages #292
- Gear colours are reset on resume #336
- Added Tool tips to Calculate Activity
- Users should be able to send images in chat prototype #330
- No erase button for recordings in Record activity #344
- Order Journal filter by activity name
- Snapcraft version lost context #346
- Snapcraft version don't allow to import/export file into/from Journal #350
- Update home image for TankOp activity
- Grammatical Errors in the Documentation #347
- Now support offline mode on Scratch for iOS
- Camera doesn't work on Record/QRCode activities for Snapcraft version #351
- Add a pause button to the Physics activity #354
- Context is lost the second time in Abecedarium activity #359
- Sound not play on Memorize activity in iOS
- Record activity don't work in Safari #362
- Error in console in Calculate activity when reopen an empty instance #358
- Localize activity name in title
- Activity palette icon has reversed colors
- XOEditor activity generate multiple entries in the Journal #370
- Clear icon in XOEditor activity is not consistent #372


## [1.1.0] - 2019-01-20
### Added
- Desktop version for GNU Linux, MacOS and Windows using electron
- Ebook Reader activity
- Exerciser activity
- Sprint Math activity
- Add a sort palette in Journal
- Allow action on multiple items in Journal
- Copy from Journal to device now available on all platforms
- Copy from device to Journal feature
- Help tutorial on initial screen
- Help on activities in list view

### Changed
- Portuguese localization
- Replace filter popups in Journal by palettes
- Increase favorite icon size in Journal and List View
- Full offline version of Scratch (sprites, background and sounds) - except on iOS
- Add Emoji support in Chat activity

### Fixed
- Update Lunar ephemerides phase for 2018 to 2024 in Moon activity #219
- DOM-based XSS vulnerability in the MarkDown Editor Activity #158
- DOM-based XSS vulnerability in the Get Things Done Activity #160
- Save Stopwatch activity context in Journal #201
- Flip activity don't detect end of game #215
- Align buttons better in tutorial #135
- ChatPrototype activity does not sanitize input #225
- Fototoon close icon missing in small screens #213
- Save Clock activity settings in Journal #204
- Add number of play in Flip activity #234
- Save Blockrain activity context in Journal #203
- Activity Idea: Math Quiz #187
- Abacus does not display solution with big numbers #140
- Change background color for Speak activity #245
- Add the sleeping face into the Speak activity #246
- Add an erase button into GridPaint activity #242
- Add an history of last QR Code generated/read in QR Code activity #244
- Save Speak history in Journal #209
- Improve Maze activity to allow playing with presence #208
- No San-Marino and Vatican in Color My World app #174
- Improve LOL activity to play against another user using presence #243

### Removed
- Remove Cordova activity
- Remove Welcome Web activity
- Chrome OS version
- Windows 10 version from the store, now using an installer


## [1.0.1] - 2018-07-07
### Added
- Better handling of lost of connection in Neighborhood view
- Compatibility with Sugarizer School Box

### Changed
- Sugarizer App start without sync at startup
- Force sync to true by default
- Remove selection on password text button
- Update VideoViewer format to use remote library settings
- Change default server connection to connect to HTTP instead of HTTPS
- Automatically switch to HTTPS when server provide it
- Fix license issues

### Removed
- Remove TurtleJS and Jappy from all store


## [1.0] - 2018-05-14
### Added
- Login Screen
- Journal synchronization
- Security and privacy settings
- Scratch activity
- Fototoon activity
- Flip activity
- Game of life activity
- Activity Development Tutorial

### Changed
- Handle large journal size locally and on remote server
- Integrate Paint items in Journal popup
- Handle localization with Weblate
- Fix Chrome OS storage issue

### Fixed
- Speak activity don't work on iOS #202
- Typo in one of the help messages #175
- Localization issue when launched as Chrome Extension in some language #173
- The Record Activity doesn't work in the HTTP version of Sugarizer #159
- Dropdown looks weird when lot of items inside #152
- Clicking On Play Again should stop gear Activity  #137
- Search icon does not look right #136
- Bug in sound card in Memorize #133
- Sugarizer offers Shutdown and Reset #129
- Sugarizer activities failed on Sugar 0.110 #116
- Sugarizer Scratch enhancement #65

### Removed
- Sugarizer Server (now in a separate repository)


## [0.9] - 2017-09-10
### Added
- Abacus activity
- Reflection activity
- ColorMyWorld activity
- Jappy activity
- Blockrain activity
- QRCode activity
- XO Editor activity
- Integrated Tutorial
- Journal Popup

### Changed
- Updated TurtleJS activity
- Better iOS support

### Fixed
- Add buttons in Markdown activity to show/hide Editor/Preview #105
- MazeWeb: Show Red Face On Start #69
- Get Things Done: Reorder Items #68


## [0.8] - 2017-01-05
### Added
- Speak activity
- Moon activity
- Video Viewer activity
- Shared Notes activity
- Windows 10 support and store availability
- Performance improvement: script optimization and lazy loading of data
- Better touch support: scrollable home view and better handling of long touch
- Application size reduction
- Sugarizer OS: Sugarizer as Android launcher

### Changed
- Updated Etoys activity

### Fixed
- Portuguese localization #74
- Localization for Markdown Activity #72
- KA View Activity, audio does not stop playing on exit #58
- Naming of Components #44
- TurtleJS unavailable on the online demo version #39

### Removed
- KA View activity


## [0.7] - 2016-01-08
### Added
- Calculate activity
- Record activity
- Physics activity
- Labyrinth activity
- KA View activity
- TurtleBlockJS activity

### Changed
- Full featured Paint activity
- Full featured Memorize activity

### Removed
- TurtleJS Activity
- Learn to code activity


## [0.6] - 2015-04-13
### Added
- Neighborhood view and presence
- TamTam Micro activity
- iOS support and store availability
- Chrome App support and store availability
- F-Droid support and store availability
- An initialization screen let you set preference at startup
- Sugarizer automatically detect language at first launch
- server.sugarizer.org is now the default server
- Igbo and Yoruba localization
- Arabic localization
- Japanese localization
- Cordova activity

### Changed
- Icon activity color in Journal and Home view now vary depending of last user color

### Removed
- ConnectTheDots activity


## [0.5] - 2014-12-07
### Added
- Responsive Design
- Firefox OS support and store availability
- Publication on Google Play, Amazon Store, Firefox Market Place
- Etoys activity
- Learn to code activity
- German localization

### Changed
- Improve Android support
- Updated TurtleJS version, now save automatically context in the Journal
- Updated Gears version, now use colors for gears
- Favorites activities are now saved in user settings
- Favorites activities are now configurable at server settings


## [0.4] - 2014-05-24
### Added
- Sugar compatibility
- Server collaboration
- Presence API prototype
- Server connectivity to Client
- API to server features
- Activity template
- Chat prototype activity
- TankOp activity
- TurtleJS activity

### Changed
- Improve Journal view: rename, delete and popup menu.
- Improve Android experience


## [0.3] - 2014-02-07
### Added
- Settings dialog for name, buddy color and language
- Launching new activity from List view
- Popup menu on List view
- Localization: English, French and Spanish
- Full buddy menu
- Handle search on Favorite view
- Handle search on List view
- Handle search on Journal
- Gridpaint activity
- Abecedarium activity
- Foodchain activity
- Maze activity
- IE compatibility
- Safari compatibility
- Firefox comptability
- Full support of filtering in home view, list view and journal,

### Changed
- Fix bug when click on popup header with no history


## [0.2] - 2014-01-04
### Added
- Journal view
- Handle datastore storage
- Popup menu on activities
- Handle window resize

### Changed
- Favorite view is now generated


## [0.1] - 2013-11-14
### Added
- Favorite view
- Android version
- Clock activity
- ConnectTheDots activity
- Gears activity
- GetThingsDone activity
- LastOneLoses activity
- Markdown activity
- Memorize activity
- Paint activity
- Stopwatch activity
- WelcomeWeb activity
