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
		SugarL10n: null,
		isConnected: null,
		db_url: null,
		grid: true,
		modeId: "grid-mode",
		images: [],
		imagesURL:[],
		gridImageURL: null,
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
		playIconId: "play-inactive",
		speakIconId: "speak-inactive",
		currentTime: 0,
		imageCount: 9,
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
		fontSize:null,
		SugarPresence: null,
		cursors: null,
		myid: null,
		connectedPlayers: [],
		isHost: false,
		l10n: {
			stringNetwork:'',
			stringToggleMode: '',
			stringGridSize: '',
			stringForegroundColor: '',
			stringBackgroundColor: '',
			stringFormatText: '',
			stringChooseFont: '',
			stringIncreaseFont: '',
			stringDecreaseFont: '',
			stringExportStory: '',
			stringExportAsSound: '',
			stringStop: '',
			stringTutoPrev: '',
			stringTutoNext: '',
			stringTutoEnd: '',
			stringTutoExplainTitle: '',
			stringTutoExplainContent: '',
			stringTutoNetworkTitle:'',
			stringTutoNetworkContent:'',
			stringTutoToggleModeTitle: '',
			stringTutoToggleModeContent: '',
			stringTutoGridSizeTitle: '',
			stringTutoGridSizeContent: '',
			stringTutoForegroundColorTitle: '',
			stringTutoForegroundColorContent: '',
			stringTutoBackgroundColorTitle: '',
			stringTutoBackgroundColorContent: '',
			stringTutoFormatTextTitle: '',
			stringTutoFormatTextContent: '',
			stringTutoChooseFontTitle: '',
			stringTutoChooseFontContent: '',
			stringTutoIncreaseFontTitle: '',
			stringTutoIncreaseFontContent: '',
			stringTutoDecreaseFontTitle: '',
			stringTutoDecreaseFontContent: '',
			stringTutoExportStoryTitle: '',
			stringTutoExportStoryContent: '',
			stringTutoExportSoundTitle: '',
			stringTutoExportSoundContent: '',
			stringTutoRecordTitle: '',
			stringTutoRecordContent: '',
			stringTutoPlayTitle: '',
			stringTutoPlayContent: '',
			stringTutoSpeakTitle: '',
			stringTutoSpeakContent: '',
			stringTutoNextImageTitle: '',
			stringTutoNextImageContent: '',
			stringTutoPrevImageTitle: '',
			stringTutoPrevImageContent: ''
		}
	},

	mounted() {
		this.SugarPresence = this.$refs.SugarPresence;
		this.SugarL10n = this.$refs.SugarL10n;
	},

	methods: {
		initialized: async function () {
			// Sugarizer initialized
			var that = this;
			var environment = this.$refs.SugarActivity.getEnvironment();	
			this.environment = environment;
			this.colors = [environment.user.colorvalue.fill, environment.user.colorvalue.stroke, '#FFFFFF'];
			if (this.activeImageIndex===0){
				this.previousBtnId = "previous-btn-inactive";
				this.nextBtnId = "next-btn"; 
			} else if (this.activeImageIndex===this.imageCount - 1){
				this.previousBtnId = "previous-btn";
				this.nextBtnId = "next-btn-inactive"; 
			}
			this.recordIconId = "record";
			for (var i=0; i<this.imageCount; i++){
				this.singleEditorsContent.push(null);
				this.singleAudioRecords.push(null);
				this.imagesURL.push(null);
			}

			var src = document.location.href.substr(0, document.location.href.indexOf("/activities/"))+"/activities/Abecedarium.activity/images/database/_ping.png";
			this.isConnected = await this.checkFileExists(src);
			var xhr = new XMLHttpRequest();
			var source = document.location.href.substr(0, document.location.href.indexOf("/activities/"))+"/activities/Abecedarium.activity/database/db_url.json";
			xhr.onload = function(){
				var data = JSON.parse(xhr.response);
				that.db_url = data;
			}
			xhr.onerror = function(err){
				console.log("Error: ", xhr.statusText);
			};
			xhr.open("GET", source);
			xhr.send();
			this.loadEditor();			
		},

		localized: function(){
			this.SugarL10n.localize(this.l10n);
		},

		imageLoaders: function(){
			const that = this;
			function getRandomInt (min, max) {
				min = Math.ceil(min);
				max = Math.floor(max);
				return Math.floor(Math.random() * (max - min + 1)) + min;
			}
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

		checkFileExists: function(urlToFile){
			try {	
				return new Promise(function (resolve, reject) {
				var xhr = new XMLHttpRequest();
				xhr.open("GET", urlToFile, true);
				xhr.onload = function(){
					if (xhr.status != 404 && (xhr.status===200 || xhr.response!="")){
						resolve(true);
					}
					resolve(false);
				}
				xhr.onerror = function(){
					resolve(false);
				};
				xhr.send();
				})
			} catch (error) {
				resolve(false);
			}
		},

		loadFile: function(url, img) {
			var that = this;
			try {
				return new Promise(function (resolve, reject) {
					var xhr = new XMLHttpRequest();
					xhr.open("GET", url, true);
					xhr.onload = function(){
					if (that.images.indexOf(img)===-1 && xhr.status !== 404 && (xhr.status===200 || xhr.response!="	")){
						that.images.push(img);
						resolve(true);
					}
						resolve(false);
					}
					xhr.onerror = function(){
						resolve(false);
					};
					xhr.send();
				})
			} catch (error) {
				resolve(false);
			}
		},

		loadImages: function(callback){
			var xhr = new XMLHttpRequest();
			var imgs = [];
			var that = this;
			var source = document.location.href.substr(0, document.location.href.indexOf("/activities/"))+"/activities/Abecedarium.activity/database/db_meta.json";
			xhr.onload = async function(){
				var data;
				data  = JSON.parse(xhr.response);
				for (var i=0; i<that.imageCount; i++){
					var img = data[Math.floor(Math.random() *  data.length)].code;
					var imgCheck;
					if (that.isConnected){
						if (img.includes("lower_")){
								imgCheck = await that.loadFile(document.location.href.substr(0, document.location.href.indexOf("/activities/"))+"/activities/Abecedarium.activity/images/letters/"+img.toLowerCase()[6]+"0.png", img);
							} else if (img.includes("upper_")){
								imgCheck = await that.loadFile(document.location.href.substr(0, document.location.href.indexOf("/activities/"))+"/activities/Abecedarium.activity/images/letters/"+img.toLowerCase()[6]+"1.png", img);
							} else {
								imgCheck = await that.loadFile(document.location.href.substr(0, document.location.href.indexOf("/activities/"))+"/activities/Abecedarium.activity/images/database/"+img+".png", img);
							}
						} else {
							if (img.includes("lower_")){
								imgCheck = await that.loadFile(that.db_url + "images/letters/"+img.toLowerCase()[6]+"0.png", img);
							} else if (img.includes("upper_")){
								imgCheck = await that.loadFile(that.db_url + "images/letters/"+img.toLowerCase()[6]+"1.png", img);
							} else {
								imgCheck = await that.loadFile(that.db_url + "images/database/"+img+".png", img);
							}
						}
						if (!imgCheck) i--;
					}
					that.activeImage = that.images[that.activeImageIndex];
					if (!that.grid){ 
						that.isLoaded = true;
						for (var i=0; i<that.imageCount; i++){
							clearInterval(that.intervalIds[i]);
						}
						that.storeData();
					}
					callback();
			};
			xhr.onerror = function(err){
				console.log("Error: ", xhr.statusText);
			};
			xhr.open("GET", source, true);
			xhr.send();
		},

		loadEditor: function(){
			Quill.register('modules/cursors', QuillCursors);
			var container = document.getElementById('editor-area');
			var editor = new Quill(container, {
				modules: {
				  toolbar: '.toolbar-container',
				  cursors: true
				},
				cursors: {
					transformOnTextChange: true,
				}
			  });
			editor.format('size', '24px');
			const cursors = editor.getModule('cursors');
			const Delta =  Quill.import('delta');
			var that = this;

			editor.on('text-change', function(delta, oldDelta, source) {
				// Executes on text or formatting changes
				if (editor.getText().length>1){ 
					that.speakIconId = "speak"
				} else {
					that.speakIconId = "speak-inactive";
				}
				if (source=='user' && that.SugarPresence && that.SugarPresence.isShared()){
					var range = that.editor.getSelection();
					that.SugarPresence.sendMessage({
						user: that.SugarPresence.getUserInfo(),
						content: {
							action: 'typing',
							data: delta,
							range: range,
							grid:that.grid,
							activeImageIndex: that.activeImageIndex,
							allText: editor.getContents()
						}
					});
				}
			});
			this.editor = editor;
			this.cursors = cursors;
		},

		updateEditor: function(){
			this.fontColor != null && this.editor.format('color',this.fontColor);
			this.backgroundColor!=null && this.editor.format('background-color',this.backgroundColor);
			this.fontSelected !=null &&	this.editor.format('font', this.fontSelected);
			this.fontSize !=null ? this.editor.format('size', this.fontSize) : this.editor.format('size', '24px');
		},
		
		getUrlImg: function(img){
			if (this.isConnected){
				if (img.includes("lower")){
					return '../Abecedarium.activity/images/letters/'+ img.toLowerCase()[6] + '0.png';
				} else if (img.includes("upper")){
					return '../Abecedarium.activity/images/letters/'+ img.toLowerCase()[6] + '1.png';
				} else {
					return '../Abecedarium.activity/images/database/'+ img + '.png';
				}
			} else {
				if (img.includes("lower")){
					return this.db_url + 'images/letters/'+ img.toLowerCase()[6] + '0.png';
				} else if (img.includes("upper")){
					return this.db_url + 'images/letters/'+ img.toLowerCase()[6] + '1.png';
				} else {
					return this.db_url + 'images/database/'+ img + '.png';
				}
			}
		},

		toggleMode: function(){
			this.currentTime = 0;
			var that = this;
			if (this.grid){
				if (this.gridImageURL==null && document.getElementById("display-grid")!=null){
					var ele = document.getElementById("display-grid");
					html2canvas(ele).then(function(canvas){
						var img = canvas.toDataURL('image/png');
						that.gridImageURL = img;
					})
				}
				this.gridEditorContent = this.editor.getContents();
				this.editor.setContents(this.singleEditorsContent[this.activeImageIndex]);
				this.updateEditor();
				this.grid=false;
				this.modeId="single-mode";
				if (this.singleAudioRecords[this.activeImageIndex]!=null){
					this.playIconId = "play"
				} else {
					this.playIconId = "play-inactive"
				}
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
				if (this.gridAudioRecord!=null){
					this.playIconId = "play"
				} else {
					this.playIconId = "play-inactive"
				}
			}

			if (this.editor.getText().length>1){ 
				this.speakIconId = "speak"
			} else {
				this.speakIconId = "speak-inactive";
			}
			this.editor.setSelection(this.editor.getText().length);
			this.storeData();
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
			this.editor.setSelection(this.editor.getText().length);
			this.storeData();

			if (this.editor.getText().length>1){ 
				this.speakIconId = "speak"
			} else {
				this.speakIconId = "speak-inactive";
			}

			if (this.singleAudioRecords[this.activeImageIndex]!=null){
				this.playIconId = "play"
			} else {
				this.playIconId = "play-inactive"
			}
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
			this.editor.setSelection(this.editor.getText().length);
			this.storeData();

			if (this.editor.getText().length>1){ 
				this.speakIconId = "speak"
			} else {
				this.speakIconId = "speak-inactive";
			}

			if (this.singleAudioRecords[this.activeImageIndex]!=null){
				this.playIconId = "play"
			} else {
				this.playIconId = "play-inactive"
			}
			if (this.activeImageIndex === this.images.length-1){
				this.nextBtnId = "next-btn-inactive"; 
			}	
		},
		
		loaded: function () {
			var that = this;
			this.imageLoaded++;
			if (this.imageLoaded === this.imageCount ){
				this.isLoaded = true;
				this.activeImage = this.images[this.activeImageIndex];
				for (var i=0; i<this.imageCount; i++){
					clearInterval(this.intervalIds[i]);
				}
			this.storeData();

			function toDataURL(src, id) {
				var img = new Image();
				img.crossOrigin = 'Anonymous';
				img.onload = function() {
					var canvas = document.createElement('CANVAS');
					var ctx = canvas.getContext('2d');
					var dataURL;
					canvas.height = this.naturalHeight;
					canvas.width = this.naturalWidth;
					ctx.drawImage(this, 0, 0);
					dataURL = canvas.toDataURL('image/png');
					that.imagesURL[id] =dataURL;
				};
				img.src = src;
				if (img.complete || img.complete === undefined) {
					img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
					img.src = src;
				}
			}

			var i=0;
				while(i<this.imageCount){
					toDataURL(`${that.getUrlImg(that.images[i])}`, i)
					i++;
				}
				setTimeout(()=>{
					if (document.getElementById("display-grid")!=null){
						var ele = document.getElementById("display-grid");
						html2canvas(ele).then(function(canvas){
							var img = canvas.toDataURL('image/png');
							that.gridImageURL = img;
						})
					}
				}, 100)
			}
		},

		openImage: function(index){
			if (this.grid){
				this.gridEditorContent = this.editor.getContents();
			}
			this.grid=false;
			this.activeImageIndex = index;
			this.activeImage = this.images[this.activeImageIndex];
			this.editor.setContents(this.singleEditorsContent[this.activeImageIndex]);
			this.modeId="single-mode";
			this.storeData();

			if (this.editor.getText().length>1){ 
				this.speakIconId = "speak"
			} else {
				this.speakIconId = "speak-inactive";
			}

			if (this.singleAudioRecords[this.activeImageIndex]!=null){
				this.playIconId = "play"
			} else {
				this.playIconId = "play-inactive"
			}

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

		onGridSizeChange: function(e){
			var that = this;
			if (this.SugarPresence.isShared()) return;
			this.grid = true;
			this.modeId = "grid-mode";
			this.activeImage= "";
			this.activeImageIndex= 0;
			this.imageCount = e.count;
			document.getElementById("size-palette").style.background = "url(icons/"+(e.count/3)+"X3.svg)";
			this.gridAudioRecord= null;
			this.singleAudioRecords= [];
			this.singleEditorsContent = [];
			this.gridEditorContent=null;
			this.images = [];
			for (var i=0; i<this.imageCount; i++){
				this.singleEditorsContent.push(null);
			}
			this.editor.setContents(this.gridEditorContent);
			this.imageLoaders();
			
			this.loadImages(() => {
				function toDataURL(src, id) {
					var img = new Image();
					img.crossOrigin = 'Anonymous';
					img.onload = function() {
						var canvas = document.createElement('CANVAS');
						var ctx = canvas.getContext('2d');
						var dataURL;
						canvas.height = this.naturalHeight;
						canvas.width = this.naturalWidth;
						ctx.drawImage(this, 0, 0);
						dataURL = canvas.toDataURL('image/png');
						that.imagesURL[id] =dataURL;
					};
					img.src = src;
					if (img.complete || img.complete === undefined) {
						img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
						img.src = src;
					}
				}
				var imgcnt=0;
				while(imgcnt<this.imageCount){
					toDataURL(`${that.getUrlImg(that.images[imgcnt])}`, imgcnt)
					imgcnt++;
				}
				setTimeout(()=>{
					that.storeData();
					if (document.getElementById("display-grid")!=null){
						var ele = document.getElementById("display-grid");
						html2canvas(ele).then(function(canvas){
							var img = canvas.toDataURL('image/png');
							that.gridImageURL = img;
						})
					}
				}, 100)
			});
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

		onExport: function(e){
			var that = this;
			var tempdiv = document.createElement('div');
			var tempeditor = new Quill(tempdiv,{});
			if (this.grid){
				this.gridEditorContent = this.editor.getContents();
			} else {
				this.singleEditorsContent[this.activeImageIndex]= this.editor.getContents();
			}
			this.storeData();

			switch (e.fileType) {
				case 'txt':
					var title = document.getElementById("title").value;
					var mimetype = 'text/plain';
					var inputData="";
					tempeditor.setContents(that.gridEditorContent);
					var text = tempeditor.getText();
					if (text.length > 1){
						inputData+=tempeditor.getText();
					}
					for (var i=0; i<that.imageCount; i++){
						tempeditor.setContents(that.singleEditorsContent[i]);
						var text = tempeditor.getText();
						if (i==that.activeImageIndex && that.editor.getText().length>1){
							inputData+=that.editor.getText();
						} else {
							if (text.length > 1){
									inputData+=tempeditor.getText();
							}
						}
					}
					var metadata = {
						mimetype: mimetype,
						title: title+".txt",
						activity: "",
						timestamp: new Date().getTime(),
						creation_time: new Date().getTime(),
						file_size: 0
					};
					this.$refs.SugarJournal.createEntry(inputData, metadata);
					this.$refs.SugarPopup.log(that.SugarL10n.get("ExportToTxt"));
					break;

				case 'pdf':
					var title = document.getElementById("title").value;
					document.getElementById("spinner-container").style.display = "block";
					var tempActiveImage = this.activeImageIndex;
					var tempMode = this.grid;
					this.grid = true;
					that.editor.setContents(that.gridEditorContent);
					var doc = new jsPDF('p', 'mm' , '',true);

					function generateOnePdf(i) {
						html2canvas(document.getElementById("display-single")).then(function(canvasImgs){
							if (i<that.imageCount-1){
								that.activeImageIndex = i+1;
								that.activeImage = that.images[i+1];
							}
							that.editor.setContents(that.singleEditorsContent[i]);
							that.editor.scrollingContainer.style.overflowY = 'visible';
							var h = that.editor.scrollingContainer.offsetHeight;
							that.editor.scrollingContainer.style.height="auto";
							that.editor.scrollingContainer.scrollTop=0;
							html2canvas(that.editor.scrollingContainer).then(function(canvas){
								that.editor.scrollingContainer.style.height = h;
								that.editor.scrollingContainer.style.overflowY = 'auto';
								var imgData = canvas.toDataURL('image/png');
								var imgWidth = 210;
								var pageHeight = 295;
								var imgHeight = canvas.height*imgWidth / canvas.width;
								var heightLeft = imgHeight;
								var position = 120;
								if (that.editor.getText().length>1){
									doc.addPage();
									doc.addImage(canvasImgs.toDataURL('image/png'), 'PNG', 55, 10, 100, 100, '', 'FAST');
									doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight-10, '' , 'FAST');
									heightLeft -= (pageHeight-120);
									while (heightLeft >= 0) {
										position = heightLeft - imgHeight;
										doc.addPage();
										doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight-10 , '' , 'FAST');
										heightLeft -= pageHeight;
									}
								}
								if (i!=that.imageCount-1) {
									generateOnePdf(i+1);
								} else {
									generateEndPdf();
								}
							})
						});
					}
					
					function generateEndPdf() {
						var inputData = doc.output('dataurlstring');
						var mimetype = 'application/pdf';
						var metadata = {
							mimetype: mimetype,
							title: title +".pdf",
							activity: "",
							timestamp: new Date().getTime(),
							creation_time: new Date().getTime(),
							file_size: 0
						};
						that.$refs.SugarJournal.createEntry(inputData, metadata);
						document.getElementById("spinner-container").style.display = "none";
						that.$refs.SugarPopup.log(that.SugarL10n.get("ExportToPdf"));						
						that.grid = tempMode;
						if (tempMode){
							that.activeImageIndex = tempActiveImage;
							that.editor.setContents(that.gridEditorContent);
						} else {
							that.activeImageIndex = tempActiveImage;
							that.activeImage = that.images[tempActiveImage];
							that.editor.setContents(that.singleEditorsContent[that.activeImageIndex]);
						}
					}
					
					function generatePdf(){
						generateOnePdf(0)
					}

					async function generatePdfGrid(){
						that.editor.scrollingContainer.style.overflowY = 'visible';
						var h = that.editor.scrollingContainer.offsetHeight;
						that.editor.scrollingContainer.style.height="auto";
						that.editor.scrollingContainer.scrollTop=0;
						var ele = document.getElementById("display-grid"); 
						var textlen = that.editor.getText().length
						await html2canvas(ele).then(function(canvasImgs){
							var imgs = canvasImgs.toDataURL('image/png');
							html2canvas(that.editor.scrollingContainer).then(function(canvas){
								that.editor.scrollingContainer.style.height = h;
								that.editor.scrollingContainer.style.overflowY = 'auto';
								var imgData = canvas.toDataURL('image/png');
								var imgWidth = 210;
								var pageHeight = 295;
								var imgHeight = canvas.height*imgWidth / canvas.width;
								var heightLeft = imgHeight;
								if (textlen>1){
									if (that.imageCount==3){
										doc.addImage(imgs, 'PNG', 55, 20, 100, 40, '', 'FAST');
										doc.addImage(imgData, 'PNG', 0, 60, imgWidth, imgHeight-10, '' , 'FAST');
									} else if (that.imageCount==6){
										doc.addImage(imgs, 'PNG', 55, 20, 100, 70, '', 'FAST');
										doc.addImage(imgData, 'PNG', 0, 90, imgWidth, imgHeight-10, '' , 'FAST');
									} else {
										doc.addImage(imgs, 'PNG', 55, 20, 100, 100, '', 'FAST');
										doc.addImage(imgData, 'PNG', 0, 120, imgWidth, imgHeight-10, '' , 'FAST');
									}
									var position = 120;
									heightLeft -= (pageHeight-120);
									while (heightLeft >= 0) {
										position = heightLeft - imgHeight;
										doc.addPage();
										doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight-10 , '' , 'FAST');
										heightLeft -= pageHeight;
									}
								}
							})
						})

						that.activeImageIndex = 0;
						that.activeImage = that.images[0];
						that.editor.setContents(that.singleEditorsContent[0]);
						that.grid = false;
						setTimeout(generatePdf, 200);
					}

					setTimeout(generatePdfGrid, 200);
					break;

				case 'doc':
					var title = document.getElementById("title").value;
					var content = this.editor.root.innerHTML;
					var header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' "+
					"xmlns:w='urn:schemas-microsoft-com:office:word' "+
					"xmlns='http://www.w3.org/TR/REC-html40'>"+
					"<head><meta charset='utf-8'></head><body>";
					var image="";
					tempeditor.setContents(that.gridEditorContent);
					var text = tempeditor.root.innerHTML;
					if (text.length > 11){
						for (var i=0; i<that.imageCount/3; i++){
							image+= `
							<div>
							<img style="display:inline-block; height:150px; width:150px; margin:auto" src=${that.imagesURL[3*(i) + (i)%3]} />
							<img style="display:inline-block; height:150px; width:150px; margin:auto" src=${that.imagesURL[3*(i) + (i+1)%3]} />
							<img style="display:inline-block; height:150px; width:150px; margin:auto" src=${that.imagesURL[3*(i) + (i+2)%3]} />
							</div>`;
						}
						image+=text;
					}
					for (var i=0; i<that.imageCount; i++){
						tempeditor.setContents(that.singleEditorsContent[i]);
						var text = tempeditor.root.innerHTML;
						if (i==that.activeImageIndex && that.editor.root.innerHTML.length>11){
							image+= `<img style="display:block; margin:auto" src=${that.imagesURL[i]} />`
							image+=that.editor.root.innerHTML;
						} else {
							if (text.length > 11){
								image+= `<img style="display:block; margin:auto" src=${that.imagesURL[i]} />`
								image+=text;
							}
						}
					}
					var footer = "</body></html>"
					var sourceHTML = header + image + footer;
					var inputData = 'data:application/vnd.ms-word;charset=utf-8;base64,' + btoa(unescape(encodeURIComponent( sourceHTML )));
					var mimetype = 'application/msword';
					var metadata = {
						mimetype: mimetype,
						title: title + ".doc",
						activity: "",
						timestamp: new Date().getTime(),
						creation_time: new Date().getTime(),
						file_size: 0
					};
					this.$refs.SugarJournal.createEntry(inputData, metadata);
					this.$refs.SugarPopup.log(that.SugarL10n.get("ExportToDoc"));
					break;

				case 'odt':
					var tempActiveImage = this.activeImageIndex;
					var tempMode = this.grid;
					this.grid = false;

					var divEle =document.createElement('div')
					that.editor.setContents(that.gridEditorContent);

					if (that.editor.getText().length > 1){
							var el= document.getElementById('editor-area');
							el= el.cloneNode(true);
							el.getElementsByTagName('div')[0];
							var tempEditor = el.getElementsByTagName('div')[0];
							var par = document.createElement("p");
							var imgEle = document.createElement("IMG");
							imgEle.height = '100px';
							imgEle.setAttribute("src", that.gridImageURL);
							par.appendChild(imgEle);
							tempEditor.insertBefore(par, tempEditor.childNodes[0]);
							divEle.append(...tempEditor.childNodes);
					}

					for (var i=0; i<that.imageCount; i++){
						that.activeImageIndex = i;
						that.editor.setContents(that.singleEditorsContent[i]);
						if (that.editor.getText().length>1){
							var el= document.getElementById('editor-area');
							el= el.cloneNode(true);
							el.getElementsByTagName('div')[0];
							var tempEditor = el.getElementsByTagName('div')[0];
							var par = document.createElement("p");
							var imgEle = document.createElement("IMG");
							imgEle.height = '500px';
							imgEle.setAttribute("src", that.imagesURL[i]);
							par.appendChild(imgEle);
							tempEditor.insertBefore(par, tempEditor.childNodes[0]);
							divEle.append(...tempEditor.childNodes);
						}
					}

					that.grid = tempMode;
					if (tempMode){
						that.activeImageIndex = tempActiveImage;
						that.editor.setContents(that.gridEditorContent);
					} else {
						that.activeImageIndex = tempActiveImage;
						that.editor.setContents(that.singleEditorsContent[that.activeImageIndex]);
					}

					var xml = traverse(divEle);
					var mimetype = 'application/vnd.oasis.opendocument.text';
					var title = document.getElementById("title").value;
					var inputData = 'data:application/vnd.oasis.opendocument.text;charset=utf-8;base64,' + btoa(unescape(encodeURIComponent( xml )));
					var metadata = {
						mimetype: mimetype,
						title: title +".odt",
						activity: "",
						timestamp: new Date().getTime(),
						creation_time: new Date().getTime(),
						file_size: 0
					};
					resetXML();

					that.$refs.SugarJournal.createEntry(inputData, metadata);
					that.$refs.SugarPopup.log(that.SugarL10n.get("ExportToOdt"));
					break;

				default:
					break;
			}
		},

		onJournalNewInstance: function() {
			console.log("New instance");
			for (var i=0; i<this.imageCount; i++){
				this.singleEditorsContent.push(null);
			}
			this.imageLoaders();
			var that = this;
			document.getElementById("size-palette").style.background = "url(icons/3X3.svg)";
			window.setTimeout(function(){that.loadImages(() => {})},910);
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
			this.activeImageIndex = data.activeImageIndex;
			this.gridAudioRecord = data.gridAudioRecord;
			this.singleAudioRecords = data.singleAudioRecords;
			this.imagesURL = JSON.parse(data.imagesURL);
			this.gridImageURL = data.gridImageURL;
			this.isLoaded = true;
			document.getElementById("size-palette").style.background = "url(icons/"+data.imageCount/3+"X3.svg)";
			this.activeImage = this.images[this.activeImageIndex];

			for (var i=0; i<9; i++){
				clearInterval(this.intervalIds[i]);
			}
			
			if(data.grid){	
				this.grid=true;
				this.editor.setContents(this.gridEditorContent);
				this.updateEditor();
				if (this.gridAudioRecord!=null){
					this.playIconId = "play"
				} else {
					this.playIconId = "play-inactive"
				}
			} else {
				this.grid = false;
				this.editor.setContents(this.singleEditorsContent[this.activeImageIndex]);
				this.updateEditor();
				this.modeId="single-mode";
				if (this.activeImageIndex===0){
					this.previousBtnId = "previous-btn-inactive";
					this.nextBtnId = "next-btn"; 
				} else if (this.activeImageIndex===this.imageCount - 1){
					this.previousBtnId = "previous-btn";
					this.nextBtnId = "next-btn-inactive"; 
				} else {
					this.nextBtnId = "next-btn"; 
					this.previousBtnId = "previous-btn";
				}
				if (this.singleAudioRecords[this.activeImageIndex]!=null){
					this.playIconId = "play"
				} else {
					this.playIconId = "play-inactive"
				}
			}

			if (this.editor.getText().length>1){ 
				this.speakIconId = "speak"
			} else {
				this.speakIconId = "speak-inactive";
			}
			this.editor.setSelection(this.editor.getText().length);
		},

		onJournalLoadError: function(error) {
			console.log("Error loading from journal");
		},

		onJournalSharedInstance: function() {
			console.log("Shared instance");
		},
		
		onNetworkDataReceived: function(msg){
			var that = this;
			switch (msg.content.action) {

				case 'init':
					const data = msg.content.data;
					this.grid = data.grid;
					this.imageLoaders();
					document.getElementById("size-palette").style.background = "url(icons/"+(data.imageCount/3)+"X3.svg)";
					this.images = data.images;
					this.imageCount = data.imageCount;
					this.gridEditorContent = JSON.parse(data.gridEditorContent);
					this.singleEditorsContent = JSON.parse(data.singleEditorsContent);
					this.connectedPlayers = data.connectedPlayers;
					this.imagesURL = JSON.parse(data.imagesURL);
					this.gridImageURL = data.gridImageURL;
					this.activeImageIndex = data.activeImageIndex;
					this.activeImage = this.images[data.activeImageIndex];

					if (this.activeImageIndex===0){
						this.previousBtnId = "previous-btn-inactive";
						this.nextBtnId = "next-btn"; 
					} else if (this.activeImageIndex===this.imageCount - 1){
						this.previousBtnId = "previous-btn";
						this.nextBtnId = "next-btn-inactive"; 
					} else {
						this.nextBtnId = "next-btn"; 
						this.previousBtnId = "previous-btn";
					}
					this.isLoaded=true;
					for (var i=0; i<this.imageCount; i++){
						clearInterval(this.intervalIds[i]);
					}

					if (data.grid){
						that.editor.setContents(that.gridEditorContent);
					} else {
						this.activeImage = this.images[data.activeImageIndex];
						that.editor.setContents(that.singleEditorsContent[that.activeImageIndex]);
						this.modeId="single-mode";
					}
					this.editor.setSelection(this.editor.getText().length);
					this.storeData();
					break;

				case 'typing':
					if(msg.content.grid){
						if (that.grid){
							that.editor.updateContents(msg.content.data);
						} else {
							that.gridEditorContent = msg.content.allText;
						}
					} else {
						if (that.grid){
							that.singleEditorsContent[msg.content.activeImageIndex] = msg.content.allText;
						} else {
							if (that.activeImageIndex == msg.content.activeImageIndex){
								that.editor.updateContents(msg.content.data);
							} else {
								that.singleEditorsContent[msg.content.activeImageIndex] = msg.content.allText;
							}
						}
					}

					if (this.editor.getText().length>1){ 
						this.speakIconId = "speak"
					} else {
						this.speakIconId = "speak-inactive";
					}
					break;

				case 'update-players':
					this.connectedPlayers = msg.content.connectedPlayers
			}
		},

		onNetworkUserChanged: function(msg){
			var mycursor = {};
			var that = this;
			// Handling only by host
			if (this.SugarPresence.isHost) {
				if (this.grid){
					this.gridEditorContent = this.editor.getContents();
				} else {
					this.singleEditorsContent[this.activeImageIndex]= this.editor.getContents();
				}
				var range = that.editor.getSelection();
				mycursor.range = range;
				this.cursors.createCursor(this.SugarPresence.presence.userInfo.networkId,this.SugarPresence.presence.userInfo.name, this.SugarPresence.presence.userInfo.colorvalue.stroke);
				var allcursors = that.cursors.cursors();
				if (!this.isHost){
					that.connectedPlayers.push(this.SugarPresence.presence.userInfo);
				}
				this.isHost = true;
				
				var context = {
					grid: this.grid,
					images: this.images,
					imageCount: this.imageCount,
					activeImageIndex: this.activeImageIndex,
					gridEditorContent: JSON.stringify(this.gridEditorContent),
					singleEditorsContent: JSON.stringify(this.singleEditorsContent),
					imagesURL: JSON.stringify(this.imagesURL),
					gridImageURL: this.gridImageURL
				};
				that.SugarPresence.sendMessage({
					user: this.SugarPresence.getUserInfo(),
					content: {
						action: 'init',
						data: context,
						allcursors: allcursors
					}
				});
				mycursor.range = null;
			}

			if (!this.myid){
				this.myid = msg.user.networkId;
			}

			var userName = msg.user.name.replace('<', '&lt;').replace('>', '&gt;');
			if (msg.move==1){
				that.connectedPlayers.push(msg.user);
				var c = this.cursors.createCursor(msg.user.networkId, userName, msg.user.colorvalue.stroke);
				if(this.myid==msg.user.networkId) {mycursor=c;}
			}
			if (msg.move == -1){
				if (msg.user.networkId === that.connectedPlayers[0].networkId){
					that.$refs.SugarPopup.log(that.connectedPlayers[1].name + " is the new host");
				}
				var tempPlayer =  that.connectedPlayers.filter((user) => {
					return user.networkId != msg.user.networkId
				});
				that.connectedPlayers = tempPlayer;
				that.SugarPresence.isHost = that.connectedPlayers[0].networkId === that.SugarPresence.getUserInfo().networkId ? true : false;
				this.cursors.removeCursor(msg.user.networkId);
			}

			if (this.SugarPresence.isHost){
				if (!this.grid){
					if (this.activeImageIndex === 0){
						this.previousBtnId = "previous-btn-inactive";
						this.nextBtnId = "next-btn"; 
					} else if (this.activeImageIndex === this.images.length-1){
						this.nextBtnId = "next-btn-inactive"; 
						this.previousBtnId = "previous-btn"
					} else {
						this.previousBtnId = "previous-btn"
						this.nextBtnId = "next-btn"; 
					}
				}
				this.SugarPresence.sendMessage({
					user: this.SugarPresence.getUserInfo(),
					content: {
						action: 'update-players',
						connectedPlayers: this.connectedPlayers
					}
				});
			}
		},

		onRecord: function(error){
			var that = this;
			if (this.SugarPresence.isShared()) return;
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
								var reader = new FileReader();
								reader.onloadend = function (evt) {
									that.playIconId = "play"
									if (that.grid){
										that.gridAudioRecord = evt.target.result;
									} else {
										that.singleAudioRecords[that.activeImageIndex]=evt.target.result;
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
				if (that.recording){
					that.recording = false;
					that.recordIconId="record";
						that.recordRTC.stopRecording(function () {
							that.recordRTC.getDataURL(function (dataURL) {
									that.playIconId = "play";
									if (that.grid){
										that.gridAudioRecord = dataURL;
									} else {
										that.singleAudioRecords[that.activeImageIndex]=dataURL;
									}
									if (that.mediaStream.stop) that.mediaStream.stop();
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
			var that = this;
			if (this.grid){
				if (that.gridAudioRecord != null){
					var dataURL = that.gridAudioRecord;
					var mimetype = dataURL.split(";")[0].split(":")[1];
					var metadata = {
						mimetype: mimetype,
						title: "Story by "+ that.environment.user.name + " in Grid Mode",
						activity: "org.olpcfrance.MediaViewerActivity",
						timestamp: new Date().getTime(),
						creation_time: new Date().getTime(),
						file_size: 0 
					};
					that.$refs.SugarJournal.createEntry(dataURL, metadata);
					that.$refs.SugarPopup.log(that.SugarL10n.get("GridModeAudioExported"))
				}
			} else {
				if (that.singleAudioRecords[that.activeImageIndex] != null){
					var dataURL = that.singleAudioRecords[that.activeImageIndex];
					var mimetype = dataURL.split(";")[0].split(":")[1];
					var metadata = {
						mimetype: mimetype,
						title: "Story by "+ that.environment.user.name + " for Image " + (that.activeImageIndex+1),
						activity: "org.olpcfrance.MediaViewerActivity",
						timestamp: new Date().getTime(),
						creation_time: new Date().getTime(),
						file_size: 0
					};
					that.$refs.SugarJournal.createEntry(dataURL, metadata);
					that.$refs.SugarPopup.log(that.SugarL10n.get("SingleModeAudioExported"))
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
						if (that.grid){
							if (that.gridAudioRecord!=null){
								that.playIconId = "play"
							} else {
								that.playIconId = "play-inactive"
							}
						} else {
							if (that.singleAudioRecords[that.activeImageIndex]!=null){
								that.playIconId = "play"
							} else {
								that.playIconId = "play-inactive"
							}
						}
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
						if (that.grid){
							if (that.gridAudioRecord!=null){
								that.playIconId = "play"
							} else {
								that.playIconId = "play-inactive"
							}
						} else {
							if (that.singleAudioRecords[that.activeImageIndex]!=null){
								that.playIconId = "play"
							} else {
								that.playIconId = "play-inactive"
							}
						}
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
			if (this.grid){
				if (this.gridAudioRecord!=null){
					this.playIconId = "play"
				} else {
					this.playIconId = "play-inactive"
				}
			} else {
				if (this.singleAudioRecords[this.activeImageIndex]!=null){
					this.playIconId = "play"
				} else {
					this.playIconId = "play-inactive"
				}
			}
			this.isPlaying = false;
		},

		speakStory: function(){
			if (this.isPlaying) return;
			var text = this.editor.getText();
			this.$refs.SugarSpeak.speech(text);
		},

		onHelp: function(){
			var steps =[
				{
					title: this.l10n.stringTutoExplainTitle,
					intro: this.l10n.stringTutoExplainContent
				},
				{
					element: "#network-button",
					position: "bottom",
					title: this.l10n.stringTutoNetworkTitle,
					intro: this.l10n.stringTutoNetworkContent
				},
				{
					element: "#grid-mode, #single-mode",
					position: "bottom",
					title: this.l10n.stringTutoToggleModeTitle,
					intro: this.l10n.stringTutoToggleModeContent
				},
				{
					element: "#size-palette",
					position: "bottom",
					title: this.l10n.stringTutoGridSizeTitle,
					intro: this.l10n.stringTutoGridSizeContent
				},
				{
					element: "#foreground-color-button",
					position: "bottom",
					title: this.l10n.stringTutoForegroundColorTitle,
					intro: this.l10n.stringTutoForegroundColorContent
				},
				{
					element: "#background-color-button",
					position: "bottom",
					title: this.l10n.stringTutoBackgroundColorTitle,
					intro: this.l10n.stringTutoBackgroundColorContent
				},
				{
					element: "#format-text-button",
					position: "bottom",
					title: this.l10n.stringTutoFormatTextTitle,
					intro: this.l10n.stringTutoFormatTextContent
				},
				{
					element: "#font-button",
					position: "bottom",
					title: this.l10n.stringTutoChooseFontTitle,
					intro: this.l10n.stringTutoChooseFontContent
				},
				{
					element: "#increase-font",
					position: "bottom",
					title: this.l10n.stringTutoIncreaseFontTitle,
					intro: this.l10n.stringTutoIncreaseFontContent
				},
				{
					element: "#decrease-font",
					position: "bottom",
					title: this.l10n.stringTutoDecreaseFontTitle,
					intro: this.l10n.stringTutoDecreaseFontContent
				},
				{
					element: "#export-palette",
					position: "bottom",
					title: this.l10n.stringTutoExportStoryTitle,
					intro: this.l10n.stringTutoExportStoryContent
				},
				{
					element: "#export-sound",
					position: "bottom",
					title: this.l10n.stringTutoExportSoundTitle,
					intro: this.l10n.stringTutoExportSoundContent
				},
				{
					element: "#record, #record-start",
					position: "left",
					title: this.l10n.stringTutoRecordTitle,
					intro: this.l10n.stringTutoRecordContent
				},
				{
					element: "#play, #play-inactive",
					position: "left",
					title: this.l10n.stringTutoPlayTitle,
					intro: this.l10n.stringTutoPlayContent
				},
				{
					element: "#speak-inactive, #speak",
					position: "left",
					title: this.l10n.stringTutoSpeakTitle,
					intro: this.l10n.stringTutoSpeakContent
				},
				{
					element: "#next-btn",
					position: "left",
					title: this.l10n.stringTutoNextImageTitle,
					intro: this.l10n.stringTutoNextImageContent
				},
				{
					element: "#previous-btn",
					position: "left",
					title: this.l10n.stringTutoPrevImageTitle,
					intro: this.l10n.stringTutoPrevImageContent
				}
				

			];
			this.$refs.SugarTutorial.show(steps);
		},
		
		storeData: function() {
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
				activeImageIndex: this.activeImageIndex,
				fontSelected: this.fontSelected,
				fontSize:this.fontSize,
				gridAudioRecord: this.gridAudioRecord,
				singleAudioRecords: this.singleAudioRecords,
				imagesURL: JSON.stringify(this.imagesURL),
				gridImageURL: this.gridImageURL
			};
			this.$refs.SugarJournal.saveData(context);
		},
		
		onStop: function() {
			this.storeData();
		}
	}
});
