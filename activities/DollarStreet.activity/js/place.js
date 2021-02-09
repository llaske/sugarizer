// Component to display a place

const imageSize = [80, 180, 360, 640];

var StreetPlace = {
	template: `
		<div class="place-padding">
			<div v-bind:class="containerClass" @click="onPlaceClicked">
				<img v-bind:src="image" @load="loaded" @error="error" class="place-image" v-bind:style="{visibility:visible?'visible':'hidden'}"/>
				<img v-bind:src="rightNotLoadedImage" class="place-image place-image2" v-bind:style="{visibility:!visible?'visible':'hidden'}"/>
				<div v-if="size>0" v-bind:class="descriptionClass">
					<span>{{"&nbsp;"+formattedIncome}}</span>
					<br>
					<span v-if="!topicMode" class="place-country">&nbsp;{{flag}}&nbsp;{{place.country.name}}</span>
				</div>
				<div v-if="size>0" v-html="thingIcon" class="place-icon"></div>
				<img src="images/spinner-light.gif" v-bind:style="{visibility:(visible&&!isLoad&&!hasError)?'visible':'hidden'}" class="place-spinner"/>
			</div>
		</div>
	`,
	props: {
		place: { type: Object },
		size: { type: Number, default: 2 },
		topicMode: { type: Boolean, default: false }
	},
	data: function() {
		return {
			image: null,
			isLoad: false,
			hasError: false,
			visible: false
		};
	},
	computed: {
		formattedIncome: function() {
			if (this.topicMode) {
				let thing = app.$refs.api.getThingByTopic(this.place.topics[0]);
				return thing && thing.thingName ? thing.thingName : "";
			} else {
				return new Intl.NumberFormat(app.$refs.api.language,{style:'currency', currency:'USD', maximumFractionDigits: 0, minimumFractionDigits: 0}).format(Math.floor(this.place.place.income)).replace("$US","$");
			}
		},
		flag: function() {
			return this.place.country.id.toUpperCase().replace(/./g, function(char) { return String.fromCodePoint(char.charCodeAt(0)+127397); });
		},
		thingIcon: function() {
			let thing = app.$refs.api.getThingByTopic(this.place.topics[0]);
			return thing ? thing.svg : "";
		},
		containerClass: function() {
			return {place: true, place0: (this.size==0), place1: (this.size==1), place2: (this.size==2), place3: (this.size==3)};
		},
		descriptionClass: function() {
			return {placelabel: true, placelabel0: (this.size==0), placelabel1: (this.size==1), placelabel2: (this.size==2), placelabel3: (this.size==3)};
		},
		rightNotLoadedImage: function() {
			return 'images/notloaded'+this.size+'.png';
		}
	},
	methods: {
		// Image for street place is loaded
		loaded: function() {
			this.isLoad = true;
			this.hasError = false;
			this.visible = true;
		},

		// Error on loading image for street place
		error: function() {
			this.isLoad = false;
			this.hasError = true;
			this.visible = false;
		},

		// Test if the item is visible
		isVisible: function() {
			let rect = this.$el.getBoundingClientRect();
			return rect.top < window.innerHeight && rect.bottom >= 0;
		},

		// Place clicked
		onPlaceClicked: function() {
			this.$emit('place-clicked', this.place);
		}
	},
	watch: {
		// Load image only when component is visible
		visible: function(val) {
			this.visible = val;
			if (this.visible) {
				this.image = this.place.images["cropped"+imageSize[this.size]];
			}
		},
		size: function(val) {
			this.size = val;
			if (this.visible) {
				this.image = this.place.images["cropped"+imageSize[this.size]];
			}
		}
	}
};
