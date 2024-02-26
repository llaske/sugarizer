Server
======

Running a local server
----------------------

[Clone the server](https://github.com/tchx84/turtleblocksjs-server) and
[change the api key]
(https://github.com/tchx84/turtleblocksjs-server/blob/master/settings.py#L26)
to your TurtleJS key.

##### Linux:  
Install apache and turtleblocksjs.  
**Setup a link to**  `/var/www/html`   
```
sudo apt-get install apache2
cd /var/www
sudo ln -s /home/path/to/app/ html
```
##### OSX(10.10+):
Apache 2.2 is already installed at `/etc/apache2`  
**Setup a link to** `/Library/WebServer/Documents`
```
cd /Library/WebServer/
sudo ln -s /home/path/to/app/ Documents
```

##### Linux:  
Then, enable the 'proxy' modules in apache.
```
cd /etc/apache2/mods-enabled 
sudo ln -s ../mods-available/proxy* . 
sudo ln -s ../mods-available/xml2enc.load .
sudo ln -s ../mods-available/slotmem_* .
```

Remove the alias module.
```
sudo unlink alias.conf
sudo unlink alias.load
```

##### OSX(10.10+):
Enable Proxy modules and disable alias module as in linux version. Main Config with module configurations is located in `/etc/apache2/httpd.conf`

Apache TurtleJS Config
----------------------
##### Linux:  
* Copy the code below into `/etc/apache2/sites-enabled/turtlejs.conf`
##### OSX(10.10+):
* Copy the code below into `/private/etc/apache2/other/turtlejs.conf`  
* If the turtlejs.conf is not loaded and is not working then add the line `/private/etc/apache2/other/turtlejs.conf` in **httpd.conf**  
* In the code below change the document root to `/Library/WebServer/Documents`

```
<VirtualHost *:80 *:443>
    DocumentRoot /var/www/html

    ProxyPreserveHost On
    ProxyPass /server http://127.0.0.1:3000
    ProxyPassReverse /server http://127.0.0.1:3000

    <Location /server>
        Order allow,deny
        Allow from all
    </Location>

</Virtualhost>
```
Then, restart apache.
##### Linux:  
```sudo service apache2 restart```
##### OSX(10.10+):
`sudo apachectl start`  / `sudo apachectl restart`

Now, you need to run the TurtleJS server.

```
cd /home/path/to/server/ 
./server.py
```
If everything is ok in your browser you should able to access to
<pre>localhost</pre> and see TurtleJS instance.
