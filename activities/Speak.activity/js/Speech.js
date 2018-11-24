var Speech = (function() {

	var answerFinal = "";
	var playing = "";

	function init(settings){
		//No Initialization as of now.
		document.getElementById('speaklang').innerHTML = settings.language;
		meSpeak.loadConfig("mespeak_config.json");
		loadVoice(settings.language);
	}

	function getBotReply(question){
		var aimlInterpreter = new AIMLInterpreter({name:'WireInterpreter', age:'42'});
		var filesArray = ['js/alice/star.aiml'];
		var words = question.split(' ');
		var marked = new Array(256);
		for(i=0;i<256;i++){
			marked[i] = 0;
		}
		for(i=0; i<words.length; i++){
			if(words[i][0] >= 'a' && words[i][0] <= 'z'){
				if (marked[(words[i].charCodeAt(0)+'A'.charCodeAt(0)-'a'.charCodeAt(0))] == 0){
					marked[(words[i].charCodeAt(0)+'A'.charCodeAt(0)-'a'.charCodeAt(0))] = 1;
					filesArray.unshift("js/alice/" + String.fromCharCode(words[i].charCodeAt(0)+'A'.charCodeAt(0)-'a'.charCodeAt(0)) + ".aiml");
				}
			}
			if((words[i][0] >= 'A' && words[i][0] <= 'Z') || (words[i][0] >= '0' && words[i][0] <= '9')){
				if (marked[words[i].charCodeAt(0)] == 0){
					marked[words[i].charCodeAt(0)] = 1;
					filesArray.unshift("js/alice/" + words[i][0] + ".aiml");
				}
			}
		}
		//console.log(filesArray);
		aimlInterpreter.loadAIMLFilesIntoArray(filesArray);
		answerFinal = "Please ask me something else";

		var callback = function(answer, wildCardArray, input){
			if(answer == null){
				answer = "Please ask me something else";
			}
		    answerFinal = answer.split('.')[0];
		};

		aimlInterpreter.findAnswerInLoadedAIMLFiles(question, callback);
	}

    function testVoice(voice, callback) {
    	var req=new XMLHttpRequest();
		req.url = voice;
    	try {
    		req.open('GET', voice);
    		req.onreadystatechange=function() {
				if (req.readyState==4) {
					callback((req.status==200 || req.status==0) && req.response.length > 0);
				}
			};
    		req.send('');
    	}
    	catch(e) {
    		callback(false);
    	}
    }

	function loadVoice(name, callback) {
		var defaultVoice = meSpeak.getDefaultVoice();
		if (defaultVoice == name || defaultVoice.indexOf(name) == 0) {
			if (callback) callback();
			return;
		}
		var fname = "voices/"+name+".json";
		testVoice(fname, function(exist) {
			if (exist) {
				meSpeak.loadVoice(fname, callback);
			} else {
				document.getElementById('speaklang').innerHTML = "en";
				meSpeak.loadVoice("voices/en.json", callback);
			}
		});
	}

	hiddenArray(); // Access speakArray

	// Function containing the speakArray, which saves the recent talk array
	function hiddenArray() {
		speakArray = [];
	}

	function playVoice(language, text) {
      playing = text;

			//Adds option when text is spoken
			var addUserInput = document.createElement("OPTION");
			addUserInput.setAttribute("value", playing);
			addUserInput.text = playing;
			document.getElementById("combo-box").appendChild(addUserInput);

			speakArray.push(playing); // Adds recent talks to speakArray

      if(document.getElementById('mode').innerHTML=="2"){
	    //After the voice is loaded, playSound callback is called
	    getBotReply(text);
	    setTimeout(function(){
			loadVoice(language, playSound);
		}, 4000);
  	  }
  	  else{
				loadVoice(language, playSound);
  	  }
    }


  function playSound(){
		var text = playing;
		var pitch = document.getElementById('pitch').innerHTML;
		var speed = document.getElementById('rate').innerHTML;
		if(document.getElementById('mode').innerHTML=="2"){
			text = answerFinal;
			console.log(answerFinal);
		}

		function soundComplete(){
			document.getElementById('speaking').innerHTML = "0";
		}

		if (!/iPad|iPhone/.test(navigator.userAgent)) {
			meSpeak.speak(text, {speed: speed, pitch: pitch}, soundComplete);
		} else {
			// HACK: On iOS, need to be played into an HTMLAudio control
			var myDataUrl = meSpeak.speak(text, {speed: speed, pitch: pitch, rawdata: 'data-url'}, soundComplete);
			var sound = new Audio(myDataUrl);
			sound.addEventListener("ended", function(){
				document.getElementById('speaking').innerHTML = "0";
			});
			sound.play();
		}
    }

	return {
        init: init,
		playVoice: playVoice
    };

});
