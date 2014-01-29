/**
	A horizontal bar containing controls used to perform common UI actions.
	
	A Toolbar customizes the styling of the controls it hosts, including
	buttons, icons, and inputs.
	
		{kind: "onyx.Toolbar", components: [
			{kind: "onyx.Button", content: "Favorites"},
			{kind: "onyx.InputDecorator", components: [
				{kind: "onyx.Input", placeholder: "Enter a search term..."}
			]},
			{kind: "onyx.IconButton", src: "go.png"}
		]}
	
	Note that it's possible to style a set of controls to look like they are in
	a toolbar without having the container itself look like a toolbar. To do so,
	apply the "onyx-toolbar-inline"	CSS class to the container that houses the
	controls.
*/
enyo.kind({
	name: "onyx.Toolbar",
	classes: "onyx onyx-toolbar onyx-toolbar-inline",
	handlers: {
		onHide: "render"
	}
});