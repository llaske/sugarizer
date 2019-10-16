define(['events'], function(EventEmitter) {
  EventEmitter = EventEmitter.EventEmitter

  function Stopwatch(countDownMS, options) {

      STATUS = {
        STOPPED: 0,
        RUNNING: 1,
        COMPLETE: 2,
      }

      this.stoptime = 0
      this.refTime = 0

      this.tickTimer = 0

      this.almostDoneFired = false
      this.doneFired = false

      this.countDownMS = countDownMS || false
      this.ms = this.countDownMS || 0
      this._elapsedMS = 0
      this.state = STATUS.STOPPED



      if(!options) {options = {}}
      this.refreshRateMS = options.refreshRateMS || 50
      this.almostDoneMS = options.almostDoneMS || 10000



      this.reset(countDownMS)

      return this
    }




    Stopwatch.prototype = {

      start: function() {
        if (this.tickTimer) {
                clearInterval(this.tickTimer)
            }
            this.state = STATUS.RUNNING

            this.refTime = new Date().getTime()
            this.refTime -= this._elapsedMS
            var self = this
            this.tickTimer = setInterval(function(){self._updateTime()}, this.refreshRateMS)
            this._updateTime(this)
      },

      stop: function() {
        if(this.tickTimer) {
                clearInterval(this.tickTimer)
            }
            if(this.state === STATUS.RUNNING) {
                this.state = STATUS.STOPPED
                this._updateTime(this)
                this.emit('stop')
                this.emit('forcestop')
            }
      },

      reset: function(countDownMS) {
        this.stop()
        this.state = STATUS.STOPPED
        this.doneFired = false
        this.almostDoneFired = false
        this._elapsedMS = 0
        this.refTime = new Date().getTime()

        if(countDownMS) {
          this.countDownMS = countDownMS
        }
        this.ms = this.countDownMS || 0

        this.emit('time',{ms: this.ms})
      },

      startstop: function() {
        if(this.state === STATUS.STOPPED) {
                this.start()
                return true
            } else {
                this.stop()
                return false
            }
      },

      _updateTime: function() {
        var self = this
            if(self.countDownMS > 0) {
              self._timerCountdown(self)
            } else {
              self._stopwatchCountup(self)
            }
      },

      _timerCountdown: function() {
        var self = this
        var currentTime = new Date().getTime()

            self._elapsedMS = currentTime - self.refTime


            var remainingSeconds = self.countDownMS - self._elapsedMS
            if(remainingSeconds < 0) {
              remainingSeconds = 0
            }

            self.ms = remainingSeconds
            self.emit('time', {ms: self.ms})

            if(remainingSeconds <= 0) {
                self.stop()
                if(!self.doneFired) {
                    self.doneFired = true
                    self.state = STATUS.COMPLETE
                    self.emit('done')
                }
            } else if (remainingSeconds < self.almostDoneMS) {
                if(!self.almostDoneFired) {
                    self.almostDoneFired = true
                    self.emit('almostdone')
                }
            }

      },

      _stopwatchCountup: function() {
        var self = this
        var currentTime = new Date().getTime()

        self._elapsedMS = currentTime - self.refTime
            self.ms = self._elapsedMS
            self.emit('time', {ms: self.ms})
      },

      onDone: function(cb) {
        this.on('done', cb)
        return this
      },

      onAlmostDone: function(cb) {
        this.on('almostDone', cb)
        return this
      },

      onTime: function(cb) {
        this.on('time', cb)
        return this
      },

      onStop: function(cb) {
        this.on('stop', cb)
        return this
      },


    }
  Object.assign(Stopwatch.prototype, EventEmitter.prototype)
  return Stopwatch
})

