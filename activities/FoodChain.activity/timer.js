
// Timer object
enyo.kind({
    name: "Timer",
    kind: enyo.Component,
    minInterval: 50,
    published: {
        baseInterval: 100, paused: false
    },
    events: {
        onTriggered: ""
    },
	
	// Constructor, start the timer
    create: function() {
        this.inherited(arguments);
        this.start();
    },
	
	// Destroy the timer
    destroy: function() {
        this.stop();
        this.inherited(arguments);
    },
	
	// Start the timer
    start: function() {
        this.job = window.setInterval(enyo.bind(this, "timer"), this.baseInterval);	
    },
	
	// Stop the timer
    stop: function() {		
        window.clearInterval(this.job);		
    },
	
	// Pause timer
	pause: function() {	
		this.paused = true;
	},
	
	// Resume the timer
	resume: function() {
		this.paused = false;
	},
	
	// Periodic event raised
    timer: function() {
		if (!this.paused)
			this.doTriggered({time: new Date().getTime()});
    },
	
	// Interval changed event
    baseIntervalChanged: function(inOldValue) {
        this.baseInterval = Math.max(this.minInterval, this.baseInterval);
        this.stop();
        this.start();
    }
});