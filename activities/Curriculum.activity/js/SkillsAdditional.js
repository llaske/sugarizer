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

var UploadItem = {
	/*html*/
	template: `
		<div>
			<div class="upload-item" @click="showPopup = true">
				<div v-if="item.type == 'image'" class="image-item">
					<img :src="item.data">
				</div>
				{{ item.title }} | {{ date }}

			</div>
			<div class="popup-container" v-if="showPopup" @click="showPopup = false">
				<div class="popup" @click.stop="">
					<img v-if="item.type == 'image'" :src="item.data" :alt="item.title" class="popup-image">

					<div class="popup-actions">
						<div class="">
							<p>Title: {{ item.title }}</p>
							<p>Upload Date: {{ date }}</p>
						</div>
						<button id="delete-button" @click="$emit('delete-item')"></button>
					</div>

				</div>
			</div>
		</div>
	`,
	props: ['item'],
	computed: {
		date: function() {
			return new Date(this.item.timestamp).toDateString();
		}
	},
	data: function() {
		return {
			showPopup: false
		}
	}
}