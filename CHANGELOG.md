# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Desktop version for GNU Linux, MacOS and Windows using electron

### Changed
- Portuguese localization


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
