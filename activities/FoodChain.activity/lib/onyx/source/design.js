//* @protected
// This is an in-progress design description of the Onyx controls for use in the Ares designer tool.
Palette.model.push(
	{name: "onyx", items: [
		{name: "onyx.Button", title: "Foofoofoo", icon: "box_software.png", stars: 4, version: 2.0, blurb: "Use as a simple page header, or add an optional navigation menu.",
			inline: {content: "onyx.Button", kind: "onyx.Button"},
			config: {content: "$name", isContainer: true, kind: "onyx.Button"}
		},
		{name: "onyx.InputDecorator", title: "Foofoofoo", icon: "box_software.png", stars: 4, version: 2.0, blurb: "Use as a simple page header, or add an optional navigation menu.",
			inline: {kind: "onyx.InputDecorator", components: [
				{kind: "Input", placeholder: "Enter text here"}
			]},
			config: {kind: "onyx.InputDecorator", components: [
				{kind: "Input", placeholder: "Enter text here"}
			]}
		},
		{name: "onyx.Input", title: "Foofoofoo", icon: "box_software.png", stars: 4, version: 2.0, blurb: "Use as a simple page header, or add an optional navigation menu.",
			inline: {value: "onyx.Input", kind: "onyx.Input"},
			config: {kind: "onyx.Input"}
		},
		{name: "onyx.ToggleButton", title: "Foofoofoo", icon: "box_software.png", stars: 4, version: 2.0, blurb: "Use as a simple page header, or add an optional navigation menu.",
			inline: {kind: "onyx.ToggleButton"},
			config: {kind: "onyx.ToggleButton"}
		},
		{name: "onyx.Checkbox", title: "Foofoofoo", icon: "box_software.png", stars: 4, version: 2.0, blurb: "Use as a simple page header, or add an optional navigation menu.",
			inline: {kind: "onyx.Checkbox"},
			config: {kind: "onyx.Checkbox"}
		},
		{name: "onyx.RadioGroup", 
			inline: {kind: "onyx.RadioGroup", components: [
				{content: "A"},
				{content: "B"},
				{content: "C"}
			]},
			config: {kind: "onyx.RadioGroup", isContainer: true, components: [
				{content: "RadioButton"}
			]}
		},
		{name: "onyx.RadioButton", 
			inline: {content: "RadioButton", kind: "onyx.RadioButton"},
			config: {content: "$name", kind: "onyx.RadioButton"}
		},
		{name: "onyx.Toolbar", title: "Foofoofoo", icon: "box_software.png", stars: 4, version: 2.0, blurb: "Use as a simple page header, or add an optional navigation menu.",
			inline: {kind: "onyx.Toolbar"},
			config: {isContainer: true, kind: "onyx.Toolbar"}
		},
		{name: "onyx.Grabber", title: "Foofoofoo", icon: "box_software.png", stars: 4, version: 2.0, blurb: "Use as a simple page header, or add an optional navigation menu.",
			inline: {kind: "onyx.Grabber", style: "background-color: #333; padding: 4px 12px;"},
			config: {kind: "onyx.Grabber"}
		},
		{name: "onyx.Groupbox", title: "Foofoofoo", icon: "box_software.png", stars: 4, version: 2.0, blurb: "Use as a simple page header, or add an optional navigation menu.",
			inline: {kind: "onyx.Groupbox", components: [
				{content: "Header", kind: "onyx.GroupboxHeader"}, 
				{content: "Item", style: "padding: 10px;"}
			]},
			config: {kind: "onyx.Groupbox", isContainer: true, components: [
				{content: "Header", kind: "onyx.GroupboxHeader", isContainer: true}, 
				{content: "Item", style: "padding: 10px;"}
			]}
		},
		{name: "onyx.GroupboxHeader", title: "Foofoofoo", icon: "box_software.png", stars: 4, version: 2.0, blurb: "Use as a simple page header, or add an optional navigation menu.",
			inline: {content: "Header", kind: "onyx.GroupboxHeader"},
			config: {content: "$name", kind: "onyx.GroupboxHeader", isContainer: true}
		}
	]}
);