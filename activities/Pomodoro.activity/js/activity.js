define(['sugar-web/activity/activity', 'activity/progress', 'activity/stopwatch'], function (activity, Progress, stopwatch) {

  // Manipulate the DOM only when it is ready.
  require(['domReady!'], function (doc) {

    // Initialize the activity.
    activity.setup();
    var pomodoroContainer = document.getElementById('pomodoro-container')
    console.log(stopwatch)
    var pomodoro = new Progress(50, '#444', 1, pomodoroContainer)
    pomodoro.draw()
    pomodoro.update(0.9)

    var playPauseButton = document.getElementById('play-button')
    playPauseButton.addEventListener('click', function() {
      if (playPauseButton.classList.contains('play')) {
        handlePomodoroPause()
      } else {
        handlePomodoroPlay()
      }
    })

  });
});

function handlePomodoroPlay() {
  var playPauseButton = document.getElementById('play-button')
  playPauseButton.classList.remove('pause')
  playPauseButton.classList.add('play')
}

function handlePomodoroPause() {
  var playPauseButton = document.getElementById('play-button')
  playPauseButton.classList.remove('play')
  playPauseButton.classList.add('pause')
}
