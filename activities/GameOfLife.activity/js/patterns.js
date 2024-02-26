var initialPattern = function initialPattern(state) {
  return new Array(state.state.gridRows).fill(0).map(function () {
    return new Array(state.state.gridCols).fill(0);
  });
};
var generateRandomBoardState = function generateRandomBoardState(state) {
  return new Array(state.state.gridRows).fill(0).map(function () {
    var row = new Array(state.state.gridCols).fill(0);
    return row.map(function () {
      return Math.floor(Math.random() * 2);
    });
  });
};

var glider = function glider(state) {
  var pattern = initialPattern(state);
  pattern[5][7] = 1;
  pattern[6][5] = 1;
  pattern[6][6] = 1;
  pattern[7][6] = 1;
  pattern[7][7] = 1;
  return pattern;
};

var no = function no(state) {
  var pattern = initialPattern(state);
  for (var j = 0; j < state.state.gridRows; j++) {
    if (!((j + 1) % 4 === 0)) {
      for (var i = 2; i < state.state.gridCols; i += 4) {
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
