// Component to display a place
var StreetPlace = {
	template: `
		<div class="place">
			<img v-bind:src="image" @load="loaded" @error="error" class="place-image" v-bind:style="{visibility:visible?'visible':'hidden'}"/>
			<img src="images/notloaded.png" class="place-image" v-bind:style="{visibility:!visible?'visible':'hidden'}"/>
			<div class="place-label">
				<span>{{formattedIncome}}</span>
				<br>
				<span class="place-country">{{flag}}&nbsp;{{place.country.name}}</span>
			</div>
			<img src="images/spinner-light.gif" v-bind:style="{visibility:(visible&&!isLoad&&!hasError)?'visible':'hidden'}" class="place-spinner"/>
		</div>
	`,
	props: ['place'],
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
			return new Intl.NumberFormat(app.$refs.api.language,{style:'currency', currency:'USD'}).format(Math.floor(this.place.place.income)).replace("$US","$");
		},
		flag: function() {
			return this.place.country.id.toUpperCase().replace(/./g, function(char) { return String.fromCodePoint(char.charCodeAt(0)+127397); });
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
		}
	},
	watch: {
		// Load image only when component is visible
		visible: function(val) {
			this.visible = val;
			if (this.visible) {
				this.image = this.place.images.cropped360;
			}
		}
	}
};
