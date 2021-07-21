// Rebase require directory
requirejs.config({
	baseUrl: "lib",
	paths: {
		activity: "../js"
	}
});

// Vue main app
var app = new Vue({
	el: '#app',
	data: {
		environment: null,
		grid: true,
		modeId: "grid-mode",
		images: [],
		activeImage: "",
		activeImageIndex: 0,
		previousBtnId: null,
		nextBtnId: null,
		recordIconId: null,
		recording: false,
		recordRTC: null,
		mediaStream: null,
		gridAudioRecord: null,
		singleAudioRecords: [],
		audio: null,
		isPlaying: false,
		playIconId: "play",
		currentTime: 0,
		imageCount: 9,	//update with Image slider
		imageLoaded: 0,
		intervalIds: [],
		colors: null,
		isLoaded: false,
		sizes: ['16px', '24px', '32px' ,'40px', '48px' , '56px', '64px' , '72px' , '80px' , '100px'],
		gridEditorContent: null,
		singleEditorsContent: [],
		editor: null,
		fontColor: null,
		backgroundColor: null,
		fontSelected: null,
		fontSize:null
	},
	methods: {
		initialized: function () {
			// Sugarizer initialized
			var environment = this.$refs.SugarActivity.getEnvironment();	
			this.environment = environment;
			this.colors = [environment.user.colorvalue.fill, environment.user.colorvalue.stroke, '#FFFFFF'];
			if (this.activeImageIndex===0){
				this.previousBtnId = "previous-btn-inactive";
				this.nextBtnId = "next-btn"; 
			} else if (this.activeImageIndex===this.image.length - 1){
				this.previousBtnId = "previous-btn";
				this.nextBtnId = "next-btn-inactive"; 
			}
			this.recordIconId = "record";
			// document.getElementById('grid-mode').classList.add("active");
			for (var i=0; i<this.imageCount; i++){
				this.singleEditorsContent.push(null);
				this.singleAudioRecords.push(null);
			}
			this.loadEditor();			
		},
		imageLoaders: function(){
			function getRandomInt (min, max) {
				min = Math.ceil(min);
				max = Math.floor(max);
				return Math.floor(Math.random() * (max - min + 1)) + min;
			}
			const that = this;
			function getColor(){
				return that.colors[getRandomInt(0,2)];
			}
			var quesimgs = document.getElementsByClassName('questionmark');
			var len = quesimgs.length;
			if (!this.grid) len=1;
			for (var i=0; i<len; i++){
				quesimgs[i].style.background = getColor();
				(function (i){
					var intervalId = setInterval(function(){quesimgs[i].style.background = getColor()}, 900);
					that.intervalIds.push(intervalId);
				})(i);
			}
		},
		loadImages: function(){
			var xhr = new XMLHttpRequest();
			var imgs = [];
			var that = this;
			var source = document.location.href.substr(0, document.location.href.indexOf("/activities/"))+"/activities/Abecedarium.activity/database/db_meta.json";
		
			function checkFileExists (urlToFile) {
				try {
					var req = new XMLHttpRequest();
					req.open('HEAD', urlToFile, false);
					req.send();
					if (req.status === 200 || req.response != ""){
						return true;
					} else {
						return false;
					}	
				} catch (error) {
					return false;
				}
			}
			xhr.onload = function(){
					var data;
					data  = JSON.parse(xhr.response);
					for (var i=0; i<that.imageCount; i++){
						var img = data[Math.floor(Math.random() *  data.length)].code;
						var imgCheck = checkFileExists(document.location.href.substr(0, document.location.href.indexOf("/activities/"))+"/activities/Abecedarium.activity/images/database/"+img+".png");
						if (imgs.indexOf(img)===-1 && imgCheck==true){
							imgs.push(img);
						} else {
							i--;
						}
					}
					that.images = imgs;
					that.activeImage = that.images[that.activeImageIndex];
					if (!that.grid){ 
						that.isLoaded = true;
						for (var i=0; i<that.imageCount; i++){
							clearInterval(that.intervalIds[i]);
						}
					}
			};
			xhr.onerror = function(err){
				console.log("Error: ", xhr.statusText);
			};
			xhr.open("GET", source);
			xhr.send();
		},
		loadEditor: function(){
			var container = document.getElementById('editor-area');
			var editor = new Quill(container, {
				modules: {
				  toolbar: '.toolbar-container'
				},
			  });
			editor.format('size', '24px');
			this.editor = editor;
		},
		updateEditor: function(){
			this.fontColor != null && this.editor.format('color',this.fontColor);
			this.backgroundColor!=null && this.editor.format('background-color',this.backgroundColor);
			this.fontSelected !=null &&	this.editor.format('font', this.fontSelected);
			this.fontSize !=null ? this.editor.format('size', this.fontSize) : this.editor.format('size', '24px');
		},
		getUrlImg: function(img){
			return '../Abecedarium.activity/images/database/'+ img + '.png';
		},
		toggleMode: function(){
			this.currentTime = 0;
			if (this.grid){
				this.gridEditorContent = this.editor.getContents();
				this.editor.setContents(this.singleEditorsContent[this.activeImageIndex]);
				this.updateEditor();
				this.grid=false;
				this.modeId="single-mode";
			} else {
				this.activeImage = this.images[this.activeImageIndex];
				this.singleEditorsContent[this.activeImageIndex]= this.editor.getContents();
				this.editor.setContents(this.gridEditorContent);
				this.updateEditor();
				if (this.activeImageIndex === 0){
					this.previousBtnId = "previous-btn-inactive";
				}
				this.grid=true;
				this.modeId="grid-mode";
			}
		},
		previousImage: function () {
			if (this.activeImageIndex === 0){
				return;
			}
			this.currentTime = 0;
			this.nextBtnId = "next-btn"; 
			this.singleEditorsContent[this.activeImageIndex]= this.editor.getContents();
			this.activeImageIndex = this.activeImageIndex - 1; 
			this.editor.setContents(this.singleEditorsContent[this.activeImageIndex]);
			this.updateEditor();
			this.activeImage = this.images[this.activeImageIndex];
			if (this.activeImageIndex === 0){
				this.previousBtnId = "previous-btn-inactive";
			}
		},
		nextImage: function () {
			if (this.activeImageIndex === this.images.length-1){
				return;
			}
			this.currentTime = 0;
			this.previousBtnId = "previous-btn"
			this.singleEditorsContent[this.activeImageIndex]= this.editor.getContents();
			this.activeImageIndex = this.activeImageIndex + 1; 
			this.editor.setContents(this.singleEditorsContent[this.activeImageIndex]);
			this.updateEditor();
			this.activeImage = this.images[this.activeImageIndex];
			if (this.activeImageIndex === this.images.length-1){
				this.nextBtnId = "next-btn-inactive"; 
			}	
		},
		loaded: function () {
			this.imageLoaded++;
			if (this.imageLoaded === this.imageCount ){
				this.isLoaded = true;
				this.activeImage = this.images[this.activeImageIndex];
				for (var i=0; i<this.imageCount; i++){
					clearInterval(this.intervalIds[i]);
				}
			}
		},
		openImage: function(index){
			this.grid=false;
			this.activeImageIndex = index;
			this.activeImage = this.images[this.activeImageIndex];
			this.modeId="single-mode";
			if (index === 0){
				this.previousBtnId = "previous-btn-inactive";
				this.nextBtnId = "next-btn";
			} else if (index === this.images.length-1){
				this.previousBtnId = "previous-btn";
				this.nextBtnId = "next-btn-inactive"; 
			} else {
				this.previousBtnId = "previous-btn";
				this.nextBtnId = "next-btn";
			}
		},
		increaseFont: function(){
			var currentSize = this.editor.getFormat();
			var that = this;
			if(currentSize.size==null){
				var index = that.sizes.indexOf('24px');
				that.editor.format('size',that.sizes[index+1]);
				that.fontSize = that.sizes[index+1];
			} else {
				var index = that.sizes.indexOf(currentSize.size);
				index++;
				if(index<that.sizes.length){
					that.editor.format('size',that.sizes[index]);
					that.fontSize = that.sizes[index];
				}
			}
		},
		decreaseFont: function(){
			var currentSize = this.editor.getFormat();
			var that = this;
			if(currentSize.size==null){
				var index = that.sizes.indexOf('24px');
				if(index>0)
				that.editor.format('size',that.sizes[index-1]);
				that.fontSize = that.sizes[index-1]
			}
			else {
				var index = that.sizes.indexOf(currentSize.size);
				index--;
				if(index>=0){
					that.editor.format('size',that.sizes[index]);
					that.fontSize = that.sizes[index];
				}
			}
		},
		onFormatText: function(e){
			this.editor.focus()
		},
		onFontChange: function(e){
			var newfont = e.font;
			if(newfont=="Arial") newfont="arial";
			if(newfont=="Comic Sans MS") newfont="comic";
			if(newfont=="Times New Roman")newfont="Times";
			if(newfont=="Courier New")newfont="Courier";
			if(newfont=="Lucida Console")newfont="Lucida";
			if(newfont=="Impact")newfont="Impact";
			if(newfont=="Georgia")newfont="Georgia";
			this.editor.format('font', newfont);
			this.fontSelected = newfont;
			this.editor.focus()
		},
		onForegroundColorChange: function(e){
			this.fontColor = e.detail.color;
			this.editor.format('color',this.fontColor);
		},
		onBackgroundColorChange: function(e){
			this.backgroundColor = e.detail.color;
			this.editor.format('background-color',this.backgroundColor);
		},

		onJournalNewInstance: function() {
			console.log("New instance");
			for (var i=0; i<this.imageCount; i++){
				this.singleEditorsContent.push(null);
			}
			this.imageLoaders();
			var that = this;
			window.setTimeout(function(){that.loadImages()},910);
		},
		onJournalDataLoaded: function (data, metadata) {
			console.log("Existing instance");
			
			this.grid = data.grid;
			this.imageLoaders();
			this.images = data.images;
			this.imageCount = data.imageCount;
			this.gridEditorContent = JSON.parse(data.gridEditorContent);
			this.singleEditorsContent = JSON.parse(data.singleEditorsContent);
			this.fontSelected = data.fontSelected;
			this.fontSize = data.fontSize;
			this.gridAudioRecord = data.gridAudioRecord;
			this.singleAudioRecords = data.singleAudioRecords;
			if(data.grid){	
				this.grid=true;
				this.editor.setContents(this.gridEditorContent);
				this.updateEditor();
			} else {
				this.activeImage = this.images[this.activeImageIndex];
				this.grid = false;
				this.isLoaded = true;
				for (var i=0; i<this.imageCount; i++){
					clearInterval(this.intervalIds[i]);
				}
				this.editor.setContents(this.singleEditorsContent[0]);
				this.updateEditor();
				this.modeId="single-mode";
				if (this.activeImageIndex === 0){
					this.previousBtnId = "previous-btn-inactive";
				}
			}
		},
		onJournalLoadError: function(error) {
			console.log("Error loading from journal");
		},
		onRecord: function(error){
			var t = this;
			if (this.isPlaying) return;
			if (window.cordova || window.PhoneGap){
				// Using Cordova
				var captureSuccess = function (mediaFiles) {
					var i, path, len;
					for (i = 0, len = mediaFiles.length; i < len; i += 1) {
						path = mediaFiles[i].fullPath;
						if (path.indexOf("file:/") == -1) {
							path = "file:/" + path;
						}
						path = path.replace("file:/", "file:///");
						window.resolveLocalFileSystemURL(path, function (entry) {
							entry.file(function (file) {
								// if (file.size / 1000000 > 2) {
								// 	displayAlertMessage("File is too big");
								// 	return;
								// }
								var reader = new FileReader();
								reader.onloadend = function (evt) {
									if (t.grid){
										t.gridAudioRecord = evt.target.result;
									} else {
										t.singleAudioRecords[t.activeImageIndex]=evt.target.result;
									}
								};
								reader.readAsDataURL(file);
							}, function (err) {
							})
						}, function (err) {
						});
					}
				};
	
				// capture error callback
				var captureError = function (error) {
					console.log("Error occured in capturing audio", error)
				};
	
				// start audio capture
				try {
					navigator.device.capture.captureAudio(captureSuccess, captureError, {
						limit: 1
					});
				} catch(err){
					console.log("error", err);
				}			
			} else {
				// Using recordRTC For web
				var that = this;
				if (that.recording){
					that.recording = false;
					that.recordIconId="record";
						that.recordRTC.stopRecording(function () {
							that.recordRTC.getDataURL(function (dataURL) {
								// setTimeout(function () {
									if (that.grid){
										that.gridAudioRecord = dataURL;
									} else {
										that.singleAudioRecords[that.activeImageIndex]=dataURL;
									}
									if (that.mediaStream.stop) that.mediaStream.stop();
								// }, 500);
							}, false);
						});
				} else {
					try {
						that.recording = true;
						navigator.mediaDevices.getUserMedia({audio: true}).then(function (mediaStream) {
							var recordRTC = RecordRTC(mediaStream, {
								type: 'audio'
							});
							that.recordIconId = "record-start";
							that.recordRTC = recordRTC;
							that.mediaStream= mediaStream;
							recordRTC.startRecording();
						}).catch(function (error) {
							that.recording = false;
						});
					} catch (e) {
						that.recording = false;
					}
				}
			}
		},
		exportRecord: function(){
			var t = this;
			if (this.grid){
				if (t.gridAudioRecord != null){
					var dataURL = t.gridAudioRecord;
					var mimetype = dataURL.split(";")[0].split(":")[1];
					var metadata = {
						mimetype: mimetype,
						title: "Story by "+ t.environment.user.name + " in Grid Mode",
						activity: "org.olpcfrance.MediaViewerActivity",
						timestamp: new Date().getTime(),
						creation_time: new Date().getTime(),
						file_size: 0 
					};
					t.$refs.SugarJournal.createEntry(dataURL, metadata);
					t.$refs.SugarPopup.log("Grid Mode Audio exported")
				}
			} else {
				if (t.singleAudioRecords[t.activeImageIndex] != null){
					var dataURL = t.singleAudioRecords[t.activeImageIndex];
					var mimetype = dataURL.split(";")[0].split(":")[1];
					var metadata = {
						mimetype: mimetype,
						title: "Story by "+ t.environment.user.name + " for Image " + (t.activeImageIndex+1),
						activity: "org.olpcfrance.MediaViewerActivity",
						timestamp: new Date().getTime(),
						creation_time: new Date().getTime(),
						file_size: 0
					};
					t.$refs.SugarJournal.createEntry(dataURL, metadata);
					t.$refs.SugarPopup.log("Single Mode Audio exported")
				}
			}
		},	
		playAudio: function(){
			var that = this;
			if (this.recording) return;
			if (this.grid && this.gridAudioRecord != null){
				if (!that.isPlaying){
					var audio = document.createElement("audio");	
					that.audio = audio;
					that.audio.src = that.gridAudioRecord;
					that.audio.play();
					that.playIconId = "pause-play";
					that.isPlaying = true;
					if (that.currentTime != 0){
						that.audio.currentTime = that.currentTime;
					}
					audio.onended = function(){
						that.playIconId = "play";
						that.isPlaying = false;
						that.currentTime = 0;
					};
				} else {
					that.currentTime = that.audio.currentTime;
					that.audio.pause();
					that.playIconId = "play";
					that.isPlaying = false;
				}
			} else if (!this.grid && this.singleAudioRecords[this.activeImageIndex]!=null){
				if (!that.isPlaying){
					var audio = document.createElement("audio");
					that.audio = audio;
					that.audio.src = that.singleAudioRecords[that.activeImageIndex];
					that.audio.play();
					that.playIconId = "pause-play";
					that.isPlaying = true;
					if (that.currentTime != 0){
						that.audio.currentTime = that.currentTime;
					}
					audio.onended = function(){
						that.playIconId = "play";
						that.isPlaying = false;
						that.currentTime = 0;
					};
				} else {
					that.currentTime = that.audio.currentTime;
					that.audio.pause();
					that.playIconId = "play";
					that.isPlaying = false;
				}
			}
		},
		stopAudio: function(){
			this.currentTime = 0;
			this.audio.pause();
			this.playIconId = "play";
			this.isPlaying = false;
		},
		speakStory: function(){
			if (this.editor.container.innerText == "") return;
			var text = this.editor.container.innerText;
			this.$refs.SugarSpeak.speech(text);
		},
		onStop: function() {
			if (this.grid){
				this.gridEditorContent = this.editor.getContents();
			} else {
				this.singleEditorsContent[this.activeImageIndex]= this.editor.getContents();
			}
			var context = {
				grid: this.grid,
				images: this.images,
				imageCount: this.imageCount,
				gridEditorContent: JSON.stringify(this.gridEditorContent),
				singleEditorsContent: JSON.stringify(this.singleEditorsContent),
				fontSelected: this.fontSelected,
				fontSize:this.fontSize,
				gridAudioRecord: this.gridAudioRecord,
				singleAudioRecords: this.singleAudioRecords
			};
			this.$refs.SugarJournal.saveData(context);
		}
	}
});
