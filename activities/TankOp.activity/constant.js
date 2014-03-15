

// Constants 
var constant = {};

// Board size
constant.boardWidth = 15;
constant.boardHeight = 9;
constant.tileSize = 64;
constant.areaWidth = constant.boardWidth*constant.tileSize;
constant.areaHeight = constant.boardHeight*constant.tileSize;
constant.pubHeight = 100;
constant.fireZoneWidth = 100;
constant.fireZoneHeight = 100;

// Tile type
constant.tileEmpty = 0;
constant.tileTrees = 1;
constant.tileMountain = 2;
constant.tileWater = 3;

// Unit power - number of step before dead
constant.powerHq = 2;
constant.powerSoldier = 1;
constant.powerTank = 2;
constant.powerCanon = 3;
constant.powerHelo = 2;

// User power
constant.userPower = 10;

// Timer count
constant.loopInterval = 500;
constant.explosionInterval = 50;

// End size image
constant.endGameWidth = 480;
constant.endGameHeight = 320;

// Units arrival
constant.startArrival = 5;
constant.waveInitSize = 2;

