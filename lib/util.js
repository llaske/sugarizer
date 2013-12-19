

// Utility functions
define(function () {

	var util = {};
	
	var units = [{singular:' year', plural:' years', factor:356 * 24 * 60 * 60},
			 {singular:' month', plural:' months', factor:30 * 24 * 60 * 60},
			 {singular:' week', plural:' weeks', factor:7 * 24 * 60 * 60},
			 {singular:' day', plural:' days', factor:24 * 60 * 60},
			 {singular:' hour', plural:' hours', factor:60 * 60},
			 {singular:' minute', plural:' minutes', factor:60}];
			 
	// Port of timestamp function - timestamp is in milliseconds elapsed since 1er january 1970
	util.timestampToElapsedString = function(timestamp, maxlevel) {
		var levels = 0;
		var time_period = '';
		var elapsed_seconds = ((new Date().getTime()) - timestamp)/1000;
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
	 
	 // Get center of screen in canvas
	 util.getCanvasCenter = function() {
		var canvas = document.getElementById("canvas");
		var canvas_height = canvas.offsetHeight;
		var canvas_width = canvas.offsetWidth;
		var canvas_centery = parseFloat(canvas_height)/2.0;
		var canvas_centerx = parseFloat(canvas_width)/2.0

		return { x: canvas_centerx, y: canvas_centery };
	 }
	 
	 // Show/Hide toolbar
	 util.setToolbarVisibility = function(values) {
		for(var key in values) {
			var elem = document.getElementById(key);
			if (values[key])
				elem.style.display = "inline";
			else
				elem.style.display = "none";
		} 
	 }
	 
	 return util;
 });