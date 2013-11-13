
function LOLGame(size) {
	// Set initial
	var length = Math.max(size,0);
	var player = 0;
	
	// Accessor
	this.getLength = function() {
		return length;
	};
	this.getPlayer = function() {
		return player;
	};
	
	// Change player, only at start
	this.reverse = function() {
		if (length != size)
			return false;
		player = (player + 1) % 2;
		return true;
	};
	
	// Play
	this.play = function(number) {
		if (number === undefined || number == null || number < 1 || number > 3 || number > length)
			return length;
		length = length - number;
		if (length > 0)
			player = (player + 1) % 2;
		return length;
	};
	
	// Test end of game
	this.endOfGame = function() {
		return length == 0;
	};
	
	// Think to the better next shot
	this.think = function(level) {
		// Level 1: try to leave at least one at end of game
		if (level >= 1) {
			if (length >= 2 && length <= 4)
				return length-1;
		}
		
		// Level 2: try to leave five
		if (level >= 2) {
			if (length >= 6 && length <= 8)
				return length-5;
		}
		
		// Level 3: always try to left the nearest multiple of 4+1
		if (level >= 3) {
			var attemptsup = length-(Math.floor(length/4)*4+1);
			if (attemptsup >=1 && attemptsup <= 3)
				return attemptsup;
			var attemptinf = length-((Math.floor(length/4)-1)*4+1);			
			if (attemptinf >=1 && attemptinf <= 3)
				return attemptinf;			
		}
		
		// Simple case: randomly choose a number
		return Math.floor(Math.random()*Math.min(3,length-1))+1;
	};
}