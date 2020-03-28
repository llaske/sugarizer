define(["sugar-web/activity/activity"], function (activity) {

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!'], function (doc) {

		// Initialize the activity.
		activity.setup();
		var tricksList = [
			'Square of a number ending with 5',
			'Square of a number just below 100',
			'Multiplication with 9',
			'Square of a number just below 100',
			"Square of any 3 digit number with 0 in ten's place",
			'Multiplication with 5',
			'Multiplication with 11',
			"Multiply two numbers when sum of 1's digit is 10."
		];
		document.getElementById("show-all-tricks").addEventListener('click',function(){
			console.log("clicked show all");
			document.getElementById("previous").style.display="block";
			document.getElementById("previous").style.visibility="visible";
			document.getElementById("next").style.display="block";
			document.getElementById("next").style.visibility="visible";
			document.getElementById("learn-now").style.display="block";
			document.getElementById("learn-now").style.visibility="visible";
			document.getElementById("learn-trick").style.display="none";
			document.getElementById("learn-trick").style.visibility="hidden";
			document.getElementById("learn-a-trick").style.display="none";
			document.getElementById("learn-a-trick").style.visibility="hidden";
			document.getElementById("show-all-tricks").style.display="none";
			document.getElementById("show-all-tricks").style.visibility="hidden";
			document.getElementById("calculator-challenge").style.display="none";
			document.getElementById("calculator-challenge").style.visibility="hidden";
			var trick_show_counter=0;
			var trick_green_board = document.getElementById("welcome-board");
			trick_green_board.innerHTML=tricksList[0];
			// trick_show_counter++;
			// for(var i=0;i<tricksList.length;i++){
				
			// }
			document.getElementById("next").addEventListener('click',function(){
				if(trick_show_counter == tricksList.length){
					//disable next click
					document.getElementById("next").disabled = true;
					// document.getElementById("next").setAttribute('disabled', 'disabled')
					console.log("disabled");
				}
				else{
					document.getElementById("next").disabled = false;
					trick_show_counter++;
					trick_green_board.innerHTML=tricksList[trick_show_counter];
					
				}
				
			});
			document.getElementById("previous").addEventListener('click',function(){
				if(trick_show_counter == 0){
					//disable next click
					document.getElementById("previous").disabled = true;
					// document.getElementById("next").setAttribute('disabled', 'disabled')
					console.log("disabled");
				}
				else{
					document.getElementById("previous").disabled = false;
					trick_show_counter--;
					trick_green_board.innerHTML=tricksList[trick_show_counter];
					
				}
				
			});
		});

		document.getElementById("learn-a-trick").addEventListener('click',function(){
			console.log("clicked learn-a-trick");
		});

		document.getElementById("calculator-challenge").addEventListener('click',function(){
			console.log("clicked calculator-challenge");
		});

		
	});

});
