// const Canvas =  styled.canvas`
//   position: absolute;
//   transform: rotate(-90deg) rotateX(180deg);
//   top: 0px;
//   left: 0px;
// `
define (function() {
  function Progress(size, color, progress, target) {
    this.size = size
    this.color = color
    this.progress = progress
    this.target = target

    this.draw = function() {
      target.innerHTML = '<canvas id="progressCircle"></canvas>'
      this.canvas = document.getElementById('progressCircle')
      this.canvas.width = this.size
      this.canvas.height = this.size
      this.ctx = this.canvas.getContext('2d')
      this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      this.ctx.beginPath()
      this.ctx.arc(
        this.canvas.width / 2,
        this.canvas.height / 2,
        this.size / 4,
        0,
        Math.PI*2*this.progress,
        false
      )
      this.ctx.lineWidth = this.size / 2
      this.ctx.strokeStyle = this.color
      this.ctx.stroke()
    }

    this.update = function(progress) {
      this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      this.ctx.beginPath()
      this.ctx.arc(
        this.canvas.width / 2,
        this.canvas.height / 2,
        this.size / 4,
        0,
        Math.PI*2*progress,
        false
      )
      this.ctx.lineWidth = this.size / 2
      this.ctx.strokeStyle = this.color
      this.ctx.stroke()
    }

    this.handleResize = function(size) {

    }
  }
  return Progress
})
