const Journal = {
	name: "Journal",
	template: `
	<div ref="journal-view" class="journal-view">
		Journal View
		<icon
			class="toolbutton"
			id="view_home_button"
			svgfile="./icons/view-radial.svg" 
			:color="768"
			:size="47"
			:title="$t('FavoritesView')"
			isNative="true"
			@click="$emit('closeJournal')"
		></icon>
	</div>
`,

	components: {
		icon: Icon,
		popup: Popup,
	},

	emits: ["closeJournal"],

	data() {
		return {
			journal: [],
		};
	},

	created() {
		sugarizer.modules.journal.load();
		this.journal = sugarizer.modules.journal.get();
		console.log(this.journal);
		this.updateJournal();
	},

	methods: {
		updateJournal() {},
		showPopupTimer(e, iconRef, data) {
			if (this.popupTimer != null) {
				window.clearTimeout(this.popupTimer);
			}
			this.popupTimer = window.setTimeout(
				this.showPopup.bind(this),
				this.constant.timerPopupDuration,
				e,
				iconRef,
				data
			);
		},
		showPopup(e, iconRef, popupData) {
			if (this.$refs.popup.isShown) this.removePopup(e); //remove before updating iconRef

			this.popupIconRef = iconRef;
			const offset = 6;
			e.clientX += offset;
			e.clientY += offset;

			this.popupItem = popupData;
			this.$refs.popup.show(e.clientX, e.clientY);
		},

		removePopupTimer(e) {
			if (this.popupTimer != null) {
				window.clearTimeout(this.popupTimer);
			}

			this.popupTimer = window.setTimeout(
				this.removePopup.bind(this),
				this.constant.timerPopupDuration,
				e
			);
		},
		removePopup(e) {
			const popupIcon = this.$refs[this.popupIconRef]?.[0];
			if (!popupIcon) this.hidePopup();
			else if (
				!this.$refs.popup.isCursorInside(e.clientX, e.clientY) &&
				!popupIcon.isCursorInside(e.clientX, e.clientY)
			) {
				this.hidePopup();
			}
		},

		hidePopup() {
			this.$refs.popup.hide();
			this.popupTimer = null;
			this.popupItem = null;
		},

		onPopupItemClick(itemId) {
			const popupData = this.$refs.popup.item;
			const handlerFunc = popupData?.handlers?.[itemId];
			if (handlerFunc) {
				handlerFunc();
				this.hidePopup();
			}
		},

		filterJournal() {},
	},
};
