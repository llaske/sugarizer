define(["sugar-web/activity/activity"], function (activity) {

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!'], function (doc) {

		// Initialize the activity.
		activity.setup();
		var trick_show_counter=0;
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

		var all_tutorial_steps = {
			0: [
				'Let us find (x5)²',
				'Step 1: Think of the number next to x.',
				'Step 2: x * number next to x',
				'Step 3: Put 25 at the end of the answer.',
				'Answer = Step 2 | 25'
			],
		
			1: [
				'Let us find (x)². X is just below 100.',
				'Step 1: Find the difference between 100 and this number.',
				'Step 2: Now, Subtract the difference from the number (x).',
				'Step 3: Find x²',
				'Answer = Step 2 | Step 3'
			],
		
			2: [
				'Consider multiplying a two digit number with 9.',
				'Step 1: Think of next number to ten\'s digit.',
				'Step 2: Subtract it from the number',
				'Step 3: Find 10 - [one\'s digit]',
				'Answer = Step 2 | Step 3'
			],
		
			3: [
				'Let us find (Y)². Y is just above 100.',
				'Step 1: Find the difference between the number and 100.',
				'Step 2: Now, Add the difference to the number (y).',
				'Step 3: Find y². Add ',
				'Answer = Step 2 | Step 3'
			],
		
			4: [
				'Let us find (x0y)².           \nDigits are referred from left to right.',
				'Step 1: Square third digit (y)²',
				'Step 2: Multiply x with y and double the answer\n( x * y * 2 ).\nAdd zero in front, if it is in single digit.',
				'Step 3: Square first digit (x)²',
				'Answer = Step 3 | Step 2 | Step 1 \n = (x)² | ( x * y * 2 ) | (y)²'
			],
		
			5: [
				'For now we will consider only the even numbers.',
				'Step 1: Find the half of the number (Number / 2)',
				'Step 2: Multiply by 10. (Add a zero in the end)',
				'Answer!'
			],
		
			6: [
				'To multiply any two-digit number by 11',
				'Step 1: Add the digits',
				'Step 2: Place the sum in between the digits.',
				'Answer!'
			],
		
			7: [
				'For any two numbers with the sum of their one’s digit = 10 and \n have the same number in the ten’s digit.',
				'Step 1: Think of the number (x) next to the number\nin ten’s digit (y)',
				'Step 2: Find x * y',
				'Step 3: Multiply both numbers’ one digit',
				'Answer = Step 2 | Step 3'
			]
		}
		
		var all_example_steps = {
			0: [
				'Question: (45)²',
				'Next number to 4 is 5',
				'4 * 5 = 20',
				'Put 25 at the end of the answer',
				'Answer = 2025'
			],
		
			1: [
				'Question: (96)²',
				'Difference is 4 (100 - 96 = 4)',
				'96 - 4 = 92',
				'(4)² = 16',
				'Answer = 9216'
			],
		
			2: [
				'Question: 68 x 9',
				'Next number to 6 is 7',
				'68 - 7 = 61',
				'10 - 8 = 2',
				'Answer = 612'
			],
		
			3: [
				'Question: (104)²',
				'Difference is 4 (104 - 100 = 4)',
				'104 + 4 = 108',
				'(4)² = 16',
				'Answer = 10816'
			],
		
			4: [
				'Question: (504)²',
				'(4)² = 16',
				'5 * 4 * 2 = 40',
				'(5)² = 25',
				'Answer = 254016'
			],
		
			5: [
				'Question: 64 x 5',
				'Half of 64 is 32',
				'Multiply 32 by 10. 32 * 10 = 320 \n(Simply add a zero in the end)',
				'Answer = 320'
			],
		
			6: [
				'Question: 43 x 11',
				'4 + 3 = 7',
				'Place 7 in between 4 and 3',
				'Answer = 473'
			],
		
			7: [
				'Question: 43 x 47 \nSum of one’s digit: 3 + 7 = 10 \nTen’s digit in both the numbers = 4',
				'Number next to 4 is 5',
				'4 * 5 = 20',
				'3 * 7 = 21',
				'Answer = 2021'
			]
		}
		document.getElementById("show-all-tricks").addEventListener('click',function(){
			console.log("clicked show all");
			document.getElementById("previous").style.display="block";
			document.getElementById("previous").style.visibility="visible";
			document.getElementById("next").style.display="block";
			document.getElementById("next").style.visibility="visible";
			document.getElementById("learn-now").style.display="block";
			document.getElementById("learn-now").style.visibility="visible";
			document.getElementById("learn-the-trick").style.display="none";
			document.getElementById("learn-the-trick").style.visibility="hidden";
			document.getElementById("learn-a-trick").style.display="none";
			document.getElementById("learn-a-trick").style.visibility="hidden";
			document.getElementById("show-all-tricks").style.display="none";
			document.getElementById("show-all-tricks").style.visibility="hidden";
			document.getElementById("calculator-challenge").style.display="none";
			document.getElementById("calculator-challenge").style.visibility="hidden";
			
			// trick_show_counter -> 0 -> first trick
			var trick_green_board = document.getElementById("welcome-board");
			trick_green_board.innerHTML=tricksList[trick_show_counter];
			console.log(trick_show_counter);
			// trick_show_counter++;
			// for(var i=0;i<tricksList.length;i++){
				
			// }
			document.getElementById("next").addEventListener('click',function(){
				if(trick_show_counter == tricksList.length){
					//disable next click
					document.getElementById("next").disabled = true;
					// document.getElementById("next").setAttribute('disabled', 'disabled')
					console.log("disabled");
					console.log("next if",trick_show_counter);
				}
				else{
					document.getElementById("next").disabled = false;
					trick_show_counter++;
					trick_green_board.innerHTML=tricksList[trick_show_counter];
					console.log("next",trick_show_counter);
					
				}
				
			});
			document.getElementById("previous").addEventListener('click',function(){
				if(trick_show_counter == 0){
					//disable next click
					document.getElementById("previous").disabled = true;
					// document.getElementById("next").setAttribute('disabled', 'disabled')
					console.log("disabled");
					console.log("if prev",trick_show_counter);
				}
				else{
					document.getElementById("previous").disabled = false;
					trick_show_counter--;
					trick_green_board.innerHTML=tricksList[trick_show_counter];
					console.log("prev",trick_show_counter);
					
				}
				
			});
		});

		document.getElementById("learn-now").addEventListener('click',function(){
			document.getElementById("previous").style.display="none";
			document.getElementById("previous").style.visibility="hidden";
			document.getElementById("next").style.display="none";
			document.getElementById("next").style.visibility="hidden";
			document.getElementById("learn-now").style.display="none";
			document.getElementById("learn-now").style.visibility="hidden";
			document.getElementById("learn-the-trick").style.display="block";
			document.getElementById("learn-the-trick").style.visibility="visible";
			document.getElementById("let-me-try-the-trick").style.display="block";
			document.getElementById("let-me-try-the-trick").style.visibility="visible";
			document.getElementById("learn-a-trick").style.display="none";
			document.getElementById("learn-a-trick").style.visibility="hidden";
			document.getElementById("show-all-tricks").style.display="none";
			document.getElementById("show-all-tricks").style.visibility="hidden";
			document.getElementById("calculator-challenge").style.display="none";
			document.getElementById("calculator-challenge").style.visibility="hidden";
			var trick_green_board = document.getElementById("welcome-board");
			var initial_message_green_board = 'Today, My teacher taught me the trick to ';
			var homework_questions = [
				"find <br /> the Square of any number ending with 5!",
				"find <br /> the Square of numbers just below 100!",
				"<br /> multiply a number with 9",
				"find <br /> the Square of number just above 100!",
				"find the Square of <br /> any three digit number with a zero in between!",
				"<br /> multiply any number with 5!",
				"multiply <br /> a two digit number with 11",
				"multiply two digits <br /> when the sum of the one's digit is 10",
			];
			trick_green_board.innerHTML=initial_message_green_board + homework_questions[trick_show_counter];
			console.log(trick_show_counter,"learn now");
		});
		var tutorial_example_step_counter = 0;
		document.getElementById("learn-the-trick").addEventListener('click',function(){
			document.getElementById("learn-the-trick").style.display="none";
			document.getElementById("learn-the-trick").style.visibility="hidden";
			document.getElementById("let-me-try-the-trick").style.display="none";
			document.getElementById("let-me-try-the-trick").style.visibility="hidden";
			document.getElementById("next-step").style.display="block";
			document.getElementById("next-step").style.visibility="visible";
			document.getElementById("start-over").style.display="block";
			document.getElementById("start-over").style.visibility="visible";
			document.getElementById("welcome-board").style.backgroundImage = "url(../Vedic.activity/img/board.jpg)"; 
			document.getElementById("welcome-board").style.width="900px";
			document.getElementById("welcome-board").style.height="640px"; 
			chosen_tutorial_steps = all_tutorial_steps[trick_show_counter];
			chosen_example_steps = all_example_steps[trick_show_counter];
			tutorial_steps = [];
			tutorial_steps = chosen_tutorial_steps;
			example_steps = [];
			example_steps = chosen_example_steps;
			var trick_green_board = document.getElementById("welcome-board");
			// var bottom_permanent_message = "<p>To learn a step again, We recommend to start over as it helps you learn it meaningfully!</p>";
			trick_green_board.innerHTML="<p id='tuto-step'>"+ tutorial_steps[tutorial_example_step_counter]+"</p>\
			<div><ul id='example_step_list'></ul></div>\
			<p id='exam-step'>"+ example_steps[tutorial_example_step_counter]+"</p>\
			<p>To learn a step again, We recommend to start over as it helps you learn it meaningfully!</p>\
			";
			tutorial_example_step_counter++;
			console.log(chosen_example_steps);
			console.log(chosen_tutorial_steps);

			document.getElementById("next-step").addEventListener('click',function(){
				if(tutorial_example_step_counter < tutorial_steps.length || tutorial_example_step_counter < example_steps.length){
				document.getElementById("tuto-step").innerHTML=tutorial_steps[tutorial_example_step_counter];
				document.getElementById("exam-step").innerHTML=example_steps[tutorial_example_step_counter];
				var node= document.createElement("LI");
				var text = example_steps[tutorial_example_step_counter-1];
				var textnode = document.createTextNode("Step"+tutorial_example_step_counter+" :"+ text );
				node.appendChild(textnode);

				document.getElementById("example_step_list").appendChild(node);
				tutorial_example_step_counter++;
				}
				else{
					console.log("tutorial ends");
					document.getElementById("next-step").style.display="none";
					document.getElementById("next-step").style.visibility="hidden";
					document.getElementById("done").style.display="block";
					document.getElementById("done").style.visibility="visible";
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
