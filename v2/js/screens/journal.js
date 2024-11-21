const Journal = {
	name: "Journal",
	template: `
	<transition name="fade" appear>
	<div ref="journal-view" class="journal-view">
		<div class="toolbar" v-show="checkboxSelected === 0">
			<div class="tool_leftitems journal-toolleft">
				<searchfield
					ref="searchfield"
					tabindex="0"
					@input-changed="searchChanged"
					:placeholder="$t('SearchJournal')"
				/>
				<icon
					id="favoritebutton"
					svgfile="./icons/emblem-favorite.svg"
					isNative="true"
					:color="filterFavorite ? buddycolor : undefined"
					:size="constant.iconSizeList"
					:title="$t('FilterFavorite')"
					@click="toggleFilterValue('filterFavorite')"
				/>
				<icon
					id="assignmentbutton"
					svgfile="./icons/assignment.svg"
					isNative="true"
					:color="filterAssignment ? buddycolor : undefined"
					:size="constant.iconSizeList"
					:title="$t('FilterAssignment')"
					@click="toggleFilterValue('filterAssignment')"
				/>
				<filter-box 
					ref="typepalette"
					name="typepalette"
					id="typepalette"
					:options="typePalette"
					@filter-selected="activityFilterSelected"
					:title="$t('FilterByType')"
				></filter-box>
				<filter-box 
					ref="datepalette"
					name="datepalette"
					:options="datePalette"
					@filter-selected="dateFilterSelected"
					:title="$t('FilterByTime')"
				></filter-box>
				<filter-box 
					ref="sortpalette"
					name="sortpalette"
					:options="sortPalette"
					@filter-selected="sortSelected"
					:title="$t('Sort')"
				></filter-box>
				<hr />
				<icon
					id="fromdevicebutton"
					class="toolbutton"
					svgfile="./icons/copy-from-device.svg"
					isNative="true"
					:size="constant.iconSizeList"
					:title="$t('CopyFromDevice')"
					@click="fromDeviceSelected"
				/>
				<hr />
				<icon
					class="toolbutton"
					id="toolbar-help-btn"
					svgfile="./icons/help.svg"
					isNative="true"
					:size="47"
					:color="768"
					:title="$t('Tutorial')"
					isNative="true"
				></icon>
			</div>
			<div class="tool_rightitems">
				<icon
					class="toolbutton"
					id="view_home_button"
					svgfile="./icons/view-radial.svg" 
					isNative="true"
					:size="47"
					:title="$t('FavoritesView')"
					isNative="true"
					@click="$emit('closeJournal')"
				></icon>
			</div>
		</div>
		<div class="toolbar" v-show="checkboxSelected > 0" :class="{ 'toolbar-disabled': showWarning }">
			<div class="tool_leftitems" style="gap: 12px">
				<icon
					id="unselallbutton"
					svgfile="./icons/select-none.svg"
					isNative="true"
					:size="constant.iconSizeList"
					:title="$t('UnselectAll')"
					@click="unselectAll"
				/>
				<icon
					id="selallbutton"
					svgfile="./icons/select-all.svg"
					isNative="true"
					:size="constant.iconSizeList"
					:title="$t('SelectAll')"
					@click="selectAll"
				/>
				<hr />
				<div v-for="operation in operations" v-show="operation.show()" :key="operation.id">
					<icon
						:id="operation.id"
						:svgfile="operation.svgfile"
						isNative="true"
						:size="constant.iconSizeList"
						:title="$t(operation.titleKey)"
						@click="handleOperation(operation)"
					/>
				</div>
				<hr />
				<span>{{ $t("Selected_one", {count: checkboxSelected, total: processedJournal.length}) }}</span>
			</div>
		</div>
		<transition name="fade" appear>
			<div class="journal-warningbox" v-show="showWarning">
				<div>
					<h4 style="margin: 0">{{ $t(warningKey) }}</h4>
					<span>{{ checkboxSelected === 1 ? $t(warningKey+"_one", {count:checkboxSelected}) : $t(warningKey+"_other",{count:checkboxSelected}) }}</span>
				</div>
				<icon-button 
					id="erase-cancel-btn"
					class="warningbox-cancel-button"
					svgfile="icons/dialog-cancel.svg"
					:size="20"
					:color="1024"
					:text="$t('Cancel')"
					@click="showWarning = false"
				></icon-button>
				<icon-button
					id="tick-icon"
					class="warningbox-refresh-button"
					svgfile="icons/dialog-ok.svg"
					:size="20"
					:color="1024"
					:text="$t('Ok')"
					isNative="true"
					@click="confirmOperation"
				></icon-button>
			</div>
		</transition>
		<div class="journal-list-container" ref="journalContainer" @scroll="handleScroll" :style="showFooter ? '' : 'height: calc(100vh - 55px)'">
			<transition-group name="fade">
			<div class="listview" id="journal-listview" v-for="(entry, idx) in visibleJournal" :key="entry.objectId" :ref="entry.objectId">
				<div class="listview_left">
					<input type="checkbox" class="journal-checkbox" v-model="entry.isChecked" @change="updateSelectedCount(entry.isChecked ? 1 : -1)">
					<icon
						:id="'star' + entry.objectId"
						class="journal-star"
						svgfile="./icons/star.svg"
						:size="22"
						:color="entry.metadata.keep ? buddycolor : 256"
						@click="toggleFavoriteActivity(entry)"
					></icon>
					<icon 
						:id=entry.objectId
						:ref=entry.objectId
						:svgfile="entry.activityIcon"
						:size="constant.iconSizeList"
						:color="entry.color"
						isNative="true"
						@click="runCurrentActivity(entry)"
						@mouseover="showPopupTimer($event, entry.objectId, entry.popupData)"
						@mouseleave="removePopupTimer"
					></icon>
					<input class="activity-name" v-model="entry.metadata.title" :class="{ 'nonEditing': !entry.isEditingTitle }" :readonly="!entry.isEditingTitle" @click="titleEditStart(entry)" @blur="titleEditEnd(entry)" />
					<div class="assignment-container" v-if=entry.metadata.assignmentId>
						<icon
							:id="'assgn-'+idx"
							svgfile="icons/assignment.svg"
							:color="buddycolor"
							:size="constant.iconSizeList"
							isNative="true"
						/>
						<div style="width: 40px">
							<icon
								:id="'assgn-inst-'+idx"
								:ref="'assgn-inst-'+idx"
								v-if="entry.metadata.instructions"
								svgfile="icons/instructions-icon.svg"
								:size="constant.iconSizeList"
								isNative="true"
								@mouseover="showPopupTimer($event, 'assgn-inst-'+idx, entry.assignmentData.popup)"
								@mouseleave="removePopupTimer"
							/>
						</div>
						<div style="width: 40px">
							<icon
								:id="'assgn-submit-'+idx"
								v-if="entry.assignmentData.isSubmittable"
								svgfile="icons/submit-assignment.svg"
								:size="constant.iconSizeList"
								isNative="true"
								@click="submitAssignment(entry)"
							/>
						</div>
						<h3 v-if="entry.assignmentData.dueDateText">{{ entry.assignmentData.dueDateText }}</h3>
					</div>
				</div>
				<span>{{ this.selectedSortFilter === "textsize" ? entry.metadata.formattedSize : this.selectedSortFilter == "timestamp" ? entry.metadata.timestampString : entry.metadata.creationTimeString }}</span>
			</div>
			</transition-group>
			<div v-if="processedJournal && processedJournal.length === 0" class="no-matching-activities">
				<icon
					id="journal-icon"
					svgfile="./icons/activity-journal.svg"
					:size="50"
					isNative="true"
					:disableHoverEffect="true"
				></icon>
				<div> {{ hasFilter() ? $t("NoMatchingEntries") : $t("JournalEmpty") }} </div>
				<icon-button
					v-if="hasFilter()"
					id="clear-search"
					svgfile="./icons/dialog-cancel.svg"
					:size="20"
					:color="1024"
					:text="$t('ClearSearch')"
					@click="clearFilters"
				></icon-button>
			</div>
			<div v-show="isLoading" class="journal-loader">
				<img src="./images/spinner-light.gif" alt="loading-spinner">
			</div>
		</div>
		<div class="toolbar journal-footer" v-if="showFooter">
			<icon
				class="toolbutton"
				:class="{active: this.journalType === constant.journalLocal}"
				id="journallocal"
				svgfile="./icons/activity-journal.svg"
				@click="showLocalJournal"
				:size="constant.iconSizeFooter"
				:color="buddycolor"
				:title="$t('Journal')"
				isNative="true"
			></icon>
			<icon
				class="toolbutton"
				:class="{active: this.journalType === constant.journalRemotePrivate}"
				id="cloudonebutton"
				svgfile="./icons/cloud-one.svg"
				@click="showPrivateCloud"
				:size="constant.iconSizeFooter"
				:color="buddycolor"
				:title="$t('Private')"
				isNative="true"
			></icon>
			<icon
				class="toolbutton"
				:class="{active: this.journalType === constant.journalRemoteShared}"
				id="cloudallbutton"
				svgfile="./icons/cloud-all.svg"
				@click="showSharedJournal"
				:size="constant.iconSizeFooter"
				:color="buddycolor"
				:title="$t('Shared')"
				isNative="true"
			></icon>
			<icon
				class="toolbutton"
				id="journal-sync"
				svgfile="./icons/sync.svg"
				@click="syncJournal"
				:size="47"
				:color="768"
				:title="$t('Synchronize')"
				isNative="true"
			></icon>
		</div>
	</div>
	</transition>
	<popup
		ref="popup"
		:item="popupItem"
		@mouseout="removePopupTimer($event)"
		@itemis-clicked="onPopupItemClick"
	></popup>
`,

	components: {
		searchfield: SearchField,
		icon: Icon,
		"icon-button": IconButton,
		popup: Popup,
		"filter-box": FilterBox,
	},

	emits: ["closeJournal"],
	props: ["isAssignmentSelected"],

	data() {
		return {
			visibleStartIndex: 0,
			visibleEndIndex: 64, //same as pageJournalSize initially
			processedJournal: null,
			popupItem: null,
			journalType: null,
			filterFavorite: false,
			filterAssignment:
				this.isAssignmentSelected !== undefined
					? this.isAssignmentSelected
					: false,
			showFooter:
				sugarizer.modules.user.getPrivateJournal() != null &&
				sugarizer.modules.user.getSharedJournal() != null,
			checkboxSelected: 0,
			showWarning: false,
			isLoading: false,
		};
	},

	computed: {
		visibleJournal() {
			if (!this.processedJournal) return [];
			if (this.journalType === this.constant.journalLocal)
				return this.processedJournal;
			return this.processedJournal.slice(
				this.visibleStartIndex,
				this.visibleEndIndex
			);
		},
		displayMessage() {
			return this.hasFilter()
				? this.$t("NoMatchingEntries")
				: this.$t("JournalEmpty");
		},
	},

	async created() {
		this.constant = {
			MIME_TYPE_ICONS: {
				"text/plain": "application-x-txt.svg",
				"application/pdf": "application-x-pdf.svg",
				"application/msword": "application-x-doc.svg",
				"application/vnd.oasis.opendocument.text":
					"application-x-odt.svg",
				"text/csv": "application-x-csv.svg",
			},
			DateRangeType: {
				ANYTIME: "Anytime", //"Anytime" is the locale string
				TODAY: "Today",
				SINCE_YESTERDAY: "SinceYesterday",
				PAST_WEEK: "PastWeek",
				PAST_MONTH: "PastMonth",
			},
			pageJournalSize: this.visibleEndIndex,
			journalLocal: 0,
			journalRemotePrivate: 1,
			journalRemoteShared: 2,

			timerPopupDuration: 1000,
			iconSizeList: 40,
			iconSizeFooter: 47,
			itemListIconSize: 20,
		};
		// Toolbar Pallete
		this.selectedActFilter = 0;
		this.typePalette = {
			icon: {
				id: "filter-type",
				iconData: "icons/view-type.svg",
				isNative: "true",
				size: "20",
			},
			name: this.$t("AllType"),
			header: this.$t("SelectFilter"),
			filterBoxList: this.getTypePaletteList(),
		};
		this.selectedTimeFilter = this.constant.DateRangeType.ANYTIME;
		this.datePalette = {
			icon: {
				id: "filter-time",
				iconData: "icons/view-created.svg",
				size: "20",
				isNative: "true",
			},
			name: this.$t("Anytime"),
			header: this.$t("SelectFilter"),
			filterBoxList: this.getDatePaletteList(),
		};
		this.selectedSortFilter = "timestamp";
		this.sortPalette = {
			icon: {
				id: "sort-palette",
				iconData: "icons/view-lastedit.svg",
				size: "20",
				isNative: "true",
			},
			header: this.$t("SortDisplay"),
			filterBoxList: this.getSortPaletteList(),
		};

		// Journal Operations
		this.currentOperation = null;
		this.operations = [
			{
				id: "copyjournalbutton",
				svgfile: "./icons/copy-journal.svg",
				titleKey: "CopyToLocal",
				show: () => this.journalType !== this.constant.journalLocal,
				action: this.copyToLocal,
			},
			{
				id: "copycloudonebutton",
				svgfile: "./icons/copy-cloud-one.svg",
				titleKey: "CopyToPrivate",
				show: () =>
					this.journalType !== this.constant.journalRemotePrivate,
				action: this.copyToRemote,
			},
			{
				id: "copycloudallbutton",
				svgfile: "./icons/copy-cloud-all.svg",
				titleKey: "CopyToShared",
				show: () =>
					this.journalType !== this.constant.journalRemoteShared,
				action: this.copyToShared,
			},
			{
				id: "copydevicebutton",
				svgfile: "./icons/copy-to-device.svg",
				titleKey: "CopyToDevice",
				show: () => true,
				action: this.copyToDevice,
			},
			{
				id: "duplicatebutton",
				svgfile: "./icons/duplicate.svg",
				titleKey: "Duplicate",
				show: () => this.journalType === this.constant.journalLocal,
				action: this.duplicateJournalEntry,
				refresh: true,
			},
			{
				id: "removebutton",
				svgfile: "./icons/list-remove.svg",
				titleKey: "Erase",
				show: () => true,
				action: this.removeJournalEntry,
				refresh: true,
			},
		];
		// Warning
		this.warningKey = null;

		this.filterText = "";
		this.popupTimer = null;
		this.popupIconRef = null;
		this.buddycolor = sugarizer.modules.settings.getUser().color;
		this.journalId = null;
		this.loadResult = { lastItemFetched: false };
		this.originalTitle = null;

		this.showLocalJournal();
	},

	methods: {
		setupJournalEntries() {
			this.processedJournal = this.journal.map((entry, index) => {
				if (entry.metadata.buddy_color) {
					entry.color = sugarizer.modules.xocolor.findIndex(
						entry.metadata.buddy_color
					);
				}
				entry.metadata.timestampString =
					sugarizer.modules.i18next.timestampToElapsedString(
						entry.metadata.timestamp,
						2,
						false
					);
				entry.metadata.creationTimeString =
					sugarizer.modules.i18next.timestampToElapsedString(
						entry.metadata.creation_time,
						2,
						false
					);
				entry.metadata.formattedSize =
					sugarizer.modules.i18next.getFormattedSize(
						entry.metadata.textsize
					);
				entry.activityInfo = sugarizer.modules.activities.getById(
					entry.metadata.activity
				);

				entry.activityIcon = this.getActivityIcon(entry);
				entry.popupData = this.getPopupData(entry);

				entry.assignmentData = this.processAssignmentData(entry);

				return entry;
			});
		},

		getActivityIcon(entry) {
			const info = entry.activityInfo;
			if (
				sugarizer.modules.activities.isGeneric(info) ||
				entry.metadata.mimetype === "text/csv"
			) {
				const iconName =
					this.constant.MIME_TYPE_ICONS[entry.metadata.mimetype];
				if (iconName) {
					return "icons" + "/" + iconName;
				}
			}

			return info.directory + "/" + info.icon;
		},

		processAssignmentData(entry) {
			if (!entry.metadata.assignmentId) {
				return {};
			}
			const currentDate = new Date();
			const dueDate = new Date(entry.metadata.dueDate);
			const difference = dueDate.getTime() - currentDate.getTime();

			let assignmentData = {
				dueDateText: "",
			};
			if (entry.metadata.instructions) {
				assignmentData.popup = {
					id: entry.metadata.assignmentId,
					name: this.$t("Instructions"),
					icon: {
						id: "inst-icon",
						iconData: "icons/instructions-icon.svg",
						size: this.constant.iconSizeList,
						isNative: "true",
					},
					itemList: [
						{
							name: entry.metadata.instructions,
							icon: {},
						},
					],
				};
			}
			if (entry.metadata.isSubmitted) {
				assignmentData.dueDateText =
					sugarizer.modules.i18next.timestampToElapsedString(
						entry.metadata.submissionDate,
						2,
						false,
						"Submitted"
					);
				assignmentData.isSubmittable = false;
			} else if (difference > 0) {
				assignmentData.dueDateText =
					sugarizer.modules.i18next.timestampToElapsedString(
						currentDate.getTime() - difference,
						2,
						false,
						"Expected"
					);
				assignmentData.isSubmittable = true;
			} else {
				assignmentData.dueDateText = this.$t("DueDatePassed");
				assignmentData.isSubmittable = entry.metadata.lateTurnIn;
				assignmentData.dueDatePassed = true;
			}
			return assignmentData;
		},

		//prettier-ignore
		getPopupData(entry) {
			const isConnected = sugarizer.modules.user.isConnected();
			const activityDisabled = sugarizer.modules.activities.isGeneric(entry.activityInfo) && entry.metadata.mimetype !== "application/pdf";
			const copyToLocalDisabled = this.journalType === this.constant.journalLocal;
			const copyToPrivateDisabled = !isConnected || this.journalType === this.constant.journalRemotePrivate;
			const copyToSharedDisabled = !isConnected || this.journalType === this.constant.journalRemoteShared || entry.metadata.assignmentId;
			const duplicateDisabled = this.journalType !== this.constant.journalLocal || entry.metadata.assignmentId;
			return {
				id: entry.objectId,
				name: entry.metadata.title,
				title: entry.metadata.formattedSize || sugarizer.modules.i18next.getFormattedSize(entry.metadata.textsize),
				icon: {
					id: "pop-icon",
					iconData: entry.activityIcon,
					color: entry.color,
					size: this.constant.iconSizeList,
					isNative: "true",
					disabled: activityDisabled
				},
				itemList: [
					{ icon: { id: "activity-start", iconData: "icons/activity-start.svg", color: 256, size: this.constant.itemListIconSize, isNative: "true" }, name: this.$t("RestartActivity"), disabled: activityDisabled},
					{ icon: { id: "copy-journal", iconData: "icons/copy-journal.svg", color: 256, size: this.constant.itemListIconSize, isNative: "true" }, name: this.$t("CopyToLocal"), disabled: copyToLocalDisabled},
					{ icon: { id: "copy-cloud-one", iconData: "icons/copy-cloud-one.svg", color: 256, size: this.constant.itemListIconSize, isNative: "true" }, name: this.$t("CopyToPrivate"), disabled: copyToPrivateDisabled},
					{ icon: { id: "copy-cloud-all", iconData: "icons/copy-cloud-all.svg", color: 256, size: this.constant.itemListIconSize, isNative: "true" }, name: this.$t("CopyToShared"), disabled: copyToSharedDisabled},
					{ icon: { id: "copy-to-device", iconData: "icons/copy-to-device.svg", color: 256, size: this.constant.itemListIconSize, isNative: "true" }, name: this.$t("CopyToDevice")},
					{ icon: { id: "duplicate", iconData: "icons/duplicate.svg", color: 256, size: this.constant.itemListIconSize, isNative: "true" }, name: this.$t("Duplicate"), disabled: duplicateDisabled},
					{ icon: { id: "list-remove", iconData: "icons/list-remove.svg", color: 256, size: this.constant.itemListIconSize, isNative: "true" }, name: this.$t("Erase")},
				],
				handlers: {
					"pop-icon": () => { this.runCurrentActivity(entry); },
					"activity-start": () => { this.runCurrentActivity(entry); },
					"copy-journal": () => { this.copyToLocal(entry); },
					"copy-cloud-one": () => { this.copyToPrivate(entry); },
					"copy-cloud-all": () => { this.copyToShared(entry); },
					"copy-to-device": () => { this.copyToDevice(entry); },
					"duplicate": () => { this.duplicateJournalEntry(entry); },
					"list-remove": () => { this.removeJournalEntry(entry); },
				},
			};
		},

		async copyToLocal(entry, isMultiple) {
			this.trace("copy_to_local", entry.objectId);
			await sugarizer.modules.journal.copyToLocal(entry, this.journalId);
		},
		async copyToPrivate(entry, isMultiple) {
			this.trace("copy_to_private", entry.objectId);
			await sugarizer.modules.journal.copyToRemote(
				entry,
				sugarizer.modules.user.getPrivateJournal()
			);
		},
		async copyToShared(entry, isMultiple) {
			this.trace("copy_to_shared", entry.objectId);
			await sugarizer.modules.journal.copyToRemote(
				entry,
				sugarizer.modules.user.getSharedJournal()
			);
		},

		async duplicateJournalEntry(entry, isMultiple) {
			if (entry.metadata.assignmentId) {
				sugarizer.modules.humane.log(
					this.$t("CannotDuplicateAssignment")
				);
				return;
			}
			this.trace("duplicate", entry.objectId);
			await sugarizer.modules.journal.duplicateEntry(entry);
			if (isMultiple) return;
			this.filterJournalEntries();
		},

		async copyToDevice(entry, isMultiple) {
			try {
				const { metadata, text } =
					await sugarizer.modules.journal.loadEntry(
						entry,
						this.journalId
					);
				const filename = await sugarizer.modules.file.writeFile(
					null,
					metadata,
					text
				);
				sugarizer.modules.humane.log(
					this.$t("FileWroteTo", { file: filename })
				);
			} catch (e) {
				console.error(e);
				sugarizer.modules.humane.log(this.$t("ErrorWritingFile"));
			}
		},

		async removeJournalEntry(entry, isMultiple) {
			//check if the entry is an assignment entry and if it is, then do not delete it
			if (entry.metadata.assignmentId) {
				sugarizer.modules.humane.log(this.$t("CannotDeleteAssignment"));
				return;
			}
			this.trace("remote_entry", entry.objectId);
			await sugarizer.modules.journal.deleteEntry(
				entry,
				this.journalType === this.constant.journalLocal,
				this.journalId
			);
			if (isMultiple) return;
			this.filterJournalEntries();
		},

		handleOperation(operation) {
			this.currentOperation = operation;
			this.warningKey = operation.titleKey;
			this.showWarning = true;
		},
		async confirmOperation() {
			this.showWarning = false;
			this.checkboxSelected = 0;
			for (entry of this.processedJournal) {
				if (
					entry.isChecked &&
					this.currentOperation &&
					this.currentOperation.action
				) {
					entry.isChecked = false;
					await this.currentOperation.action(entry, true);
				}
			}
			sugarizer.modules.humane.log(
				this.$t(
					this.currentOperation.id === "removebutton"
						? "Erasing"
						: "Copying"
				)
			);
			if (this.currentOperation.refresh)
				await this.filterJournalEntries();
		},

		async fromDeviceSelected() {
			await sugarizer.modules.file.askAndReadFiles();
			this.filterJournalEntries();
		},

		async runCurrentActivity(entry) {
			const activity = entry.activityInfo;

			if (sugarizer.modules.activities.isGeneric(activity)) {
				if (entry.metadata.mimetype == "application/pdf") {
					const { metadata, text } =
						await sugarizer.modules.journal.loadEntry(
							entry,
							this.journalId
						);
					sugarizer.modules.file.openAsDocument(metadata, text);
					return;
				}
			}
			// Load text content
			const { metadata, text } =
				await sugarizer.modules.journal.loadEntry(
					entry,
					this.journalId
				);
			if (this.journalType === this.constant.journalRemoteShared) {
				// Shared Remote entry, copy in the local journal first
				await sugarizer.modules.journal.saveDatastoreObject(
					entry.objectId,
					metadata,
					text
				);
			}
			sugarizer.modules.activities.runActivity(
				activity,
				entry.objectId,
				activity.title
			);
		},

		getTypePaletteList() {
			const activitiesList = sugarizer.modules.activities.get();
			const unsortedItems = activitiesList.map((activity, index) => ({
				icon: {
					id: index + 1,
					iconData: activity.directory + "/" + activity.icon,
					size: this.constant.itemListIconSize,
					isNative: "true",
				},
				name: activity.name,
			}));

			const sortedItems = unsortedItems.sort((a, b) =>
				a.name.localeCompare(b.name)
			);
			return [
				{
					icon: {
						id: 0,
						iconData: "icons/application-x-generic.svg",
						size: this.constant.itemListIconSize,
						isNative: "true",
					},
					name: this.$t("AllType"),
				},
				...sortedItems,
			];
		},
		getDatePaletteList() {
			return Object.values(this.constant.DateRangeType).map(
				(rangeType) => ({
					name: this.$t(rangeType),
					type: rangeType,
				})
			);
		},
		getSortPaletteList() {
			const sorts = [
				{
					textKey: "SortByUpdated",
					icon: "view-lastedit.svg",
					sort: "timestamp",
				},
				{
					textKey: "SortByCreated",
					icon: "view-created.svg",
					sort: "creation_time",
				},
				{
					textKey: "SortBySize",
					icon: "view-size.svg",
					sort: "textsize",
				},
				{
					textKey: "SortByDueDate",
					icon: "view-duedate.svg",
					sort: "dueDate",
				},
			];
			return sorts.map((sort, index) => ({
				icon: {
					id: index,
					iconData: `icons/${sort.icon}`,
					size: this.constant.itemListIconSize,
					isNative: "true",
				},
				sort: sort.sort,
				name: this.$t(sort.textKey),
			}));
		},

		toggleFilterValue(property) {
			if (this[property] === undefined) return;
			this[property] = !this[property];
			this.filterJournalEntries();
		},

		async toggleFavoriteActivity(entry) {
			const activity = entry.activityInfo;
			this.trace("switch_favorite", entry.objectId);
			const keep = entry.metadata.keep;
			if (keep === undefined) {
				entry.metadata.keep = 1;
			} else {
				entry.metadata.keep = (keep + 1) % 2;
			}
			await sugarizer.modules.journal.updateFavorite(
				entry.objectId,
				entry.metadata
			);
			this.filterJournalEntries();
		},

		activityFilterSelected(e) {
			this.selectedActFilter = e.icon ? e.icon.id : 0;
			this.filterJournalEntries();
		},
		dateFilterSelected(e) {
			this.selectedTimeFilter = e.type;
			this.filterJournalEntries();
		},
		sortSelected(e) {
			this.selectedSortFilter = e.sort;
			this.filterJournalEntries();
		},
		searchChanged(e) {
			this.filterText = e;
			this.filterJournalEntries();
		},

		async filterJournalEntries(offset = 0) {
			if (offset === 0) this.checkboxSelected = 0;

			// prettier-ignore
			const typeselected = this.selectedActFilter <= 0 ? undefined : sugarizer.modules.activities.get()[this.selectedActFilter - 1].id,
				timeselected = this.getDateRange(this.selectedTimeFilter).min;
			let traceText = "q=" + this.filterText;
			if (this.filterFavorite) traceText += "&favorite=true";
			if (this.filterAssignment) traceText += "&assignment=true";
			if (typeselected) traceText += "&type=" + typeselected;
			if (timeselected) traceText += "&time=" + timeselected;
			if (this.selectedSortFilter)
				traceText += "&sort=" + this.selectedSortFilter;
			this.trace("update", traceText);

			if (
				this.journalType !== this.constant.journalLocal &&
				this.journalId !== null
			) {
				const response =
					await sugarizer.modules.journal.getRemoteEntries(
						this.journalId,
						{
							typeactivity: typeselected,
							title: this.filterText,
							stime: timeselected,
							favorite: this.filterFavorite ? true : undefined, //Passing 'false' will remove the filtered items
							assignment: this.filterAssignment
								? true
								: undefined,
							limit: this.constant.pageJournalSize,
							sort: this.selectedSortFilter,
							offset: offset,
						}
					);
				if (offset > 0) {
					this.journal.push(...response.entries);
				} else this.journal = response.entries;

				this.loadResult.offset = response.offset;
				this.loadResult.total = response.total;
				this.loadResult.limit = response.limit;
			} else {
				// Filter local entries
				sugarizer.modules.journal.load();
				this.journal =
					sugarizer.modules.journal.getByActivity(typeselected);
				this.journal = this.journal
					.filter((entry) => {
						return (
							(!this.filterFavorite || entry.metadata.keep) &&
							(!this.filterText.length ||
								entry.metadata.title
									.toLowerCase()
									.includes(this.filterText.toLowerCase())) &&
							(!timeselected ||
								entry.metadata.timestamp >= timeselected) &&
							(!this.filterAssignment ||
								entry.metadata.assignmentId)
						);
					})
					.sort((e0, e1) => {
						const sortField =
							this.selectedSortFilter || "timestamp";
						let diff;
						if (sortField === "textsize") {
							diff =
								parseInt(e1.metadata[sortField] || 0) -
								parseInt(e0.metadata[sortField] || 0);
						} else
							diff =
								parseInt(e1.metadata[sortField]) -
								parseInt(e0.metadata[sortField]);
						return diff;
					});
			}
			this.setupJournalEntries();
		},

		clearFilters() {
			this.filterFavorite = false;
			this.filterAssignment = false;
			this.$refs.searchfield.cancelClicked();
			this.filterText = "";
			this.selectedActFilter = 0;
			this.selectedTimeFilter = this.constant.DateRangeType.ANYTIME;
			this.selectedSortFilter = "timestamp";
			this.filterJournalEntries();
		},
		hasFilter() {
			return (
				this.filterFavorite === true ||
				this.filterAssignment === true ||
				this.filterText ||
				this.selectedActFilter > 0 ||
				this.selectedTimeFilter !==
					this.constant.DateRangeType.ANYTIME ||
				this.selectedSortFilter !== "timestamp"
			);
		},

		showLocalJournal() {
			if (this.journalType === this.constant.journalType) return;
			this.trace("show_journal", "local");
			this.journalType = this.constant.journalLocal;
			this.journalId = null;
			this.filterJournalEntries();
		},
		async showPrivateCloud() {
			if (this.journalType === this.constant.journalRemotePrivate) return;
			this.trace("show_journal", "private");
			this.journalType = this.constant.journalRemotePrivate;
			this.journalId = sugarizer.modules.user.getPrivateJournal();
			this.filterJournalEntries();
			this.$refs.journalContainer.scroll({ top: 0 });
		},
		async showSharedJournal() {
			if (this.journalType === this.constant.journalRemoteShared) return;
			this.trace("show_journal", "shared");
			this.journalType = this.constant.journalRemoteShared;
			this.journalId = sugarizer.modules.user.getSharedJournal();
			this.filterJournalEntries();
			this.$refs.journalContainer.scroll({ top: 0 });
		},

		async submitAssignment(entry) {
			const humane = sugarizer.modules.humane;
			if (entry.metadata.isSubmitted == true) {
				humane.log(this.$t("AssignmentAlreadySubmitted"));
			} else if (!entry.assignmentData.isSubmittable) {
				humane.log(this.$t("AssignmentDueDatePassed"));
			}
			entry.metadata.isSubmitted = true;
			entry.metadata.submissionDate = new Date().getTime();
			try {
				await sugarizer.modules.journal.postAssignment(entry);
				humane.log(this.$t("AssignmentSubmitted"));
				this.setupJournalEntries();
			} catch (e) {
				console.error("Err in submitting Assignment:", e);
				humane.log(this.$t("AssignmentError"));
			}
		},

		onPopupItemClick(itemId) {
			const popupData = this.$refs.popup.item;
			itemId = itemId.split("_")[1];
			const handlerFunc = popupData?.handlers?.[itemId];
			if (handlerFunc) {
				handlerFunc();
				this.hidePopup();
			}
		},
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
			if (this.$refs.popup.isShown && this.popupIconRef !== iconRef)
				this.removePopup(e); //remove before updating iconRef

			this.popupIconRef = iconRef;

			this.popupItem = popupData;
			this.$refs.popup.show(e.clientX + 14, e.clientY + 6); //show with x and y offset
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
		getDateRange(rangeType) {
			const now = new Date();
			const today = new Date(
				now.getFullYear(),
				now.getMonth(),
				now.getDate()
			).getTime();
			const currentTime = now.getTime();
			const DateRangeType = this.constant.DateRangeType;
			const ranges = {
				[DateRangeType.TODAY]: { min: today, max: currentTime },
				[DateRangeType.SINCE_YESTERDAY]: {
					min: today - 86400000,
					max: currentTime,
				},
				[DateRangeType.PAST_WEEK]: {
					min: today - 604800000,
					max: currentTime,
				},
				[DateRangeType.PAST_MONTH]: {
					min: today - 2592000000,
					max: currentTime,
				},
			};
			return ranges[rangeType] || {};
		},

		updateSelectedCount(change) {
			this.checkboxSelected += change;
		},
		selectAll() {
			this.processedJournal.forEach((entry) => {
				if (!entry.isChecked) {
					entry.isChecked = true;
					this.checkboxSelected++;
				}
			});
		},
		unselectAll() {
			this.processedJournal.forEach((entry) => {
				if (entry.isChecked) {
					entry.isChecked = false;
					this.checkboxSelected--;
				}
			});
		},

		titleEditStart(entry) {
			this.originalTitle = entry.metadata.title;
			entry.isEditingTitle = true;
		},
		async titleEditEnd(entry) {
			entry.isEditingTitle = false;
			if (entry.metadata.title?.trim() == this.originalTitle?.trim()) {
				return;
			}

			this.originalTitle = null;
			const objectId = entry.objectId;
			// Update local journal
			const { metadata, text } =
				await sugarizer.modules.journal.loadEntry(
					entry,
					this.journalId
				);
			metadata.title = entry.metadata.title;
			if (this.journalType == this.constant.journalLocal) {
				// Update metadata
				this.trace("rename_entry", objectId);
				await sugarizer.modules.journal.saveDatastoreObject(
					objectId,
					metadata,
					text
				);
			}
			// Update remote journal
			else {
				const journalId = this.journalId;
				metadata.timestamp = new Date().getTime();
				// Update remote journal
				const dataentry = {
					metadata: metadata,
					text: text,
					objectId: objectId,
				};
				this.trace("rename_entry", objectId, journalId);
				await sugarizer.modules.server
					.putJournalEntry(journalId, objectId, dataentry)
					.catch((e) => {
						console.warn(
							"Error updating remote journal " + journalId
						);
					});
			}
			await this.syncJournal();
		},

		async handleScroll(e) {
			if (this.journalType === this.constant.journalLocal) return;
			const container = this.$refs.journalContainer;
			const scrollTop = container.scrollTop;
			const scrollHeight = container.scrollHeight;
			const clientHeight = container.clientHeight;
			const pageJournalSize = this.constant.pageJournalSize;

			if (scrollTop === 0 && this.visibleStartIndex > 0) {
				// Scrolled to top
				const topElement =
					this.$refs[
						this.processedJournal[this.visibleStartIndex]?.objectId
					]?.[1];
				this.visibleStartIndex = Math.max(
					this.visibleStartIndex - pageJournalSize,
					0
				);
				this.visibleEndIndex = Math.min(
					this.visibleStartIndex + 2 * pageJournalSize, //updated start index + 2*size
					this.loadResult.total
				);
				this.$nextTick(() => {
					topElement.scrollIntoView();
				});
			} else if (
				scrollTop + clientHeight > scrollHeight - 10 &&
				this.visibleStartIndex < this.loadResult.total
			) {
				// Scrolled to bottom
				await this.loadMoreEntries();
				this.visibleEndIndex = Math.min(
					this.visibleEndIndex + pageJournalSize,
					this.loadResult.total
				);
				this.visibleStartIndex = Math.max(
					this.visibleEndIndex - 2 * pageJournalSize, //updated end index - 2*size
					0
				);
			}
		},

		async loadMoreEntries() {
			if (!this.isLoading) {
				const result = this.loadResult;
				if (!result.lastItemFetched && result.offset < result.total) {
					let newOffset = result.offset + result.limit;
					if (newOffset + result.limit >= result.total) {
						this.loadResult.lastItemFetched = true;
					}
					this.isLoading = true;

					await this.filterJournalEntries(newOffset);
				}
				this.isLoading = false;
			}
		},

		async syncJournal() {
			await sugarizer.modules.journal.synchronize();
			this.filterJournalEntries();
		},

		trace(action, content, id = null) {
			sugarizer.modules.stats.trace("journal", action, content, id);
		},
	},
};
