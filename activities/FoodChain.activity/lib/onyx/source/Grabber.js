/**
	A control styled to indicate that an object can be grabbed and moved.  It
	should only be used in this limited context--to indicate that dragging the
	object will result in movement.

		{kind: "onyx.Toolbar", components: [
			{kind: "onyx.Grabber", ondragstart: "grabberDragstart",
				ondrag: "grabberDrag", ondragfinish: "grabberDragFinish"},
			{kind: "onyx.Button", content: "More stuff"}
		]}

	When using a Grabber inside a Fittable control, be sure to set "noStretch: true"
	on the Fittable or else give it an explicit height.  Otherwise, the Grabber
	may not be visible.
*/
enyo.kind({
	name: "onyx.Grabber",
	classes: "onyx-grabber"
});