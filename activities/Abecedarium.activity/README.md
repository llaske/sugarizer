# What is Abecedarium ?

Abecedarium is an abecedary activity to learn its alphabet using images, sounds and words.

Abecedarium has two parts:
* Learn: To explore the words by letters or by theme (Nature, Body parts, Things, Concepts),
* Play: Six little games to match pictures/sounds/words with possibility to filter by letter or by theme,
* Build: It will allow to build little stories combining images and sounds from the database.

All words could be seen in upper case, lower case or script.
Abecedarium could be use both in English (about 500 words in the database), in French (about 1000 words in the database) and in Spanish (about 600 words in the database).
All contents come from the Art4apps library. See Credits page for more.



# How it works ?

Abecedarium is wrote mainly in HTML5/JavaScript using the Enyo Framework.  
All the HTML5/JavaScript is encapsulated in Python code executing a WebView (an instance of the WebKit browser).  

# Folders

## /.

Contains Python code (activity.py) and the framework to communicate between Python and JavaScript (enyo.py).

## /activity

Contains the Sugar manifest manifest to describe the activity.

## /html

All the HTML5/JavaScript is in this directory. 
* index.html is the HTML container
* styles.css contains all CSS class used
* package.js list all javascript files to load
* app.js is the main screen
* learngame.js is the first game
* playgame.js is the second game
* buildgame.js is the third game
* credits.js is the credit screen
* all other .js files are component used by the games


## /html/enyo and /html/lib

Contains the Enyo Framework.

## /html/audio

Contains all music and sound files.

## /html/images

Contains all images.

## /html/css

Styles sheet for different platforms.
