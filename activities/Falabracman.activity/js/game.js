var requestAnimationFrame = window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame;

const obstaclesPossiblePos = [
  [1, 1, 1, 0, 1, 1],
  [1, 0, 1, 0, 0, 1],
  [1, 0, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 0],
  [1, 1, 1, 0, 1, 1],
  [1, 0, 1, 0, 1, 1]
];

const framesSequence = {
  'LEFT': [4, 5, 4, 6],
  'RIGHT': [1, 2, 1, 3],
  'UP': [9, 10, 9, 11],
  'DOWN': [0, 7, 0, 8],
}

function Game(canvas, resources, paladict, webL10n) {

  this.homeScreen = true;
  this.playScreen = false;
  this.PlayerStop = true;
  this.gameEnded = false;

  this.obstacles = [];
  this.frameWidth = 76;
  this.frameHeight = 80;
  this.obstWidth = 130;
  this.obstHeight = 64;
  this.prevCanvasWidth = canvas.width;
  this.prevCanvasHeight = canvas.height;
  this.lives = 3;
  this.frameX = 0;
  this.frameY = 0;
  this.frameNo = 0;
  this.framesSequenceNo = 0;
  this.playerX = canvas.width * 0.88;
  this.playerY = canvas.height * 0.15;
  this.key = undefined;
  this.lastTime = Date.now();
  this.PlayerTimeInterval = 25;
  this.playerSpeed = (2 + canvas.width / screen.width * (screen.width / 300)) / this.PlayerTimeInterval;

  this.targetWord = "";
  this.targetWordLetters = [];
  this.targetLetterSize = screen.height * 0.10;
  this.homeScreenFontSize = canvas.height * 0.07;
  this.menuSelected = 0;
  this.menuTexts = [];

  //for setting screen
  this.settingScreen = false;
  this.useCustomDict = false;
  this.customDictWordEdit = false;
  this.wordInSetting = null;
  this.customDict = [];
  this.wordToBeEdited = null;
  this.customDictLang = null;


  this.splashAudio = new Audio('./sounds/splash.mp3');
  this.aplausoAudio = new Audio('./sounds/aplauso.mp3');
  this.moneyAudio = new Audio('./sounds/money.mp3');
  this.menuAudio = new Audio('./sounds/menu.mp3');
  this.gameAudio = new Audio('./sounds/menumusic22.mp3');


  this.main = function() {
    if (!this.useCustomDict) {
      this.initializeCustomDict();
    }

    if (this.homeScreen) {
      this.drawHomeScreen();
    } else if (this.creditScreen) {
      this.drawCreditScreen();
    } else if (this.settingScreen) {
      this.drawSettingScreen();
    } else if (this.playScreen) {
      this.initializeObstacles();
      this.generateTargetWord();
      this.run()
    }
  };

  this.reset = function(empty, lives) {
    this.PlayerStop = true;
    this.gameEnded = false;
    if (lives != null) {
      this.lives = lives;
    } else {
      this.lives = 3;
    }
    this.targetWordLetters = [];
    this.obstacles = [];
    this.frameNo = 0;
    this.playerX = canvas.width * 0.88;
    this.playerY = canvas.height * 0.15;
    if (!empty) {
      this.initializeObstacles();
      this.generateTargetWord();
    }

  };

  this.resizeImagesAndFont = function() {
    var aspectRatio = 76 / 80;
    var obstAspectRatio = 130 / 64;

    var canvasAspectRatio = canvas.width / canvas.height;

    //resizing frame or player's image
    if (aspectRatio >= canvasAspectRatio) {
      this.frameWidth = canvas.width * 0.10;
      this.frameHeight = this.frameWidth / aspectRatio;
    } else {
      this.frameHeight = canvas.height * 0.10;
      this.frameWidth = this.frameHeight * aspectRatio;
    }

    //resizing obstacles's images
    if (obstAspectRatio >= canvasAspectRatio) {
      this.obstWidth = canvas.width * 0.10;
      this.obstHeight = this.obstWidth / obstAspectRatio;
    } else {
      this.obstHeight = canvas.height * 0.10;
      this.obstWidth = this.obstHeight * obstAspectRatio;
    }

    //resizing font of targetword and targetWordLetters
    if (1 >= canvasAspectRatio) {
      this.targetLetterSize = canvas.width * 0.10;
    } else {
      this.targetLetterSize = canvas.height * 0.10;
    }

    //for resizing homescreen's text font size

    this.homeScreenFontSize = canvas.height * 0.07;


  };

  this.resizeGame = function(newCanvasWidth, newCanvasHeight) {
    var pxr = this.playerX / this.prevCanvasWidth;
    var pyr = this.playerY / this.prevCanvasHeight;
    var obstaclesCoordRatio = [];
    var targetWordLettersCoordRat = [];

    for (var i = 0; i < this.obstacles.length; i++) {
      var tmpX = this.obstacles[i].x / this.prevCanvasWidth;
      var tmpY = this.obstacles[i].y / this.prevCanvasHeight;
      var obj = {
        xr: tmpX,
        yr: tmpY
      }
      obstaclesCoordRatio.push(obj);
    }

    for (var i = 0; i < this.targetWordLetters.length; i++) {
      var tmpX = this.targetWordLetters[i].x / this.prevCanvasWidth;
      var tmpY = this.targetWordLetters[i].y / this.prevCanvasHeight;
      var obj = {
        xr: tmpX,
        yr: tmpY
      }
      targetWordLettersCoordRat.push(obj);
    }

    canvas.width = newCanvasWidth;
    canvas.height = newCanvasHeight;
    this.prevCanvasWidth = newCanvasWidth;
    this.prevCanvasHeight = newCanvasHeight;

    //changing the values
    this.resizeImagesAndFont();

    this.playerX = pxr * canvas.width;
    this.playerY = pyr * canvas.height;
    this.playerSpeed = (2 + canvas.width / screen.width * (2 + screen.width / 300)) / this.PlayerTimeInterval;


    for (var i = 0; i < this.obstacles.length; i++) {
      this.obstacles[i].x = obstaclesCoordRatio[i].xr * canvas.width;
      this.obstacles[i].y = obstaclesCoordRatio[i].yr * canvas.height;
    }

    for (var i = 0; i < targetWordLettersCoordRat.length; i++) {
      this.targetWordLetters[i].x = targetWordLettersCoordRat[i].xr * canvas.width;
      this.targetWordLetters[i].y = targetWordLettersCoordRat[i].yr * canvas.height;
    }

    this.resizeSettingScreen();

    if (this.homeScreen) {
      this.drawHomeScreen();
    } else if (this.settingScreen) {
      this.drawSettingScreen();
    }

  }

  this.drawHomeScreen = function() {
    var ctx = canvas.getContext("2d");
    var backgroundMenu = resources.get('./images/menu.jpg');
    ctx.drawImage(backgroundMenu, 0, 0, canvas.width, canvas.height);

    this.drawMenu();

  };

  this.drawMenu = function() {
    var ctx = canvas.getContext("2d");
    ctx.textBaseline = "top";
    var menu = ['Play', 'Credits', 'Settings', 'Quit'];
    this.menuTexts = [];
    var _this = this;
    document.fonts.load(_this.homeScreenFontSize + 'px ds_moster').then(function() {
      for (var i = 0; i < menu.length; i++) {
        if (_this.menuSelected == i) {
          ctx.fillStyle = "Red";
        } else {
          ctx.fillStyle = "Black";
        }
        ctx.font = _this.homeScreenFontSize + "px ds_moster";
        var text = webL10n.get(menu[i]);
        var menuTextObj = {
          x: canvas.width / 4,
          y: canvas.height / 2 + i * _this.homeScreenFontSize + i * 10,
          text: text
        }
        _this.menuTexts.push(menuTextObj);
        ctx.fillText(text, menuTextObj.x, menuTextObj.y);
      }
    });

  };

  this.drawCreditScreen = function() {
    var ctx = canvas.getContext("2d");
    var firstCreditScreen = resources.get('./images/splash.jpg');
    var secondCreditScreen = resources.get('./images/creditos.jpg');
    ctx.drawImage(firstCreditScreen, 0, 0, canvas.width, canvas.height);
    var _this = this;
    //display two credit images
    setTimeout(function() {
      ctx.drawImage(secondCreditScreen, 0, 0, canvas.width, canvas.height);
      setTimeout(function() {
        _this.homeScreen = true;
        _this.creditScreen = false;
        _this.drawHomeScreen();
      }, 2000);
    }, 2000);

  };

  this.initializeCustomDict = function(customDict) {
    this.customDict = [];
    this.customDictLang = webL10n.language.code;
    var dict;
    if (customDict == null) {
      var len = paladict.defaultDict.length;
      for (var i = 0; i < len; i++) {
        var word = webL10n.get(paladict.defaultDict[i]);
        this.customDict.push(word);
      }
    } else {
      this.customDict = customDict;
    }
  };

  this.resizeSettingScreen = function() {

    var settingScreenElem = document.getElementById("settingScreen");
    var panelBodyElem = document.getElementById("panel-body");
    var wordInputElem = document.getElementById('word');

    settingScreenElem.style.top = window.innerHeight * 0.15 + "px";
    settingScreenElem.style.left = window.innerWidth * 0.05 + "px";
    settingScreenElem.style.right = window.innerWidth * 0.05 + "px";
    settingScreenElem.style.width = window.innerWidth * 0.9 + "px";
    settingScreenElem.style.height = window.innerHeight * 0.8 + "px";
    if (window.innerHeight < 500) {
      panelBodyElem.style.height = window.innerHeight * 0.2 + "px";
    } else {
      panelBodyElem.style.height = window.innerHeight * 0.4 + "px";
    }
    panelBodyElem.style.width = 100 + "%";
    wordInputElem.style.width = window.innerWidth * 0.9 + "px";
  };

  this.drawSettingScreen = function() {
    var ctx = canvas.getContext("2d");
    var backgroundMenu = resources.get('./images/setting.jpg');
    ctx.drawImage(backgroundMenu, 0, 0, canvas.width, canvas.height);

    var settingScreenElem = document.getElementById("settingScreen");
    var dictionaryListElem = document.getElementById('dictionary');

    settingScreenElem.style.visibility = "visible";

    this.resizeSettingScreen();


    var wordInSetting = this.wordInSetting;

    dictionaryListElem.innerHTML = "";

    if (this.customDictWordEdit) {
      var tmp = document.createElement('li');

      var tmpRow = '<div class="dictRow">' +
        '<div>' + wordInSetting + '</div>' +
        '<div>' +
        '<button type="button" id="' + this.wordToBeEdited + '" class="settingButtons saveEditWord" name="button" title="Okay"></button>' +
        '<button type="button" id="' + this.wordToBeEdited + '" class="settingButtons resetEditWord" name="button" title="Cancel"></button>' +
        '</div>' +
        '</div>';

      tmp.innerHTML = tmpRow;
      dictionaryListElem.appendChild(tmp);
    } else {

      for (var i = 0; i < this.customDict.length; i++) {
        var word = this.customDict[i];
        if (wordInSetting != null) {
          if (word.toUpperCase().startsWith(wordInSetting.toUpperCase())) {
            var tmp = document.createElement('li');

            var tmpRow = '<div class="dictRow">' +
              '<div>' + word + '</div>' +
              '<div>' +
              '<button type="button" id="' + word + '" class="settingButtons editWord" name="button" title="Edit"></button>';
            if (this.customDict.length != 1) {
              tmpRow += '<button type="button" id="' + word + '" class="settingButtons deleteWord" name="button title="Delete""></button>';
            }
            tmpRow += '</div>' +
              '</div>';

            tmp.innerHTML = tmpRow;
            dictionaryListElem.appendChild(tmp);
          }
        } else {
          var tmp = document.createElement('li');

          var tmpRow = '<div class="dictRow">' +
            '<div>' + word + '</div>' +
            '<div>' +
            '<button type="button" id="' + word + '" class="settingButtons editWord" name="button" title="Edit"></button>';
          if (this.customDict.length != 1) {
            tmpRow += '<button type="button" id="' + word + '" class="settingButtons deleteWord" name="button" title="Delete"></button>';
          }
          tmpRow += '</div>' +
            '</div>';

          tmp.innerHTML = tmpRow;
          dictionaryListElem.appendChild(tmp);
        }
      }
    }

  };

  this.run = function() {
    var ctx = canvas.getContext("2d");
    //clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (this.playScreen) {

      if (this.key != undefined) {
        this.gameAudio.play();
      }

      var bar;
      bar = resources.get('./images/barra.jpg');

      //draw the upper bar
      ctx.drawImage(bar, 0, 0, canvas.width, canvas.height * 0.15);

      var playBackground;
      playBackground = resources.get('./images/fondo.jpg');

      //draw the background image
      ctx.drawImage(playBackground, 0, canvas.height * 0.15, canvas.width, canvas.height * 0.85);

      //draw obstacles
      for (var i = 0; i < this.obstacles.length; i++) {
        var x = this.obstacles[i].x;
        var y = this.obstacles[i].y;
        var j = this.obstacles[i].j;

        var obsImg;
        obsImg = resources.get('./images/lago' + j + '.png');
        ctx.drawImage(obsImg, x, y, this.obstWidth, this.obstHeight);

      }

      this.drawTargetLetters();

      //draw the lives
      for (var i = 1; i <= this.lives; i++) {

        var livesImg;
        livesImg = resources.get('./images/zeek0.png');
        var x = canvas.width * 0.95 - i * this.frameWidth;
        ctx.drawImage(livesImg, x, 10, this.frameWidth, this.frameHeight);

      }

      this.movePlayerSprite();

      var won = this.checkIfGameEnded();

      if (this.gameEnded) {
        this.gameEnded = false;
        this.drawEndGameScreen(won);
        var _this = this;
        setTimeout(function() {
          if (!won) {
            _this.reset(true);
            _this.playScreen = false;
            _this.homeScreen = true;
            display = 'homeScreen';
            _this.gameAudio.pause();
          } else {
            var tmp = _this.lives;
            _this.reset(false, tmp);
          }

          requestAnimationFrame(_this.run.bind(_this));

        }, 2000);
      } else {
        requestAnimationFrame(this.run.bind(this));
      }
    } else {
      this.main();
    }

  };

  this.initializeObstacles = function() {

    this.resizeImagesAndFont();

    for (var i = 0; i < 6;) {

      var arr = [];
      for (var k = 0; k < 6; k++) {
        if (obstaclesPossiblePos[i][k] == 1) {
          arr.push(k);
        }
      }

      var x = i * this.obstWidth + this.frameWidth;
      var y = arr[Math.floor(Math.random() * arr.length)] * canvas.height * 0.10 + this.frameHeight + canvas.height * 0.15;
      var j = Math.floor(Math.random() * 4);
      var obj = {
        x: x,
        y: y,
        j: j
      }
      var doPush = true;
      for (var k = 0; k < this.obstacles.length; k++) {
        var isCollide = this.collides({
          x: x,
          y: y,
          width: this.obstWidth,
          height: this.obstHeight
        }, {
          x: this.obstacles[k].x,
          y: this.obstacles[k].y,
          width: this.obstWidth,
          height: this.obstHeight
        });
        if (isCollide) {
          doPush = false;
          break;
        } else {
          doPush = true;
        }
      }
      if (doPush) {
        i++;
        this.obstacles.push(obj);
      }
    }
    this.aplausoAudio.play();

  };

  this.generateTargetWord = function() {
    var targetWord = paladict.getRandomWord();
    if (this.useCustomDict) {
      this.targetWord = targetWord.toUpperCase();
    } else {
      this.targetWord = webL10n.get(targetWord).toUpperCase();
    }

    var tempArr = this.targetWord.split('');

    for (var i = 0; i < tempArr.length;) {

      var x = Math.floor(Math.random() * canvas.width * 0.70) + canvas.width * 0.1;
      var y = Math.floor(Math.random() * canvas.height * 0.65) + canvas.height * 0.20;
      var letter = tempArr[i];
      var obj = {
        x: x,
        y: y,
        letter: letter
      }
      var doPush1 = true,
        doPush2 = true;

      //to ensure the letter do not overlaps with any obstacles
      // to ensure the letter do not overlaps even after resizing the window to the full, we are considering maximum size a letter can attain
      for (var k = 0; k < this.obstacles.length; k++) {
        var isCollide = this.collides({
          x: x,
          y: y,
          width: this.targetLetterSize,
          height: this.targetLetterSize
        }, {
          x: this.obstacles[k].x,
          y: this.obstacles[k].y,
          width: screen.width * 0.10,
          height: screen.height * 0.10
        });
        if (isCollide) {
          doPush1 = false;
          break;
        } else {
          doPush1 = true;
        }
      }

      //to ensure any letter do not overlaps with any other letter
      for (var k = 0; k < this.targetWordLetters.length; k++) {
        var isCollide = this.collides({
          x: x,
          y: y,
          width: this.targetLetterSize,
          height: this.targetLetterSize
        }, {
          x: this.targetWordLetters[k].x,
          y: this.targetWordLetters[k].y,
          width: this.targetLetterSize,
          height: this.targetLetterSize
        });
        if (isCollide) {
          doPush2 = false;
          break;
        } else {
          doPush2 = true;
        }
      }
      if (doPush1 && doPush2) {
        i++;
        this.targetWordLetters.push(obj);
      }

    }
  };

  this.drawTargetLetters = function() {
    var ctx = canvas.getContext("2d");
    var num = this.targetWord.length - this.targetWordLetters.length;

    //drawing target word at the bar
    ctx.font = this.targetLetterSize + "px VeraBd";
    ctx.fillStyle = "white";
    ctx.strokeStyle = "Black";
    var collectedWords = this.targetWord.substr(0, num);
    ctx.strokeText(collectedWords, 15, 20);
    ctx.fillText(collectedWords, 15, 20);

    ctx.fillStyle = "Black";
    ctx.strokeStyle = "White";
    var remainingWords = this.targetWord.substr(num);
    ctx.strokeText(remainingWords, 15 + ctx.measureText(collectedWords).width, 20);
    ctx.fillText(remainingWords, 15 + ctx.measureText(collectedWords).width, 20);

    //drawing target words letters on the play board
    for (var i = 0; i < this.targetWordLetters.length; i++) {
      var x = this.targetWordLetters[i].x;
      var y = this.targetWordLetters[i].y;
      var letter = this.targetWordLetters[i].letter;

      ctx.font = this.targetLetterSize + "px VeraBd";
      ctx.fillStyle = "White";
      ctx.textBaseline = "top";
      ctx.strokeStyle = 'Black';
      ctx.fillText(letter, x, y);
      ctx.strokeText(letter, x, y);
      ctx.stroke();
    }

  }

  this.movePlayerSprite = function() {
    var ctx = canvas.getContext("2d");

    //change the player frame only if Date.now()-this.lastTime is greater than or equal to this.PlayerTimeInterval
    if (this.key == 'LEFT') {
      if (Date.now() - this.lastTime >= this.PlayerTimeInterval) {

        this.playerNobstaclesCollision();

        if (this.playerX <= 0) {
          this.PlayerStop = true;
          this.frameNo = 4;
        }
        if (!this.PlayerStop) {
          if (this.framesSequenceNo == 3) {
            this.framesSequenceNo = 0;
            this.frameNo = framesSequence['LEFT'][this.framesSequenceNo];
          } else {
            this.framesSequenceNo++;
            this.frameNo = framesSequence['LEFT'][this.framesSequenceNo];
          }
          this.playerX -= this.playerSpeed * this.PlayerTimeInterval;
        }

        this.lastTime = Date.now();
      }

    }

    if (this.key == 'UP') {
      if (Date.now() - this.lastTime >= this.PlayerTimeInterval) {

        this.playerNobstaclesCollision();

        if (this.playerY <= canvas.height * 0.15) {
          this.PlayerStop = true;
          this.frameNo = 9;
        }
        if (!this.PlayerStop) {
          if (this.framesSequenceNo == 3) {
            this.framesSequenceNo = 0;
            this.frameNo = framesSequence['UP'][this.framesSequenceNo];
          } else {
            this.framesSequenceNo++;
            this.frameNo = framesSequence['UP'][this.framesSequenceNo];
          }
          this.playerY -= this.playerSpeed * this.PlayerTimeInterval;
        }

        this.lastTime = Date.now();
      }
    }

    if (this.key == 'RIGHT') {
      if (Date.now() - this.lastTime >= this.PlayerTimeInterval) {

        this.playerNobstaclesCollision();

        if (this.playerX + this.frameWidth >= canvas.width) {
          this.PlayerStop = true;
          this.frameNo = 1;
        }
        if (!this.PlayerStop) {
          if (this.framesSequenceNo == 3) {
            this.framesSequenceNo = 0;
            this.frameNo = framesSequence['RIGHT'][this.framesSequenceNo];
          } else {
            this.framesSequenceNo++;
            this.frameNo = framesSequence['RIGHT'][this.framesSequenceNo];
          }
          this.playerX += this.playerSpeed * this.PlayerTimeInterval;
        }

        this.lastTime = Date.now();
      }
    }

    if (this.key == 'DOWN') {
      if (Date.now() - this.lastTime >= this.PlayerTimeInterval) {

        this.playerNobstaclesCollision();

        if (this.playerY + this.frameHeight >= canvas.height) {
          this.PlayerStop = true;
          this.frameNo = 0;
        }
        if (!this.PlayerStop) {
          if (this.framesSequenceNo == 3) {
            this.framesSequenceNo = 0;
            this.frameNo = framesSequence['DOWN'][this.framesSequenceNo];
          } else {
            this.framesSequenceNo++;
            this.frameNo = framesSequence['DOWN'][this.framesSequenceNo];
          }
          this.playerY += this.playerSpeed * this.PlayerTimeInterval;
        }

        this.lastTime = Date.now();
      }
    }

    this.checkIfWordsCollected();

    var playerImg;

    playerImg = resources.get('./images/zeek' + this.frameNo + '.png');

    ctx.drawImage(playerImg, this.playerX, this.playerY, this.frameWidth, this.frameHeight);

  };

  this.checkIfWordsCollected = function() {
    var isCollide = false;

    if (this.targetWordLetters.length > 0) {
      for(var i=0; i<this.targetWordLetters.length; i++) {
        if(this.targetWordLetters[i].letter == this.targetWordLetters[0].letter) {
          isCollide = this.collides({
            x: this.playerX,
            y: this.playerY,
            width: this.frameWidth,
            height: this.frameHeight
          }, {
            x: this.targetWordLetters[i].x,
            y: this.targetWordLetters[i].y,
            width: 30,
            height: 30
          });
          if (isCollide) {
            if(i != 0) {
              //Swapping the x and y of first letter with the current
              var tempX = this.targetWordLetters[0].x;
              var tempY = this.targetWordLetters[0].y;
              this.targetWordLetters[0].x = this.targetWordLetters[i].x;
              this.targetWordLetters[0].y = this.targetWordLetters[i].y;
              this.targetWordLetters[i].x = tempX;
              this.targetWordLetters[i].y = tempY;
            }
            this.targetWordLetters.splice(0, 1);
            this.moneyAudio.play();
            this.drawTargetLetters();
            break;
          }
        }
      }
    }
  };

  this.playerNobstaclesCollision = function() {
    var isCollide;
    for (var i = 0; i < this.obstacles.length; i++) {
      isCollide = this.collides({
        x: this.obstacles[i].x,
        y: this.obstacles[i].y,
        width: this.obstWidth,
        height: this.obstHeight
      }, {
        x: this.playerX,
        y: this.playerY,
        width: this.frameWidth,
        height: this.frameHeight
      });
      if (isCollide) {
        break;
      }
    }

    if (isCollide) {
      this.PlayerStop = true;
      this.lives--;
      this.playerX = canvas.width * 0.88;
      this.playerY = canvas.height * 0.15;
      this.frameNo = 0;
      this.splashAudio.play();

    }
    return isCollide;
  };

  this.collides = function(a, b) {
    if (a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y)
      return true;
    else
      return false;
  };

  this.drawEndGameScreen = function(won) {
    var ctx = canvas.getContext("2d");
    var endScreenImg;
    if (won) {
      endScreenImg = resources.get('./images/ganaste.png');
    } else {
      endScreenImg = resources.get('./images/perdio.png');
    }
    ctx.drawImage(endScreenImg, 0, 0, canvas.width, canvas.height);
  }

  this.checkIfGameEnded = function() {
    if (this.targetWordLetters.length == 0 && !this.gameEnded) {
      this.gameEnded = true;
      return true;
    }
    if (this.lives == -1 && !this.gameEnded) {
      this.gameEnded = true;
      return false;
    }
  }

}

define(function() {
  return Game;
});
