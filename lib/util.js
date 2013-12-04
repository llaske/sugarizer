

// Utility functions
define(function () {

	var util = {};
	
	var units = [{singular:' year', plural:' years', factor:356 * 24 * 60 * 60},
			 {singular:' month', plural:' months', factor:30 * 24 * 60 * 60},
			 {singular:' week', plural:' weeks', factor:7 * 24 * 60 * 60},
			 {singular:' day', plural:' days', factor:24 * 60 * 60},
			 {singular:' hour', plural:' hours', factor:60 * 60},
			 {singular:' minute', plural:' minutes', factor:60}];
			 
	// Port of timestamp function
	util.timestampToElapsedString = function(timestamp, maxlevel) {
		var levels = 0;
		var time_period = '';
		var elapsed_seconds = new Date().getTime() - timestamp;

		for (var i = 0; i < units.length ; i++) {
			var name_singular = units[i].singular;
			var name_plural = units[i].plural;
			var factor = units[i].factor;
			
			var elapsed_units = Math.floor(elapsed_seconds / factor);
			if (elapsed_units > 0) {
				if (levels > 0)
					time_period += ',';
					
				time_period += ' '+elapsed_units+(elapsed_units>1?name_plural:name_singular);
					
				elapsed_seconds -= elapsed_units * factor;
			}
			
			if (time_period != '')
				levels += 1;
				
			if (levels == maxlevel)
				break;
		}
		
		if (levels == 0)
			return 'Seconds ago';
		
		return time_period+' ago';
	 }
	 
	 return util;
 });