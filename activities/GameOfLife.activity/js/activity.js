define(['sugar-web/activity/activity', "webL10n", 'activity/Board', 'activity/vanilla-state', 'activity/patterns', 'activity/shadeColor','sugar-web/env', 'genSpeedPalette','gridSizePalette'], function (activity, l10n, Board, State, patterns, shadeColor, env, genSpeedPalette, gridSizePalette) {
  requirejs(['domReady!'], function (doc) {
    activity.setup();
	env.getEnvironment(function(err, environment) {
		var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language;
		var language = environment.user ? environment.user.language : defaultLanguage;
		l10n.language.code = language;
		window.addEventListener('localized', function () {
          document.querySelector('.generation-status').innerText = l10n.get('Generation');
          document.querySelector('#speedlabel').innerText = l10n.get('speed');
          document.querySelector('#sizelabel').innerText = l10n.get('size');
	    });
        activity.getXOColor(function (err, color) {
          var dataStore = activity.getDatastoreObject();
          main(Board, State, patterns, color, shadeColor, l10n, dataStore, genSpeedPalette, gridSizePalette);
        });
	});
  });
});

function main(Board, State, patterns, color, shadeColor, l10n, dataStore, genSpeedPalette, gridSizePalette) {
  var state = new State({
    boardState: [],
    generation: 0,
    playPauseIcon: 'play',
    shouldPlay: false,
    generationTimeInterval: 235,
    gridCols: 40,
    gridRows: 20
  });
  var randomPattern = patterns[0],
      gliderPattern = patterns[1],
      noPattern = patterns[2],
      blankPattern = patterns[3];

  var target = document.querySelector('.main canvas');
  var board = new Board(state.state.boardState, color.fill, '#FBF6F5', shadeColor(color.stroke, 10), color.stroke, 12, 12, 2, 2, target);

  var genSpeedButton = document.getElementById("speed-button");
  var genSpeedButtonPallete = new genSpeedPalette.ActivityPalette(
        genSpeedButton, state);

  var gridSizeButton = document.getElementById("size-button");
  var gridSizePallete = new gridSizePalette.ActivityPalette(
              gridSizeButton, state, board);

  document.querySelector('.generation-count').style.color = color.fill;
  document.querySelector('.generation-status').style.color = color.fill;

  board.draw(state);

  var storeLocally = function storeLocally(state) {
    dataStore.setDataAsText({
      boardState: state.boardState,
      generation: state.generation,
      gridCols : state.gridCols,
      gridRows : state.gridRows
    });
    console.log(state);
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
      setTimeout(generateGeneration, state.state.generationTimeInterval);
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
    var leftX = x - 1 === -1 ? state.state.gridCols -1 : x - 1;
    var rightX = x + 1 === state.state.gridCols ? 0 : x + 1;
    var topY = y - 1 === -1 ? state.state.gridRows -1: y - 1;
    var bottomY = y + 1 === state.state.gridRows ? 0 : y + 1;
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
    }],

    gridCols: ['.fake-selector', function (fakeElem, value, prevValue) {
      let sizeScale = document.getElementById('sizevalue');
      sizeScale.value = value / 20;
      board.handleResize(window.innerWidth, state.state.boardState, state);
    }],

    gridRows: ['.fake-selector', function (fakeElem, value, prevValue) {
      let sizeScale = document.getElementById('sizevalue');
      sizeScale.value = value / 10;
      board.handleResize(window.innerWidth, state.state.boardState, state);
    }]
  });

  dataStore.loadAsText(function (err, metadata, data) {
    var boardState = data ? data.boardState : randomPattern(state);
    var generation =  data ? data.generation : 0;
    let gridCols =  data ? data.gridCols : 40;
    let gridRows =  data ? data.gridRows : 20;
    console.log(data);
    console.log(gridCols);
    state.set({
      boardState: boardState,
      generation: parseInt(generation),
      gridCols : parseInt(gridCols),
      gridRows : parseInt(gridRows)
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
          generation: state.state.generation,
          gridCols : state.state.gridCols,
          gridRows : state.state.gridRows
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
      generation: state.state.generation,
      gridCols : state.state.gridCols,
      gridRows : state.state.gridRows
    });
  })

  // Full screen
  document.getElementById("fullscreen-button").addEventListener('click', function() {
    document.getElementById("main-toolbar").style.opacity = 0;
    document.getElementById("canvas").style.top = "0px";
    document.getElementById("unfullscreen-button").style.visibility = "visible";
    //board.handleResize(window.innerWidth, state.state.boardState,state);
  });
  document.getElementById("unfullscreen-button").addEventListener('click', function() {
    document.getElementById("main-toolbar").style.opacity = 1;
    document.getElementById("canvas").style.top = "55px";
    document.getElementById("unfullscreen-button").style.visibility = "hidden";
    //board.handleResize(window.innerWidth, state.state.boardState,state);
  });

  document.querySelector('#random').addEventListener('click', function () {
    state.set({
      boardState: randomPattern(state),
      generation: 0
    });
  });
  document.querySelector('#glider').addEventListener('click', function () {
    state.set({
      boardState: gliderPattern(state),
      generation: 0
    });
  });
  document.querySelector('#no').addEventListener('click', function () {
    state.set({
      boardState: noPattern(state),
      generation: 0
    });
  });
  document.querySelector('#clear').addEventListener('click', function () {
    state.set({
      boardState: blankPattern(state),
      generation: 0,
      playPauseIcon: 'play',
      shouldPlay: false
    });
  });

  window.addEventListener('resize', function (e) {
    board.handleResize(window.innerWidth, state.state.boardState,state);
  });
  board.handleResize(window.innerWidth, state.state.boardState,state);
}
