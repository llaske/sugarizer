// Enyo interface for Sugar

enyo.Sugar = {};
enyo.Sugar.component = null;
enyo.Sugar.sendMessage = function(name, args) {
	if (enyo.Sugar.component) {
		enyo.Sugar.component.signal(name, JSON.parse(args));
	}	
};

enyo.kind({
	name: "Sugar",

	// Constructor, init component
	create: function() {
		this.inherited(arguments);
		this.handlers = [];
		enyo.Sugar.component = this;
	},
	
	// Connect a callback to a message
	connect: function(name, callback) {
		this.handlers[name] = callback;
	},

	// Send a message to Sugar
	sendMessage: function(name, args) {
		var msg	= "";
		msg = msg + "enyo://"+name.length+"/"+name;
		if (!args)
			msg = msg + "/0/";
		else {
			var value = JSON.stringify(args);
			msg = msg + "/"+value.length+"/"+value;
		}
		console.log(msg);	
	},

	// A message was sent by Sugar
	signal: function(name, args) {
		var callback = this.handlers[name];
		if (callback) {
			callback(args);
		}		
	}
});
