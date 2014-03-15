/** 
	Description to make fittable kinds available in Ares.
*/
Palette.model.push(
	{name: "fittable", items: [
		{name: "FittableRows", title: "Vertical stacked layout", icon: "package_new.png", stars: 4.5, version: 2.0, blurb: "Stack of vertical rows, one of which can be made to fit.",
			inline: {kind: "FittableRows", style: "height: 80px; position: relative;", padding: 4, components: [
				{style: "background-color: lightblue; border: 1px dotted blue; height: 15px;"},
				{style: "background-color: lightblue; border: 1px dotted blue;", fit: true},
				{style: "background-color: lightblue; border: 1px dotted blue; height: 15px;"}
			]},
			config: {content: "$name", isContainer: true, kind: "FittableRows", padding: 10, margin: 10}
		},
		{name: "FittableColumns", title: "Horizontal stacked layout", icon: "package_new.png", stars: 4.5, version: 2.0, blurb: "Stack of horizontal columns, one of which can be made to fit.",
			inline: {kind: "FittableColumns", style: "height: 60px; position: relative;", padding: 4, components: [
				{style: "background-color: lightblue; border: 1px dotted blue; width: 20px;"},
				{style: "background-color: lightblue; border: 1px dotted blue;", fit: true},
				{style: "background-color: lightblue; border: 1px dotted blue; width: 20px;"}
			]},
			config: {content: "$name", isContainer: true, kind: "FittableColumns", padding: 10, margin: 10}
		}
	]}
);