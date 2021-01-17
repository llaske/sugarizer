// Component to display a place
var StreetPlace = {
	template: `
		<div class="place">
			<img v-bind:src="image" @load="loaded" @error="error" class="place-image"/>
			<div class="place-label">
				<span>{{formattedIncome}}</span>
				<br>
				<span class="place-country">{{place.country.name}}</span>
			</div>
			<img src="images/spinner-light.gif" v-bind:style="{visibility:(isLoad||hasError)?'hidden':'visible'}" class="place-spinner"/>
		</div>
	`,
	props: ['place'],
	data: function() {
		return {
			image: null,
			isLoad: false,
			hasError: false
		};
	},
	created: function() {
		this.image = this.place.images.cropped360;
	},
	computed: {
		formattedIncome: function() {
			return new Intl.NumberFormat(app.$refs.api.language,{style:'currency', currency:'USD'}).format(Math.floor(this.place.place.income)).replace("$US","$");
		}
	},
	methods: {
		// Image for street place is loaded
		loaded: function() {
			this.isLoad = true;
			this.hasError = false;
		},

		// Error on loading image for street place
		error: function() {
			this.isLoad = false;
			this.hasError = true;
			this.image = "images/notloaded.png";
		}
	}
};
