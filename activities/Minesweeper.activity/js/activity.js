define(["sugar-web/activity/activity"], function (activity) {

	// Manipulate the DOM only when it is ready.
	require(['domReady!'], function (doc) {

		// Initialize the activity.
		activity.setup();

document.getElementsByClassName("difficulty")[0].addEventListener("click", startgame);
document.getElementsByClassName("difficulty")[1].addEventListener("click", startgame);
document.getElementsByClassName("difficulty")[2].addEventListener("click", startgame);

document.getElementsByClassName("smiley")[0].addEventListener("click", startgame);
function startgame(e){
	if(!e) e = window.event;

	for(i=0;i<document.getElementsByClassName("difficulty").length;i++){
		if(document.getElementsByClassName("difficulty")[i].classList.contains("selected")){
			document.getElementsByClassName("difficulty")[i].classList.remove("selected");
		}
	}

	document.getElementsByClassName("smiley")[0].innerHTML = "<img src = './icons/smile-emoji.png'>";
	switch(e.target.classList[1]){
		case "easy": rows = 15;
			cols = 15;
			bombs = 20;
			document.getElementsByClassName("difficulty")[0].classList.add("selected");
			break;

		case "medium": rows = 15;
			cols = 15;
			bombs = 30;
			document.getElementsByClassName("difficulty")[1].classList.add("selected");
			break;

		case "difficult": rows = 15;
			cols = 15;
			bombs = 50;
			document.getElementsByClassName("difficulty")[2].classList.add("selected");
			break;

		default: rows = 15;
			cols = 15;
			bombs = 20;
			document.getElementsByClassName("difficulty")[0].classList.add("selected");
			break;
	}
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

	//planting the bombs
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
	}

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
				}
			}
			else{
				// document.getElementsByTagName("tr")[i-1].childNodes[j-1].style.color = "red";
				document.getElementsByTagName("tr")[i-1].childNodes[j-1].innerHTML = bombcount;
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
	}

	for(i=0;i<document.getElementsByTagName("td").length;i++){
		document.getElementsByTagName("td")[i].addEventListener("click", tileClick);
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
			}
		});
	}
}

	});

});
