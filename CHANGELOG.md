# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Chart Activity
- Word Puzzle Template in Exerciser activity
- CSV support in the Journal
- Export CSV instead of TXT in Measure.activity
- Export CSV in Stopwatch activity
- Allow any files to be copied from device on Android/iOS

### Changed
- Rewrite of Chat activity
- Migrate localization to i18next
- Updated Etoys activity, supports (local) saving now
- Add pause button in Gears Activity #1506

### Fixed
- Chess multiplayer bug when a third player join #1047
- Undefined tutorial step in curriculum activity #1293
- Bad cursor pointer on scrollbar #1281
- Extra white space to right side of the buttons #1124
- Migrating Measure activity to i18next #1362
- Unable to create password mainly based on numbers #1380
- QR activity Photo Loading Icon Overlaping #1268
- Fototoon Activity: interactive buttons appears under the box shape #1221
- "Help" pop-ups nearly impossible to close in Chrome on Mobile #1403
- XSS injections on Labyrinth JS and Paint Activity #787
- Style for Planet Info in Planet Activity is Hard to See #1448
- Misaligned button in Speak activity #1504
- Added pause functionality to Blockrain activity #1501
- Fraction Bounce Activity, trick to cheat the score #1511
- Tooltips not localized in Reflection activity #1508
- Time fluctuations in Clock Activity #1507
- Resizing textarea in activity palette looks ugly #1303
- Player without face and color #1536
- Undeletable text in FotoToon #1549

## [1.7.0] - 2023-03-28
### Added
- Evaluation mode in Exerciser activity
- Assignments support

### Changed
- Replace Bootstrap Tour by IntroJS in Sugarizer Core
- Replace Bootstrap Tour by IntroJS in activities #1090
- Fix touch support on smart board and touch PC
- Better compatibility with iPad on iOS 13+
- Add statistics feature in activities

### Fixed
- Scratch instructions are not localized #970
- Wrong arrow icon in Exerciser activity #748
- Improve responsive in Calculate activity #982
- Overlap hover effect in circular mode view #974
- No tooltip on home page and journal page #913
- Localize and detail tooltip in Paint activity #1004
- Off-center pictures in Abecedarium Activity #1001
- Generate QRCode with enter in QRCode activity #1007
- Implode Activity: fix Warning message button alignment #1025
- Hover effect to Planet Activity #1029
- Fraction jump tutorial navigation text issue #1035
- Some button text is not in centre with the icon #1052
- Dollar street activity not loading #985
- Overlapping of "activity-palette" with "back-button" in Tangran and Curriculum activity #1055
- Settings of Falabracman activity was overlapping with activity palette #1060
- Overlapping of "activity-palette" in LabyrinthJS.activity #1073
- Blank screen after using Sugarizer Server Dashboard #1079
- Planet type is not localized in Planets activity #1076
- Displaying message when MediaViewer activity is empty #1003
- Add Previous/Next button in DollarStreet activity to navigate in images #1075
- Fix SharedNotes tutorial don't start at end of home tutorial
- Fix SharedNotes content is lost once disconnected #1144 
- Tutorial steps missing at first launch #1089
- Disabling Text selection for buttons #1151
- Physics element are coming above toolbar #1064
- Forbid create elements in Physics that're Bigger than canvas #1171
- Template container interfering the Calligra Activity #1174
- Background color of journal-container and body are same in some activities #1181
- Bad handling of multitouch in Physics activity #849
- Add score counter in Fractions Activity #1032
- Increase Record video limit to 15s, remove size limit
- Chess Activity : Step Number are not visible after 99 #1196
- Speak activity UI enhancement #1201
- TamTam Micro : Piano Color keys doesn't work when pressed near Black keys #1206
- Dollar Street Activity sliders can overlap #1212
- Blockrain Activity : rotate button unaligned #1232
- Get Things Done Activity : plus button unaligned #1245
- QR code Activity: buttons are unaligned #1253
- Markdown Activity: Mouse pointer UI issue on scrollbar #1255
- Physics Js Activity : Navbar still active in fullscreen mode #1290
- Abecedarium Activity: Unexpected behaviour with language change button #1321
- VideoViewer Activity add key mapping #1274
- Chess Activity Moves Alignment Fix #1329
- Stopwatch activity: Activity dropdown UI issue #1297
- Ebook Activity : Add keys to paginate #1273

## [1.6.0] - 2022-01-04
### Added
- Measure activity
- Story activity
- Support for word writing in Calligra activity
- Cookie consent screen
- Delete account buttons in privacy settings

### Changed
- Refactor activities and preferences loading
- Refactor browser and device detection
- Force token expiration when a local account is connected and server unavailable
- Enhancement in multiplayer mode of Memorize activity #795
- Position of scrollbar in listview is saved #945

### Fixed
- Name and XO visible even after removing in Memorize Activity #794
- Calculate activity outputs incorrect error message if variable is changed in function #798
- Popup to connect local user freeze on Android/iOS
- Calligra touch responsiveness is really bad on smartphone #955
- Journal updates on favorite and name are not synchronized
- Impossible to open PDF on iOS #967
- Screen doesn't use the full size on iPhone X #968


## [1.5.0] - 2021-04-27
### Added
- DollarStreet activity
- Xmas Lights activity
- Add Photo mode in Journal popup
- Add a noLoginMode to hide login button on first screen
- Add more fun at end of Calligra #894
- Add an option to remove seconds hand in Clock activity #885
- Check if login exist before asking password #893
- Add presence simulator
- Add option for clock to show or hide minutes, AM hours, PM hours #903
- Add option in Paint to export the current drawing to the journal as an image #911
- Add country flag in Color My World activity #920
- Add a feature to change background in Shared Notes activity #799
- Add a full 24h mode in Clock activity #921
- Add an option to change default server at login
- Add a popup when image is exported in Planets Activity #927

### Changed
- Improved Spanish localization
- Update noServerMode: add a Quit button in the buddy menu
- Use HTTPS for default Sugarizer Server
- Use HTTPS for default library in Ebook Reader activity
- Use HTTPS for default videos libraries in Video Viewer activity
- Change color of Calligra icon - was too white
- Optimize drawing in neighborhood view
- Update to Cordova 10
- Update to Electron 9
- Consider unsecured server accessed via HTTPS like secured server

### Fixed
- Wrong poll is displayed in Vote activity #854
- Font is too small in Tangram activity on Safari or iOS #852
- Leaving Sugarizer app without leaving current activity cause some activities to become empty #850
- Improve frog control using touch/click in FoodChain activity #858
- Allow frog to move with arrow keys in FoodChain activity #857
- Add a popup when image is exported in Moon activity #867
- Add a popup when image is exported in Shared Notes activity #868
- Add a popup when image is exported in Labyrinth activity #869
- Stop playing a video change to fullscreen in VideoViewer activity #859
- Fix JournalChooser icons in Memorize activity
- Color My World Error between the two Korea #898
- Password characters flash from color to black&white #897
- Issues on West Bank, Somalia and Cyprus in Color My World #901
- Add a popup when image/sound is exported in Abecedarium activity #870
- Improve responsiveness of TankOp activity #566
- Improved Responsiveness in Game of life Activity #793
- Wrong values for inverse trigonometric function in Calculate Activity #895
- Palettes not responsive in Dollar Street Activity #929
- Video not responsive in Video Viewer Activity #933
- Sound and Video recording in Record activity don't work on Android/iOS #932
- The way to launch Sugarizer locally with Chrome has changed #937
- Dollar Street Activity no longer work #940


## [1.4.0] - 2020-09-23
### Added
- Fraction activity #205
- Implode activity #710
- Planets activity
- Chess activity
- Curriculum activity
- MindMath activity
- Vote activity
- Tangram activity
- Simon mode game in TamTam activity #686
- Vue.js activity template
- Activity Development Tutorial in Vue.js
- Duplicate action on Journal entries
- ES6 compatibility for activities (except modules)
- Support autologoff mode for Electron and Sugarizer OS
- Support for native Android app in activities.json
- Join shared activity in one click in neighborhood view

### Changed
- Improve Presence palette UI, now handle list of users and disconnection
- Improve Sugarizer spiral in home view #579
- Localize and standardize activities title

### Fixed
- Falabracman activity don't detect win condition for restarted game #723
- Falabracman only accepts a specific letter in case of repeated letters in a word #725
- Speak Text button hides text under it in speak activity #727
- Video Viewer shows tutorial for a feature not available #731
- Labyrinth shows tutorial for functions not available on small screens #733
- Blockrain tutorial overflows off screen on smaller screens #736
- Get Things Done can't handle multiple lines #741
- Stop button not visible in Scratch activity on small screens #715
- Wrong title of network button in Memorize activity #745
- Text not showing under erase button in qr-code activity #700
- Food Chain tutorial off screen in small resolutions #752
- Food Chain activity palette behind canvas #754
- Awkward placement of Labyrinth canvas tutorial #758
- Stopwatch activity palette text not visible #756
- Tutorial button hidden on login screens #697
- Pomodoro timer resets on break change #750
- Awkward positioning of contents in the searchfield of video viewer activity #761
- Size and speed palettes of game of life activity don't works on touch screen #766
- Speech and Face Palettes of speak activity doesn't work on touch screen #764
- Keyboard overlaps input fields on Android #739
- Alignment of help button in some activities #777
- Presence palette implementation in Memorize is non standard #374
- Splitbar in toolbar of Clock activity are half sized in Chrome #789
- Wrong title of blinker button in Game Of Life activity #792
- Alert "user already exists" should come earlier #580
- Wrong song is play on slow device/connection in TamTam activity #803
- Removed resize option in Shared Notes
- When connected to server, activities get shared automatically #810
- Private button in presence palette shares the activity #811
- Export palette in Write activity pop at the wrong place #807
- Last One Loses activity is unplayable after sharing without second player #815
- Spinner on first screen is at the bottom of the screen
- Countries and view palettes pop at the wrong place in Constellation activity
- Timer in chess activity stops on inactive tabs #828


## [1.3.0] - 2020-03-28
### Added
- Calligra activity
- Falabracman activity
- Tutorial step 9: integrate a tutorial
- Add new Fonts for Write Activity
- Add an option to choose board size of Game of Life activity #381
- Allow to control speed generation in Game of Life activity #380
- Add superscript and subscript features to Write activity
- Support for no signup mode
- Add dead cells in Game of life activity #379
- Add a set time mode to the Clock activity #387
- Add a synth keyboard mode in TamTam Micro activity #389
- Add a home button in Grid Paint activity #546
- Add a quit application button in Electron
- Add an option to navigate back to Contents in Ebook Reader #651
- Add a way to restart game in Abecedarium #680
- Add a fullscreen button in Gears activity #411
- Add a fullscreen button in Memorize activity #401
- Add a fullscreen button in XO Editor activity #415
- Add a fullscreen button in TamTam micro activity #409
- Add a fullscreen button in Clock activity #412
- Add a fullscreen button in Moon activity #413
- Add a fullscreen button in BlockRain activity #416
- Add a fullscreen button in ColorMyWorld activity #414
- Add a fullscreen button in Abacus activity #402
- Add a fullscreen button in the Maze activity #400
- Add a fullscreen button in Constellation activity #417
- Add a fullscreen button in Abecedarium activity #406
- Add a fullscreen button in LastOneLose activity #418
- Add a fullscreen button in Calculate activity #408
- Add a fullscreen button in Physics activity #410
- Add a fullscreen button in GameOfLife activity #407
- Add a fullscreen button in the Flip activity #514
- Add a fullscreen button to the TankOp activity #547
- Add a fullscreen button in the Stopwatch activity #599
- Add a fullscreen button in the FoodChain activity #598
- Add a fullscreen button to the Video Viewer activity #600
- Add a fullscreen button in the Exerciser activity #602
- Add a fullscreen button in the GridPaint activity #601
- Add a tutorial to the Memorize activity #427
- Add a tutorial to the VideoViewer activity #435
- Add a tutorial to the Fototoon activity #443
- Add a tutorial to the Paint activity #425
- Add a tutorial to the Moon activity #432
- Add a tutorial to the SprintMath activity #444
- Add a tutorial to the Record activity #433
- Add a tutorial to the Constellation activity #446
- Add a tutorial to the Reflection activity #440
- Add a tutorial to the XOEditor activity #439
- Add a tutorial to the LastOneLose activity #447
- Add a tutorial to the Write activity #445
- Add a tutorial to the Abacus activity #441
- Add a tutorial to the MazeWeb activity #424
- Add a tutorial to the TamTam Micro activity #426
- Add a tutorial to the Clock activity #430
- Add a tutorial to the Flip activity #442
- Add a tutorial to the PhysicsJS activity #428
- Add a tutorial on Game of Life activity #382
- Add a tutorial to the Speak activity #431
- Add a tutorial to the Calculate activity #429
- Add a tutorial to the ColorMyWorld activity #438
- Add a tutorial to the FoodChain activity #436
- Add a tutorial to the GridPaint activity #437
- Add a tutorial to the Abecedarium activity #434
- Add a tutorial to the QR Code activity #595
- Add a tutorial to the TankOp activity #597
- Add a tutorial to the Chat activity #594
- Add a tutorial to the Block Rain activity #593
- Add a tutorial to the Stopwatch activity #596

### Changed
- Double size of Record images in WebApp and electron App
- Add a message when disconnected by the server or by another device
- Improve Gears Tutorial #396
- Improve Exerciser UI to avoid accidental deletion #455
- Changing server URL at login need one more click now
- ColorMyWorld language is now linked to core language
- Use a real input field for password
- Remove the two steps popup opening
- Automatically shift popup menu to the left when it will override the right border
- Allow teachers to login
- Reorder buddy menu icons
- Click on buddy icon/name in buddy menu is now like clicking on settings item
- Remove restart message on settings/about me and settings/about language
- Increase link width in LabyrinthJS activity
- Disable overscroll on iOS/Android
- Click on activity icon/name in listview menu launch activity, reorder items
- Use Sugarizer default language for FoodChain default language
- Use Sugarizer default language for Abecedarium default language

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
- Make responsive the toolbar in Write activity #515
- Make responsive the toolbar in Physics activity #516
- Horizontal scrollbar appears in the Write activity #538
- Handle window resize in TankOp activity during play #404
- Resize function gives error in TankOp Activity #549
- Can't see the previous result on small screens for Calculate activity #517
- Fix the clean all button in the Fototoon activity #513
- Disappearance of clock in set time mode in clock activity #581
- Improve design of Text Palette in Fototoon activity #575
- Fix Unit Test
- Presence is initialized as unsecure by default instead of using location.protocol value
- XO Editor don't work on touch screens #588
- Font size of Title reduces in fototoon activity #563
- Fix TXT file generation in Write activity
- Fix TXT import file
- Journal chooser sometimes load Abecedarium images from server instead of from local directory
- RGB bars in ColorMyWorld activity overflows #605
- Harsh Sound in TamTam Micro activity in keyboard mode on Firefox and Safari #564
- Grid Paint Activity screen not working properly on Firefox #342
- Gridpaint don't handle window resize #403
- In Journal Popup in iOS/Safari, Choose item text is not centered
- RGB bars in LabyrinthJS and Write activity overflows #620
- Time laps in stopwatch activity should be reset when reset button is clicked #624
- Unnecessary display of time lapse when stopwatch not started #638
- Stop Watch Activity is not responsive and has text overflowing problem #604
- Wrong text appears upon hovering on buttons in Blockrain activity #627
- Sound don't restart in FoodChain activity #360
- Video erase button hidden in Record Activity #655
- Text not visible in search bar of Calligra Activity #661
- Dialog box has no background in Markdown #671
- Markdown link opens in frame which crashes the output #673
- Responsiveness issue in Pomodoro Activity #675
- Password Tutorial targets the wrong element #68
- Tutorial error in Shared Notes Activity #693
- TamTam Micro Activity Piano Mode Not working in Chrome in file:// #679
- Bug While Resizing game screen after resizing setting screen in Falabracman activity #703

### Removed
- Remove .OGG sounds, now replaced by .MP3 only


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
