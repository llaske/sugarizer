function Board(
  boardState,
  lineColor,
  deadCellColor,
  aliveYoungCellColor,
  aliveOldCellColor,
  cellWidth,
  cellHeight,
  rowPadding,
  colPadding,
  canvas
) {

  this.draw = function() {
    canvas.width = (cellWidth + rowPadding) * 50 - 2
    canvas.height = (cellHeight + colPadding) * 30 - 2
    canvas.style.background =  lineColor
    canvas.style.boxShadow = '5px 5px 25px 0px rgba(46, 61, 73, 0.2)'
    this.ctx = canvas.getContext('2d')
    this.update(boardState)
  }

  this.update = function(state) {
    const cellColorFromState = [deadCellColor, aliveOldCellColor, aliveYoungCellColor]
    state.forEach((row, rowIndex) => {
      const y = (cellHeight + colPadding) * rowIndex
      row.forEach((cell, cellIndex) => {
        const x = (cellWidth + rowPadding) * cellIndex
        this.ctx.fillStyle = cellColorFromState[cell]
        this.ctx.fillRect(x, y, cellWidth, cellHeight)
      })
    })
  }
}

define(() => Board)