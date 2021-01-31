// Component to display a family

// Size images : full512: 512×341, full1024:1024×683, full2048:2048×1365

var Family = {
	template: `
		<div class="family-detail">
			<div>
				<div class="family-goback" v-on:click="goBack()"></div>
				<img :src="place.images.full512" class="family-image"/>
				<div id="family-description" class="family-description">
					<div class="family-income">{{formattedIncome}}</div><div class="family-bymonth">/month</div>
					<div class="family-name">{{capitalizeName}}, {{place.country.name}}</div>
					<div class="family-content">{{place.place.description}}</div>
				</div>
			</div>
			<div id="family-things" class="family-things">
				<street-place ref="things" v-for="(place) in things" :place="place" :size="1" :topicMode="true"></street-place>
				<img id="family-spinner" src="images/spinner-light.gif"/>
			</div>
		</div>
	`,
	components: {
		'street-place': StreetPlace
	},
	props: {
		place: { type: Object },
		things: { type: Array, default: [] }
	},
	data: function() {
		return {
		};
	},
	mounted: function() {
		let vm = this;
		document.getElementById("family-description").style.width = (document.getElementById("body").offsetWidth - 512 - 100 - 10)+"px";
		document.getElementById("family-things").style.height = (document.getElementById("body").offsetHeight - 341 - 20 - (app.$refs.SugarToolbar&&app.$refs.SugarToolbar.isHidden()?0:55))+"px";
		document.getElementById("family-spinner").style.visibility = "visible";
		app.$refs.api.getThingsForPlace(vm.place).then(function(things) {
			let places = [];
			for (let i = 0 ; i < things.length ; i++) {
				places.push(things[i]);
			}
			document.getElementById("family-spinner").style.visibility = "hidden";
			vm.things = places;
			setTimeout(function() {
				let things = vm.$refs.things;
				for (let i = 0 ; i < things.length ; i++) {
					things[i].visible = true;
				}
			}, 500);
		});
	},
	computed: {
		formattedIncome: function() {
			return new Intl.NumberFormat(app.$refs.api.language,{style:'currency', currency:'USD', maximumFractionDigits: 0}).format(Math.floor(this.place.place.income)).replace("$US","$");
		},
		capitalizeName: function() {
			return this.place.place.slug.replace(/-/g, " ").replace(/\b\w/g, function(c) { return c.toUpperCase()});
		}
	},
	methods: {
		goBack: function() {
			this.$emit('back-clicked', this.place);
		}
	}
};
