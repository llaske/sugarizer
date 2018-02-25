var initialPattern = function initialPattern() {
  return new Array(30).fill(0).map(function () {
    return new Array(50).fill(0);
  });
};
var generateRandomBoardState = function generateRandomBoardState() {
  return new Array(30).fill(0).map(function () {
    var row = new Array(50).fill(0);
    return row.map(function () {
      return Math.floor(Math.random() * 2);
    });
  });
};

var glider = function glider() {
  var pattern = initialPattern();
  pattern[5][7] = 1;
  pattern[6][5] = 1;
  pattern[6][6] = 1;
  pattern[7][6] = 1;
  pattern[7][7] = 1;
  return pattern;
};

var no = function no() {
  var pattern = initialPattern();
  for (var j = 0; j < 30; j++) {
    if (!((j + 1) % 4 === 0)) {
      for (var i = 2; i < 50; i += 4) {
        pattern[j][i] = 1;
      }
    }
  }
  return pattern;
};

var patterns = [generateRandomBoardState, glider, no, initialPattern];

define(function () {
  return patterns;
});