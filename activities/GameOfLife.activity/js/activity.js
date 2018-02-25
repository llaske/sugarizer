define(['sugar-web/activity/activity', "webL10n", 'activity/Board', 'activity/vanilla-state', 'activity/patterns', 'activity/shadeColor'], function (activity, l10n, Board, State, patterns, shadeColor) {
  require(['domReady!'], function (doc) {
    activity.setup();
    window.addEventListener('localized', function () {
      activity.getXOColor(function (err, color) {
        var dataStore = activity.getDatastoreObject();
        main(Board, State, patterns, color, shadeColor, l10n, dataStore);
      });
    });
  });
});

function main(Board, State, patterns, color, shadeColor, l10n, dataStore) {
  var state = new State({
    boardState: [],
    generation: 0,
    playPauseIcon: 'play',
    shouldPlay: false
  });
  var randomPattern = patterns[0],
      gliderPattern = patterns[1],
      noPattern = patterns[2],
      blankPattern = patterns[3];

  var target = document.querySelector('.main canvas');
  var board = new Board(state.state.boardState, color.fill, '#FBF6F5', shadeColor(color.stroke, 10), color.stroke, 12, 12, 2, 2, target);
  document.querySelector('.generation-count').style.color = color.fill;
  document.querySelector('.generation-status').style.color = color.fill;
  document.querySelector('.generation-status').innerText = l10n.get('Generation');

  board.draw();

  var storeLocally = function storeLocally(state) {
    dataStore.setDataAsText({
      boardState: state.boardState,
      generation: state.generation
    });
    console.log('writing');
    dataStore.save(function (err) {
      if (err) {
        console.log('writing failed.');
        console.error(err);
      } else {
        console.log('writing saved.');
      }
    });
  };

  var generateGeneration = function generateGeneration() {
    if (state.state.shouldPlay) {
      var nextGenerationBoard = state.state.boardState.map(function (row, y) {
        return row.map(function (cell, x) {
          return transformCellByRule(cell, findNeighbours(x, y));
        });
      });
      state.set(function (prev) {
        return {
          boardState: nextGenerationBoard,
          generation: prev.generation + 1
        };
      });
      setTimeout(generateGeneration, 100);
    } else {
      return 0;
    }
  };

  var transformCellByRule = function transformCellByRule(cell, neighbours) {
    var cellIsAlive = cell === 1 || cell === 2;
    var aliveInNeighbour = neighbours.filter(function (cell) {
      return cell === 1 || cell === 2;
    });
    var numOfAliveNeighbours = aliveInNeighbour.length;
    if (cellIsAlive) {
      if (numOfAliveNeighbours < 2) {
        return 0;
      } else if (numOfAliveNeighbours === 2 || numOfAliveNeighbours === 3) {
        return 1;
      } else {
        return 0;
      }
    } else {
      if (numOfAliveNeighbours === 3) {
        return 2;
      } else {
        return 0;
      }
    }
  };

  var findNeighbours = function findNeighbours(x, y) {
    var leftX = x - 1 === -1 ? 49 : x - 1;
    var rightX = x + 1 === 50 ? 0 : x + 1;
    var topY = y - 1 === -1 ? 29 : y - 1;
    var bottomY = y + 1 === 30 ? 0 : y + 1;
    var boardState = state.state.boardState;

    var left = boardState[y][leftX];
    var right = boardState[y][rightX];
    var top = boardState[topY][x];
    var bottom = boardState[bottomY][x];
    var leftTop = boardState[topY][leftX];
    var leftBottom = boardState[bottomY][leftX];
    var rightTop = boardState[topY][rightX];
    var rightBottom = boardState[bottomY][rightX];

    return [left, right, top, bottom, leftTop, leftBottom, rightTop, rightBottom];
  };

  state.subscribe({
    boardState: ['.fake-selector', function (fakeElem, value, prevValue) {
      board.update(value);
    }],

    generation: ['.generation-count', 'innerText'],

    playPauseIcon: ['#play-pause', function (elem, value, prevValue) {
      elem.className = value + ' toolbutton';
    }],

    shouldPlay: ['.fake-selector', function (fakeElem, value, prevValue) {
      if (value) {
        generateGeneration();
      }
    }]
  });

  dataStore.loadAsText(function (err, metadata, data) {
    var boardState = data ? data.boardState : randomPattern();
    var generation =  data ? data.generation : 0;
    state.set({
      boardState: boardState,
      generation: parseInt(generation)
    });
  });

  board.onClick(function (cellX, cellY) {
    state.set(function (prev) {
      var newState = [].concat(prev.boardState);
      var clickedCell = newState[cellY][cellX]
      if (clickedCell === 1 || clickedCell === 2) {
        newState[cellY][cellX] = 0;
      } else {
        newState[cellY][cellX] = 2;
      }
      return {
        boardState: newState
      };
    });
  });

  document.querySelector('#play-pause').addEventListener('click', function () {
    state.set(function (prev) {
      var iconToSet = prev.playPauseIcon === 'play' ? 'pause' : 'play';
      var togglePlay = prev.shouldPlay === true ? false : true;
      if (prev.shouldPlay) {
        storeLocally({
          boardState: state.state.boardState,
          generation: state.state.generation
        });
      }
      return {
        playPauseIcon: iconToSet,
        shouldPlay: togglePlay
      };
    });
  });

  document.querySelector('#stop-button').addEventListener('click', function() {
    storeLocally({
      boardState: state.state.boardState,
      generation: state.state.generation
    });
  })

  document.querySelector('#random').addEventListener('click', function () {
    state.set({
      boardState: randomPattern(),
      generation: 0
    });
  });
  document.querySelector('#glider').addEventListener('click', function () {
    state.set({
      boardState: glider(),
      generation: 0
    });
  });
  document.querySelector('#no').addEventListener('click', function () {
    state.set({
      boardState: no(),
      generation: 0
    });
  });
  document.querySelector('#clear').addEventListener('click', function () {
    state.set({
      boardState: blankPattern(),
      generation: 0,
      playPauseIcon: 'play',
      shouldPlay: false
    });
  });

  window.addEventListener('resize', function (e) {
    board.handleResize(window.innerWidth, state.state.boardState);
  });
  board.handleResize(window.innerWidth, state.state.boardState);
}