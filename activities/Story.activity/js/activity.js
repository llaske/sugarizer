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
		grid: true,
		images: [],
		activeImage: "",
		activeImageIndex: 0,
		previousBtnId: null,
		nextBtnId: null,
		recordIconId: null,
		imageCount: 9,	//update with Image slider
		imageLoaded: 0,
		intervalIds: [],
		colors: null,
		isLoaded: false,
		sizes: ['16px', '24px', '32px' ,'40px', '48px' , '56px', '64px' , '72px' , '80px' , '100px'],
		gridEditorContent: null,
		singleEditorsContent: [],
		editor: null,
		boldSelected: false,
		italicSelected: false,
		underlineSelected: false
	},
	methods: {
		initialized: function () {
			// Sugarizer initialized
			var environment = this.$refs.SugarActivity.getEnvironment();	
			this.colors = [environment.user.colorvalue.fill, environment.user.colorvalue.stroke, '#FFFFFF'];
			if (this.activeImageIndex===0){
				this.previousBtnId = "previous-btn-inactive";
				this.nextBtnId = "next-btn"; 
			} else if (this.activeImageIndex===this.image.length - 1){
				this.previousBtnId = "previous-btn";
				this.nextBtnId = "next-btn-inactive"; 
			}
			this.recordIconId = "record";
			document.getElementById('grid-mode').classList.add("active");
			for (var i=0; i<this.imageCount; i++){
				this.singleEditorsContent.push(null);
			}
			this.imageLoaders();
			this.loadImages();
			this.loadEditor();			
		},
		increaseFont: function(){
			var currentSize = this.editor.getFormat();
			var that = this;
			if(currentSize.size==null){
				var index = that.sizes.indexOf('24px');
				that.editor.format('size',that.sizes[index+1]);
			} else {
				var index = that.sizes.indexOf(currentSize.size);
				index++;
				if(index<that.sizes.length){
					that.editor.format('size',that.sizes[index]);
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
			}
			else {
				var index = that.sizes.indexOf(currentSize.size);
				index--;
				if(index>=0){
					that.editor.format('size',that.sizes[index]);
				}
			}
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
					if(navigator.userAgent.indexOf("Safari") != -1){
						if (req.readyState === 4 && req.response != ""){
							return true;
						} else {
							return false;
						}	
					} else {
						if (req.readyState === 4){
							return true;
						} else {
							return false;
						}	
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
		getUrlImg: function(img){
			return '../Abecedarium.activity/images/database/'+ img + '.png';
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
			for (var i=0; i<len; i++){
				quesimgs[i].style.background = getColor();
				(function (i){
					var intervalId = setInterval(function(){quesimgs[i].style.background = getColor()}, 900);
					that.intervalIds.push(intervalId);
				})(i);
			}
		},
		onFormatText: function(event){
			console.log(event.format)
			this.editor.focus()
		},
		gridImageMode: function(){
			this.grid=true;
			document.getElementById('grid-mode').classList.add("active");
			document.getElementById('single-mode').classList.remove("active");
			this.singleEditorsContent[this.activeImageIndex]= this.editor.getContents();
			this.editor.setContents(this.gridEditorContent);
			this.editor.format('size', '24px');
		},
		singleImageMode: function(){
			this.grid = false;
			document.getElementById('grid-mode').classList.remove("active");
			document.getElementById('single-mode').classList.add("active");
			this.activeImage = this.images[this.activeImageIndex];
			this.gridEditorContent = this.editor.getContents();
			this.editor.setContents(this.singleEditorsContent[this.activeImageIndex]);
			this.editor.format('size', '24px'); 
			if (this.activeImageIndex === 0){
				this.previousBtnId = "previous-btn-inactive";
			}
		},
		previousImage: function () {
			if (this.activeImageIndex === 0){
				return;
			}
			this.nextBtnId = "next-btn"; 
			this.singleEditorsContent[this.activeImageIndex]= this.editor.getContents();
			this.activeImageIndex = this.activeImageIndex - 1; 
			this.editor.setContents(this.singleEditorsContent[this.activeImageIndex]);
			this.editor.format('size', '24px');
			this.activeImage = this.images[this.activeImageIndex];
			if (this.activeImageIndex === 0){
				this.previousBtnId = "previous-btn-inactive";
			}
		},
		nextImage: function () {
			if (this.activeImageIndex === this.images.length-1){
				return;
			}
			this.previousBtnId = "previous-btn"
			this.singleEditorsContent[this.activeImageIndex]= this.editor.getContents();
			this.activeImageIndex = this.activeImageIndex + 1; 
			this.editor.setContents(this.singleEditorsContent[this.activeImageIndex]);
			this.editor.format('size', '24px');
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
	}
});
