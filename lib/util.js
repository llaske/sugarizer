

// Utility functions
define(["webL10n"], function (l10n) {
	var util = {};
	
	var units = [{name:'Years', factor:356 * 24 * 60 * 60},
			 {name:'Months', factor:30 * 24 * 60 * 60},
			 {name:'Weeks', factor:7 * 24 * 60 * 60},
			 {name:'Days', factor:24 * 60 * 60},
			 {name:'Hours', factor:60 * 60},
			 {name:'Minutes', factor:60}];
			 
	// Port of timestamp function - timestamp is in milliseconds elapsed since 1er january 1970
	util.timestampToElapsedString = function(timestamp, maxlevel) {
		var levels = 0;
		var time_period = '';
		var elapsed_seconds = ((new Date().getTime()) - timestamp)/1000;
		for (var i = 0; i < units.length ; i++) {
			var factor = units[i].factor;
			
			var elapsed_units = Math.floor(elapsed_seconds / factor);
			if (elapsed_units > 0) {
				if (levels > 0)
					time_period += ',';
				
				time_period += ' '+elapsed_units+" "+(elapsed_units==1?l10n.get(units[i].name+"_one"):l10n.get(units[i].name+"_other"));
					
				elapsed_seconds -= elapsed_units * factor;
			}
			
			if (time_period != '')
				levels += 1;
				
			if (levels == maxlevel)
				break;
		}
		
		if (levels == 0)
			return l10n.get("SecondsAgo");
		
		return l10n.get("Ago", {time:time_period});
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
	 util.setToolbar = function(newtoolbar) {
		if (toolbar == newtoolbar)
			return;
		toolbar = newtoolbar;
        newtoolbar.renderInto(document.getElementById("toolbar"));
	 }
	 
	 // Quit application
	 util.quitApp = function() {
		window.close(); 
		window.open('', '_self', ''); // HACK: Not allowed on all browsers
		window.close();	 
	 }
	 
	 return util;
 });