define(["sugar-web/activity/activity","tween","rAF","activity/directions","sugar-web/graphics/presencepalette", "sugar-web/env",  "sugar-web/graphics/icon", "webL10n", "sugar-web/graphics/palette", "rot"], function (activity, TWEEN, rAF, directions, presencepalette, env, icon, webL10n, palette, ROT) {

    requirejs(['domReady!'], function (doc) {
        activity.setup();

        var maze = {};
        var ended=false;
        var oponentEnded=false;
        maze.width = undefined;
        maze.height = undefined;
        maze.startPoint = {};
        maze.goalPoint = {};

        maze.walls = [];
        maze.visited = [];
        maze.directions = [];
        maze.forks = [];
        var firstentry=true;
        
        
        env.getEnvironment(function(err, environment) {        
            // Shared instances
            if (environment.sharedId) {
                console.log("Shared instance");
                presence = activity.getPresenceObject(function(error, network) {
                    network.onDataReceived(onNetworkDataReceived);
                    network.onSharedActivityUserChanged(onNetworkUserChanged);
                });
            }
            
        });

        var onNetworkDataReceived = function(msg) {
            if (presence.getUserInfo().networkId === msg.user.networkId) {
                return;
            }
            
            switch (msg.action){
                case 'start':
                    ended=false;
                    oponentEnded=false;
                    maze=msg.content;
                    gameSize=msg.SizeOfGame;
                    updateMazeSize();
                    updateSprites();
                    onLevelStart();
                    break;
                case 'ended':
                    oponentEnded=true;
                    break;
            }
            
            
        }; 

        var onNetworkUserChanged = function(msg) {
            if (isHost) {
                presence.sendMessage(presence.getSharedInfo().id, {
                    user: presence.getUserInfo(),
                    action: 'start',
                    SizeOfGame: gameSize,
                    content: maze
                });
            }
            console.log("User "+msg.user.name+" "+(msg.move == 1 ? "join": "leave"));

        }; 

		var soundType = /(iPad|iPhone|iPod)/g.test(navigator.userAgent) ? '.mp3' : '.ogg';
        var canvasWidth;
        var canvasHeight;

        var wallColor = "#101010";
        var corridorColor = "#ffffff";
        var startColor = "hsl(0, 0%, 80%)";
        var startPlayerColor = "hsl(0, 90%, 50%)";
        var goalColor;

        var cellWidth;
        var cellHeight;

        var dirtyCells = [];

        var controls = {
            'arrows': [38, 39, 40, 37],
            'wasd': [87, 68, 83, 65],
            'ijkl': [73, 76, 75, 74],
            'mouse': [-1, -1, -1, -1]
        };

        var controlNames = ['arrows', 'wasd', 'ijkl', 'mouse'];

        var controlColors = {};
        var controlSprites = {};

        var players = {};
        var winner;

        var gameSize = 60;

        var levelStatus;
        var levelTransitionRadius;
        var levelStartingValue;

        var debug = false; //true;

        var mazeCanvas = document.getElementById("maze");

        var spriteCanvas = document.createElement("canvas");
        

        var updateMazeSize = function () {
            var toolbarElem = document.getElementById("main-toolbar");

            canvasWidth = window.innerWidth;
            canvasHeight = window.innerHeight - toolbarElem.offsetHeight - 3;

            cellWidth = Math.floor(canvasWidth / maze.width);
            cellHeight = Math.floor(canvasHeight / maze.height);

            mazeCanvas.width = canvasWidth;
            mazeCanvas.height = canvasHeight;

            spriteCanvas.width = cellWidth * 2; // number of states
            spriteCanvas.height = cellHeight * controlNames.length;
        };

        

        var onWindowResize = function () {
            updateMazeSize();
            updateSprites();
            drawMaze();
        };
        window.addEventListener('resize', onWindowResize);

        var updateSprites = function () {
            for (control in controls) {
                if (control in controlColors) {
                    createPlayerSprite(control);
                }
            }
        }

        var createPlayerSprite = function (control) {
            var i = controlNames.indexOf(control);
            ctx = spriteCanvas.getContext("2d");
            drawPlayerFace(ctx, 0, i, controlColors[control].normal);
            drawPlayerFace(ctx, 1, i, controlColors[control].blocked);
            return {
                'normal': {'image': spriteCanvas, 'x': 0, 'y': i},
                'blocked': {'image': spriteCanvas, 'x': 1, 'y': i}
            };
        }
        var drawCell = function (ctx, x, y, color) {
            ctx.fillStyle = color;
            ctx.fillRect(cellWidth * x, cellHeight * y, cellWidth, cellHeight);
        }

        var drawGround = function (ctx, x, y, value) {
            var color;
            if (value == 1) {
                color = wallColor;
            } else {
                color = corridorColor;
            }
            drawCell(ctx, x, y, color);
        };

        var drawPoint = function (ctx, x, y, color, size) {
            var centerX = cellWidth * (x + 0.5);
            var centerY = cellHeight * (y + 0.5);
            var radius = size * Math.min(cellWidth, cellHeight) / 2;

            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
            ctx.fillStyle = color;
            ctx.fill();
        };

        var drawPlayerFace = function (ctx, x, y, color) {
            drawPoint(ctx, x, y, color, 0.9);

            var eye1X = cellWidth * (x + 0.3);
            var eye1Y = cellHeight * (y + 0.45);
            var eyeRadius = 0.28 * Math.min(cellWidth, cellHeight) / 2;
            ctx.beginPath();
            ctx.arc(eye1X, eye1Y, eyeRadius, 0, 2 * Math.PI, false);

            var eye2X = cellWidth * (x + 0.7);
            var eye2Y = cellHeight * (y + 0.45);
            ctx.arc(eye2X, eye2Y, eyeRadius, 0, 2 * Math.PI, false);
            ctx.fillStyle = "#ffffff";
            ctx.fill();

            ctx.beginPath();
            ctx.arc(eye1X, eye1Y, eyeRadius / 2, 0, 2 * Math.PI, false);
            ctx.arc(eye2X, eye2Y, eyeRadius / 2, 0, 2 * Math.PI, false);
            ctx.fillStyle = "#000000";
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(cellWidth * (x + 0.25), cellHeight * (y + 0.65));
            ctx.quadraticCurveTo(cellWidth * (x + 0.5), cellHeight * (y + 0.75),
                                 cellWidth * (x + 0.75), cellHeight * (y + 0.65));
            ctx.quadraticCurveTo(cellWidth * (x + 0.5), cellHeight * (y + 0.75),
                                 cellWidth * (x + 0.75), cellHeight * (y + 0.65));
            ctx.quadraticCurveTo(cellWidth * (x + 0.5), cellHeight * (y + 1),
                                 cellWidth * (x + 0.25), cellHeight * (y + 0.65));
            ctx.quadraticCurveTo(cellWidth * (x + 0.5), cellHeight * (y + 1),
                                 cellWidth * (x + 0.25), cellHeight * (y + 0.65));
            ctx.fillStyle = "#ffffff";
            ctx.fill();
        }

        var drawSprite = function (ctx, x, y, spriteData) {
            ctx.drawImage(spriteData.image,
                          cellWidth * spriteData.x, cellHeight * spriteData.y,
                          cellWidth, cellHeight,
                          cellWidth * x, cellHeight * y,
                          cellWidth, cellHeight)
        }

        var drawMazeCell = function (x, y, ctx) {
            if (ctx === undefined) {
                ctx = mazeCanvas.getContext("2d");
            }

            drawGround(ctx, x, y, maze.walls[x][y]);

            if (maze.visited[x][y] !== undefined) {
                drawPoint(ctx, x, y, maze.visited[x][y], 0.5);
            }

            if (debug) {
                if (maze.forks[x][y] == 1) {
                    drawPoint(ctx, x, y, '#faa', 0.5);
                }
            }

            if (x == maze.startPoint.x && y == maze.startPoint.y) {
                drawPoint(ctx, maze.startPoint.x, maze.startPoint.y, startColor, 0.9);
            }

            if (x == maze.goalPoint.x && y == maze.goalPoint.y) {
                drawCell(ctx, maze.goalPoint.x, maze.goalPoint.y, goalColor);
            }

            for (control in players) {
                var player = players[control];
                if (x == player.x && y == player.y) {
                    drawSprite(ctx, x, y, player.sprite);
                }
            };

        }

        var drawMaze = function (ctx) {
            if (ctx === undefined) {
                ctx = mazeCanvas.getContext("2d");
            }

            for (var x=0; x<maze.width; x++) {
                for (var y=0; y<maze.height; y++) {
                    drawGround(ctx, x, y, maze.walls[x][y]);
                    if (maze.visited[x][y] !== undefined) {
                        drawPoint(ctx, x, y, maze.visited[x][y], 0.5);
                    }
                    if (debug) {
                        if (maze.forks[x][y] == 1) {
                            drawPoint(ctx, x, y, '#faa', 0.5);
                        }
                    }
                }
            }

            drawPoint(ctx, maze.startPoint.x, maze.startPoint.y, startColor, 0.9);
            drawPlayerFace(ctx, maze.startPoint.x, maze.startPoint.y, startPlayerColor);
            drawCell(ctx, maze.goalPoint.x, maze.goalPoint.y, goalColor);

            for (control in players) {
                var player = players[control];
                drawSprite(ctx, x, y, player.sprite);
            };

        };

        var drawLevelComplete = function (ctx) {
            if (ctx === undefined) {
                ctx = mazeCanvas.getContext("2d");
            }

            var centerX = cellWidth * (winner.x + 0.5);
            var centerY = cellHeight * (winner.y + 0.5);
            var radius = levelTransitionRadius;

            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
            ctx.fillStyle = winner.color;
            ctx.fill();
        }

        var drawLevelStarting = function (ctx) {
            if (ctx === undefined) {
                ctx = mazeCanvas.getContext("2d");
            }

            ctx.fillStyle = goalColor;
            var width = cellWidth * levelStartingValue;
            var height = cellHeight * levelStartingValue;
            var x;
            var y;
            if (maze.goalPoint.x == 1) {
                x = cellWidth;
            }
            else {
                x = ((maze.goalPoint.x + 1) * cellWidth) - width;
            }
            if (maze.goalPoint.y == 1) {
                y = cellHeight;
            }
            else {
                y = ((maze.goalPoint.y + 1) * cellHeight) - height;
            }
            ctx.fillRect(x, y, width, height);

            drawPoint(ctx, maze.startPoint.x, maze.startPoint.y, startColor,
                      0.9 * levelStartingValue);
        }

        var onLevelStart = function () {
            levelStatus = 'starting';

            tween = new TWEEN.Tween({t: 0});
            tween.to({t: 1}, 900);
            tween.easing(TWEEN.Easing.Quadratic.InOut);
            tween.onUpdate(function () {
                levelStartingValue = this.t;
            });
            tween.onComplete(function () {
                levelStartingValue = undefined;
                levelStatus = 'playing';
                drawMaze();
                
            });
            tween.start();
            
        }

        var generate = function (aspectRatio, size) {
            initialize(aspectRatio, size);
            
            maze.walls = createMatrix(maze.width, maze.height);
            maze.visited = createMatrix(maze.width, maze.height);
            maze.directions = createMatrix(maze.width, maze.height);
            maze.forks = createMatrix(maze.width, maze.height);

            
            var rotmaze = new ROT.Map.IceyMaze(maze.width, maze.height, 1);
            //var rotmaze = new ROT.Map.EllerMaze(maze.width, maze.height, 1);
            rotmaze.create(onCellGenerated);
            
            findDirections();
            findForks();
        };


        var onLevelComplete = function (player) {
            winner = player;
            levelStatus = 'transition';
            ended=true;
            if(presence){
                presence.sendMessage(presence.getSharedInfo().id, {
                    user: presence.getUserInfo(),
                    action: 'ended'
                });
            }
            var audio = new Audio('sounds/win'+soundType);
            audio.play();
            for (control in players) {
                players[control].stop();
            }
            
            var hypot = Math.sqrt(Math.pow(window.innerWidth, 2) +
                                Math.pow(window.innerHeight, 2));

            tween = new TWEEN.Tween({radius: 0});
            tween.to({radius: hypot}, 1200);
            tween.easing(TWEEN.Easing.Circular.Out);
            tween.onUpdate(function () {
                levelTransitionRadius = this.radius;
            });
            maze.startPoint={};
            players={};
            if((presence&&oponentEnded)||!presence){
                tween.onComplete(function () {
                    nextLevel();
                });
            }      
            tween.start();
            
            
        }

        var nextLevel = function () {
            gameSize *= 1.2;
            runLevel();
        }

        var Player = function (control) {
            this.control = control;
            this.x = maze.startPoint.x;
            this.y = maze.startPoint.y;
            if (!(control in controlColors)) {
                var hue = Math.floor(Math.random()*360);
                controlColors[control] = {
                    'normal': 'hsl(' + hue + ', 90%, 50%)',
                    'blocked': 'hsl(' + hue + ', 90%, 80%)',
                    'visited': 'hsl(' + hue + ', 30%, 80%)'
                };
                controlSprites[control] = createPlayerSprite(control);
            }
            this.color = controlColors[control].normal;
            this.sprite = controlSprites[control].normal;
            this.visitedColor = controlColors[control].visited;
            this.path = undefined;
            this.animation = undefined;
            this.blockTween = undefined;

            dirtyCells.push({'x': this.x, 'y': this.y});
        };

        var countOptions = function (x, y) {
            var dirs = maze.directions[x][y];
            return dirs.reduce(function (previousValue, currentValue) {
                return previousValue + currentValue;
            });
        };

        var isDeadEnd = function (x, y) {
            return countOptions(x, y) == 1;
        };

        var isFork = function (x, y) {
            return countOptions(x, y) > 2;
        };

        

        var initialize = function (aspectRatio, size) {
            maze.height = Math.sqrt(size / aspectRatio);
            maze.width = maze.height * aspectRatio;
            maze.height = Math.floor(maze.height);
            maze.width = Math.floor(maze.width);
    
            var maxCellX;
            var maxCellY;
            if (maze.width % 2) {
                maxCellX = maze.width-2;
            } else {
                maxCellX = maze.width-3;
            }
            if (maze.height % 2) {
                maxCellY = maze.height-2;
            } else {
                maxCellY = maze.height-3;
            }
            
            var startX;
            var goalY;
            if (Math.random() < 0.5) {
                startX = 1;
                goalX = maxCellX;
            } else {
                startX = maxCellX;
                goalX = 1;
            }
    
            var startY;
            var goalX;
            if (Math.random() < 0.5) {
                startY = 1;
                goalY = maxCellY;
            } else {
                startY = maxCellY;
                goalY = 1;
            }
            
            maze.startPoint = {'x': startX, 'y': startY};
            maze.goalPoint = {'x': goalX, 'y': goalY};
            
    
        };

        var createMatrix = function (width, height) {
            var matrix = [];
            for (var x=0; x<width; x++) {
                matrix[x] = new Array(height);
            }
    
            return matrix;
        };

        var onCellGenerated = function (x, y, value) {
            maze.walls[x][y] = value;
        };

        var findDirections = function () {
            for (var x=0; x<maze.width; x++) {
                for (var y=0; y<maze.height; y++) {
                    maze.directions[x][y] = getDirections(x, y);
                }
            }
        };

        var getDirections = function (x, y) {
            var dirs = [0, 0, 0, 0];
    
            if (maze.walls[x][y] == 1) {
                return dirs;
            }
    
            if (maze.walls[x-1][y] == 0) {
                dirs[directions.west] = 1;
            }
            if (maze.walls[x+1][y] == 0) {
                dirs[directions.east] = 1;
            }
            if (maze.walls[x][y-1] == 0) {
                dirs[directions.north] = 1;
            }
            if (maze.walls[x][y+1] == 0) {
                dirs[directions.south] = 1;
            }
    
            return dirs;
        };

        var findForks = function () {
            for (var x=0; x<maze.width; x++) {
                for (var y=0; y<maze.height; y++) {
                    if (isDeadEnd(x, y) || isFork(x, y)) {
                        maze.forks[x][y] = 1;
                    }
                }
            }
        };

        var runLevel = function () {
            generate(window.innerWidth / window.innerHeight, gameSize);
            
            updateMazeSize();
            updateSprites();
            if (presence) {
                presence.sendMessage(presence.getSharedInfo().id, {
                    user: presence.getUserInfo(),
                    action: 'start',
                    SizeOfGame: gameSize,
                    content: maze
                });
                    
            }
            ended=false;
            oponentEnded=false;
            players = {};
            winner = undefined;
            onLevelStart();
            
        }
        runLevel();

        Player.prototype.isMoving = function () {
            return (this.animation !== undefined);
        };

        Player.prototype.canGo = function (direction) {
            var dirs = maze.directions[this.x][this.y];
            var i = directions[direction];
            return dirs[i] == 1;
        };

        Player.prototype.findPath = function (direction) {

            var find = function (x, y, direction, first) {

                if (!(first) && (isDeadEnd(x,y) || isFork(x,y))) {
                    return [];
                }

                var nextCell = function (x, y, direction) {
                    var newX = x;
                    var newY = y;
                    var newDir;

                    if (direction == 'north') {
                        newY -= 1;
                    }
                    if (direction == 'east') {
                        newX += 1;
                    }
                    if (direction == 'south') {
                        newY += 1;
                    }
                    if (direction == 'west') {
                        newX -= 1;
                    }

                    var dirs = maze.directions[newX][newY];
                    var tempDirs = dirs.slice(0);
                    tempDirs[directions[directions.getOpposite(direction)]] = 0;
                    newDir = directions.orders[tempDirs.indexOf(1)];

                    return {'x': newX, 'y': newY, 'direction': newDir};
                };

                var next = nextCell(x, y, direction);
                var result = find(next.x, next.y, next.direction, false);
                result.unshift(direction);
                return result;

            };

            return find(this.x, this.y, direction, true);
        }

        Player.prototype.stop = function () {
            clearInterval(this.animation);
            this.animation = undefined;
        }

        Player.prototype.showBlocked = function () {
            var that = this;

            function restoreColor() {
                that.color = controlColors[that.control].normal;
                that.sprite = controlSprites[that.control].normal;
                dirtyCells.push({'x': that.x, 'y': that.y});
            }

            if (this.blockTween !== undefined) {
                this.blockTween.stop();
                restoreColor();
            }

            this.blockTween = new TWEEN.Tween({}).to({}, 300);

            this.color = controlColors[this.control].blocked;
            this.sprite = controlSprites[this.control].blocked;
            dirtyCells.push({'x': this.x, 'y': this.y});

            this.blockTween.onComplete(function () {
                restoreColor();
            });

            this.blockTween.start();

            var audio = new Audio('sounds/tick'+soundType);
            audio.play();
        }

        Player.prototype.move = function (direction) {
            if (this.isMoving()) {
                return
            }

            if (!(this.canGo(direction))) {
                this.showBlocked();
                return;
            }

            var that = this;

            var next = function () {
                var direction = that.path.shift();
                if (direction == undefined) {
                    that.stop();
                };

                maze.visited[that.x][that.y] = that.visitedColor;

                dirtyCells.push({'x': that.x, 'y': that.y});

                if (direction == 'north') {
                    that.y -= 1;
                }
                if (direction == 'east') {
                    that.x += 1;
                }
                if (direction == 'south') {
                    that.y += 1;
                }
                if (direction == 'west') {
                    that.x -= 1;
                }

                dirtyCells.push({'x': that.x, 'y': that.y});

                if (that.x == maze.goalPoint.x && that.y == maze.goalPoint.y) {
                    onLevelComplete(that);
                }
            }

            this.path = this.findPath(direction);
            this.animation = setInterval(next, 40);
        };

        var mazeClick = function (event) {
            if (levelStatus == 'transition') {
                return;
            }

            var currentControl = 'mouse'

            if (!(currentControl in players)) {
                players[currentControl] = new Player(currentControl);
            }

            var player = players[currentControl];

            var px = cellWidth * (player.x + 0.5);
            var py = cellHeight * (player.y + 0.5);

            var x = event.clientX;
            var y = event.clientY;

            var canvas = document.getElementById("maze");
            x -= canvas.offsetLeft;
            y -= canvas.offsetTop;

            var angle = Math.atan2(y - py, x - px) * 180 / Math.PI;

            if (45 < angle && angle < 135) {
                    player.move('south');
            } else if (-45 > angle && angle > -135) {
                    player.move('north');
            } else if (-45 < angle && angle < 45) {
                    player.move('east');
            } else {
                    player.move('west');
            }
        };

        if (mazeCanvas.addEventListener) {
            mazeCanvas.addEventListener("mousedown", mazeClick);
        } else {
            mazeCanvas.attachEvent('onclick', mazeClick);
        }

        var onKeyDown = function (event) {
            if (levelStatus == 'transition') {
                return;
            }

            var currentControl;
            var currentDirection;
            for (control in controls) {
                if (controls[control].indexOf(event.keyCode) != -1) {
                    currentControl = control;
                    currentDirection = directions.orders[controls[control].
                                                         indexOf(event.keyCode)];
                }
            }
            if (currentControl === undefined) {
                return;
            }

            if (!(currentControl in players)) {
                players[currentControl] = new Player(currentControl);
            }

            var player = players[currentControl];
            player.move(currentDirection);
        };

        document.addEventListener("keydown", onKeyDown);

        var animateGoal = function (timestamp) {
            var hue = Math.floor(120 * (1 + Math.cos(timestamp / 3000)));
            var light = Math.floor(50 + (10 * (1 + Math.cos(timestamp / 300))));
            goalColor = 'hsl(' + hue + ', 90%, ' + light + '%)';

            dirtyCells.push({'x': maze.goalPoint.x, 'y': maze.goalPoint.y});
        }

        var animate = function (timestamp) {
            TWEEN.update(timestamp);

            switch(levelStatus) {
            case 'transition':
                drawLevelComplete();
                break;

            case 'starting':
                animateGoal(timestamp);
                drawLevelStarting();
                break;

            case 'playing':
                animateGoal(timestamp);

                dirtyCells.forEach(function (cell) {
                    drawMazeCell(cell.x, cell.y);
                });
                dirtyCells = [];
                break;
            }

            requestAnimationFrame(animate);

            // HACK: Force redraw on Android
            if (/Android/i.test(navigator.userAgent) && document.location.protocol.substr(0,4) != "http") {
                mazeCanvas.style.display='none';
                mazeCanvas.offsetHeight;
                mazeCanvas.style.display='block';
            }
        };
        animate();

        // Link presence palette
        var presence = null;
        var isHost = false;
        var palette = new presencepalette.PresencePalette(document.getElementById("network-button"), undefined);
        palette.addEventListener('shared', function() {
            palette.popDown();
            console.log("Want to share");
            presence = activity.getPresenceObject(function(error, network) {
                if (error) {
                    console.log("Sharing error");
                    return;
                }
                network.createSharedActivity('org.sugarlabs.MazeWebActivity', function(groupId) {
                    console.log("Activity shared");
                    isHost = true;
                    presence.sendMessage(presence.getSharedInfo().id, {
                        user: presence.getUserInfo(),
                        action: 'connect'
                    });
                });
                network.onDataReceived(onNetworkDataReceived);
                network.onSharedActivityUserChanged(onNetworkUserChanged);
            });
        });
    });

});