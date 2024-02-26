/**
	A control that displays an icon. The icon image is specified by setting the
	*src* property to a URL.

	In onyx, icons have a size of 32x32 pixels. Since the icon image is applied
	as a CSS background, the height and width of an icon must be set if an image
	of a different size is used.

		{kind: "onyx.Icon", src: "images/search.png"}

	When an icon should act like a button, use an <a href="#onyx.IconButton">onyx.IconButton</a>.

*/
enyo.kind({
	name: "onyx.Icon",
	published: {
		// url path specifying the icon image
		src: ""
	},
	classes: "onyx-icon",
	//* @protected
	create: function() {
		this.inherited(arguments);
		if (this.src) {
			this.srcChanged();
		}
	},
	srcChanged: function() {
		this.applyStyle("background-image", "url(" + enyo.path.rewrite(this.src) + ")");
	}
});