function Board(boardState, lineColor, deadCellColor, aliveYoungCellColor, aliveOldCellColor, cellWidth, cellHeight, rowPadding, colPadding, canvas) {

  this.onClick = function (clickHandler) {
    var _this = this;

    canvas.addEventListener('click', function (e) {
      var x = e.clientX - canvas.getBoundingClientRect().left;
      var y = e.clientY - canvas.getBoundingClientRect().top;
      var cellX = Math.floor(x / (_this.cellWidth + 2));
      var cellY = Math.floor(y / (_this.cellHeight + 2));
      clickHandler(cellX, cellY);
    });
  };

  this.draw = function () {
    canvasWidth = (cellWidth + rowPadding) * 50 - 2;
    canvasHeight = (cellHeight + colPadding) * 30 - 2;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.style.background = lineColor;
    canvas.style.boxShadow = '5px 5px 25px 0px rgba(46, 61, 73, 0.2)';
    this.ctx = canvas.getContext('2d');
    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;
    this.update(boardState);
  };

  this.update = function (state) {
    var _this2 = this;

    var cellColorFromState = [deadCellColor, aliveOldCellColor, aliveYoungCellColor];
    state.forEach(function (row, rowIndex) {
      var y = (_this2.cellHeight + colPadding) * rowIndex;
      row.forEach(function (cell, cellIndex) {
        var x = (_this2.cellWidth + rowPadding) * cellIndex;
        _this2.ctx.fillStyle = cellColorFromState[cell];
        _this2.ctx.fillRect(x, y, _this2.cellWidth, _this2.cellHeight);
      });
    });
  };

  this.handleResize = function (windowWidth, state) {
    var scale = windowWidth / canvasWidth;
    if (scale < 1) {
      canvas.width = canvasWidth * (scale - 0.1);
      canvas.height = canvasHeight * (scale - 0.1);
      this.cellWidth = (canvas.width - 2 * 50) / 50;
      this.cellHeight = (canvas.height - 2 * 30) / 30;
      this.update(state);
    } else {
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      this.cellWidth = cellWidth;
      this.cellHeight = cellHeight;
      this.update(state);
    }
  };
}

define(function () {
  return Board;
});