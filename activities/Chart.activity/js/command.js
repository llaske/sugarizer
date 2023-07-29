const Action_Types = {
    INIT: "init",
    UPDATE_TITLE: "updateTitle",

    UPDATE_TABLE_DATA: "updateTableData",
    ADD_TABLE_DATA: "addTableData",
    REMOVE_TABLE_DATA: "removeTableData",
    SWAP_DATA: "swapData",
    SWAP_COLUMN: "swapColumn",

    UPDATE_LABEL: "updateLabel",
    UPDATE_CHART_COLOR: "updateChartColor",
    UPDATE_CHART_TYPE: "updateChartType",
    UPDATE_TEXT_COLOR: "updateTextColor",
    UPDATE_FONT_FAMILY: "updateFontFamily",
    UPDATE_FONT_SIZE: "updateFontSize",

    TOGGLE_PALETTE: "togglePalette",
};

const Execute = {
    [Action_Types.INIT]: function (self, msg) {
        const data = msg.content.data;
        self.tabularData = data.tabularData;
        self.pref = data.pref;
        self.updatePreference(data.pref);
        self.updateActivityTitle(data.title);
        self.updateTitleInput(data.title);
        self.$refs.csvView.updateJsonData(data.csvJsonData.data, data.csvJsonData.header, false, true);
    },

    [Action_Types.UPDATE_TITLE]: function (self, msg) {
        const title = msg.content.data.title;
        self.activityTitle = title;
        self.chartview.updateTitle(title);
        if (msg.user) {
            self.updateTitleInput(title);
        }
    },

    [Action_Types.UPDATE_TABLE_DATA]: function (self, msg) {
        const data = msg.content.data;
        const sf = data.selectedField;
        self.tabularData[sf.i][sf.axis] = data.value;
    },

    [Action_Types.ADD_TABLE_DATA]: function (self, msg) {
        self.tabularData.push(msg.content.data.obj);
    },

    [Action_Types.REMOVE_TABLE_DATA]: function (self, msg) {
        self.tabularData.splice(msg.content.data.idx, 1);
    },

    [Action_Types.SWAP_DATA]: function (self, msg) {
        const arr = self.tabularData;
        const a = msg.content.data.a;
        const b = msg.content.data.b;
        let tmp = arr[a];
        arr[a] = arr[b];
        self.$set(arr, b, tmp);
    },
    [Action_Types.SWAP_COLUMN]: function (self, msg) {
        const arr = self.jsonData.header;
        const a = msg.content.data.a;
        const b = msg.content.data.b;
        let tmp = arr[a];
        arr[a] = arr[b];
        self.$set(arr, b, tmp);
        self.$refs.csvView.updateTableData();
    },

    [Action_Types.UPDATE_LABEL]: function (self, msg) {
        self.pref.labels[msg.content.data.axis] = msg.content.data.value;
    },

    [Action_Types.UPDATE_CHART_COLOR]: function (self, msg) {
        const type = msg.content.data.type; // 'stroke' or 'fill'
        const color = msg.content.data.color;
        self.pref.chartColor[type] = color;
        const palette = type + "Color";
        // setColor will only set color if isn't set yet (i.e don't set for sender)
        self.palettes[palette].setColor(color);
    },

    [Action_Types.UPDATE_CHART_TYPE]: function (self, msg) {
        self.pref.chartType = msg.content.data.chartType;
    },

    [Action_Types.UPDATE_TEXT_COLOR]: function (self, msg) {
        const color = msg.content.data.color;
        self.selectedFontIdx = msg.content.data.selectedFontIdx;
        self.selectedFontField.color = color;
        self.palettes.textColor.setColor(color);
    },

    [Action_Types.UPDATE_FONT_FAMILY]: function (self, msg) {
        const family = msg.content.data.family;
        self.selectedFontIdx = msg.content.data.selectedFontIdx;
        self.selectedFontField.fontfamily = family;
        self.palettes.font.setFont(msg.content.data.family);
    },

    [Action_Types.UPDATE_FONT_SIZE]: function (self, msg) {
        const value = msg.content.data.value;
        let fontsize = self.selectedFontField.fontsize;
        fontsize += value;

        self.selectedFontIdx = msg.content.data.selectedFontIdx;
        self.selectedFontField.fontsize = Math.min(Math.max(10, fontsize), 55);
    },

    [Action_Types.TOGGLE_PALETTE]: function (self, msg) {
        const data = msg.content.data;
        self.configActive = data.configActive;
        self.textPalActive = data.textPalActive;
        self.popDownPal();
    },
};
