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
		images: ["https://i.ibb.co/QkBsPS3/Screenshot-from-2021-04-02-01-25-34.png", "https://i.ibb.co/Rv25tbt/sampleimage2.png","https://i.ibb.co/L91Lcz5/sampleimage3.png", "https://i.ibb.co/M8cPxbh/sampleimage4.png", "https://i.ibb.co/0Z73LGZ/sampleimage5.png", "https://i.ibb.co/gvTcPCH/sampleimage6.png", "https://i.ibb.co/98yqR7b/sampleimage7.png", "https://i.ibb.co/mGK22f3/sampleimage8.png", "https://i.ibb.co/YD1WVmp/sampleimage9.png" ],
	activeImage: "",
	activeImageIndex: 0,
	previousBtnId: null,
	nextBtnId: null,
	recordIconId: null
	},
	methods: {
		initialized: function () {
			// Sugarizer initialized
			var environment = this.$refs.SugarActivity.getEnvironment();	
			if (this.activeImageIndex===0){
				this.previousBtnId = "previous-btn-inactive";
				this.nextBtnId = "next-btn"; 
			} else if (this.activeImageIndex===this.image.length - 1){
				this.previousBtnId = "previous-btn";
				this.nextBtnId = "next-btn-inactive"; 
			}
			this.recordIconId = "record";
			document.getElementById('grid-mode').classList.add("active");
		},
		gridImageMode: function(){
			this.grid=true;
			document.getElementById('grid-mode').classList.add("active");
			document.getElementById('single-mode').classList.remove("active");
		},
		singleImageMode: function(){
			this.grid = false;
			document.getElementById('grid-mode').classList.remove("active");
			document.getElementById('single-mode').classList.add("active");
			this.activeImage = this.images[this.activeImageIndex];
			if (this.activeImageIndex === 0){
				this.previousBtnId = "previous-btn-inactive";
			}
		},
		previousImage: function () {
			if (this.activeImageIndex === 0){
				return;
			}
			this.nextBtnId = "next-btn"; 
			this.activeImageIndex = this.activeImageIndex - 1; 
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
			this.activeImageIndex = this.activeImageIndex + 1; 
			this.activeImage = this.images[this.activeImageIndex];
			if (this.activeImageIndex === this.images.length-1){
				this.nextBtnId = "next-btn-inactive"; 
			}	
		}
	}
});
