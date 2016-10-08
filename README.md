# What is Sugarizer ?

The Sugar Learning Platform is a leading learning platform that began in the famous One Laptop Per Child project. 
It is used every day by nearly 3 million children around the world. 

Sugarizer is a web implementation of the platform and runs on every device - from tiny Raspberry Pi computers to small Android and iOS phones to tablets and to laptops and desktops. 
It has 3 broad components:

* Thin Client: a web application that runs in modern web browsers
* Client: an installable app for every operating system
* Server: a nodejs/express server for clients to connect with

Enjoy the experience and help us reach every child on every device in every country.

# Thin Client

[Run it now! (server.sugarizer.org)](http://server.sugarizer.org/)

Sugarizer Thin Client is a web application that runs on any device with a recent Chrome version and has also been tested successfully on Firefox, Safari and IE. 

Features include:

* No installation required
* Runs any Sugar Web Activity available from a Sugarizer Server
* Sugar Home view (Radial and List)
* Sugar Journal
* Sugar Local Data Store (limited by the browser to 5Mb, [learn more](https://en.wikipedia.org/wiki/Web_storage))
    * Backup locally stored content to the Server
    * Share locally stored content through the Server 
* Sugar Presence 
* Sugar Collaboration

As a thin client, it does not run offline and requires a permanent network connection to a Sugarizer Server.

Each Sugarizer Server provides its own copy of the Thin Client.

# Client

Sugarizer Client is a cross-platform application for installing on any GNU+Linux, Windows, Mac OS X, Android, iOS, or Chrome OS device.

Features are the same as Thin Client, plus:

* Runs completely offline, without accessing any server
* Some features (like collaboration) do a require network connection

To run **Sugarizer on your PC** (GNU Linux/Mac OS/Windows), close any running instances of Chrome and re-launch it using the command line:

    chrome --allow-file-access-from-files index.html

The option `--allow-file-access-from-files` is needed to enable access to local files. 

Equivalent options for other browser [are available](https://github.com/mrdoob/three.js/wiki/How-to-run-things-locally).

If you run Sugarizer this way often, you should create an alias for this command ([learn more](https://en.wikipedia.org/wiki/Alias_(command)))

To run **Sugarizer Client on Android**, download it on [Google Play](https://play.google.com/store/apps/details?id=org.olpc_france.sugarizer), [Amazon Store](http://www.amazon.com/gp/product/B00NKK7PZA) or [F-Droid](https://f-droid.org/repository/browse/?fdid=org.olpc_france.sugarizer). You could also build yourself the Sugarizer Client APK using instruction below.

To run **Sugarizer Client on iOS**, download it on [Apple Store](https://itunes.apple.com/us/app/sugarizer/id978495303) or build yourself the Sugarizer Client IPA using instructions below.

To run **Sugarizer Client as Chrome Web App**, download it from the [Chrome Web Store](https://chrome.google.com/webstore/detail/sugarizer/omfgclgehghdlloggibhgicnlldjiboo) or use the [Chrome Apps & Extensions Developer Tool](https://chrome.google.com/webstore/detail/chrome-apps-extensions-de/ohmmkhmmmpcnpikjeljgnaoabkaalbgc) and use the Sugarizer directory as the target for the unpacked application.

Features of Sugarizer Client include:

* Sugar Desktop view (Radial, List and Journal),
* Sugar Local data store storage - limited by the browser to 5Mb (see [here](https://en.wikipedia.org/wiki/Web_storage "here")),
* Running of locally stored Sugar Web Activities,
* Capability to connect to a server to backup or sharing local storage to the Server,
* Presence and collaboration

# Server

Sugarizer Server is the back-end for network features of Sugarizer. It means: allow deployment of Sugarizer on a local server, for example on a school server, so expose locally Thin Client (without Internet access). Sugarizer Server can also be used to provide collaboration features for Client and Thin Client on the network. Sugarizer Server could be deployed on any computer with Apache2, Node.js and MongoDB.

Sugarizer Server features include:

* Sugarizer Thin Client access,
* Backup and shared storage for Client and Thin Client,
* Presence and collaboration handling between Client/Thin Client on the same network

To run your own Sugarizer Server, follow the step behind. Commands are shown from a new Debian Linux machine and could be different for other platforms or for an already installed machine:

**Install Apache2**: you need to install Apache2 and ensure than few mods are available and enabled: mod_headers, mod_proxy, mod_proxy_http and mode_rewrite. You need also to allow override on /var/www directory. See [here](http://httpd.apache.org/docs/ "here") for more.

	sudo apt-get install apache2
    cd /etc/apache2/mods-enabled
    sudo ln -s ../mods-available/headers.load headers.load
    sudo ln -s ../mods-available/rewrite.load rewrite.load
    sudo ln -s ../mods-available/proxy.load proxy.load
    sudo ln -s ../mods-available/proxy_http.load proxy_http.load
    sudo vi /etc/apache2/sites-available/default  # Set to all value for /var/www AllowOverride
    sudo /etc/init.d/apache2 restart

**Install Node.js**: Install Node.js and npm to manage packages. See [here](http://nodejs.org/ "here") more information.

    sudo apt-get install nodejs

**Install MongoDB**: Don't forget to create a /data/db directory to store databases. See [here](http://www.mongodb.org/ "here") more information.

    sudo apt-get install mongodb
    sudo mkdir -p /data/db

**Install Sugarizer**: If need, you could update server/sugarizer.ini file (update port for web, mongodb or presence)

    sudo apt-get install git
    cd /var/www
    sudo git clone https://github.com/llaske/sugarizer
    cd /var/www/sugarizer/server
    sudo npm install

**Run MongoDB and Sugarizer Server**:Run mongo daemon and Sugarizer a background process.

    sudo mongod --fork --port 27018 --logpath /home/root/mongo.log
    sudo nohup node sugarizer.js > /home/root/sugarizer.log &

**Update Firewall rules**: If need, open Firewall port for HTTP and Presence.

    sudo iptables -A INPUT -i eth0 -p tcp --dport 80 -j ACCEPT # HTTP
    sudo iptables -A INPUT -i eth0 -p tcp --dport 8039 -j ACCEPT   # Presence 
    sudo iptables -A OUTPUT -p tcp --dport 8039 -j ACCEPT    # Presence

**Check your install**: To check your install, run "http://&lt;server name&gt;/sugarizer" in your browser: 

* you should see the home with all activities,
* go to Journal view, you should see at the bottom of the screen the two icons to switch to private/shared journal,
* go to the neighborhood view, you should see one icon for the server and one for you.

You could also run unit tests (see below) to ensure that everything works.

**Server settings** 

If need, Sugarizer server settings could be changed using the [server/sugarizer.ini](server/sugarizer.ini) config file.

	[web]
	port = 8080

	[presence]
	port = 8039

	[database]
	server = localhost
	port = 27018
	name = sugarizer

	[collections]
	users = users
	journal = journal

	[activities]
	activities_directory_name = activities
	activities_path = ../activities
	template_directory_name = ActivityTemplate
	activity_info_path = activity/activity.info
	favorites = org.sugarlabs.GearsActivity,org.sugarlabs.MazeWebActivity,org.olpcfrance.PaintActivity,org.olpcfrance.TamTamMicro,org.olpcfrance.MemorizeActivity,org.olpg-france.physicsjs,org.sugarlabs.CalculateActivity,org.sugarlabs.TurtleBlocksJS,org.sugarlabs.Clock,,org.olpcfrance.RecordActivity,org.olpcfrance.Abecedarium,org.olpcfrance.KAView,org.olpcfrance.FoodChain,org.olpc-france.labyrinthjs,org.olpcfrance.TankOp,org.sugarlabs.ChatPrototype,org.olpcfrance.Gridpaint,org.olpc-france.LOLActivity,org.sugarlabs.StopwatchActivity,org.sugarlabs.GTDActivity,org.sugarlabs.Markdown,org.laptop.WelcomeWebActivity

The **[web]** section describe the settings of the node.js process. Sugarizer server uses an Apache web server and a node.js web server. The Apache Web server redirect calls to the node.js server. The link between them is set in the file [api/.htaccess](api/.htaccess).

	RewriteEngine on

	# Redirect a whole subdirectory:
	RewriteRule ^(.+) http://localhost:8080/$1 [P]

So by default, the Apache Web server expects that the node.js server listens on port 8080. You have to change both this file and the port value in the web section to change the port.

The **[presence]** section describe the settings of the presence server. By default, a web socket is created on port 8039. You need to change this value if you want to use another port. 
Warning: presence.js in activities hardcode this port today.

The **[database]** and **[collections]** sections are for MongoDB settings. You could update the server name (by default MongoDB run locally) and the server port. Names of the database and collections had no reason to be changed.

The **[activities]** section describe information on where to find embedded activities. The favorites value list ids of activities that Thin Client users will find by default on the home page. All values are self explained and had no reason to be changed. 

**Server API** 

Sugarizer Server exposes a REST API used by clients to handle collaboration. 

	// Activities API
	[GET]    /api/activities
	[GET]    /api/activities/:id
	
	// Users API
	[GET]    /api/users
	[GET]    /api/users/:uid
	[POST]   /api/users
	[PUT]    /api/users/:uid
	
	// Journal API
	[GET]    /api/journal/shared
	[GET]    /api/journal/:jid
	[GET]    /api/journal/:jid/filter/:aid
	[GET]    /api/journal/:jid/field/:field
	[GET]    /api/journal/:jid/filter/:aid/field/:field
	[POST]   /api/journal/:jid
	[GET]    /api/journal/:jid/:oid
	[PUT]    /api/journal/:jid/:oid
	[DELETE] /api/journal/:jid/:oid

A full documentation of the API is available in [server/doc](server/doc) or online on [http://sugarizer.org/apidoc/](http://sugarizer.org/apidoc/).

# Activities

Sugarizer includes a bunch of pedagogic activities.
All activities could be found in the [activities](activities) directory. Each activity has its own subdirectory. So for example, the *Abecedarium* activity is located in [activities/Abecedarium.activity](activities/Abecedarium.activity)

You could distribute Sugarizer with whatever activities you want.
To do that, you first need to adapt the content of the [activities](activities) directory  to match your wish: removing activities you don't want to distribute and adding in this directory new activities you want to include.

Then you need to update the [activities.json](activities.json) file to reflect your choice.
Here an example of this file:

	[
		{"id": "org.sugarlabs.GearsActivity", "name": "Gears", "version": 6, "directory": "activities/Gears.activity", "icon": "activity/activity-icon.svg", "favorite": true, "activityId": null},
		{"id": "org.sugarlabs.MazeWebActivity", "name": "Maze Web", "version": 2, "directory": "activities/MazeWeb.activity", "icon": "activity/activity-icon.svg", "favorite": true, "activityId": null},
		{"id": "org.olpcfrance.PaintActivity", "name": "Paint", "version": 1, "directory": "activities/Paint.activity", "icon": "activity/activity-icon.svg", "favorite": true, "activityId": null},
		{"id": "org.olpcfrance.TamTamMicro", "name": "TamTam Micro", "version": 1, "directory": "activities/TamTamMicro.activity", "icon": "activity/activity-icon.svg", "favorite": true, "activityId": null},	
		{"id": "org.olpcfrance.MemorizeActivity", "name": "Memorize", "version": 1, "directory": "activities/Memorize.activity", "icon": "activity/activity-icon.svg", "favorite": true, "activityId": null},
		{"id": "org.olpg-france.physicsjs", "name": "Physics JS", "version": 1, "directory": "activities/PhysicsJS.activity", "icon": "activity/activity-icon.svg", "favorite": true, "activityId": null},
		{"id": "org.sugarlabs.CalculateActivity", "name": "Calculate", "version": 1, "directory": "activities/Calculate.activity", "icon": "activity/activity-icon.svg", "favorite": true, "activityId": null},
		{"id": "org.sugarlabs.TurtleBlocksJS", "name": "Turtle Blocks JS", "version": 1, "directory": "activities/TurtleBlocksJS.activity", "icon": "activity/activity-icon.svg", "favorite": true, "activityId": null},
		{"id": "org.sugarlabs.Clock", "name": "Clock Web", "version": 1, "directory": "activities/Clock.activity", "icon": "activity/activity-clock.svg", "favorite": true, "activityId": null},
		{"id": "org.olpcfrance.RecordActivity", "name": "Record", "version": 1, "directory": "activities/Record.activity", "icon": "activity/activity-icon.svg", "favorite": true, "activityId": null},
		{"id": "org.olpcfrance.Abecedarium", "name": "Abecedarium", "version": 5, "directory": "activities/Abecedarium.activity", "icon": "activity/activity-icon.svg", "favorite": true, "activityId": null},
		{"id": "org.olpcfrance.KAView", "name": "KA View", "version": 1, "directory": "activities/KAView.activity", "icon": "activity/activity-icon.svg", "favorite": true, "activityId": null},
		{"id": "org.olpcfrance.FoodChain", "name": "FoodChain", "version": 4, "directory": "activities/FoodChain.activity", "icon": "activity/activity-icon.svg", "favorite": true, "activityId": null},
		{"id": "org.olpc-france.labyrinthjs", "name": "Labyrinth JS", "version": 1, "directory": "activities/LabyrinthJS.activity", "icon": "activity/activity-icon.svg", "favorite": true, "activityId": null},
		{"id": "org.olpcfrance.TankOp", "name": "Tank Operation", "version": 1, "directory": "activities/TankOp.activity", "icon": "activity/activity-icon.svg", "favorite": true, "activityId": null},
		{"id": "org.sugarlabs.ChatPrototype", "name": "ChatPrototype", "version": 1, "directory": "activities/ChatPrototype.activity", "icon": "activity/activity-icon.svg", "favorite": true, "activityId": null},
		{"id": "org.olpcfrance.Gridpaint", "name": "Grid Paint", "version": 2, "directory": "activities/Gridpaint.activity", "icon": "activity/activity-icon.svg", "favorite": true, "activityId": null},
		{"id": "org.olpc-france.LOLActivity", "name": "Last One Loses Activity", "version": 1, "directory": "activities/LastOneLoses.activity", "icon": "activity/activity-icon.svg", "favorite": true, "activityId": null},
		{"id": "org.sugarlabs.StopwatchActivity", "name": "Stopwatch", "version": 1, "directory": "activities/Stopwatch.activity", "icon": "activity/activity-icon.svg", "favorite": true, "activityId": null},
		{"id": "org.sugarlabs.Markdown", "name": "Markdown", "version": 3, "directory": "activities/Markdown.activity", "icon": "activity/activity-icon.svg", "favorite": true, "activityId": null},
		{"id": "org.sugarlabs.GTDActivity", "name": "Get Things Done", "version": 1, "directory": "activities/GetThingsDone.activity", "icon": "activity/activity-icon.svg", "favorite": true, "activityId": null},
		{"id": "org.laptop.WelcomeWebActivity", "name": "WelcomeWeb", "version": 1, "directory": "activities/WelcomeWeb.activity", "icon": "activity/welcome-activity.svg", "favorite": true, "activityId": null},	
		{"id": "org.vpri.EtoysActivity", "name": "Etoys", "version": 1, "directory": "activities/Etoys.activity", "icon": "activity/activity-etoys.svg", "favorite": false, "activityId": null},
		{"id": "io.cordova.all_in_one_plugin_sample", "name": "Cordova", "version": 1, "directory": "activities/Cordova.activity", "icon": "activity/activity-icon.svg", "favorite": false, "activityId": null},
		{"id": "org.olpcfrance.MediaViewerActivity", "name": "MediaViewer", "version": 1, "directory": "activities/MediaViewer.activity", "icon": "activity/activity-icon.svg", "favorite": false, "activityId": null}
  	]

Each line in this file is one activity. Here is the description of each field:

* **id**: Activity unique ID
* **name**: Display name of the activity
* **version**: Activity version number
* **directory**: Location directory of the activity in Sugarizer
* **icon**: Location of the icon in the activity directory
* **favorite**: true means that the activity is in the favorite view
* **activityId** Reserved for internal use

Remove in this file rows for activities that you want to remove. Add in this file a line for each activity you want to add. 

Note than:

1. The [activities/ActivityTemplate](activities/ActivityTemplate) directory does not contain a real activity. It's just a template that you could use to create your own activity.
2. The [activities.json](activities.json) is used only by Sugarizer Client, the Thin Client relies on the */api/activities* API that dynamically browse the [activities](activities) directory. By the way, it's a good practice to match the content of the activities.json file and the content of the activities directory.

# Create your own activity

With Sugarizer, it's easy to create your own activity with a bunch of HTML and JavaScript. Here's the step to follow.

### Create the activity from the template 

First, copy all content of [activities/ActivityTemplate](activities/ActivityTemplate) directory in a new directory for example `activities/MyActivity.activity`.

### Customize the activity

Then customize the activity. Choose a name for your activity. Write it in the activity name and bundle_id properties in `activity/activity.info` of the new directory.

	[Activity]
	name = My Activity
	activity_version = 1
	bundle_id = org.sugarlabs.MyActivity
	exec = sugar-activity-web
	icon = activity-icon

Change also the title tag of `index.html`.

	<!DOCTYPE html>
	<html>
	
	<head>
	<meta charset="utf-8" />
	<title>My Activity</title>
	<meta name="viewport" content="user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width"/>
	<link rel="stylesheet" media="not screen and (device-width: 1200px) and (device-height: 900px)"
		href="lib/sugar-web/graphics/css/sugar-96dpi.css">
	<link rel="stylesheet" media="screen and (device-width: 1200px) and (device-height: 900px)"
		href="lib/sugar-web/graphics/css/sugar-200dpi.css">
	<link rel="stylesheet" href="css/activity.css">
	<script data-main="js/loader" src="lib/require.js"></script>
	</head>

Update the file [activities.json](activities.json)  of the Sugarizer directory: add a new line for your activity. Update id, name and directory values on this new line.

	[
		{"id": "org.sugarlabs.MyActivity", "name": "My Activity", "version": 1, "directory": "activities/MyActivity.activity", "icon": "activity/activity-icon.svg", "favorite": true, "activityId": null},
		{"id": "org.sugarlabs.GearsActivity", "name": "Gears", "version": 6, "directory": "activities/Gears.activity", "icon": "activity/activity-icon.svg", "favorite": true, "activityId": null},
		{"id": "org.sugarlabs.MazeWebActivity", "name": "Maze Web", "version": 2, "directory": "activities/MazeWeb.activity", "icon": "activity/activity-icon.svg", "favorite": true, "activityId": null},

Now run Sugarizer, you should see the icon of your new activity. Let's run it!

### File structure

In your new activity, you will find the following file structure:

    my-activity/
    |-- activity/
    |   |-- activity.info
    |   `-- activity-icon.svg
    |-- index.html
    |-- css/
    |   `-- activity.css
    |-- js/
    |   |-- activity.js
    |   `-- loader.js
    |-- lib/
    |-- package.json
    `-- setup.py

* `activity/` contains information about your activity, including the name, ID, and the icon.
* `index.html` is where the elements that compose your activity are defined.  The template comes with a toolbar and a canvas where you can place your content.
* `js/activity.js` is where the logic of your activity lives.
* `css/activity.css` is where you add the styling of your activity.

Those are the files you'll modify in most cases. The others are:

* `js/loader.js` configures the libraries paths and loads your   `js/activity.js`
* `lib/` contains the libraries
* `package.json` contains information about the libraries the activity depends on
* `setup.py` is used if you want to run your activity in Sugar.

Now you are ready to go ahead and develop your activity in the HTML, JavaScript and CSS files.

### Adding a button to the toolbar

This simple example will show you how web activities are structured as bits of HTML, CSS and JavaScript.

You will need an SVG graphic for the button.  Or you can use one from the Sugar icon set at `lib/sugar-web/graphics/icons/`.  For this example, let's say you have one custom icon called `my-button.svg`.
Create a directory `icons/` inside your activity and place the SVG
file inside.  Then do the following steps.

In `index.html`, add a new &lt;button&gt; element inside the toolbar:

    <button class="toolbutton" id="my-button" title="My Button"></button>

In `css/activity.css`, define the button style:

    #main-toolbar #my-button {
        background-image: url(../icons/my-button.svg);
    }

In `js/activity.js`, add a callback for the button:

    var myButton = document.getElementById("my-button");
    myButton.onclick = function () {
        console.log("You clicked me!");
    }

### Adding HTML content dynamically

Soon you will find that adding content to the HTML as we did with the toolbar button in the previous section, is very limited.  You'll want to add HTML elements on the fly, as the user interacts with the activity, or as the data structures of your activity logic change.
There are several options to archive this.  Most of the time you'll end using a mix of them, so is important to know them all.

First, it is possible to create HTML elements and append them to other HTML elements using JavaScript.  This is called "manipulating the DOM".

Add this in `js/activity.js`:

    var canvas = document.getElementById("canvas");
    canvas.innerHTML +=
        '<ul id="names-list">' +
          '<li class="name">Tom</li>' +
          '<li class="name">Chris</li>' +
          '<li class="name">Donald</li>' +
        '</ul>';

Run again your new activity, you will see then change.

That's all, it's your turn now to transform this activity in something fun!

# Unit testing

Sugarizer includes a set of unit tests both for client side and for server side.
To run unit tests, you should first install [Mocha](http://mochajs.org/):

	sudo npm install -g mocha

To run unit tests for Sugarizer Server, launch:

	cd /var/www/sugarizer/server/
	mocha

To run unit tests for Sugarizer Client, run "file:///var/www/sugarizer/test/index.html" in your browser.

# Supervise the server

Instead of running your Sugarizer Server like described in the "Run MongoDB and Sugarizer Server" section above, you could use a tool like [supervisor](http://supervisord.org/) to run it in background.

First install, supervisor:

	sudo apt-get install supervisor

Then install the wait-for-mongo node tool:

	sudo npm install -g wait-for-mongo

Create a sugarizer.sh file in /home/root directory:

	wait-for-mongo mongodb://127.0.0.1:27018/sugarizer 30000
	cd /var/www/server
	node sugarizer.js

Create a sugarizer.conf setting file in /etc/supervisor/conf.d directory:

	[supervisord]
	nodaemon=true
	
	[program:mongod]
	command=/usr/bin/mongod --port 27018 --logpath /home/root/mongo.log
	priority=1
	
	[program:sugarizer]
	command=sh /home/root/sugarizer.sh
	priority=2
	stdout_logfile=/home/root/sugarizer.log
	stderr_logfile=/home/root/sugarizer.log
	autostart=true
	autorestart=true

Run the supervisor daemon for the first time:

	sudo /etc/init.d/supervisor start

MongoDB and Sugarizer Server should now start automatically at startup and restart if fail.
You could start it manually using:

	sudo supervisorctl start sugarizer

You could end it manually using:

	sudo supervisorctl stop sugarizer


# Build Client for Android or iOS

Sugarizer Client could be packaged as an Android or iOS application using [Cordova](http://cordova.apache.org/).

To build it, first install Cordova as described [here](http://cordova.apache.org/).

Then create a directory for Sugarizer Cordova and put the content of the git repository in the www directory:

	cordova create sugar-cordova
	cd sugar-cordova
	rm config.xml
	rm -fr www
	git clone https://github.com/llaske/sugarizer.git www

Add the platform you want to add (here Android):

	cordova platform add android

Replace the auto generated config.xml file by the Sugarizer one:

	cp www/config.xml .

Build the package:

	cordova build android

On Android, if you want to generate the Sugarizer OS version, remove the SugarizerOS comment around the `cordova-plugin-sugarizeros` plugin in [config.xml](config.xml) file.

# Reduce package size

The current size of Sugarizer is about 300 Mb. This huge size is related to media content and resources include in two activities:

* **Abecedarium activity**: about 150 Mb
* **Etoys activity**: about 100 Mb

By the way, both activities are able to retrieve the content remotely if its not deployed locally. So, if you want to reduce the Sugarizer package size (specifically for deployment on mobile) you could either remove completely those two activities or just remove the media content of this activities.

To remove activities, just remove both activities directory and update [activities.json](activities.json) file as explain above.

To remove media content for **Abecedarium**, remove directories:

* [activities/Abecedarium.activity/audio/en](activities/Abecedarium.activity/audio/en)
* [activities/Abecedarium.activity/audio/fr](activities/Abecedarium.activity/audio/fr)
* [activities/Abecedarium.activity/audio/es](activities/Abecedarium.activity/audio/es)
* [activities/Abecedarium.activity/images/database](activities/Abecedarium.activity/images/database)

The activity will look for media content on the server referenced in [activities/Abecedarium.activity/config.js](activities/Abecedarium.activity/config.js), by default `http://server.sugarizer.org/activities/Abecedarium.activity/`.

To remove resources for **Etoys**, remove directory [activities/Etoys.activities/resources](activities/Etoys.activities/resources) and replace the value `resources/etoys.image` in [activities/Etoys.activities/index.html](activities/Etoys.activities/index.html) by the remote location of the resources, for example `http://server.sugarizer.org/activities/Etoys.activity/resources/etoys.image`.

# Localization

Sugarizer use [webL10n](https://github.com/fabi1cazenave/webL10n) localization system by Fabien Cazenave.

All strings are localized in the [locale.ini](locale.ini) file at the root of the repository.
If you want to add a new translation, copy the whole [en] section at the end of the file and:

* Replace "en" by the [ISO 639-1 code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) of your language. For example, "fr" for French,
* Substitute the right side of the "=" character on each line by the string localized in your language. For example:

		[fr]
		StartNew=Commencer un nouveau 
		NameActivity=Activité {{name}}
		RemoveFavorite=Retirer le favori

Sugarizer automatically detects the navigator language. To enable this detection, you need to update the settings.init function in the [lib/settings.js](lib/settings.js) file. Add a test on your language code. For example in French:

	else if (navigatorLanguage.indexOf("fr") != -1)
		this.language = "fr";
 
Sugarizer settings display a list of all available languages. You need to add your language in this dialog. For this you have to:

* Add a new string in [locale.ini](locale.ini) with the name of your language in English. For example:

		French=French

* Add the same line for all languages/sections in the file. If you're able to do that, translate the right side of the "=" character with the localized string for the name of your language. If you don't know how to translate it, just let the English word. For example:

		French=Français

* Add your string in the [js/dialog.js](dialog.js) file in the create function of the Enyo class Sugar.DialogLanguage. You should give the ISO 639-1 language code and the new string for your language name. For example:

		{code: "fr", icon: null, name: l10n.get("French")},

That's all. Test the result in your browser.

Note that this translation is for Sugarizer only. Each activity could provide its own localization feature.
