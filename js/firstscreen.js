

// First screen class
enyo.kind({
	name: "Sugar.FirstScreen",
	kind: enyo.Control,
	components: [
		{name: "namebox", classes: "first-namebox", onresize: "resize", showing: false, components: [
			{name: "nameline", classes: "first-nameline", components: [
				{name: "nametext", content: "xxx", classes: "first-nametext"},
				{classes: "first-input", components: [
					{name: "name", kind: "Input", classes: "first-namevalue", onfocus: "scrollToField", onkeydown: "enterclick"}
				]}
			]},
		]},
		{name: "passbox", classes: "first-passbox", onresize: "resize", showing: false, components: [
			{name: "passline", classes: "first-passline", components: [
				{name: "passtext", content: "xxx", classes: "first-passtext"},
				{classes: "first-input", components: [
					{name: "pass", kind: "Input", classes: "first-passvalue", onfocus: "scrollToField", onkeydown: "enterclick"}
				]}
			]},
		]},
		{name: "previous", kind: "Sugar.IconButton", icon: {directory: "icons", icon: "go-left.svg"}, classes: "first-leftbutton", ontap: "previous", showing: false},
		{name: "next", kind: "Sugar.IconButton", icon: {directory: "icons", icon: "go-right.svg"}, classes: "first-rightbutton", ontap: "next", showing: false},
		{name: "colortext", content: "xxx", classes: "first-colortext", showing: false},
		{name: "owner", kind: "Sugar.Icon", size: constant.sizeOwner, colorized: true, classes: "first-owner-icon", showing: false, onresize: "resize", ontap: "nextcolor"},
		{name: "newuser", kind: "Sugar.Icon", size: constant.sizeNewUser, colorized: false, classes: "first-owner-icon", showing: true, onresize: "resize", ontap: "newUser"},
		{name: "newusertext", content: "xxx", classes: "newuser-text"},
		{name: "login", kind: "Sugar.Icon", size: constant.sizeNewUser, colorized: false, classes: "first-owner-icon", showing: true, onresize: "resize", ontap: "login"},
		{name: "logintext", content: "xxx", classes: "newuser-text"},
		{name: "spinner", kind: "Image", src: "images/spinner-light.gif", classes: "spinner", showing: false}
	],

	// Constructor
	create: function() {
		// Init screen
		this.inherited(arguments);
		this.$.nametext.setContent(l10n.get("Name"));
		this.$.passtext.setContent(l10n.get("Password"));
		this.$.previous.setText(l10n.get("Back"));
		this.$.next.setText(l10n.get("Next"));
		this.$.newusertext.setContent(l10n.get("NewUser"));
		this.$.logintext.setContent(l10n.get("Login"));
		this.$.owner.setIcon({directory: "icons", icon: "owner-icon.svg"});
		this.$.colortext.setContent(l10n.get("ClickToColor"));
		this.resize();
		this.ownerColor = Math.floor(Math.random()*xoPalette.colors.length);
		this.$.owner.setColorizedColor(xoPalette.colors[this.ownerColor]);
		this.$.newuser.setIcon({directory: "icons", icon: "newuser-icon.svg"});
		this.$.login.setIcon({directory: "icons", icon: "login.svg"});
		if (l10n.language.direction == "rtl") {
			this.$.name.addClass("rtl-10");
		}
		this.createnew = true;
		if (util.getClientType() == constant.webAppType) {
			this.step = 0;
		} else {
			this.step = 1;
		}
		this.displayStep();

		// Hide toolbar
		var toolbar = document.getElementById("toolbar");
		this.backgroundColor = toolbar.style.backgroundColor;
		toolbar.style.backgroundColor = "white";
		document.getElementById("canvas").style.overflowY = "hidden";
		util.hideNativeToolbar();
	},

	// Display current step items
	displayStep: function() {
		var vlogin = false,
			vlogintext = false,
			vnewuser = false,
			vnewusertext = false,
			vnamebox = false,
			vpassbox = false,
			vcolortext = false,
			vowner = false,
			vnext = false,
			vprevious = false;

		switch(this.step) {
		case 0:
			vlogin = vlogintext = vnewuser = vnewusertext = true;
			break;

		case 1:
			vnamebox = vnext = true;
			vprevious = (util.getClientType() == constant.webAppType);
			this.$.nametext.setContent(l10n.get(this.createnew ? "ChooseName" : "Name"));
			this.$.next.setText(l10n.get("Next"));
			break;

		case 2:
			vpassbox = vprevious = vnext = true;
			this.$.passtext.setContent(l10n.get(this.createnew ? "ChoosePassword" : "Password"));
			this.$.next.setText(l10n.get("Next"));
			break;

		case 3:
			vcolortext = vprevious = vnext = vowner = true;
			this.$.next.setText(l10n.get("Done"));
			break;

		case 4:
			// Save settings
			preferences.setColor(this.ownerColor);
			preferences.setName(this.$.name.getValue());
			console.log(this.$.pass.getValue());

			// Launch Desktop
			document.getElementById("toolbar").style.backgroundColor = this.backgroundColor;
			document.getElementById("canvas").style.overflowY = "auto";
			app = new Sugar.Desktop();
			app.renderInto(document.getElementById("canvas"));
			preferences.save();
			return;
		}

		this.$.login.setShowing(vlogin);
		this.$.logintext.setShowing(vlogintext);
		this.$.newuser.setShowing(vnewuser);
		this.$.newusertext.setShowing(vnewusertext);
		this.$.namebox.setShowing(vnamebox);
		this.$.passbox.setShowing(vpassbox);
		this.$.colortext.setShowing(vcolortext);
		this.$.owner.setShowing(vowner);
		this.$.previous.setShowing(vprevious);
		this.$.next.setShowing(vnext);
	},

	// Event handling
	newUser: function() {
		this.createnew = true;
		this.step++;
		this.displayStep();
	},

	login: function() {
		this.createnew = false;
		this.step++;
		this.displayStep();
	},

	next: function() {
		// Handle click next
		if (this.step == 1) {
			var name = this.$.name.getValue();
			if (name.length == 0) {
				return;
			}
			this.step++;
			if (util.getClientType() == constant.appType) {
				this.step++;
			}
			this.displayStep();
		} else if (this.step == 2) {
			var pass = this.$.pass.getValue();
			if (pass.length == 0) {
				return;
			}
			this.step++;
			this.displayStep();
		} else {
			this.step++;
			this.displayStep();
		}
	},

	previous: function() {
		this.step--;
		if (util.getClientType() == constant.appType && this.step == 2) {
			this.step--;
		}
		this.displayStep();
	},

	enterclick: function(inSender, inEvent) {
		if (inEvent.keyCode === 13) {
			this.next();
			return true;
		}
	},

	scrollToField: function() {
		// HACK: Scroll screen on Android to avoid to be hide by the touch keyboard
		var nodeName = this.$.name.hasNode();
		if (nodeName && (enyo.platform.android || enyo.platform.androidChrome)) {
			setTimeout(function() {
				nodeName.scrollIntoView();
			}, 100);
		}
	},

	nextcolor: function() {
		this.ownerColor = this.ownerColor + 1;
		if (this.ownerColor >= xoPalette.colors.length)
			this.ownerColor = 0;
		this.$.owner.setColorizedColor(xoPalette.colors[this.ownerColor]);
		this.$.owner.render();
	},

	resize: function() {
		var canvas_center = util.getCanvasCenter();
		this.$.owner.applyStyle("margin-left", (canvas_center.x-constant.sizeOwner/2)+"px");
		var middletop = (canvas_center.y-constant.sizeOwner/2);
		this.$.nameline.applyStyle("margin-top", middletop+"px");
		this.$.passline.applyStyle("margin-top", middletop+"px");
		this.$.owner.applyStyle("margin-top", middletop+"px");
		this.$.colortext.applyStyle("margin-top", (middletop-15)+"px");
		this.$.newuser.applyStyle("margin-left", (canvas_center.x-constant.sizeNewUser-25)+"px");
		this.$.login.applyStyle("margin-left", (canvas_center.x+25)+"px");
		var newUserPosition = (middletop-constant.sizeNewUser/2);
		this.$.newuser.applyStyle("margin-top", newUserPosition+"px");
		this.$.login.applyStyle("margin-top", newUserPosition+"px");
		this.$.newusertext.applyStyle("margin-top", (newUserPosition+constant.sizeNewUser+20)+"px");
		this.$.newusertext.applyStyle("margin-left", (canvas_center.x-constant.sizeNewUser-25)+"px");
		this.$.newusertext.applyStyle("width", constant.sizeNewUser+"px");
		this.$.logintext.applyStyle("margin-top", (newUserPosition+constant.sizeNewUser+20)+"px");
		this.$.logintext.applyStyle("margin-left", (canvas_center.x+25)+"px");
		this.$.logintext.applyStyle("width", constant.sizeNewUser+"px");
	}
});
