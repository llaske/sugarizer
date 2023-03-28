// Component to display a family

// Size images : full512: 512×341, full1024:1024×683, full2048:2048×1365

var Family = {
	template: `
		<div class="family-detail">
			<div>
				<div class="family-goback" id="family-goback" v-on:click="goBack()"></div>
				<div class="family-image-container" v-on:click="showImage(place)">
					<img :src="place.images.full512" class="family-image"/>
				</div>
				<div id="family-description" class="family-description">
					<div class="family-income">{{formattedIncome}}</div><div class="family-bymonth">{{"/"+app.$refs.SugarL10n.get("Months_one")}}</div>
					<div class="family-name">{{capitalizeName}}, {{place.country.name}}</div>
					<div class="family-content">{{""}}</div>
				</div>
			</div>
			<div id="family-things" class="family-things">
				<div class="flex-container">
					<street-place ref="things" v-for="(place,index) in things" :place="place" :size="1" :topicMode="true" @place-clicked="showImage(place,index)"></street-place>
				</div>
				<img id="family-spinner" src="images/spinner-light.gif"/>
			</div>
			<popup ref="imageDialog"></popup>
		</div>
	`,
	components: {
		'street-place': StreetPlace,
		'popup': Popup
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
		vm.computeSize();
		document.getElementById("family-spinner").style.visibility = "visible";
		app.$refs.api.getThingsForPlace(vm.place).then(function(things) {
			let spinner = document.getElementById("family-spinner");
			if (!spinner) { return; }
			let places = [];
			for (let i = 0 ; i < things.length ; i++) {
				places.push(things[i]);
			}
			spinner.style.visibility = "hidden";
			vm.things = places;
			setTimeout(function() {
				let things = vm.$refs.things;
				if (!things) { return; }
				for (let i = 0 ; i < things.length ; i++) {
					things[i].visible = true;
				}
				_all_things=vm.things;
			}, 500);
		});
	},
	computed: {
		formattedIncome: function() {
			return new Intl.NumberFormat(app.$refs.api.language,{style:'currency', currency:'USD', maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(Math.floor(this.place.place.income)).replace("$US","$");
		},
		capitalizeName: function() {
			return _capitalize(this.place.place.slug);
		}
	},
	methods: {
		computeSize: function() {
			let body = document.getElementById("body");
			let small = (body.offsetWidth<750);
			document.getElementById("family-description").style.width = (body.offsetWidth - (small?256:512) - 100 - 19)+"px";
			document.getElementById("family-things").style.height = (body.offsetHeight - (small?170:341) - 20 - (app.$refs.SugarToolbar&&app.$refs.SugarToolbar.isHidden()?0:55))+"px";
		},

		goBack: function() {
			let vm = this;
			document.getElementById("family-goback").style.visibility = "hidden";
			setTimeout(function() {
				vm.$emit('back-clicked', vm.place);
			}, 0);
		},

		showImage: function(place, index=-1) {
			let image = place.images.full2048;
			_place_to_export = place;
			_current_index=index;
			let titleClose = app.$refs.SugarL10n.get("Close");
			this.$refs.imageDialog.show({
				content: `
					<div id='popup-container'>
						<div id="popup-image" class="popup-image" style="background-image:url(`+image+`)"/>
						</div>
						<img id="export-image" class="popup-hidden-image" src="`+image+`"/>
						<div id="popup-export" onclick="_image_export()"></div>
						<div id="left" class="place-left" onclick="previousPlace()" style="visibility: hidden;"></div>
						<div id="right" class="place-right" onclick="nextPlace()" style="visibility: hidden;"></div>
						<div class="popup-credit">Photo DollarStreet - licensed under CC BY 4.0</div>
					</div>`,
				closeHtml: "",
				closeStyles: {
					outline: "none",
					backgroundImage: "url(lib/sugar-web/graphics/icons/actions/dialog-cancel.svg)",
					backgroundSize: "contain",
					width: "40px",
					height: "40px",
					position: "absolute",
					top: "5px",
					right: "5px"
				},
				modalStyles: {
					backgroundColor: "white",
					maxHeight: "90%",
					height: "90%",
					width: "90%",
					maxWidth: "90%"
				}
			});
		}
	}
};

// Capitalize name
function _capitalize(name) {
	return name.replace(/-/g, " ").replace(/\b\w/g, function(c) { return c.toUpperCase()});
}

var _current_index=null;
var _all_things=null;
function previousPlace(){
	if(_current_index==_all_things.length-1) {
		document.getElementById('right').style.visibility="visible";
	}
	_current_index=_current_index-1;
	let index=_current_index;
	let image=_all_things[index].images.full2048;
	if(index==0) {
		document.getElementById('left').style.visibility="hidden";
	}
	document.getElementById('popup-image').style.backgroundImage="url("+image+")";
}

function nextPlace(){
	if(_current_index==0) {
		document.getElementById('left').style.visibility="visible";
	}
	_current_index=_current_index+1;
	let index=_current_index;
	let image=_all_things[index].images.full2048;
	if(index==_all_things.length-1) {
		document.getElementById('right').style.visibility="hidden";
	}
	document.getElementById('popup-image').style.backgroundImage="url("+image+")";
}

// Export popup
// HACK: Should be global
var _place_to_export = null;
function _image_export() {
	// Get name
	let place = _place_to_export;
	let thing = app.$refs.api.getThingByTopic(place.topics[0]);
	let name = _capitalize(place.place.slug) + " - " + thing.thingName;

	// Get image into a canvas
	var image = document.getElementById("export-image");
	var imgCanvas = document.createElement("canvas");
	var imgContext = imgCanvas.getContext("2d");
	imgCanvas.width = 2048; imgCanvas.height = 1365;
	imgContext.drawImage(image, 0, 0, imgCanvas.width, imgCanvas.height);
	var imgAsDataURL = imgCanvas.toDataURL("image/jpg");

	// Save in datastore
	var metadata = {
		mimetype: "image/jpg",
		title: name,
		activity: "org.olpcfrance.MediaViewerActivity",
		timestamp: new Date().getTime(),
		creation_time: new Date().getTime(),
		file_size: 0
	};
	app.$refs.SugarJournal.createEntry(imgAsDataURL, metadata).then(function() {
		let place = _place_to_export;
		app.$refs.popup.log(app.$refs.SugarL10n.get("ImageExported"));
	});
}
