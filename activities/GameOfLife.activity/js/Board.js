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

  this.onClick = function(clickHandler) {
    canvas.addEventListener('click', (e) => {
      console.log(e.clientX, e.clientY)
      const x = e.clientX - canvas.getBoundingClientRect().left
      const y = e.clientY - canvas.getBoundingClientRect().top
      const cellX = Math.floor(x / (this.cellWidth + 2))
      const cellY = Math.floor(y / (this.cellHeight + 2))
      clickHandler(cellX, cellY)
    })
  }

  this.draw = function() {
    canvasWidth = (cellWidth + rowPadding) * 50 - 2
    canvasHeight = (cellHeight + colPadding) * 30 - 2
    canvas.width = canvasWidth
    canvas.height = canvasHeight
    console.log(canvas.width, canvas.height)
    canvas.style.background =  lineColor
    canvas.style.boxShadow = '5px 5px 25px 0px rgba(46, 61, 73, 0.2)'
    this.ctx = canvas.getContext('2d')
    this.cellWidth = cellWidth
    this.cellHeight = cellHeight
    this.update(boardState)
  }


  this.update = function(state) {
    const cellColorFromState = [deadCellColor, aliveOldCellColor, aliveYoungCellColor]
    state.forEach((row, rowIndex) => {
      const y = (this.cellHeight + colPadding) * rowIndex
      row.forEach((cell, cellIndex) => {
        const x = (this.cellWidth + rowPadding) * cellIndex
        this.ctx.fillStyle = cellColorFromState[cell]
        this.ctx.fillRect(x, y, this.cellWidth, this.cellHeight)
      })
    })
  }

  this.handleResize = function(windowWidth, state) {
    const scale = windowWidth / canvasWidth
    if (scale < 1) {
      canvas.width = canvasWidth * (scale - 0.1)
      canvas.height = canvasHeight * (scale - 0.1)
      this.cellWidth = (canvas.width - (2 * 50)) / 50
      this.cellHeight = (canvas.height - (2 * 30)) / 30
      console.log(canvas.width, this.cellWidth)
      this.update(state)
    } else {
      canvas.width = canvasWidth
      canvas.height = canvasHeight
      this.cellWidth = cellWidth
      this.cellHeight = cellHeight
      this.update(state)
    }
  }
}

define(() => Board)