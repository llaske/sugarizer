define(["sugar-web/activity/activity","sugar-web/env"], function (activity,env) {

	// Manipulate the DOM only when it is ready.
	require(['domReady!'], function (doc) {

		// Initialize the activity.
		activity.setup();

		var isNewBool, memoryGame;

		env.getEnvironment(function(err, environment) {
			currentenv = environment;

			// Load from datastore
			if (!environment.objectId) {
				isNewBool = true;
				document.getElementsByClassName("difficulty")[0].classList.add("active");
				document.getElementsByClassName("size")[0].classList.add("active");
				startgame();
			} 
			else {
				activity.getDatastoreObject().loadAsText(function(error, metadata, data) {
					if (error==null && data!=null) {
						memoryGame = JSON.parse(data);
						console.log(memoryGame);
						if(memoryGame != null) {
							isNewBool = false;
							document.getElementsByClassName("difficulty")[memoryGame.diff].classList.add("active");
							document.getElementsByClassName("size")[memoryGame.size].classList.add("active");
							startgame();
						}
						else{
							isNewBool = true;
							document.getElementsByClassName("difficulty")[0].classList.add("active");
							document.getElementsByClassName("size")[0].classList.add("active");
							startgame();
						}
					}
				});
			}
		});	




for(i=0;i<document.getElementsByClassName("difficulty").length;i++){
	
	document.getElementsByClassName("difficulty")[i].addEventListener("click", function(){
		for(i=0;i<document.getElementsByClassName("difficulty").length;i++){
			if(document.getElementsByClassName("difficulty")[i].classList.contains("active")){
				document.getElementsByClassName("difficulty")[i].classList.remove("active");
			}
		}
		this.classList.add("active");
	});	
	
	document.getElementsByClassName("difficulty")[i].addEventListener("click", function(){
		isNewBool = true;
		startgame();
	});	
}

for(i=0;i<document.getElementsByClassName("size").length;i++){

	document.getElementsByClassName("size")[i].addEventListener("click", function(){
		for(i=0;i<document.getElementsByClassName("size").length;i++){
			if(document.getElementsByClassName("size")[i].classList.contains("active")){
				document.getElementsByClassName("size")[i].classList.remove("active");
			}
		}
		this.classList.add("active");
	});	
	
	document.getElementsByClassName("size")[i].addEventListener("click", function(){
		isNewBool = true;
		startgame();
	});	
}

document.getElementsByClassName("smiley")[0].addEventListener("click", function(){
		isNewBool = true;
		startgame();
	});


var memoryBombs = [];//array for memory of bombs
var memorySize, memoryDiff;//memory of size and difficulty
var memoryOpen = [];//memory of open tiles
var memoryFlags = [];//memory of flags

function startgame(e){
	if(!e) e = window.event;

	document.getElementsByClassName("smiley")[0].innerHTML = "<img src = './icons/smile-emoji.png'>";

	var diff;// 0 -> easy; 1 -> medium; 2 -> hard
	for(i=0;i<document.getElementsByClassName("difficulty").length;i++){
		if(document.getElementsByClassName("difficulty")[i].classList.contains("active")) diff = i;
	}
	
	var size;// 0 -> small; 1 -> medium; 2 -> large
	for(i=0;i<document.getElementsByClassName("size").length;i++){
		if(document.getElementsByClassName("size")[i].classList.contains("active")) size = i;
	}

	switch(diff){
		case 0: bombs = 20;
			break;

		case 1: bombs = 30;
			break;

		case 2: bombs = 50;
			break;

		default: rows = 13;
			cols = 25;
			bombs = 20;
			document.getElementsByClassName("difficulty")[0].classList.add("active");
			break;
	}
	memoryDiff = diff;

	switch(size){
		case 0: rows = 13;
			cols = 15;
			break;

		case 1: rows = 13;
			cols = 20;
			break;

		case 2: rows = 13;
			cols = 25;
			break;

		default: rows = 13;
			cols = 25;
			bombs = 20;
			document.getElementsByClassName("difficulty")[0].classList.add("active");
			break;
	}
	memorySize = size;


	var table = document.getElementsByTagName("table")[0];

	table.innerHTML = "";

	//creating the rows x cols table as required
	for(i=1;i<=rows;i++){
		var tr = document.createElement("tr");
		table.appendChild(tr);
		for(j=1;j<=cols;j++){
			var currenttr = document.getElementsByTagName("tr")[i-1];
			var td = document.createElement("td");
			currenttr.appendChild(td);
		}
	}
	
	//memory of bombs
	for(i=0;i<rows;i++){
		memoryBombs[i] = [];

		for(j=0;j<cols;j++){
			memoryBombs[i][j] = 0;
		}
	}

	//planting the bombs
	if(isNewBool){
		for(i=1;i<=bombs;i++){
			var randx, randy;
			function randtwodigNum(){
				var x = Math.floor(Math.random()*100);
				var y = Math.floor(Math.random()*100);
				if(x > rows || x < 1){
					randtwodigNum();
				}
				else if(y > cols || y < 1){
					randtwodigNum();
				}
				else{
					if(document.getElementsByTagName("tr")[x-1].childNodes[y-1].className == 'bomb'){
						randtwodigNum();
					}
					else{
						randx = x; randy = y;
					}
				}
			}
			randtwodigNum();
			
			document.getElementsByTagName("tr")[randx-1].childNodes[randy-1].className = 'bomb';

			memoryBombs[randx-1][randy-1] = 1;
		}
	}
	else{
		for(i=0;i<rows;i++){
			for(j=0;j<cols;j++){
				if(memoryGame.bombs[i][j] == 1){
					document.getElementsByTagName("tr")[i].childNodes[j].className = 'bomb';
					memoryBombs[i][j] = 1;
				}
			}
		}
	}
	

	//memory of number of mines
	// for(i=0;i<rows;i++){
	// 	memoryNumber[i] = [];

	// 	for(j=0;j<cols;j++){
	// 		memoryNumber[i][j] = 0;
	// 	}
	// }

	//memory of empty tiles
	// for(i=0;i<rows;i++){
	// 	memoryEmpty[i] = [];

	// 	for(j=0;j<cols;j++){
	// 		memoryEmpty[i][j] = 0;
	// 	}
	// }

	//adding the number of mines in the vicinity of a particular tile
	for(i=1;i<=rows;i++){
		for(j=1;j<=cols;j++){
			var bombcount = 0;
			for(p=i-1;p<=i+1;p++){
				for(q=j-1;q<=j+1;q++){
					if(p == i && q == j){continue;}

					else{
						if(p<=0 || q<=0 || p>rows || q>cols){continue;}
						else if(document.getElementsByTagName("tr")[p-1].childNodes[q-1].className == 'bomb'){
							bombcount++;
						}
					}
				}
			}
			if(bombcount == 0){
				if(document.getElementsByTagName("tr")[i-1].childNodes[j-1].className != "bomb"){
					document.getElementsByTagName("tr")[i-1].childNodes[j-1].className = "empty";
					// memoryEmpty[i-1][j-1] = 1;
				}
			}
			else{
				// document.getElementsByTagName("tr")[i-1].childNodes[j-1].style.color = "red";
				document.getElementsByTagName("tr")[i-1].childNodes[j-1].innerHTML = bombcount;
				// memoryNumber[i-1][j-1] = bombcount;
			}
			
		}
	}

	
	//memory of open/close tiles
	for(i=0;i<rows;i++){
		memoryOpen[i] = [];

		for(j=0;j<cols;j++){
			memoryOpen[i][j] = 0;
		}
	}
	
	if(!isNewBool){
		//opening tiles from memory
		for(i=0;i<rows;i++){
			for(j=0;j<cols;j++){
				if(memoryGame.open[i][j] == 1){
					document.getElementsByTagName("tr")[i].childNodes[j].classList.add("open");
					memoryOpen[i][j] = 1;
				}
			}
		}
	}

	function tileClick(){
		if(this.className == 'bomb'){
			document.getElementsByClassName("smiley")[0].innerHTML = "<img src = './icons/dead-emoji.png'>";
			for(i=0;i<bombs;i++){
				document.getElementsByClassName("bomb")[i].innerHTML= "<img src = './icons/mine.svg'>";
			}

			for(i=0;i<document.getElementsByTagName("td").length;i++){
				document.getElementsByTagName("td")[i].removeEventListener("click", tileClick);
				document.getElementsByTagName("td")[i].removeEventListener("contextmenu", tileClick);
			}

			//setTimeout(function(){location.reload();}, 500);
		}

		else{
			this.setAttribute("id", "selected");
			this.classList.add("open");
			var a,b;
			for(i=1;i<=rows;i++){
				for(j=1;j<=cols;j++){
					if(document.getElementsByTagName("tr")[i-1].childNodes[j-1].id == 'selected'){
						a = i;
						b = j;
						break;
					}
				}
			}


			function digging(x,y){
				for(p=x-1;p<=x+1;p++){
				for(q=y-1;q<=y+1;q++){
					if(p == x && q == y){continue;}

					else{
						if(p<=0 || q<=0 || p>rows || q>cols){continue;}
						else if(document.getElementsByTagName("tr")[p-1].childNodes[q-1].className == 'empty'){
							document.getElementsByTagName("tr")[p-1].childNodes[q-1].className = "empty open";
							var l = p;
							var m = q;
							digging(l,m);
							digging(l,m);
							digging(l,m);
							digging(l,m);
							digging(l,m);
							digging(l,m);
						}
						else if(document.getElementsByTagName("tr")[p-1].childNodes[q-1].className == "empty open"){
							continue;
						}
						else{
							continue;
						}
					}
				}
			}
			}
			digging(a,b);
			digging(a,b);
			digging(a,b);
			digging(a,b);
			digging(a,b);
			digging(a,b);

			var emptytiles = 0;
			for(i=1;i<=rows;i++){
				for(j=1;j<=cols;j++){
					if(document.getElementsByTagName("tr")[i-1].childNodes[j-1].className == 'empty open'){
						for(p=i-1;p<=i+1;p++){
				for(q=j-1;q<=j+1;q++){
					if(p == i && q == j){continue;}

					else{
						if(p<=0 || q<=0 || p>rows || q>cols){continue;}
						else if(document.getElementsByTagName("tr")[p-1].childNodes[q-1].className != 'bomb' && document.getElementsByTagName("tr")[p-1].childNodes[q-1].className != 'empty open'){
							document.getElementsByTagName("tr")[p-1].childNodes[q-1].className = 'open';
						}
					}
				}
			}
					}
				}
			}
			this.removeAttribute("id");
		}

		var remaining = 0;

		for(i=0;i<rows;i++){
			for(j=0;j<cols;j++){
				if(document.getElementsByTagName("tr")[i].childNodes[j].className != 'open' && document.getElementsByTagName("tr")[i].childNodes[j].className != 'empty open'){
					remaining++;
				}
			}
		}
		if(remaining == bombs){
			for(i=0;i<bombs;i++){
				document.getElementsByClassName("bomb")[i].innerHTML= "<img src = './icons/mine.svg'>";
			}

			for(i=0;i<document.getElementsByTagName("td").length;i++){
				document.getElementsByTagName("td")[i].removeEventListener("click", tileClick);
				document.getElementsByTagName("td")[i].removeEventListener("contextmenu", tileClick);
			}
		}


		//memory of open/close
		for(i=0;i<rows;i++){
			for(j=0;j<cols;j++){
				if(document.getElementsByTagName("tr")[i].childNodes[j].classList.contains('open')) memoryOpen[i][j] = 1;
			}
		}
	}

	for(i=0;i<document.getElementsByTagName("td").length;i++){
		document.getElementsByTagName("td")[i].addEventListener("click", tileClick);
	}


		for(i=0;i<rows;i++){
			memoryFlags[i] = [];
			for(j=0;j<cols;j++){
				memoryFlags[i][j] = 0;
			}
		}
		
		if(!isNewBool){
			for(i=0;i<rows;i++){
				for(j=0;j<cols;j++){
					if(memoryGame.flags[i][j] == 1){
						document.getElementsByTagName("tr")[i].childNodes[j].innerHTML = "<img src = './icons/flag.svg'>";
						memoryFlags[i][j] = 1;
					}
				}
			}
		}

			var prevcontent;
	for(i=0;i<document.getElementsByTagName("td").length;i++){
		document.getElementsByTagName("td")[i].addEventListener("contextmenu", function(e){
			e = window.event;
			e.preventDefault();

			if(this.innerHTML == "<img src = './icons/flag.svg'>"){
				this.innerHTML = prevcontent;
			}
			else if(!this.classList.contains("open")){
				prevcontent = this.innerHTML;
				this.innerHTML = "<img src = './icons/flag.svg'>";
				var thisRow = Array.from(document.getElementsByTagName("tr")).indexOf(this.parentNode);
				var thisCol = Array.from(document.getElementsByTagName("tr")[thisRow].childNodes).indexOf(this);

				memoryFlags[thisRow][thisCol] = 1;
			}

		});
	}
}


		// Save in Journal on Stop
		document.getElementById("stop-button").addEventListener('click', function (event) {
			var jsonData = JSON.stringify({
				"bombs":memoryBombs,
				"open":memoryOpen,
				// "number":memoryNumber,
				// "empty":memoryEmpty,
				"size":memorySize,
				"diff":memoryDiff,
				"flags":memoryFlags
			});
			
			activity.getDatastoreObject().setDataAsText(jsonData);
			
			activity.getDatastoreObject().save(function (error) {
				if (error === null) {
					console.log("write done.");
				} 
				else {
					console.log("write failed.");
				}
			});
		});
	});
});
