define(["sugar-web/activity/activity","tween","rAF","activity/maze","activity/directions"], function (activity, TWEEN, rAF, maze, directions) {

    require(['domReady!'], function (doc) {
        activity.setup();

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

        var runLevel = function () {
            maze.generate(window.innerWidth / window.innerHeight, gameSize);
            updateMazeSize();
            updateSprites();
            players = {};
            winner = undefined;
            onLevelStart();
        }
        runLevel();

        var onLevelComplete = function (player) {
            winner = player;
            levelStatus = 'transition';

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
            tween.onComplete(function () {
                nextLevel();
            });
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

                if (!(first) && (maze.isDeadEnd(x, y) || maze.isFork(x, y))) {
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

    });

});
