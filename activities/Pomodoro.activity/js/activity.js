define(['sugar-web/activity/activity', 'webL10n', 'activity/progress', 'activity/stopwatch'], function (activity, l10n, Progress, Stopwatch) {

  // Manipulate the DOM only when it is ready.
  require(['domReady!'], function (doc) {

    // Initialize the activity.
    activity.setup();
    var datastore = activity.getDatastoreObject();
    activity.getXOColor(function (err, color) {
      window.addEventListener('localized', function () {
        main(Progress, Stopwatch, l10n, color, datastore);
      });
    });
  });
});

function convertReadableMS(timeInMs) {
  var parsedTime = parseMs(timeInMs);
  var timeStr = parsedTime.hours ? parsedTime.hours + parsedTime.days * 24 + ':' + parsedTime.minutes + ':' + parsedTime.seconds : parsedTime.minutes + ':' + parsedTime.seconds;
  return timeStr.split(':').map(function (num) {
    return ('' + num).padStart(2, '0');
  }).join(':');
}

var defaultWorkTimerLimit = 1;
var defaultBreakTimerLimit = 1;
function main(Progress, Stopwatch, l10n, color, datastore) {
  var _this = this;
  console.log(this)
  this.state = {
    status: 'work',
    workTimerLimit: defaultWorkTimerLimit,
    breakTimerLimit: defaultBreakTimerLimit,
    progress: 1,
    currentWorkText: convertReadableMS(defaultWorkTimerLimit * 1000 * 60),
    currentBreakText: convertReadableMS(defaultBreakTimerLimit * 1000 * 60),
    themeColor: '#FF0060',
    isButtonsDisable: false
  };
  datastore.loadAsText(function (err, metadata, data) {
    if (data) {
      _this.state = data;
    }
  });
  startWork();
  renderPomodoroText();
  renderStatusText(l10n.get(this.state.status));
  var pomodoroContainer = document.getElementById('pomodoro-container');
  this.pomodoro = new Progress(280, color.stroke, this.state.progress, pomodoroContainer);
  this.pomodoro.draw();
  renderTheme(color.stroke);
  saveInDataStore();

  function mapRange(obj, num) {
    return (num - obj.from[0]) * (obj.to[1] - obj.to[0]) / (obj.from[1] - obj.from[0]) + obj.to[0];
  }

  function parseMs(ms) {
    if (typeof ms !== 'number') {
      throw new TypeError('Expected a number');
    }

    var roundTowardZero = ms > 0 ? Math.floor : Math.ceil;

    return {
      days: roundTowardZero(ms / 86400000),
      hours: roundTowardZero(ms / 3600000) % 24,
      minutes: roundTowardZero(ms / 60000) % 60,
      seconds: roundTowardZero(ms / 1000) % 60,
      milliseconds: roundTowardZero(ms) % 1000
    };
  }

  function saveInDataStore() {
    datastore.setDataAsText({
      state: this.state
    });
    datastore.save(function (err) {
      if (err) {
        console.errror(err);
      }
    });
    setTimeout(saveInDataStore, 1000);
  }

  function convertReadableMS(timeInMs) {
    var parsedTime = parseMs(timeInMs);
    var timeStr = parsedTime.hours ? parsedTime.hours + parsedTime.days * 24 + ':' + parsedTime.minutes + ':' + parsedTime.seconds : parsedTime.minutes + ':' + parsedTime.seconds;
    return timeStr.split(':').map(function (num) {
      return ('' + num).padStart(2, '0');
    }).join(':');
  }

  this.handlePausePlay = function () {
    var playPauseButton = document.getElementById('play-button');
    if (this.state.status === 'work') {
      if (this.workTimer.state === 1) {
        //if timer is running
        this.workTimer.stop();
        enableButtons();
        playPauseButton.classList.remove('pause');
        playPauseButton.classList.add('play');
      } else {
        this.workTimer.start();
        disableButtons();
        playPauseButton.classList.remove('play');
        playPauseButton.classList.add('pause');
      }
    } else {
      if (this.breakTimer.state === 1) {
        this.breakTimer.stop();
        enableButtons();
        playPauseButton.classList.remove('pause');
        playPauseButton.classList.add('play');
      } else {
        disableButtons();
        this.breakTimer.start();
        playPauseButton.classList.remove('play');
        playPauseButton.classList.add('pause');
      }
    }
  };

  function startWork() {
    var _this2 = this;

    var timerInMS = this.state.workTimerLimit * 60 * 1000;
    this.workTimer = new Stopwatch(timerInMS);
    this.state.status = 'work';
    this.workTimer.onTime(function (time) {
      var progress = mapRange({
        from: [timerInMS, 0],
        to: [1, 0]
      }, time.ms);
      setProgress(progress, convertReadableMS(time.ms));
    });
    this.workTimer.onDone(function () {
      renderTheme(color.fill);
      setTimeout(function () {
        renderStatusText(l10n.get('break'));
        startBreak();
        _this2.breakTimer.start();
      }, 1000);
    });
  }

  function startBreak() {
    var _this3 = this;

    var timerInMS = this.state.breakTimerLimit * 60 * 1000;
    this.breakTimer = new Stopwatch(timerInMS);
    this.state.status = 'break';
    this.breakTimer.onTime(function (time) {
      var progress = mapRange({
        from: [timerInMS, 0],
        to: [1, 0]
      }, time.ms);
      setProgress(progress, convertReadableMS(time.ms));
    });
    this.breakTimer.onDone(function () {
      renderTheme(color.stroke);
      renderStatusText(l10n.get('work'));
      setTimeout(function () {
        startWork();
        _this3.workTimer.start();
      }, 1000);
    });
  }

  function renderStatusText(text) {
    document.querySelector('.status').innerText = text;
  }

  function setProgress(progress, currentTimerText) {
    this.state.progress = progress;
    if (this.state.status === 'work') {
      this.state.currentWorkText = currentTimerText;
    } else {
      this.state.currentBreakText = currentTimerText;
    }
    renderPomodoro();
    renderPomodoroText();
  }

  function renderPomodoro() {
    this.pomodoro.update(this.state.progress);
  }

  function renderPomodoroText() {
    var timerTextElem = document.querySelector('.info-circle span');
    if (this.state.status === 'work') {
      timerTextElem.innerText = this.state.currentWorkText;
    } else {
      timerTextElem.innerText = this.state.currentBreakText;
    }
  }

  function renderTheme(themeColor) {
    this.state.themeColor = themeColor;
    document.querySelector('.info-circle').style.backgroundColor = themeColor;
    document.querySelector('.base-circle').style.backgroundColor = themeColor + '2b';
    this.pomodoro.updateColor(themeColor, this.state.progress);
    renderButtons();
  }

  function renderButtons() {
    var _this4 = this;

    document.querySelectorAll('.button').forEach(function (elem) {
      elem.style.background = _this4.state.themeColor;
    });

    document.querySelectorAll('.button-label, .button-time').forEach(function (elem) {
      elem.style.color = _this4.state.themeColor;
    });
  }

  function disableButtons() {
    this.state.isButtonsDisable = true;
    document.querySelectorAll('.button, .button-time, .button-label').forEach(function (elem) {
      elem.classList.add('disable');
    });
  }
  function enableButtons() {
    this.state.isButtonsDisable = false;
    document.querySelectorAll('.button, .button-time, .button-label').forEach(function (elem) {
      elem.classList.remove('disable');
    });
  }

  function updateWorkPomodoro() {
    this.state.currentWorkText = convertReadableMS(this.state.workTimerLimit * 60 * 1000);
    document.querySelector('.button-time.work').innerText = this.state.workTimerLimit;
    this.pomodoro.update(1);
    renderPomodoroText();
    if (this.state.status === 'work') {
      startWork();
    }
  }

  function updateBreakPomodoro() {
    this.state.currentBreakText = convertReadableMS(this.state.breakTimerLimit * 60 * 1000);
    document.querySelector('.button-time.break').innerText = this.state.breakTimerLimit;
    renderPomodoroText();
    if (this.state.status === 'break') {
      startBreak();
    }
  }

  this.handleWorkPlusClick = function () {
    if (!this.state.isButtonsDisable) {
      this.state.workTimerLimit = this.state.workTimerLimit + 1;
      updateWorkPomodoro();
    }
  };

  this.handleWorkMinusClick = function () {
    if (!this.state.isButtonsDisable && this.state.workTimerLimit > 1) {
      this.state.workTimerLimit = this.state.workTimerLimit - 1;
      updateWorkPomodoro();
    }
  };

  this.handleBreakPlusClick = function () {
    if (!this.state.isButtonsDisable) {
      this.state.breakTimerLimit = this.state.breakTimerLimit + 1;
      updateBreakPomodoro();
    }
  };

  this.handleBreakMinusClick = function () {
    if (!this.state.isButtonsDisable) {
      this.state.breakTimerLimit = this.state.breakTimerLimit - 1;
      updateBreakPomodoro();
    }
  };

  function initTimerText() {
    document.querySelector('.button-time.work').innerText = this.state.workTimerLimit;
    document.querySelector('.button-time.break').innerText = this.state.breakTimerLimit;
  }

  initTimerText();
  document.querySelector('.plus-button.work').addEventListener('click', handleWorkPlusClick.bind(this));
  document.querySelector('.minus-button.work').addEventListener('click', handleWorkMinusClick.bind(this));
  document.querySelector('.plus-button.break').addEventListener('click', handleBreakPlusClick.bind(this));
  document.querySelector('.minus-button.break').addEventListener('click', handleBreakMinusClick.bind(this));
  document.querySelector('#play-button').addEventListener('click', function () {
    _this.handlePausePlay();
  });
  document.querySelector('#replay-button').addEventListener('click', function () {
    var shouldPlay = _this.breakTimer ? _this.workTimer.state === 1 || _this.breakTimer.state === 1 : _this.workTimer.state === 1;
    if (_this.state.status === 'break') {
      _this.breakTimer.stop();
      renderTheme(color.stroke);
      renderStatusText(l10n.get('work'));
      startWork();
      if (shouldPlay) {
        _this.workTimer.start();
      }
    }
    if (shouldPlay) {
      _this.handlePausePlay();
      updateWorkPomodoro();
      _this.handlePausePlay();
    } else {
      updateBreakPomodoro();
    }
  });
}