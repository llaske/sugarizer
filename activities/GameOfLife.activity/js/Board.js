function Board(boardState, lineColor, deadCellColor, trailsColor , aliveYoungCellColor, aliveOldCellColor, cellWidth, cellHeight, rowPadding, colPadding, canvas) {

  this.showTrails = false;
  this.nowY = -1;
  this.nowX = -1;

  this.onClick = function (clickHandler) {
    var _this = this;
    var isMouseDown = false;
    var isMouseMove = false;

    // Function to handle drag event
    function dragEvent(e) {
        if (isMouseDown) {
            isMouseMove = true;
            var x, y;
            if (e.type === 'mousemove') {
                x = e.clientX - canvas.getBoundingClientRect().left;
                y = e.clientY - canvas.getBoundingClientRect().top;
            } else if (e.type === 'touchmove') {
                x = e.touches[0].clientX - canvas.getBoundingClientRect().left;
                y = e.touches[0].clientY - canvas.getBoundingClientRect().top;
            }
            var cellX = Math.floor(x / (_this.cellWidth + 2));
            var cellY = Math.floor(y / (_this.cellHeight + 2));
            if (_this.nowX !== cellX || _this.nowY !== cellY) {
                clickHandler(cellX, cellY);
            }
            _this.nowX = cellX;
            _this.nowY = cellY;
        }
    }

    canvas.addEventListener('mousedown', function () {
        isMouseDown = true;
    });

    canvas.addEventListener('touchstart', function () {
        isMouseDown = true;
    });

    canvas.addEventListener('mouseup', function () {
        isMouseDown = false;
        _this.nowX = -1;
            _this.nowY = -1
    });

    canvas.addEventListener('touchend', function () {
        isMouseDown = false;
        _this.nowX = -1;
            _this.nowY = -1
    });

    canvas.addEventListener('mousemove', dragEvent);

    canvas.addEventListener('touchmove', dragEvent);

    canvas.addEventListener('click', function (e) {
      if(isMouseMove) {
        isMouseMove = false; return;
      }
      var x = e.clientX - canvas.getBoundingClientRect().left;
      var y = e.clientY - canvas.getBoundingClientRect().top;
      var cellX = Math.floor(x / (_this.cellWidth + 2));
      var cellY = Math.floor(y / (_this.cellHeight + 2));
      clickHandler(cellX, cellY);
  });
  };

  this.draw = function (state) {
    canvasWidth = 1000;
    canvasHeight = 500;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.style.background = lineColor;
    canvas.style.boxShadow = '5px 5px 25px 0px rgba(46, 61, 73, 0.2)';
    this.ctx = canvas.getContext('2d');
    this.cellWidth = (canvas.width - 2 * state.state.gridCols) / state.state.gridCols;
    this.cellHeight = (canvas.height - 2 * state.state.gridRows) / state.state.gridRows;
    this.update(boardState);
  };

  this.update = function (state) {
    var _this2 = this;

    var cellColorFromState = [deadCellColor, aliveOldCellColor, aliveYoungCellColor,trailsColor];
    state.forEach(function (row, rowIndex) {
      var y = (_this2.cellHeight + colPadding) * rowIndex;
      row.forEach(function (cell, cellIndex) {
        var x = (_this2.cellWidth + rowPadding) * cellIndex;
        if (cell == 3) {
          if (_this2.showTrails) {
            _this2.ctx.fillStyle = cellColorFromState[cell];
          }
          else{
            _this2.ctx.fillStyle = cellColorFromState[0];
          }
        }else {
          _this2.ctx.fillStyle = cellColorFromState[cell];
        }

        _this2.ctx.fillRect(x, y, _this2.cellWidth, _this2.cellHeight);
      });
    });
  };

  this.handleResize = function (windowWidth, _state, state) {
    var scale = windowWidth / canvasWidth;
    if (scale < 1) {
      canvas.width = canvasWidth * (scale - 0.1);
      canvas.height = canvasHeight * (scale - 0.1);
    } else {
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
    }
    this.cellWidth = (canvas.width - 2 * state.state.gridCols) / state.state.gridCols;
    this.cellHeight = (canvas.height - 2 * state.state.gridRows) / state.state.gridRows;
    this.update(_state);
  };
}

define(function () {
  return Board;
});
