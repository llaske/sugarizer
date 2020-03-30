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
		var all_explanation_steps = {
			0: [
				'So let\'s look at the math behind finding \nthe square of a number ending with 5',
				'We will just recollect our algebraic skills. \n (ax + b)² = a² . x² + 2 * a * b * x + b²',
				'Now, take 25 for example. In the above form.',
				'25 is twice of 10 + 5. (10*2 + 5)',
				'Likewise for any number ending with 5, \nit will be (a * 10 + 5)',
				'Back to algebra!, \n(10a + 5)² = a² * 10²+ 2 * 10 * a * 5 + 5²',
				'= a² . 10² + a * 10²+ 5²',
				'= a * (a + 1) * 10² + 25',
				'To add a 2 digits number with 100, replace 0s',
				'So, a * (a + 1) | 25 is the answer!',
				'For 25, 2 * (2 + 1) | 25.'
			],
			1: [
				'So let’s look at the math behind finding\nthe square of a number just below 100?',
				'Say for example, we shall take 96.',
				'Is that OK to write 96 as (100 - 4)?',
				'To find 96², we will find (100 - 4)²',
				'Cool, Now recollect your algebraic skills!\n (a-b)² = a² - 2 * a * b + b²',
				'Now,In the decimal system, \n100 * 100 is 100 shifted to the left two places',
				'That is 100² + 4²  = 10016 \njust from the place values',
				'The trick here is to subtract 8 * 100. \nThat accounts a * (b * 2)',
				'However, by place value this is subtracting \n8 from 100.  (100 - 8) = 92',
				'So we get (96 - 4) or (100 - 8) | 4²',
				'Simply is (Number - difference) | difference²'
			],
			2: [
				'Than a proof, we will see a quick intuitive \nway to multiply a number xy with 9.',
				'Say for example, we will take 68. \nHere x is 6 and y is 8. To find 68 * 9,',
				'We can find ( 68 * 10 ) - 68',
				'Since the 6 in 68 represents 60 it \ndoesn\'t change the 1s place of the product.',
				'It is determined by 9 * y. That is 9 * 8.',
				'As y increases by 1, the 1s place decreases \nby 1 and so we need to subtract.',
				'And hence, shortly we see it as,',
				'(68 - 7) | (10 - 8).'
				
			],
			3: [
				'So let’s look at the math behind finding \nthe square of a number just above 100?',
				'Say for example, we shall take 104.',
				'Is that OK to write 104 as (100 + 4)?',
				'To find 104², we will find (100 + 4)²',
				'Cool, Now recollect your algebraic skills! \n(a+b)² = a² + 2 * a * b + b²',
				'Now, In the decimal system, \n100 * 100 is 100 shifted to the left two places',
				'That is 100² + 4²  = 10016 \njust from the place values',
				'The trick here is to add 8 * 100. \nThat accounts a * (b * 2)',
				'However, by place value this is just \nadding 8 to 100.  (100 + 8) = 108',
				'So we get (104 + 4) or (100 + 8) | 4²',
				'Simply is (Number + surplus) | surplus²'
			],
			4: [
				'Does it look intimidating?! It’s so simple.' ,
				'Recollect your algebraic skills! \n(a+b)² = a² + 2 * a * b + b²',
				'Now take an example, (504)².',
				'That is, (5 * 100 + 4 * 1)² \n= 5 * 5 * 100 * 100 + 40 * 100 + 16',
				'And to our rescue, we just use \nthe position value of the numbers',
				'Simply, num * 100 is moving to the left, \ntwo digits.',
				'Likewise, num * 100 * 100 is moving \nto the left, four digits.',
				'And so we get 254016.'
			
			],
			5: [
				'This is a good example of Halving and doubling, \nan ancient means of multiplication.', 
				'For example, 64 * 5 = 32 * 10. \nWhere 32 is half of 64.',
				'But as odd numbers have their \ndecimals while halved, be careful.',
				'We just need to include them.',
				'In terms of the trick, \n63 * 5 = (31 * 10) + 5 = 315',
			],
			6: [
				'Say for example, you take 43 * 11',
				'We write 11 as 10 + 1 and mutliply 43 with it.',
				'43 * (10 + 1) = 43 * 10 + 43',
				'Where, 430 is (4 * 100 + 3 * 10)\nAnd 43 is (4 * 10 + 3)',
				'= 4 * 100 + 3 * 10 + 4 * 10 + 3',
				'Surprise!,  4+3 goes in the 10s place\nwhile we group the 10s',
				'And simply add numbers by place value.',
				'It is x | x+y | y which is 4 | (7) | 1.'
			],
			7: [
				'We shall take an example, 43 * 47.',
				'We can write it as (40 + 3) * 47 and on expanding,',
				'43 * 47 = 40 * 47 + 3 * 47',
				'= 40 * (40+7) + 3 * (40+7)',
				'= 40² + 40 * 7 + 40 * 3 + 3 * 7',
				'= 16 * 100 + 40 * (7+3) + 21',
				'= 16 * 100 + 4 * 100 + 40 * 10 +21',
				'= 20 * 100 + 2 * 10 + 1',
				'So the requirement that the numbers in \nthe 10s place be the same is to create a square.',
				'And the 7 + 3 = 10 to move the result \nleft one place.'
			
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
			document.getElementById("curiosity-clicks").style.display="block";
			document.getElementById("curiosity-clicks").style.visibility="visible";
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
					document.getElementById("curiosity-clicks").style.display="display";
			document.getElementById("curiosity-clicks").style.visibility="visible";
				}
				
			});
		});

		
		var curiosity_step_counter=0;
		document.getElementById("curiosity-clicks").addEventListener('click',function(){
			document.getElementById("start-over").style.display="none";
			document.getElementById("start-over").style.visibility="hidden";
			document.getElementById("curiosity-clicks").style.display="none";
			document.getElementById("curiosity-clicks").style.visibility="hidden";
			document.getElementById("next-step").style.display="block";
			document.getElementById("next-step").style.visibility="visible";
			document.getElementById("welcome-board").style.backgroundImage = "url(../Vedic.activity/img/board.jpg)"; 
			document.getElementById("welcome-board").style.width="900px";
			document.getElementById("welcome-board").style.height="640px";
			chosen_curiosity_steps = all_explanation_steps[trick_show_counter];
			curiosity_steps = [];
			curiosity_steps = chosen_curiosity_steps;
			console.log(curiosity_steps);
			var trick_green_board = document.getElementById("welcome-board");
			// var bottom_permanent_message = "<p>To learn a step again, We recommend to start over as it helps you learn it meaningfully!</p>";
			trick_green_board.innerHTML="<div><ul id='curiosity_step_list'></ul></div>\
			<p id='curiosity-step'>"+ curiosity_steps[curiosity_step_counter]+"</p>\
			";
			curiosity_step_counter++;
			console.log("main",curiosity_step_counter);
			console.log("len",curiosity_steps.length)
			console.log("trick show counter",trick_show_counter);
			document.getElementById("next-step").addEventListener('click',function(){
				if(curiosity_step_counter < curiosity_steps.length){
				document.getElementById("curiosity-step").innerHTML=curiosity_steps[curiosity_step_counter];
				// document.getElementById("exam-step").innerHTML=example_steps[curiosity_step_counter];
				var node= document.createElement("LI");
				var text = curiosity_steps[curiosity_step_counter-1];
				var textnode = document.createTextNode("Step"+curiosity_step_counter+" :"+ text );
				node.appendChild(textnode);

				document.getElementById("curiosity_step_list").appendChild(node);
				curiosity_step_counter++;
				}
				else{
					console.log("tutorial ends");
					document.getElementById("next-step").style.display="none";
					document.getElementById("next-step").style.visibility="hidden";
					document.getElementById("done").style.display="block";
					document.getElementById("done").style.visibility="visible";
				}
				console.log("in",curiosity_step_counter);
				
			});
		});
		var question_num, question_txt, answer_helper_left, answer_helper_right;
		function getRandomInt(min, max) {
			return Math.floor(Math.random() * (max - min + 1)) + min;
		}
		var lollipops_count=0;
		function verifyAnswer(a,b,c) {
			var answered_right = false;
			var user_answer = (parseInt(a) != NaN) ? parseInt(a) : 0
			console.log("user_answer",user_answer);
			switch(b) {
			case 0:
			  if (user_answer === c.question_num * c.question_num) {
				answered_right = true;
				console.log("t");
			}
			break;
		  
			case 1:
			  if (user_answer === c.question_num * c.question_num) {
				answered_right = true;
			}
			break;
		  
			case 2:
			  if (user_answer === c.question_num * 9) {
				answered_right = true;
			}
			break;
		  
			case 3:
			  if (user_answer === c.question_num * c.question_num) {
				answered_right = true;
			}
			break;
		  
			case 4:
			  if (user_answer === c.question_num * c.question_num) {
				answered_right = true;
			}
			break;
		  
			case 5:
			  if (user_answer === c.question_num * 5) {
				answered_right = true;
			}
			break;
		  
			case 6:
			  if (user_answer === c.question_num * 11) {
				answered_right = true;
			}
			break;
		  
			case 7:
			  if (user_answer === c.question_num[0] * c.question_num[1]) {
				answered_right = true;
			}
			break;
		  
			default:
			// break;
			}
			
			if (answered_right) {
			  lollipops_count = lollipops_count + 10;
			  document.getElementById("lollipop").innerHTML=lollipops_count;
			//   if(lollipops_count >= 100) {
			// 	game.state.start('end');
			//   }
			console.log(answered_right);
			document.getElementById("let-me-try-the-trick-answer").style.borderColor="green";
			fun();
			setTimeout(colorNeutral,2000);
			// document.getElementById("let-me-try-the-trick-answer").style.borderColor="";
			//   setQuestion();
			}
			if(!answered_right){
				
				document.getElementById("let-me-try-the-trick-answer").style.borderColor="red";
				setTimeout(colorNeutral,2000);
			}
			document.getElementById("let-me-try-the-trick-answer").value="";
			// answer_field.destroy();
			// setInputField(answered_right);
			// answer_field.focus();  
		  }
		  function colorNeutral(){
			document.getElementById("let-me-try-the-trick-answer").style.borderColor="";
		  }
		

		  function setQuestion(a){
			switch(a) {
				case 0:
				//Square of a number ending with 5
				var question_num = Math.round(Math.random() * 9) * 10 + 5;
				var first_digit = Math.floor(question_num/10);
			
				var question_txt = '( ' + question_num + ' )²';
				var answer_helper_left = first_digit + ' * Next number to ' + first_digit + '  (' + (++first_digit) + ')';
				var answer_helper_right = '5 * 5';
				var answer_helper_middle = '';
				var ret = {
					question_num:question_num,
					question_txt:question_txt,
					answer_helper_left:answer_helper_left,
					answer_helper_right:answer_helper_right,
					answer_helper_middle:answer_helper_middle
				};
				return ret;
				
				break;
			
				case 1:
				//Square of numbers just below 100
				var question_num = getRandomInt(91, 96);
			
				var question_txt = '( ' + question_num + ' )²';
				var answer_helper_middle = '';
				var answer_helper_left = question_num +' - '+ (100 - question_num);
				var answer_helper_right = 'Square of '+ (100 - question_num);
				var ret = {
					question_num:question_num,
					question_txt:question_txt,
					answer_helper_left:answer_helper_left,
					answer_helper_right:answer_helper_right,
					answer_helper_middle:answer_helper_middle
				};
				return ret;
				break;
			
				case 2:
				// multiply a number with 9
				var question_num = getRandomInt(10, 99);
				var first_digit = Math.floor(question_num/10);
				var second_digit = Math.floor(question_num%10);
			
				var question_txt = '( ' + question_num + ' ) * 9';
				var answer_helper_middle = '';
				var answer_helper_left = question_num +' - '+ (first_digit + 1);
				var answer_helper_right = '10 - '+ second_digit;
				var ret = {
					question_num:question_num,
					question_txt:question_txt,
					answer_helper_left:answer_helper_left,
					answer_helper_right:answer_helper_right,
					answer_helper_middle:answer_helper_middle
				};
				return ret;
				break;
				case 3:
				// Square of number just above 100
				var question_num = getRandomInt(104, 109);
			
				var question_txt = '( ' + question_num + ' )²';
				var answer_helper_middle = '';
				var answer_helper_left = question_num +' + '+ (question_num - 100);
				var answer_helper_right = 'Square of '+ (question_num - 100);
				var ret = {
					question_num:question_num,
					question_txt:question_txt,
					answer_helper_left:answer_helper_left,
					answer_helper_right:answer_helper_right,
					answer_helper_middle:answer_helper_middle
				};
				return ret;
				break;
			
				case 4:
				// square of any three digit number with a zero in between
				var question_num = getRandomInt(101, 109) + Math.round((Math.random() * 5)) * 100;
				var first_digit = Math.floor(question_num/100);
				var last_digit = Math.floor(question_num%10);
			
				var question_txt = '( ' + question_num + ' )²'; 
				var answer_helper_middle = '(' + first_digit +') * ('+ last_digit + ') * 2';
				var answer_helper_left = 'Square of '+ first_digit;
				var answer_helper_right = 'Square of '+ last_digit;
				var ret = {
					question_num:question_num,
					question_txt:question_txt,
					answer_helper_left:answer_helper_left,
					answer_helper_right:answer_helper_right,
					answer_helper_middle:answer_helper_middle
				};
				return ret;
				break;
			
				case 5:
				// multiply any number with 5
				var question_num = getRandomInt(10, 49) * 2;
			
				var question_txt = '( ' + question_num + ' ) * 5'; 
				var answer_helper_middle = 'Half of '+ question_num + ' * 10';
				var answer_helper_left = '';
				var answer_helper_right = '';
				var ret = {
					question_num:question_num,
					question_txt:question_txt,
					answer_helper_left:answer_helper_left,
					answer_helper_right:answer_helper_right,
					answer_helper_middle:answer_helper_middle
				};
				return ret;
				break;
				
				case 6:
				// multiply a two digit number with 11  
				while(true) {
					var question_num = getRandomInt(10, 99);
					if((Math.floor(question_num/10) + Math.floor(question_num%10) ) < 10)
					break;
				}
				var first_digit = Math.floor(question_num/10);
				var second_digit = Math.floor(question_num%10);
			
				var question_txt = '( ' + question_num + ' ) * 11'; 
				var answer_helper_middle = first_digit +' + '+ second_digit;
				var answer_helper_left = 'First digit ('+ first_digit +')';
				var answer_helper_right = 'Last digit ('+ second_digit +')';
				var ret = {
					question_num:question_num,
					question_txt:question_txt,
					answer_helper_left:answer_helper_left,
					answer_helper_right:answer_helper_right,
					answer_helper_middle:answer_helper_middle
				};
				return ret;
				break;
			
				case 7:
				// multiply two digits when the sum of the one's digit is 10
				var question_num = getRandomInt(20, 99);
				var first_digit = Math.floor(question_num/10);
				var question_num_one = question_num;
				var question_num_two = question_num + ((10 - Math.floor(question_num%10)) - Math.floor(question_num%10));
			
				var question_txt = '( ' + question_num_one + ' * '+ question_num_two +' )'; 
				var answer_helper_middle = '';
				var answer_helper_left = first_digit +' * Next number to '+ first_digit +' (' + first_digit +' * '+ (first_digit + 1) +')';
				var answer_helper_right =  (Math.floor(question_num_one%10)) +' * '+ (Math.floor(question_num_two%10));
			
				question_num = [question_num_one, question_num_two];
				var ret = {
					question_num:question_num,
					question_txt:question_txt,
					answer_helper_left:answer_helper_left,
					answer_helper_right:answer_helper_right,
					answer_helper_middle:answer_helper_middle
				};
				return ret;
				break;
			
				case 8:
			
				case 9:
			
				default:
			}
		  }
		var values;
		var val;
		function getQuestions(ab){
			val=setQuestion(ab);
			return val;
		}
		document.getElementById("let-me-try-the-trick").addEventListener('click',function(){
			console.log("let me try the trick clicked");
			document.getElementById("welcome-board").style.backgroundImage = "url(../Vedic.activity/img/homework_template_3.gif)"; 
			document.getElementById("welcome-board").style.width="900px";
			document.getElementById("welcome-board").style.height="640px";
			document.getElementById("submit").style.display="block";
			document.getElementById("submit").style.visibility="visible";
			console.log(trick_show_counter);

			values=getQuestions(trick_show_counter);

			var trick_green_board = document.getElementById("welcome-board");
			// var bottom_permanent_message = "<p>To learn a step again, We recommend to start over as it helps you learn it meaningfully!</p>";
			
			trick_green_board.innerHTML="<div id='timer'></div>\
			<div id='lollipop'></div>\
			<div id='let-me-try-the-trick-question'>problem question</div>\
			<div id='left_helper'>a</div>\
			<div id='middle_helper'>a</div>\
			<div id='right_helper'>b</div>\
			<input type='text' id='let-me-try-the-trick-answer' placeholder='Your answer'>";
			document.getElementById("let-me-try-the-trick-question").innerHTML = values.question_txt;
			document.getElementById("left_helper").innerHTML = values.answer_helper_left;
			document.getElementById("middle_helper").innerHTML =values.answer_helper_middle;
			document.getElementById("right_helper").innerHTML = values.answer_helper_right;
			
			// verifyAnswer(document.getElementById("let-me-try-the-trick-answer").value,trick_show_counter);
			// var user_answerr = document.getElementById("let-me-try-the-trick-answer").value;
			
			// console.log(user_answer);
		});
		function fun(){
			
			values=getQuestions(trick_show_counter);
			document.getElementById("let-me-try-the-trick-question").innerHTML = values.question_txt;
			document.getElementById("left_helper").innerHTML = values.answer_helper_left;
			document.getElementById("middle_helper").innerHTML =values.answer_helper_middle;
			document.getElementById("right_helper").innerHTML = values.answer_helper_right;
		}
		document.getElementById("submit").addEventListener('click',function(){
			console.log(document.getElementById("let-me-try-the-trick-answer").value);
			verifyAnswer(document.getElementById("let-me-try-the-trick-answer").value,trick_show_counter,values);
			console.log("reached");
			// fun();
		});
		document.getElementById("learn-a-trick").addEventListener('click',function(){
			console.log("clicked learn-a-trick");
		});

		document.getElementById("calculator-challenge").addEventListener('click',function(){
			console.log("clicked calculator-challenge");
		});





		
	});

});
