# What is Sugarizer ?

The Sugar Learning Platform is a leading learning platform developed for the One Laptop per Child project and used every day by nearly 3 million children around the world. With Sugarizer, you could discover the Sugar Learning Platform on any device: from the tiny Raspberry PI to the small Android/iOS tablet or the bigger PC/Mac. Enjoy the experience and help us reach every children on every device in every country.

Sugarizer is distributed in the form of 3 components:

* Thin Client: remote access to Sugarizer using a browser,
* Client: Sugarizer running locally,
* Server: place to run remote Sugarizer features.


# Thin Client

Sugarizer Thin Client is Sugarizer in a browser. It could work on any device with a recent Chrome/Chromium version, and has also been tested successfully on Firefox, Safari and IE. Sugarizer Thin Client doesn't need any installation on the device but requires a permanent access to a Sugarizer Server.

[Run it Now](http://server.sugarizer.org/)

Features of Sugarizer Thin Client include:

* Sugar Desktop view (Radial, List and Journal),
* Sugar Local data store storage - limited by the browser to 5Mb (see [here](https://en.wikipedia.org/wiki/Web_storage "here")),
* Running of remote stored Sugar Web Activities,
* Backup or sharing of local storage content to the Server,
* Presence and collaboration

Note: You can run sugarizer from the link above, but the Thin Client access is provided by all the Sugarizer Servers, so you can use for your own Sugarizer Server. See below how to install your own Sugarizer Server. 

# Client

Sugarizer Client is Sugarizer installed locally on the device so it does not require any access to the Server - it works stand-alone. Server access could be required only when it needs network features. Sugarizer could work on any device with a recent Chrome/Chromium version and has also been tested successfully on Firefox, Safari and IE. Sugarizer Client is available for PC, for Android, iOS and Chrome Web App.

To run **Sugarizer on your PC** (GNU Linux/Mac OS/Windows), launch Chrome using the command line:

    chrome --allow-file-access-from-files

Then open the "index.html" file in the browser. Note that the option "--allow-file-access-from-files" is needed to authorize access to local file. Don't forget to close all other instances of Chrome before using this option. For other browser equivalent options see [here](https://github.com/mrdoob/three.js/wiki/How-to-run-things-locally "here"). Do not hesitate to write a shortcut on this command for future use.

To run **Sugarizer Client on Android**, download it on [Google Play](https://play.google.com/store/apps/details?id=org.olpc_france.sugarizer), [Amazon Store](http://www.amazon.com/gp/product/B00NKK7PZA) or [F-Droid](https://f-droid.org/repository/browse/?fdid=org.olpc_france.sugarizer). You could also build yourself the Sugarizer Client APK using instruction below.

To run **Sugarizer Client on iOS**, download it on [Apple Store](https://itunes.apple.com/us/app/sugarizer/id978495303) or build yourself the Sugarizer Client IPA using instructions below.

To run **Sugarizer Client as Chrome Web App**, download it on [Chrome Web Store](https://chrome.google.com/webstore/detail/sugarizer/omfgclgehghdlloggibhgicnlldjiboo) or use the [Chrome Apps & Extensions Developer Tool](https://chrome.google.com/webstore/detail/chrome-apps-extensions-de/ohmmkhmmmpcnpikjeljgnaoabkaalbgc) and use the Sugarizer directory as target for unpacked application.

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
* go to the neighborhood view, you should seen one icon for the server and one for you.

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

The **[web]** section describe the settings of the node.js process. Sugarizer server use an Apache web server and a node.js web server. The Apache Web server redirect calls to the node.js server. The link between them is set in the file [api/.htaccess](api/.htaccess).

	RewriteEngine on

	# Redirect a whole subdirectory:
	RewriteRule ^(.+) http://localhost:8080/$1 [P]

So by default, the Apache Web server expect that the node.js server listen on port 8080. You have to change both this file and the port value in the web section to change port.

The **[presence]** section describe the settings of the presence server. By default a web socket is created on port 8039. You need to change this value if you want to use another port. 
Warning: presence.js in activities hardcode this port today.

The **[database]** and **[collections]** sections are for MongoDB settings. You could update the server name (by default MongoDB run locally) and the server port. Names of the database and collections had no reason to be changed.

The **[activities]** section describe information on where to find embedded activities. The favorites value list ids of activities that Thin Client users will find by default on the home page. All values are self explained and had no reason to be changed. 

**Server API** 

Sugarizer Server expose a REST API used by clients to handle collaboration. 

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


# Unit testing

Sugarizer include a set of unit tests both for client side and for server side.
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
	git clone https://github.com/llaske/sugarizer.git www

Add the platform you want to add (here Android) and all cordova plugin need:

	cordova platform add android
	cordova plugin add cordova-plugin-camera
	cordova plugin add cordova-plugin-device-motion
	cordova plugin add cordova-plugin-dialogs
	cordova plugin add cordova-plugin-globalization
	cordova plugin add cordova-plugin-network-information
	cordova plugin add cordova-plugin-device
	cordova plugin add cordova-plugin-media

Replace the auto generated config.xml file by the Sugarizer one:

	cp www/config.xml .

Build the package:

	cordova build android
 
# Localization

Sugarizer use [webL10n](https://github.com/fabi1cazenave/webL10n) localization system by Fabien Cazenave.

All strings are localized in the [locale.ini](locale.ini) file at the root of the repository.
If you want to add a new translation, copy the whole [en] section at the end of the file and:

* Replace "en" by the [ISO 639-1 oode](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) of your language. For example, "fr" for French,
* Substitute the right side of the "=" character on each line by the string localized in your language. For example:

		[fr]
		StartNew=Commencer un nouveau 
		NameActivity=Activité {{name}}
		RemoveFavorite=Retirer le favori

Sugarizer automatically detect the navigator language. To enable this detection, you need to update the settings.init function in the [lib/settings.js](lib/settings.js) file. Add a test on your language code. For example in French:

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