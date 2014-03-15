
// Utility function
var util = {};

// Heading:  0 <
//           1 ^
//           2 >
//           3 v
util.moves = [{dx: -1, dy: 0}, {dx: 0, dy: -1}, {dx: +1, dy: 0}, {dx: 0, dy: +1}];

// Unit types and powers
util.unitTypes = ["hq", "soldier", "tank", "canon", "helo"];
util.unitPowers = [constant.powerHq, constant.powerSoldier, constant.powerTank, constant.powerCanon, constant.powerHelo];
util.unitStats = [constant.statHq, constant.statSoldier, constant.statTank, constant.statCanon, constant.statHelo];

// Unit type
util.explosionsImages = ["explosion_1", "explosion_2", "explosion_3", "explosion_4", "explosion_5", "explosion_6", "explosion_7"];


// Prepare board using ground model
util.createMap = function(grounds) {
	var game = [];
	var index = 0;
	for (var i = 0 ; i < constant.boardHeight ; i++ ) {
		var line = []
		for (var j = 0 ; j < constant.boardWidth ; j++ ) {
			var ground = constant.tileEmpty;
			var current = grounds[index];
			if (current == 'O')
				ground = constant.tileWater;
			else if (current == 'H')
				ground = constant.tileTrees;
			else if (current == '^')
				ground = constant.tileMountain;
			line.push(ground);
			index++;
		}
		game.push(line);
	}
	
	return game;
}

// Create a set of units
util.createUnit = function(unit) {
	var heading = unit.color == "blue" ? 2 : 0;
	var power = 0;
	for (var i = 0 ; i < util.unitTypes.length ; i++) {
		if (util.unitTypes[i] == unit.type) {
			power = util.unitPowers[i];
		}
	}
	var imageprefix = unit.type + "_" + unit.color;
	while(util.lookForUnit(unit) != null)
		unit.x = unit.x+1;
	var newUnit = new Sprite({
		x: unit.x, y: unit.y, 
		heading: heading, power: power,
		engine: unit.engine,
		images: (unit.type == "hq") ? [imageprefix] : [imageprefix+"_0", imageprefix+"_1", imageprefix+"_2", imageprefix+"_3"]
	});
	return newUnit;
}

util.createUnits = function(units) {
	var created = [];
	for (var i = 0 ; i < units.length ; i++) {
		created.push(util.createUnit(units[i]));
	}
	return created;
}

// Test if 
util.isValidPosition = function(position, sprite) {
	// Out of board
	if (position.x < 0 || position.x == constant.boardWidth || position.y < 0 || position.y == constant.boardHeight)
		return false;
	
	// Authorized ground depend of unit type
	var maptype=play.game[position.y][position.x];
	var unittype=util.getUnitType(sprite);
	if (unittype == 4)
		return true;	// Helo can go anywhere
	if (maptype == constant.tileEmpty)
		return true;	// Grass is for everyone
	if (unittype == 0)
		return maptype == constant.tileEmpty; // HQ only on grass
	if (maptype == constant.tileTrees)
		return unittype == 1;  // Trees is only for soldier
	else if (maptype == constant.tileWater)
		return unittype == 1;  // Water is only for soldier

	// Already a unit inside
	var unitinside = util.lookForUnit(position);
	if (unitinside != null)
		return unitinside == sprite;
	return false;
}

// Compute next position if sprite go ahead in the current heading
util.nextPositionOnHeading = function(sprite) {
	return { x: sprite.x + util.moves[sprite.heading].dx, y: sprite.y + util.moves[sprite.heading].dy };
}

// Look for unit at a position
util.lookForUnit = function(position) {
	// Check this position for each unit
	for (var i = 0 ; i < play.units.length ; i++)
		if (play.units[i].x == position.x && play.units[i].y == position.y)
			return play.units[i];
	return null;
}

// Look for unit with a value
util.lookForValue = function(value) {
	// Check this value on each unit
	var set = [];
	for (var i = 0 ; i < play.units.length ; i++) {
		if (play.units[i].value !== undefined && play.units[i].value.result == value)
			set.push(play.units[i]);
	}
	return set;
}

// Look for opponent around the sprite
util.lookForOpponent = function(sprite) {
	var oppositeColor = sprite.getCurrentImage().indexOf("red") != -1 ? "blue" : "red";
	for (var i = 0 ; i < util.moves.length ; i++ ) {
		var position = {x: sprite.x + util.moves[i].dx, y: sprite.y + util.moves[i].dy};
		var neighbour = util.lookForUnit(position);
		if (neighbour != null && neighbour.getCurrentImage().indexOf(oppositeColor) != -1)
			return {heading: i, unit: neighbour};
	}
	return null;
}

// Get unit type
util.getUnitType = function(unit) {
	var image = unit.getCurrentImage();
	for (var i = 0 ; i < util.unitTypes.length ; i++)
		if (image.indexOf(util.unitTypes[i]) != -1)
			return i;
	return -1;
}

// Test if a unit could beat another
util.couldBeat = function(unit1, unit2) {
	var type1 = util.getUnitType(unit1);
	var type2 = util.getUnitType(unit2);
	if (type1 == 1 && type2 == util.unitTypes.length - 1)  // Soldier could beat Helo
		return true;
	return (type1 >= type2);
}

// Handle fight between two opponents
util.processFight = function(unit1, unit2, power) {
	if (unit1 != null && !util.couldBeat(unit1, unit2))
		return;
	unit2.power = unit2.power - (power !== undefined ? power : 1);
	util.doExplosion(unit2);
}

// Do explosion animation
util.doExplosion = function(position) {
	var index = 0;
	sound.play("audio/explosion");
	var timer = window.setInterval(function() {
		if (index == util.explosionsImages.length || app.endOfGame) {
			window.clearInterval(timer);
			return;
		}
		var ctx = play.canvas.hasNode().getContext('2d');
		var image = document.getElementById(util.explosionsImages[index]);		
		ctx.save();
		ctx.translate(position.x*constant.tileSize, position.y*constant.tileSize);
		ctx.drawImage(image, 0, 0);	
		ctx.restore();	
		index++;
	}, constant.explosionInterval);
}

// Get URL parameter
util.getUrlParameter = function(name) {
	var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
	return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

// Get a random number
util.random = function(max) {
	return Math.floor(Math.random()*max);
}

// Get randomly a unit name
util.randomUnit = function(stats) {
	var unittype = util.random(10);	
	for (var i = util.unitStats.length-1 ; i > 0 ; i--) {
		if (unittype >= stats[i]) {
			return util.unitTypes[i];
		}
	}
}

// Computer nearest unit from me
util.nearestUnit = function(me, units) {
	var current = -1;
	var near = constant.boardWidth*constant.boardHeight;
	for (var i = 0 ; i < units.length ; i++) {
		var distance = Math.abs(units[i].x - me.x)+Math.abs(units[i].y - me.y);
		if (distance < near) {
			current = i;
			near = distance;
		}
	}
	return current != -1 ? units[current] : null;
}