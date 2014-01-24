# What is FoodChain ?

FoodChain is an activity for Sugar.  
FoodChain is pedagogical game allowing to learn name of animals (word and sound) and princip of food chains: who eat what ? who eat who ?   
The activity is composed of 3 little games with 20 levels of growing complexity.   
First game objective is to class cards of animals depending of their food regim (herbivore, carnivore, omnivore).  
Second game objectif is to order cards of animals/food in the order of who eat who. For example: Snake -eat-> Frog -eat-> Flies.  
Third game is an arcade game. You handle a frog and you need to eat flies avoiding being eaten by snakes and hitting rocks.  


# How it works ?

FoodChain is wrote mainly in HTML5/JavaScript using the Enyo Framework.  
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
* buildgame.js is the second game
* playgame.js is the third game
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
