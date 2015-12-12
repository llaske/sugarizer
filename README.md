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

Note: You can run sugarizer from the link above, but the Thin Client access is provided by all the Sugarizer Servers, so you can use others as well. 

# Client

Sugarizer Client is Sugarizer installed locally on the device so it does not require any access to the Server - it works stand-alone. Server access could be required only when it needs network features. Sugarizer could work on any device with a recent Chrome/Chromium version and has also been tested successfully on Firefox, Safari and IE. Sugarizer Client is available for PC, for Android, iOS, Chrome Web App and for Firefox OS devices.

To run Sugarizer on your PC (GNU Linux/Mac OS/Windows), launch Chrome using the command line:

    chrome --allow-file-access-from-files

Then open the "index.html" file in the browser. Note that the option "--allow-file-access-from-files" is needed to authorize access to local file. Don't forget to close all other instances of Chrome before using this option. For other browser equivalent options see [here](https://github.com/mrdoob/three.js/wiki/How-to-run-things-locally "here"). Do not hesitate to write a shortcut on this command for future use.

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

    sudo apt-get install python g++ make checkinstall fakeroot
    src=$(mktemp -d) && cd $src
    wget -N http://nodejs.org/dist/node-latest.tar.gz
    tar xzvf node-latest.tar.gz && cd node-v*
    ./configure
    sudo fakeroot checkinstall -y --install=no --pkgversion $(echo $(pwd) | sed -n -re's/.+node-v(.+)$/\1/p') make -j$(($(nproc)+1)) install
    sudo dpkg -i node_*
    curl https://www.npmjs.org/install.sh | sudo sh

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

To check your install, run "http://&lt;server name&gt;/sugarizer" in your browser: you should see the home with all activities. Then go to Journal view, you should see at the bottom of the screen the two icons to switch to private/shared journal.