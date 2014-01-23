define(function (require) {
    var ROT = require("rot");

    var directions = require("activity/directions");

    var maze = {};

    maze.width = undefined;
    maze.height = undefined;
    maze.startPoint = {};
    maze.goalPoint = {};

    maze.walls = [];
    maze.visited = [];
    maze.directions = [];
    maze.forks = [];

    var countOptions = function (x, y) {
        var dirs = maze.directions[x][y];
        return dirs.reduce(function (previousValue, currentValue) {
            return previousValue + currentValue;
        });
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

    var findDirections = function () {
        for (var x=0; x<maze.width; x++) {
            for (var y=0; y<maze.height; y++) {
                maze.directions[x][y] = getDirections(x, y);
            }
        }
    };

    maze.isDeadEnd = function (x, y) {
        return countOptions(x, y) == 1;
    };

    maze.isFork = function (x, y) {
        return countOptions(x, y) > 2;
    };

    var findForks = function () {
        for (var x=0; x<maze.width; x++) {
            for (var y=0; y<maze.height; y++) {
                if (maze.isDeadEnd(x, y) || maze.isFork(x, y)) {
                    maze.forks[x][y] = 1;
                }
            }
        }
    };

    var onCellGenerated = function (x, y, value) {
        maze.walls[x][y] = value;
    };

    var createMatrix = function (width, height) {
        var matrix = [];
        for (var x=0; x<width; x++) {
            matrix[x] = new Array(height);
        }

        return matrix;
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

    maze.generate = function (aspectRatio, size) {
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

    return maze;

});
