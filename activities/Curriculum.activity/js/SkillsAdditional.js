
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
						<button id="delete-button" @click="$emit('delete-item')"></button>
					</div>

				</div>
			</div>
		</div>
	`,
	props: ['item'],
	computed: {
		date: function () {
			// return new Date(this.item.timestamp).toDateString();
			return this.timestampToElapsedString(this.item.timestamp, 2);
		}
	},
	data: function () {
		return {
			showPopup: false,
			units: [
				{ name: 'Years', factor: 356 * 24 * 60 * 60 },
				{ name: 'Months', factor: 30 * 24 * 60 * 60 },
				{ name: 'Weeks', factor: 7 * 24 * 60 * 60 },
				{ name: 'Days', factor: 24 * 60 * 60 },
				{ name: 'Hours', factor: 60 * 60 },
				{ name: 'Minutes', factor: 60 }
			]
		}
	},
	methods: {
		timestampToElapsedString: function (timestamp, maxlevel, issmall) {
			var suffix = (issmall ? "_short" : "");
			var levels = 0;
			var time_period = '';
			var elapsed_seconds = ((new Date().getTime()) - timestamp) / 1000;
			for (var i = 0; i < this.units.length; i++) {
				var factor = this.units[i].factor;

				var elapsed_units = Math.floor(elapsed_seconds / factor);
				if (elapsed_units > 0) {
					if (levels > 0)
						time_period += ',';

					time_period += ' ' + elapsed_units + " " + (elapsed_units == 1 ? this.$root.$refs.SugarL10n.get(this.units[i].name + "_one" + suffix) : this.$root.$refs.SugarL10n.get(this.units[i].name + "_other" + suffix));

					elapsed_seconds -= elapsed_units * factor;
				}

				if (time_period != '')
					levels += 1;

				if (levels == maxlevel)
					break;
			}

			if (levels == 0) {
				return this.$root.$refs.SugarL10n.get("SecondsAgo" + suffix);
			}

			return this.$root.$refs.SugarL10n.get("Ago" + suffix, { time: time_period });
		}
	},

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
