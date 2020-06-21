var Medal = {
	/*html*/
	template: `
		<div class="medal-container" v-on="$listeners" v-bind="$attrs">
			<div :class="{'medal-small': small, 'medal-large': !small}">
				<!-- 
				<div ref="medal" class="medal" v-show="!acquired">
					<p v-show="!small" class="grade">{{ levels[notationLevel][acquired].grade }}<p>
				</div>
				-->
				<div ref="medalAcquired" class="medal acquired buddy">
					<p v-show="!small" class="grade">{{ levels[notationLevel][acquired].grade }}<p>
				</div>
				<div v-show="acquired == notationLevel" class="shine"></div>
				<div v-show="acquired == notationLevel" class="shine"></div>
				<div v-show="acquired == notationLevel" class="shine" ref="shine1"></div>
				<div v-show="acquired == notationLevel" class="shine" ref="shine2"></div>
			</div>
		</div>
	`,
	props: {
		small: Boolean,
		acquired: Number,
		notationLevel: {
			type: Number,
			default: 1
		},
		levels: Object
	},
	data: {
		icon: null
	},
	computed: {
		colors: function() {
			if(this.notationLevel == 1 && this.acquired && this.$root.$refs.SugarActivity.getEnvironment()) {
				return this.$root.$refs.SugarActivity.getEnvironment().user.colorvalue;
			} else {
				return this.levels[this.notationLevel][this.acquired].colors;
			}
		}
	},
	watch: {
		colors: function(newVal, oldVal) {
			this.colorizeElements(newVal);
		}
	},
	mounted: function () {
		this.colorizeElements(this.colors);
	},
	methods: {
		colorizeElements(colors) {
			// this.icon.colorize(this.$refs.medalAcquired, colors);
			var vm = this;
			this.$root.$refs.SugarIcon.generateIconWithColors("../icons/medal.svg", colors, function(src) {
				vm.$refs.medalAcquired.style.backgroundImage = `url(${src})`;
			});
			if(!this.small) {
				this.$root.$refs.SugarIcon.colorize(this.$refs.shine1, colors);
				this.$root.$refs.SugarIcon.colorize(this.$refs.shine2, colors);
			}
			this.$refs.medalAcquired.style.color = this.colors.stroke;
		}
	}
}

var UploadItem = {
	/*html*/
	template: `
		<div>
			<div class="uploaded-item" @click="showPopup = true">
				<div v-if="item.type == 'image'" class="item">
					<img :src="item.data" class="image-preview">
				</div>
				<div v-else-if="item.type == 'audio'" class="item">
					<img src="icons/audio.svg" class="audio-preview">
				</div>
				<div v-else-if="item.type == 'video'" class="item">
					<img src="icons/video.svg" class="video-preview">
				</div>
			</div>

			<div class="popup-container" v-if="showPopup" @click="showPopup = false">
				<div class="popup" @click.stop="">
					<button id="popup-close" @click="showPopup = false"></button>
					<img v-if="item.type == 'image'" :src="item.data" :alt="item.title" class="popup-image">
					<audio v-if="item.type == 'audio'" :src="item.data" :title="item.title" class="popup-audio" controls></audio>
					<video v-if="item.type == 'video'" :src="item.data" :title="item.title" class="popup-video" controls></video>

					<div class="popup-actions">
						<div class="">
							<p>{{ item.title }}</p>
							<p>{{ date }}</p>
						</div>
						<button id="delete-button" @click="onDeleteClick"></button>
					</div>

				</div>
			</div>
		</div>
	`,
	props: ['item'],
	computed: {
		date: function () {
			return this.$root.$refs.SugarL10n.timestampToElapsedString(this.item.timestamp, 2);
		}
	},
	data: function () {
		return {
			showPopup: false,
		}
	},
	methods: {
		onDeleteClick: function() {
			this.$emit('delete-item');
			this.showPopup = false;
		}
	}
}

var Flag = {
	/*html*/
	template: `
		<div class="flag">
			<div v-if="small" class="flag-small">
				<div class="pole"></div>
				<img :src="raised ? 'icons/flag-green.svg' : 'icons/flag-red.svg'" class="fly" :style="{ top: raised ? '0' : '50%' }">
			</div>
			<div v-else class="flag-large">
				<img src="icons/clouds.svg" class="bg">
				<div class="pole"></div>
				<img :src="raised ? 'icons/flag-green.svg' : 'icons/flag-red.svg'" class="fly" :style="{ top: raised ? '0' : '50%' }">
				<img v-if="raised" src="icons/flag-star.svg" class="star1">
				<img v-if="raised" src="icons/flag-star.svg" class="star2">
			</div>
		</div>
	`,
	props: {
		small: Boolean,
		raised: Boolean
	}
}
