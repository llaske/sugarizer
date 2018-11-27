define(["sugar-web/graphics/palette","sugar-web/env","webL10n","sugar-web/datastore"], function (palette,env,l10n,datastore) {

	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext('2d');
	canvas.width  = window.innerWidth;
  	canvas.height = window.innerHeight-55;
	var windowWidth = canvas.getBoundingClientRect().width;
	var windowHeight = canvas.getBoundingClientRect().height;
	var shiftY = 45;

	var radiusEye = Math.min(windowWidth,windowHeight)/6.5;
	var radiusEyeball = Math.min(windowWidth,windowHeight)/28;
	var eyePos = [{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0}];
	var mouthStart = {x:windowWidth*1.35/4,y:shiftY+windowHeight*2/3.0};
	var mouthEnd = {x:windowWidth*2.65/4,y:shiftY+windowHeight*2/3.0};
	var noOfEyes = 2;

	$(window).resize(function() {
		canvas.width  = window.innerWidth;
  		canvas.height = window.innerHeight-55;
  		windowWidth = canvas.getBoundingClientRect().width;
		windowHeight = canvas.getBoundingClientRect().height;
  		mouthStart = {x:windowWidth*1.35/4,y:shiftY+windowHeight*2/3.0};
		mouthEnd = {x:windowWidth*2.65/4,y:shiftY+windowHeight*2/3.0};
		radiusEye = Math.min(windowWidth,windowHeight)/6.5;
		radiusEyeball = Math.min(windowWidth,windowHeight)/28;
  		setEyes();
	})

	canvas.addEventListener('mousemove', function(evt) {
        setMousePosition(canvas, evt);
      }, false);

	// Detect if the browser is IE or not
	var IE = document.all?true:false
	var mouseX = -1,mouseY = -1;
	var mouthYdiff = 0.0;
	var mouthDirection = 1;
	var mouthTimeout;
	var speech = null;
	var sugarSettings = {};
	var first = true;

	function init(){
		speech = Speech();
		env.getEnvironment(function(err, environment) {
			var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language;
			if (!environment.user) environment.user = { language: defaultLanguage };
			sugarSettings = environment.user;
			speech.init(sugarSettings);
			// If not IE, setup mouse for capture
			if (!IE){
				document.captureEvents(Event.MOUSEMOVE)
			}
			var FPS = 30;
			setInterval(function() {
			  updateCanvas();
			}, 1000/FPS);
			window.addEventListener('localized', function() {
				if (first) {
					l10n.language.code = sugarSettings.language;
					first = false;
					return;
				} else {
					localize();
					var timer = window.setTimeout(function() {
					window.clearTimeout(timer);
						var language = document.getElementById('speaklang').innerHTML;
						var text = l10n.get("TypeSomething", {name:sugarSettings.name});
						document.getElementById("combo-box").title = l10n.get("SavedTalk"); // Localized Saved talk title.
						document.getElementsByClassName("dropdown").title = l10n.get("SavedTalk"); // Localized Saved talk title.
						speech.playVoice(language, text);
						moveMouth(text);
					}, 100);
				}
			});
		});
	}

	function hidePalettes(){
		var palettes = document.getElementsByClassName('palette');
		for(var i=0;i<palettes.length;i++){
			palettes[i].style.visibility="hidden";
		}
	}

	document.getElementById('userArea').onmouseup = function(e){
		hidePalettes();
	}

	function setEyes(eyes){
		var i;
		var rect = canvas.getBoundingClientRect();
		var width = rect.width - rect.width/4.5;
		var height = rect.height;
		var center = rect.width/2;
		var offset = (width*(eyes)/(5))/(eyes-1); //The max offset with 5 eyes
		//console.log(offset);
		if(eyes%2 == 0){
			for(i=0;i<Math.floor(eyes/2);i++){
				eyePos[i+1].x = (center - offset/2) - (Math.floor(eyes/2)-i-1)*offset;
				eyePos[i+1].y = shiftY+height/3;
			}
			for(i=0;i<Math.floor(eyes/2);i++){
				eyePos[i+Math.floor(eyes/2)+1].x = (center + offset/2) + i*offset;
				eyePos[i+Math.floor(eyes/2)+1].y = shiftY+height/3;
			}
		}
		if(eyes%2 == 1){
			eyePos[1].x = center;
			eyePos[1].y = shiftY+height/3;
			for(i=0;i<Math.floor(eyes/2);i++){
				eyePos[i+2].x = center - (Math.floor(eyes/2)-i)*offset;
				eyePos[i+2].y = shiftY+height/3;
			}
			for(i=0;i<Math.floor(eyes/2);i++){
				//console.log(i+Math.floor(eyes/2)+2);
				eyePos[i+Math.floor(eyes/2)+2].x = center + (i+1)*offset;
				eyePos[i+Math.floor(eyes/2)+2].y = shiftY+height/3;
			}
		}
		//console.log(eyePos[1]);
	}

	function setMousePosition(canvas, evt){
		var rect = canvas.getBoundingClientRect();
		mouseX = (evt.clientX - rect.left)*canvas.width/rect.width;
		mouseY = (evt.clientY - rect.top)*canvas.height/rect.height;
	}

	function drawEyes(){
		var i;
		var eyetype = document.getElementById('eyetype').innerHTML;
		for(i=1;i<=noOfEyes;i++){
			ctx.beginPath();
			ctx.fillStyle="#000000";
			if (eyetype == 1) {
				ctx.arc(eyePos[i].x,eyePos[i].y,radiusEye*1.1,0,2*Math.PI);
				ctx.fill();
			} else {
				var rectsize = radiusEye*1.1;
				ctx.fillRect(eyePos[i].x-rectsize,eyePos[i].y-rectsize,rectsize*2,rectsize*2);
			}
			ctx.closePath();
		}
		for(i=1;i<=noOfEyes;i++){
			ctx.beginPath();
			ctx.fillStyle="#FFFFFF";
			if (eyetype == 1) {
				ctx.arc(eyePos[i].x,eyePos[i].y,radiusEye,0,2*Math.PI);
				ctx.fill();
			} else {
				var rectsize = radiusEye;
				ctx.fillRect(eyePos[i].x-rectsize,eyePos[i].y-rectsize,rectsize*2,rectsize*2);
			}
			ctx.closePath();
		}
	}

	function getEyeballOffset(eye){ //eye=1 for the first eye and so on...
		var offsetX,offsetY;
		var baseoffset = 0.30*windowWidth/(noOfEyes+2);
		var ratio = (1)/(noOfEyes+2);
		if(mouseX == -1 && mouseY == -1){
			offsetX = 0;
			offsetY = 0;
		}
		else{
			offsetX = mouseX - eyePos[eye]['x'];
			offsetY = mouseY - eyePos[eye]['y'];
		}
		var xMult=1,yMult=1;
		if(offsetX < 0){
			xMult = -1;
		}
		if(offsetY < 0){
			yMult = -1;
		}
		var angle = Math.atan(Math.abs(offsetY/offsetX));
		if(isNaN(angle)){
			angle = 0.0;
		}
		return {x:xMult*Math.min((radiusEye-radiusEyeball)*Math.cos(angle),Math.abs(offsetX)),
			y:yMult*Math.min((radiusEye-radiusEyeball)*Math.sin(angle),Math.abs(offsetY))}
	}

	function drawEyeballs(){
		var i;
		for(i=1;i<=noOfEyes;i++){
			ctx.beginPath();
			ctx.fillStyle="#000000";
			ctx.arc(eyePos[i].x + getEyeballOffset(i).x,eyePos[i].y + getEyeballOffset(i).y,radiusEyeball,0,2*Math.PI);
			ctx.fill();
			ctx.closePath();
		}
	}

	document.getElementById('speakText').onmousedown = function(e){
		var language = document.getElementById('speaklang').innerHTML;
		var text = document.getElementById('userText').value;
		speech.playVoice(language, text);
	}

	document.getElementById('speakText').onmouseup = function(e){
		var text = document.getElementById('userText').value;
		moveMouth(text);
		if(document.getElementById('mode').innerHTML == "3"){
			addToChat();
		}
	}

	document.getElementById('userText').onkeypress = function(e) {
		var key = e.keyCode || e.which;
		if (key == 13) {
			var language = document.getElementById('speaklang').innerHTML;
			var text = document.getElementById('userText').value;
			speech.playVoice(language, text);
			moveMouth(text);
			if(document.getElementById('mode').innerHTML == "3"){
				addToChat();
			}
		}
	}

	document.getElementById('userText').oninput = function(e) {
		var bounding = this.getBoundingClientRect();
		var position = { clientX: bounding.left + 20*document.getElementById('userText').selectionStart, clientY: bounding.top };
		setMousePosition(canvas, position);
		updateCanvas();
	}

	document.getElementById('userText').addEventListener('mousemove', function(evt) {
        setMousePosition(canvas, evt);
        updateCanvas();
    }, false);

	document.getElementById('gamemode1-button').onmouseup = function(e){
		//The type something to hear it mode
		document.getElementById('mode').innerHTML = "1";
		document.getElementById('canvas').style.display = "block";
		closeChat();
	}

	document.getElementById('gamemode2-button').onmouseup = function(e){
		//The robot mode
		document.getElementById('mode').innerHTML = "2";
		document.getElementById('canvas').style.display = "block";
		closeChat();
	}

	document.getElementById('gamemode3-button').onmouseup = function(e){
		//The chat mode
		document.getElementById('mode').innerHTML = "3";
		document.getElementById('canvas').style.display = "none";
		setupChat();
	}

	function setupChat(){
		document.getElementById('chat').style.display = "block";
	}

	function closeChat(){
		document.getElementById('chat').style.display = "none";
	}

	function addToChat(){
		var text = document.getElementById('userText').value;
		var chatbox = document.getElementById('chatbox');
		var li = document.createElement("li");
		li.style.borderRadius = "10px";
		li.style.backgroundColor = "#999999";
		li.style.listStyleType = "none";
		li.style.padding = "15px";
		li.style.margin = "-15px";
		li.appendChild(document.createTextNode(text));
		chatbox.appendChild(li);
	}

	function animateMouth(speed){
		//console.log('animateMouthcalled');
		if(document.getElementById('speaking').innerHTML == "0"){
			clearInterval(mouthTimeout);
			mouthYdiff = 0;
		}
		var change = speed/70+1;
		change = Math.min(4,change);
		change = Math.max(1,change);
		if(mouthDirection==1){
			mouthYdiff -= change;
			if(mouthYdiff<-40){
				mouthDirection = 2;
			}
		}
		else if(mouthDirection==2){
			mouthYdiff += change;
			if(mouthYdiff>40){
				mouthDirection = 1;
			}
		}
	}

	function startMouthAnim(){
		var speed = document.getElementById('rate').innerHTML;
		var interval = 0.01;
		document.getElementById('speaking').innerHTML = 1;
		mouthTimeout = setInterval(function(){
			animateMouth(speed);
		},interval*1000);
	}

	function moveMouth(text){
		if(text != ""){
			if(document.getElementById('mode').innerHTML=="2"){
				setTimeout(function(){
					startMouthAnim();
				}, 4000);
			}
			else{
				startMouthAnim();
			}
		}
	}

	function drawMouth(){
		ctx.beginPath();
		ctx.moveTo(mouthStart.x,mouthStart.y);
		ctx.bezierCurveTo(mouthStart.x+100,mouthStart.y+mouthYdiff,mouthEnd.x-100,mouthEnd.y+mouthYdiff,mouthEnd.x,mouthEnd.y);
		ctx.lineWidth = 10;
		ctx.stroke();
		ctx.closePath();
		ctx.beginPath();
		ctx.moveTo(mouthStart.x,mouthStart.y);
		ctx.bezierCurveTo(mouthStart.x+100,mouthStart.y-mouthYdiff,mouthEnd.x-100,mouthEnd.y-mouthYdiff,mouthEnd.x,mouthEnd.y);
		ctx.lineWidth = 10;
		ctx.stroke();
		ctx.closePath();
	}

	function updateCanvas(){
		clearCanvas();
		noOfEyes = parseInt(document.getElementById('numeyes').innerHTML);
		setEyes(noOfEyes);
		drawEyes();
		drawEyeballs();
		drawMouth();
	}

	function clearCanvas(){
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.beginPath();
		ctx.rect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = "#999999";
		ctx.fill();
	}

	function localize() {
		document.getElementById('gamemode1-button').title = l10n.get("TypeSomethingToHear");
		document.getElementById('gamemode2-button').title = l10n.get("AskRobot");
		document.getElementById('gamemode3-button').title = l10n.get("VoiceChat");
		document.getElementById('language-button').title = l10n.get("Language");
		document.getElementById('speech-button').title = l10n.get("Speech");
		document.getElementById('face-button').title = l10n.get("Face");
		document.getElementById('ratelabel').innerHTML = l10n.get("ratelabel");
		document.getElementById('pitchlabel').innerHTML = l10n.get("pitchlabel");
		document.getElementById('eyesnumber').innerHTML = l10n.get("eyesnumber");
		document.getElementById('eyes').title = l10n.get("eyes");
		document.getElementById('glasses').title = l10n.get("glasses");
		document.getElementById('speakText').title = l10n.get("speak");
		document.getElementById('lang-en').innerHTML = l10n.get('langen');
		document.getElementById('lang-ca').innerHTML = l10n.get('langca');
		document.getElementById('lang-cs').innerHTML = l10n.get('langcs');
		document.getElementById('lang-de').innerHTML = l10n.get('langde');
		document.getElementById('lang-el').innerHTML = l10n.get('langel');
		document.getElementById('lang-eo').innerHTML = l10n.get('langeo');
		document.getElementById('lang-es').innerHTML = l10n.get('langes');
		document.getElementById('lang-fi').innerHTML = l10n.get('langfi');
		document.getElementById('lang-fr').innerHTML = l10n.get('langfr');
		document.getElementById('lang-hu').innerHTML = l10n.get('langhu');
		document.getElementById('lang-it').innerHTML = l10n.get('langit');
		document.getElementById('lang-kn').innerHTML = l10n.get('langkn');
		document.getElementById('lang-la').innerHTML = l10n.get('langla');
		document.getElementById('lang-lv').innerHTML = l10n.get('langlv');
		document.getElementById('lang-nl').innerHTML = l10n.get('langnl');
		document.getElementById('lang-pl').innerHTML = l10n.get('langpl');
		document.getElementById('lang-pt').innerHTML = l10n.get('langpt');
		document.getElementById('lang-ro').innerHTML = l10n.get('langro');
		document.getElementById('lang-sk').innerHTML = l10n.get('langsk');
		document.getElementById('lang-sv').innerHTML = l10n.get('langsv');
		document.getElementById('lang-tr').innerHTML = l10n.get('langtr');
		document.getElementById('lang-zh').innerHTML = l10n.get('langzh');
	}

	init();
});
