# What is Calligra activity ?

Calligra activity is a fun activity to help kids learn cursive writing: letters, numbers or figures.

# How to customize items provided

Calligra comes with a set of items to draw but it's easy to customize this set either by using the included Editor (see tutorial) or by editing the `js/database.js` file.

Here is the format of this file:

	var defaultTemplates = [
		{
			name: "template-lower",
			images: [
				{image:"icons/lower-a.svg","starts":[
					{"x":115,"y":98,"path":[{"x":113,"y":94},{"x":111,"y":92}, ..., {"x":116,"y":87}]},
					{"x":116,"y":87,"path":[{"x":116,"y":90},{"x":116,"y":93}, ...,{"x":139,"y":108}]}
				]},
				{image:"icons/lower-b.svg","starts":[...
				]},
				...
		},
		...
		{
			name: "template-number",
			images: [
				...
			]
		}
	];

The file define a default templates set used to initialize the activity when a new instance of the activity is launch.

This array contains a list of templates. Each template is define by:

* a name, should be the name of its icon file in `icons` directory (for example `icons/template-lower.svg`),
* a set of images in the template. Each image is an item to draw.

Each item in a template is defined by:

* an image, should be the path to find the image or could be the image itself encoded in base64. The value of this field will be use to initialize the `src` property of the HTML `img` tag,
* a set of starts point. Each drawing could have multiple start points. Starts point are generally use to show where the pen should be up when drawing the item.

Each start point is defined by:

* x,y coordinate, the place where the start point is located related to the corner top left of the image at initial size,
* a set of paths point. Use path points to define the path to follow to draw your item from each start point. It's better if path points are not very far from one another.

Each start point is defined by:

* x,y coordinate, the place where the path point is located related to the corner top left of the image at initial size.


# Credits

Letters and numbers by default are SVG files based on Graphécrit font by Olivier Nangda from http://ecriture-cursive.com
