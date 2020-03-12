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
      './images/setting.jpg',
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
    var wordInputElem = document.getElementById('word');
    toolbarElem.style.opacity = 1;
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

      //translating for setting Screen
      window.addEventListener('localized', function() {
        document.getElementById('WordHeading').innerHTML = webL10n.get('Word');
        document.getElementById('DictHeading').innerHTML = webL10n.get('Dictionary');

        resources.onReady(function() {
          if (!environment.objectId) {
            display = 'homeScreen';
            game.main();
          } else {
            //load from datastore
            activity.getDatastoreObject().loadAsText(function(error, metadata, data) {
              if (error == null && data != null) {

                game.customDict = data.customDict;
                game.useCustomDict = data.useCustomDict;
                if (game.useCustomDict) {
                  paladict.changeDict(data.customDict);
                }

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
                  game.prevCanvasWidth = data.prevCanvasWidth;
                  game.prevCanvasHeight = data.prevCanvasHeight;
                  game.resizeGame(canvas.width, canvas.height);
                  if (!game.useCustomDict) {
                    game.initializeCustomDict();
                  }
                  game.run();
                } else {
                  game.homeScreen = true;
                  display = 'homeScreen';
                  game.playScreen = false;
                  game.main();
                }
              }
            })
          }
        });
      });
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
    document.getElementById('word').addEventListener('input', handleOnTextChange);

    var touchScreen = ("ontouchstart" in document.documentElement);

    if (touchScreen) {
      canvas.addEventListener('touchstart', handleOnMouseDown, false);
      canvas.addEventListener('touchend', handleOnMouseUp, false);
    } else {
      canvas.addEventListener('mousedown', handleOnMouseDown, false);
      canvas.addEventListener('mouseup', handleOnMouseUp, false);
    }

    function handleKeyLeft() {
      game.key = 'LEFT';
      game.frameNo = 4;
      game.PlayerStop = false;
    }

    function handleKeyUp() {
      game.key = 'UP';
      game.frameNo = 9;
      game.PlayerStop = false;
    }

    function handleKeyRight() {
      game.key = 'RIGHT';
      game.frameNo = 1;
      game.PlayerStop = false;
    }

    function handleKeyDown() {
      game.key = 'DOWN';
      game.frameNo = 7;
      game.PlayerStop = false;
    }

    function handleMenuChoose(_selected) {
      if (game.soundEnabled) {
        game.menuAudio.play();
      }
      if (_selected == 0) {
        game.homeScreen = false;
        game.creditScreen = false;
        game.playScreen = true;
        display = 'playScreen';
        game.main();
      } else if (_selected == 1) {
        game.homeScreen = false;
        game.creditScreen = true;
        game.drawCreditScreen();
      } else if (_selected == 2) {
        game.homeScreen = false;
        game.creditScreen = false;
        game.settingScreen = true;
        display = 'settingScreen';
        game.drawSettingScreen();
      } else if (_selected == 3) {
        stopButton.click();
      }
    }

    function handleOnKeyDown(e, sts) {
      var code = e.keyCode;

      switch (code) {
        case 13:
          if (game.homeScreen) {
            var sel = game.menuSelected;
            handleMenuChoose(sel);
          }
          break;
        case 37:
          handleKeyLeft();
          break;
        case 38:
          if (game.homeScreen) {
            if (game.menuSelected == 0) {
              game.menuSelected = 3;
            } else {
              game.menuSelected--;
            }
            if (game.soundEnabled) {
              game.menuAudio.play();
            }
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
            if (game.menuSelected == 3) {
              game.menuSelected = 0;
            } else {
              game.menuSelected++;
            }
            if (game.soundEnabled) {
              game.menuAudio.play();
            }
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

      var sel;
      if (game.homeScreen) {

        for (var i = 0; i < game.menuTexts.length; i++) {
          var isCollide = game.collides({
            x: game.menuTexts[i].x,
            y: game.menuTexts[i].y,
            width: ctx.measureText(game.menuTexts[i].text).width,
            height: game.homeScreenFontSize + 10
          }, {
            x: startPoint.x,
            y: startPoint.y,
            width: 10,
            height: 10
          });
          if (isCollide) {
            sel = i;
            handleMenuChoose(sel);
            break;
          }
        }

      }

      if (game.playScreen) {
        var deltaY = Math.abs(endPoint.y - startPoint.y);
        var deltaX = Math.abs(endPoint.x - startPoint.x)
        var theta = Math.atan2(deltaY, deltaX);

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

    };

    //for setting screen

    function handleOnTextChange(e) {
      game.wordInSetting = e.target.value;
      if (game.soundEnabled) {
        game.menuAudio.play();
      }

      if (game.wordInSetting == "") {
        game.wordInSetting = null;
      }
      if (game.customDictWordEdit) {
        var dictionaryListElem = document.getElementById('dictionary');
        dictionaryListElem.children[0].children[0].children[0].innerHTML = e.target.value;
      } else {
        game.drawSettingScreen();
      }

    }

    var addWordButton = document.getElementById("addWord");
    addWordButton.addEventListener('click', function() {
      var dictionaryListElem = document.getElementById('dictionary');
      var flag = 0;
      //checking if a word already existed in dictionary or not
      if (!game.customDictWordEdit) {
        if (game.soundEnabled) {
          game.menuAudio.play();
        }
        if (game.wordInSetting != null) {
          for (var i = 0; i < dictionaryListElem.children.length; i++) {
            var wordShown = dictionaryListElem.children[i].children[0].children[0].innerHTML;
            if (wordShown.toUpperCase() == game.wordInSetting.toUpperCase()) {
              flag = 1;
              break;
            }
          }

          if (flag == 0) {
            game.customDict.unshift(game.wordInSetting);
            wordInputElem.value = "";
            game.wordInSetting = null;
            game.drawSettingScreen();
          }
        }
      }

    });

    var deleteAllWordsButton = document.getElementById("deleteAllWords");
    deleteAllWordsButton.addEventListener('click', function() {
      if (!game.customDictWordEdit) {
        if (game.soundEnabled) {
          game.menuAudio.play();
        }
        var firstWord = webL10n.get('Play');
        game.customDict = [firstWord];
        wordInputElem.value = "";
        game.wordInSetting = null;
        game.drawSettingScreen();
      }
    });

    var saveDictButton = document.getElementById("saveDict");
    saveDictButton.addEventListener('click', function() {
      if (!game.customDictWordEdit) {
        if (game.soundEnabled) {
          game.menuAudio.play();
        }
        paladict.changeDict(game.customDict);
        game.useCustomDict = true;
        game.drawSettingScreen();
      }
    });

    var resetDictButton = document.getElementById("resetDict");
    resetDictButton.addEventListener('click', function() {
      if (!game.customDictWordEdit) {
        if (game.soundEnabled) {
          game.menuAudio.play();
        }
        game.initializeCustomDict();
        wordInputElem.value = "";
        game.wordInSetting = null;
        game.drawSettingScreen();
      }
    });


    if (document.addEventListener) {
      document.addEventListener("click", handleButtonClick, true);
    } else if (document.attachEvent) {
      document.attachEvent("onclick", handleButtonClick, true);
    }

    function handleButtonClick(event) {
      event = event || window.event;
      event.target = event.target || event.srcElement;

      var element = event.target;

      var addWordElem = document.getElementById('addWord');
      var deleteAllWordsElem = document.getElementById('deleteAllWords');
      var saveDictElem = document.getElementById('saveDict');
      var resetDictElem = document.getElementById('resetDict');

      // Climb up the document tree from the target of the event
      while (element) {
        if (element.nodeName === "BUTTON" && /deleteWord/.test(element.className)) {
          // The user clicked on a <button> or clicked on an element inside a <button>
          // with a class name called "deleteWord"
          if (game.soundEnabled) {
            game.menuAudio.play();
          }
          var filtered = game.customDict.filter(function(value, index, arr) {
            return value != element.id;
          });
          game.customDict = filtered;
          //paladict.changeDict(game.customDict);
          game.drawSettingScreen();
          break;
        }

        if (element.nodeName === "BUTTON" && /editWord/.test(element.className)) {
          // The user clicked on a <button> or clicked on an element inside a <button>
          // with a class name called "editWord"
          if (game.soundEnabled) {
            game.menuAudio.play();
          }
          wordInputElem.value = element.id;
          game.wordInSetting = wordInputElem.value;
          game.wordToBeEdited = wordInputElem.value;
          game.customDictWordEdit = true;
          //blurring the buttons
          addWordElem.style.opacity = 0.5;
          deleteAllWordsElem.style.opacity = 0.5;
          saveDictElem.style.opacity = 0.5;
          resetDictElem.style.opacity = 0.5;

          game.drawSettingScreen();
          break;
        }

        if (element.nodeName === "BUTTON" && /saveEditWord/.test(element.className)) {
          // The user clicked on a <button> or clicked on an element inside a <button>
          // with a class name called "saveEditWord"
          if (game.soundEnabled) {
            game.menuAudio.play();
          }
          if (game.wordInSetting != null) {
            game.customDict[game.customDict.indexOf(game.wordToBeEdited)] = game.wordInSetting;
            game.customDictWordEdit = false;
            wordInputElem.value = "";
            game.wordInSetting = null;

            addWordElem.style.opacity = 1;
            deleteAllWordsElem.style.opacity = 1;
            saveDictElem.style.opacity = 1;
            resetDictElem.style.opacity = 1;

            game.drawSettingScreen();
          }

          break;
        }

        if (element.nodeName === "BUTTON" && /resetEditWord/.test(element.className)) {
          // The user clicked on a <button> or clicked on an element inside a <button>
          // with a class name called "saveEditWord"
          if (game.soundEnabled) {
            game.menuAudio.play();
          }
          game.customDict[game.customDict.indexOf(game.wordToBeEdited)] = game.wordToBeEdited;
          game.customDictWordEdit = false;
          game.wordInSetting = "";
          wordInputElem.value = null;

          addWordElem.style.opacity = 1;
          deleteAllWordsElem.style.opacity = 1;
          saveDictElem.style.opacity = 1;
          resetDictElem.style.opacity = 1;

          game.drawSettingScreen();
          break;
        }

        element = element.parentNode;
      }
    }



    window.addEventListener('resize', function() {
      var newCanvasWidth = window.innerWidth;
      var toolbarHeight = toolbarElem.style.opacity == 1 ? toolbarElem.offsetHeight + 3 : 0;
      var newCanvasHeight = window.innerHeight - toolbarHeight;
      game.resizeGame(newCanvasWidth, newCanvasHeight);
    });

    var restartButton = document.getElementById("restart-button");
    restartButton.addEventListener('click', function() {
      game.homeScreen = true;
      display = 'homeScreen';
      game.playScreen = false;
      game.reset(true);
      game.gameAudio.pause();
      if (game.settingScreen) {
        game.settingScreen = false;
        wordInputElem.value = "";
        game.wordInSetting = null;
        game.customDict = [].concat(paladict.dict);
        game.customDictWordEdit = false;

        document.getElementById("settingScreen").style.visibility = "hidden";
        document.getElementById("addWord").style.opacity = 1;
        document.getElementById("deleteAllWords").style.opacity = 1;
        document.getElementById("saveDict").style.opacity = 1;
        document.getElementById("resetDict").style.opacity = 1;
        game.main();
      }
    }, false);

    var soundButton = document.getElementById("sound-button");
    soundButton.addEventListener('click', function() {
      game.soundEnabled = !game.soundEnabled;
      if (game.soundEnabled) {
        document.getElementById("sound-button").style.backgroundImage = "url(./icons/speaker-muted-100.svg)";
        document.getElementById('sound-button').title = 'Mute The Game';
      }
      else {
        document.getElementById("sound-button").style.backgroundImage = "url(./icons/speaker-muted-000.svg)";
        document.getElementById('sound-button').title = 'Unmute The Game';
        game.gameAudio.pause();
        game.aplausoAudio.pause();
        game.splashAudio.pause();
        game.moneyAudio.pause();
        game.menuAudio.pause();
      }
    }, false);


    var stopButton = document.getElementById("stop-button");
    stopButton.addEventListener('click', function(event) {
      var stateObj = {
        homeScreen: game.homeScreen,
        playScreen: game.playScreen,
        playerX: game.playerX,
        playerY: game.playerY,
        obstacles: game.obstacles,
        lives: game.lives,
        targetWordLetters: game.targetWordLetters,
        targetWord: game.targetWord,
        frameNo: game.frameNo,
        prevCanvasWidth: game.prevCanvasWidth,
        prevCanvasHeight: game.prevCanvasHeight,
        customDict: game.customDict,
        useCustomDict: game.useCustomDict,
        customDictLang: game.customDictLang
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
      var newCanvasWidth = window.innerWidth;
      var newCanvasHeight = window.innerHeight;

      game.resizeGame(newCanvasWidth, newCanvasHeight);
    });
    document.getElementById("unfullscreen-button").addEventListener('click', function() {
      document.getElementById("main-toolbar").style.opacity = 1;
      document.getElementById("canvas").style.top = "55px";
      document.getElementById("unfullscreen-button").style.visibility = "hidden";
      var newCanvasWidth = window.innerWidth;
      var newCanvasHeight = window.innerHeight - toolbarElem.offsetHeight - 3;

      game.resizeGame(newCanvasWidth, newCanvasHeight);
    });

    document.getElementById("help-button").addEventListener('click', function(e) {
      tutorial.start();
    });

  });

});
