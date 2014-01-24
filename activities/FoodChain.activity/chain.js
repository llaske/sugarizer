// Cards lists
FoodChain.cards = [
	"alligator", "animal", "bat", "bee", "bird", "camel", "cat", "chicken", "chimp",
	"clam", "corn", "cow", "crab", "crocodile", "crow", "dog", "duck", "fish", "flies",
	"fox", "frog", "giraffe", "goat", "grass", "hay", "hen", "lamb", "mice", "mole",
	"mosquito", "mule", "owl", "ox", "pig", "rat", "shark", "shrimp", "skunk", "snail",
	"snake", "spider", "spike", "squid", "squirrel", "starfish", "swan", "tick", "wheat"
];

// Feed strategy list and members
FoodChain.feedStrategy = [
	{ name: "herbivore", members: ["swan", "bee", "cow", "giraffe", "squirrel", "goat", "ox", "lamb", "mule", "camel", "chimp"] },
	{ name: "carnivore", members: ["mosquito", "mole", "spike", "tick", "squid", "crab", "owl", "snake", "dog", "alligator", "bat", "crocodile", "frog", "shark", "spider", "starfish", "crocodile"] },
	{ name: "omnivore", members: ["duck", "flies", "pig", "mice", "rat", "skunk", "chicken", "hen", "fox"] }
];

// Chains computation
FoodChain.validChains = [
	["snake", "mice", "corn"],
	["cat", "mice", "corn"],
	["fox", "bird", "spider", "mosquito"],
	["fox", "bird", "spider", "flies"],
	["fox", "duck", "frog", "flies"],
	["snake", "frog", "mosquito"],
	["snake", "frog", "flies"],
	["fox", "duck", "frog", "snail", "grass"],
	["spike", "spider", "mosquito"],
	["spike", "spider", "flies"],
	["shark", "fish", "shrimp"],
	["owl", "bat", "mosquito"],
	["owl", "bat", "flies"],
	["cat", "bat", "mosquito"],
	["cat", "bat", "flies"],
	["fox", "hen", "corn"],
	["fox", "chicken", "corn"],
	["cow", "grass"],
	["starfish", "clam"],
	["frog", "snail", "grass"],
	["skunk", "rat", "snail", "grass"],
	["skunk", "mice", "snail", "grass"],
	["spike", "snail", "grass"],
	["crow", "snail", "grass"],
	["duck", "snail", "grass"],
	["starfish", "crab"]
];

// Create a random foodchain for the specified size (game build)
FoodChain.randomChain = function(size) {
	// Check size
	if (size == undefined) {
		size = 3;
	}
	
	// Look for chains for this size
	var chains = [];
	for(var i in FoodChain.validChains) {
		// Too small
		var c = FoodChain.validChains[i];
		if (c.length < size)
			continue;
			
		// Just the right size
		if (c.length == size) {
			chains.push(c);
			continue;
		}
		
		// Too long, compute randomly a subchain
		var index = Math.floor(Math.random()*(c.length-size));
		var newchain = [];
		for (var j = index; j < index+size ; j++) {
			newchain.push(c[j]);
		}
		chains.push(newchain);
	}
	
	// Randomly choose a chain
	return chains[Math.floor(Math.random()*chains.length)];
};


// Mix a chain
FoodChain.mix = function(chain) {
	// Check size
	if (chain.length < 2) {
		return chain;
	}
	
	// Mix cards
	var mixedchain = [];
	var tomix = enyo.cloneArray(chain);
	while (tomix.length != 1) {
		// Take a card
		var i = Math.floor(Math.random()*tomix.length);
		mixedchain.push(tomix[i]);
		tomix[i] = null;
		
		// Remix
		var newmix = [];
		for (var j = 0 ; j < tomix.length ; j++) {
			if (tomix[j] != null)
				newmix.push(tomix[j]);
		}
		tomix = newmix;
	}
	mixedchain.push(tomix[0]);
	
	return mixedchain;
};


// Create a random feed card for the specified size and count (game learn)
FoodChain.randomFeedList = function(size, count) {
	// Check size
	if (size == undefined) {
		size = 2;
	}
	
	// Look for chains for this size
	var list = [];
	for(var i = 0 ; i < count ; i++) {
		// Choose randomly a feed strategy
		var strategy = Math.floor(Math.random()*size);
		
		// Choose randomly a card not already picked
		var index = -1;
		var cardname;
		while (index == -1) {
			// Pick a card
			index = Math.floor(Math.random()*FoodChain.feedStrategy[strategy].members.length);
			
			// Check if not already here
			cardname = FoodChain.feedStrategy[strategy].members[index];
			for (var j = 0 ; index != -1 && j < list.length ; j++) {
				if (list[j].cardname == cardname) {
					index = -1;
				}
			}
		}
		
		// Add card
		list.push({cardname: cardname, strategy: strategy});
	}
	
	// Return list
	return list;
};