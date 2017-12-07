define(['sugar-web/activity/activity', 'activity/progress', 'activity/stopwatch'], function (activity, Progress, stopwatch) {

  // Manipulate the DOM only when it is ready.
  require(['domReady!'], function (doc) {

    // Initialize the activity.
    activity.setup()
    main(activity, Progress, stopwatch)
  })
})

function main(activity, progress, stopwatch) {
  handlePausePlay()

  function mapRange(obj, num) {
    return (((num - obj.from[0]) * (obj.to[1] - obj.to[0])) / (obj.from[1] - obj.from[0])) + obj.to[0]
  }

  function parseMs(ms) {
    if (typeof ms !== 'number') {
      throw new TypeError('Expected a number')
    }

    var roundTowardZero = ms > 0 ? Math.floor : Math.ceil

    return {
      days: roundTowardZero(ms / 86400000),
      hours: roundTowardZero(ms / 3600000) % 24,
      minutes: roundTowardZero(ms / 60000) % 60,
      seconds: roundTowardZero(ms / 1000) % 60,
      milliseconds: roundTowardZero(ms) % 1000
    }
  }

  function convertReadableMS(timeInMs) {
    var parsedTime = parseMs(timeInMs)
    var timeStr = parsedTime.hours
      ? `${parsedTime.hours + parsedTime.days * 24}:${parsedTime.minutes}:${parsedTime.seconds}`
      : `${parsedTime.minutes}:${parsedTime.seconds}`
    return timeStr
      .split(':')
      .map((num) => `${num}`.padStart(2, '0'))
      .join(':')
  }

  function handlePausePlay() {
    var playPauseButton = document.getElementById('play-button')

    playPauseButton.addEventListener('click', function() {
      if (playPauseButton.classList.contains('play')) {
        playPauseButton.classList.remove('play')
        playPauseButton.classList.add('pause')
      } else {
        playPauseButton.classList.remove('pause')
        playPauseButton.classList.add('play')
      }
    })
  }

  function startWork() {

  }

  function startBreak() {

  }

  function stopPomodoro() {

  }

}
