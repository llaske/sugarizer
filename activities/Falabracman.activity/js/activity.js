define(["sugar-web/activity/activity", "sugar-web/env", "activity/game", "activity/resources", "activity/paladict", "data/en/dict.js", "webL10n", "tutorial"], function(activity, env, Game, Resources, Paladict, dictEn, webL10n, tutorial) {

  // Manipulate the DOM only when it is ready.
  requirejs(['domReady!'], function(doc) {

    // Initialize the activity.
    activity.setup();

    var currentEnv;
    display = 'homeScreen';

    var resources = new Resources();
    resources.load([
      './images/barra.jpg',
      './images/creditos.jpg',
      './images/fondo.jpg',
      './images/ganaste.png',
      './images/grossini.png',
      './images/lago0.png',
      './images/lago1.png',
      './images/lago2.png',
      './images/lago3.png',
      './images/menu.jpg',
      './images/perdio.png',
      './images/splash.jpg',
      './images/spritesheet.png',
      './images/zeek0.png',
      './images/zeek1.png',
      './images/zeek2.png',
      './images/zeek3.png',
      './images/zeek4.png',
      './images/zeek5.png',
      './images/zeek6.png',
      './images/zeek7.png',
      './images/zeek8.png',
      './images/zeek9.png',
      './images/zeek10.png',
      './images/zeek11.png'
    ]);

    var toolbarElem = document.getElementById("main-toolbar");
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - toolbarElem.offsetHeight - 3;

    var paladict = new Paladict(dictEn);
    var game = new Game(canvas, resources, paladict, webL10n);

    env.getEnvironment(function(env, environment) {
      currentEnv = environment;

      var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language;
      var language = environment.user ? environment.user.language : defaultLanguage;
      webL10n.language.code = language;

      //load from datastore
      if (!environment.objectId) {
        console.log("New instance");
        resources.onReady(function() {
          display = 'homeScreen';
          game.main();
        });
      } else {

        activity.getDatastoreObject().loadAsText(function(error, metadata, data) {
          if (error == null && data != null) {

            console.log(data);
            if (data.playScreen) {
              game.playScreen = true;
              display = 'playScreen';
              game.homeScreen = false;
              game.obstacles = data.obstacles;
              game.playerX = data.playerX;
              game.playerY = data.playerY;
              game.lives = data.lives;
              game.targetWordLetters = data.targetWordLetters;
              game.targetWord = data.targetWord;
              game.resizeGame(canvas.width,canvas.height);
              game.run();
            } else if (data.homeScreen) {
              game.homeScreen = true;
              display = 'homeScreen';
              game.playScreen = false;
              game.main();
            }
          }
        })
      }
    });

    var startPoint = {
      x: undefined,
      y: undefined
    };
    var endPoint = {
      x: undefined,
      y: undefined
    };

    document.addEventListener('keyup', handleOnKeyDown, false);

    var touchScreen = ("ontouchstart" in document.documentElement);

    if (touchScreen) {
      canvas.addEventListener('touchstart', handleOnMouseDown, false);
      canvas.addEventListener('touchend', handleOnMouseUp, false);
    } else {
      canvas.addEventListener('mousedown', handleOnMouseDown);
      canvas.addEventListener('mouseup', handleOnMouseUp);
    }

    function handleKeyLeft() {
      game.key = 'LEFT';
      game.frameNo = 4;
      game.PlayerDistMoves = 5;
      game.PlayerStop = false;
    }

    function handleKeyUp() {
      game.key = 'UP';
      game.frameNo = 9;
      game.PlayerDistMoves = 5;
      game.PlayerStop = false;
    }

    function handleKeyRight() {
      game.key = 'RIGHT';
      game.frameNo = 1;
      game.PlayerDistMoves = 5;
      game.PlayerStop = false;
    }

    function handleKeyDown() {
      game.key = 'DOWN';
      game.frameNo = 7;
      game.PlayerDistMoves = 5;
      game.PlayerStop = false;
    }

    function handleMenuChoose(selected) {
      game.menuAudio.play();
      if (selected == 0) {
        game.homeScreen = false;
        game.creditScreen = false;
        game.playScreen = true;
        display = 'playScreen';
        game.main();
      } else if (selected == 1) {
        game.homeScreen = false;
        game.drawCreditScreen();

      } else if (selected == 2) {
        stopButton.click();
      }
    }

    function handleOnKeyDown(e, sts) {
      let code = e.keyCode;

      switch (code) {
        case 13:
          if (game.homeScreen) {
            handleMenuChoose(game.menuSelected);
          }
          break;
        case 37:
          handleKeyLeft();
          break;
        case 38:
          if (game.homeScreen) {
            if (game.menuSelected == 0) {
              game.menuSelected = 2;
            } else {
              game.menuSelected--;
            }
            game.menuAudio.play();
            game.drawHomeScreen();
          } else {
            handleKeyUp();
          }
          break;
        case 39:
          handleKeyRight();
          break;
        case 40:
          if (game.homeScreen) {
            if (game.menuSelected == 2) {
              game.menuSelected = 0;
            } else {
              game.menuSelected++;
            }
            game.menuAudio.play();
            game.drawHomeScreen();
          } else {
            handleKeyDown();
          }
          break;
      }

    }

    function handleOnMouseDown(e) {
      if (touchScreen) e = e.changedTouches[0];

      const rect = canvas.getBoundingClientRect();
      startPoint.x = e.clientX - rect.left;
      startPoint.y = e.clientY - rect.top;

    }

    function handleOnMouseUp(e) {
      if (touchScreen) e = e.changedTouches[0];

      const rect = canvas.getBoundingClientRect();
      endPoint.x = e.clientX - rect.left;
      endPoint.y = e.clientY - rect.top;

      let selected;
      if (game.homeScreen) {

        for (var i = 0; i < game.menuTexts.length; i++) {
          let isCollide = game.collides({
            x: game.menuTexts[i].x,
            y: game.menuTexts[i].y,
            width: ctx.measureText(game.menuTexts[i].text).width,
            height: 50
          }, {
            x: startPoint.x,
            y: startPoint.y,
            width: 10,
            height: 10
          });
          if (isCollide) {
            selected = i;
            handleMenuChoose(selected);
            break;
          }
        }

      }

      if (game.playScreen) {
        let deltaY = Math.abs(endPoint.y - startPoint.y);
        let deltaX = Math.abs(endPoint.x - startPoint.x)
        let theta = Math.atan2(deltaY, deltaX);

        if (endPoint.y <= startPoint.y) {
          if (endPoint.x >= startPoint.x) {
            if (theta < 15 * Math.PI / 180) {
              handleKeyRight();
            }
            if (theta > 75 * Math.PI / 180) {
              handleKeyUp();
            }
          } else {
            if (theta < 15 * Math.PI / 180) {
              handleKeyLeft();
            }
            if (theta > 75 * Math.PI / 180) {
              handleKeyUp();
            }
          }
        } else {
          if (endPoint.x >= startPoint.x) {
            if (theta < 15 * Math.PI / 180) {
              handleKeyRight();
            }
            if (theta > 75 * Math.PI / 180) {
              handleKeyDown();
            }
          } else {
            if (theta < 15 * Math.PI / 180) {
              handleKeyLeft();
            }
            if (theta > 75 * Math.PI / 180) {
              handleKeyDown();
            }
          }
        }
      }

    }


    window.addEventListener('resize', function() {
      let newCanvasWidth = window.innerWidth;
      let toolbarHeight = toolbarElem.style.opacity ? 0 : toolbarElem.offsetHeight + 3 ;
      let newCanvasHeight = window.innerHeight - toolbarHeight;

      game.resizeGame(newCanvasWidth, newCanvasHeight);
    });

    var restartButton = document.getElementById("restart-button");
    restartButton.addEventListener('click', function() {
      game.menuSelected = 0;
      game.homeScreen = true;
      display = 'homeScreen';
      game.playScreen = false;
      game.reset(true);
      game.gameAudio.pause();
    }, false);


    var stopButton = document.getElementById("stop-button");
    stopButton.addEventListener('click', function(event) {
      let stateObj = {
        homeScreen: game.homeScreen,
        playScreen: game.playScreen,
        playerX: game.playerX,
        playerY: game.playerY,
        obstacles: game.obstacles,
        lives: game.lives,
        targetWordLetters: game.targetWordLetters,
        targetWord: game.targetWord,
        frameNo: game.frameNo
      };
      activity.getDatastoreObject().setDataAsText(stateObj);
      activity.getDatastoreObject().save(function(error) {
        if (error === null) {
          console.log("write done.");
        } else {
          console.log("write failed.");
        }
      });
    });

    //full screen
    document.getElementById("fullscreen-button").addEventListener('click', function() {

      document.getElementById("main-toolbar").style.opacity = 0;
      document.getElementById("canvas").style.top = "0px";
      document.getElementById("unfullscreen-button").style.visibility = "visible";
      let newCanvasWidth = window.innerWidth;
      let newCanvasHeight = window.innerHeight;

      game.resizeGame(newCanvasWidth, newCanvasHeight);
    });
    document.getElementById("unfullscreen-button").addEventListener('click', function() {
      document.getElementById("main-toolbar").style.opacity = 1;
      document.getElementById("canvas").style.top = "55px";
      document.getElementById("unfullscreen-button").style.visibility = "hidden";
      let newCanvasWidth = window.innerWidth;
      let newCanvasHeight = window.innerHeight - toolbarElem.offsetHeight - 3;

      game.resizeGame(newCanvasWidth, newCanvasHeight);
    });

    document.getElementById("help-button").addEventListener('click', function(e) {
		tutorial.start();
	});

  });

});
