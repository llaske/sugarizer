[Go back to tutorial home](tutorial.md)

# Step 9: Integrate a tutorial
*(Estimated time: 15mn)*

Because Sugarizer is a platform dedicated to children, activities should be self-understandable. By the way, it's fair to provide some help to shy users that don't want to click everywhere.

In this tutorial, you'll learn how to easily integrate a tutorial into your Pawn activity.


## What's a tutorial in Sugarizer?

Go to the Sugarizer home view and click on the "?" button to launch the tutorial. Use Next/Prev button to navigate.

![](../../images/tutorial_step9_1.png)

As you can see, the tutorial is a set of dialog box that show you the meaning of UI elements by pointing on them.

Let's see how to do the same in our Pawn activity.


## Prepare the UI

First, we're going to prepare the UI of the activity.

Sugarizer users expect to find the help button into the toolbar. It will be our first step to add it.

![](../../images/tutorial_step9_2.png)

So, download the help icon `help.svg` [here](../../images/help.svg) and copy it in the `icons` directory of your Pawn activity.

Then, as usual, let's add our new button in the toolbar. To do that we will first update the `index.html` by adding the button at the end of the toolbar:
```html
<div id="main-toolbar" class="toolbar">

		...

	<!-- Buttons with class="pull-right" will be right aligned -->
	<button class="toolbutton pull-right" id="stop-button" title="Stop"></button>
	<button class="toolbutton pull-right" id="help-button" title="Tutorial"></button>
</div>
```
Don't forget the `pull-right` class to align it to the right.

We will now associate the icon to this new button. Like in Step 3 of this tutorial, this association should be done in the `css/activity.css` file. Add these lines at the end of the file.
```css
#main-toolbar #help-button {
	background-image: url(../icons/help.svg);
}
```
Let's run the activity to test the result.

![](../../images/tutorial_step9_3.png)

The button is here. That's a good start.


## Integrate IntroJs tour components

Sugarizer relies on the [IntroJs library](https://introjs.com/) to produce the UI for the tutorial. 

**Intro.js** is a lightweight JavaScript library for creating step-by-step and powerful customer onboarding tours. Intro.js doesn't have any dependencies. All we need to do is add the JS and CSS file.

Let's see how to integrate it in Pawn activity.

First download the introJs JavaScript libraries. You could find the `introjs.css` file [here](../../download/introjs.css) and the `intro.js` file [here](../../download/intro.js).

Copy these files in your Pawn activity. The first file should be copied in the `css` directory and the other one should be copied in the `lib` directory.

We're now going to reference these files from our `index.html` file. Update the file like that:
```html
...
<link rel="stylesheet" href="css/activity.css">

<link rel="stylesheet" href="css/introjs.css">
<script src="lib/intro.js"></script>

<script data-main="js/loader" src="lib/require.js"></script>
...
```
The main change is to add the link on the CSS file and integrate the libraries into the scripts part. 


## Display the tutorial

Only a few Javascript lines are needed to display a tutorial with introJs. By the way, it's a good practice to separate this specific code in a dedicated file.

So, let's create a new Javascript file `lib/tutorial.js` to handle everything related to the tutorial.

Insert in this file the following code:
```js
define([], function () {
	var tutorial = {};

	tutorial.start = function() {
		var steps = [
			{
				title: "Pawn Activity",
				intro: "Welcome into the Pawn activity. This activity is an activity to test Sugarizer development."
			},
			{
				element: "#add-button",
				position: "bottom",
				title: "Add pawn",
				intro: "Click here to add one to three pawns on the board."
			},
			{
				element: "#picture-button",
				title: "Change background",
				intro: "Click here to choose a new background for the board."
			}
		];
    steps= steps.filter(function (obj) {
        return !('element' in obj) || ((obj.element).length && document.querySelector(obj.element) && document.querySelector(obj.element).style.display != 'none');
    });
		introJs().setOptions({
			steps: steps,
		}).start();

	};

	return tutorial;
});
```
Since Step 2, you should now be familiar with the structure of this file. It defines a new **require.js** component with a single method `start()`.

The `start` method contains all the stuff to call introJs library. 

We've first defined an array with steps (i.e. dialogs) for the tutorial. Here we've chosen a dialog box to present the activity, then two dialog box to explain the role of "Add" and "Insert Image" buttons.
Here, we are also ensuring that if any element we are targeting for steps, then it should be present or should be visible to display our step.

Then we've called the `setOptions()` function, exposed by the introJs library. Finally, we've called the  `start()` method on this object to display the tutorial.

Really easy, isn't it?

Can't wait to test it! 

But we need first to integrate our new components in the main source code for our Pawn activity. Once again, we will update the dependencies list of libraries at the first line of the `js/activity.js` file.
```js
define(["sugar-web/activity/activity", ... ,"pawnpalette","tutorial"], function (activity, ... , pawnpalette, tutorial) {
```
This time you need to add the `tutorial` library created before. Add the string `"tutorial"` at the end of dependencies array and declare a new `tutorial` variable at the end of the function declaration.

Then we need to add an event listener to handle click on our new help button:
```js
// Launch tutorial
document.getElementById("help-button").addEventListener('click', function(e) {
	tutorial.start();
});
```
That's all. Now launch the activity and click on the help button.

![](../../images/tutorial_step9_4.png)

Hurrah! It works!
Don't worry about UI we are going to fix it.

## Sugarize the UI

Our tutorial is nice but it don't look like to an usual Sugarizer tutorial. Let's now "Sugarize" the tutorial UI.

A cool feature of introJs library is that we're able to fully customize the UI by using the [`tooltipClass`](https://introjs.com/docs/intro/options) option. A css class is a way to provide the exact CSS styling that you want to use for the tutorial window.

So we're going to update the call to introJs tour into `lib/tutorial.js` to include a more Sugarizer friendly UI:
```js
introJs().setOptions({
	tooltipClass: 'customTooltip',
	steps: steps,
	prevLabel: "Prev",
	nextLabel: "Next",
	exitOnOverlayClick: false,
	nextToDone: false,
	showBullets: false
}).start();
```
We need also to define custom CSS class `customTooltip` used here. To do that, add the following lines to the `css/activity.css` file:

```css
/* UI styling for introJs-tutorial */

.introjs-overlay {
  background-color: #000 !important;
  opacity: .8 !important;
}

.introjs-tooltip {
  font-family: "Helvetica Neue",Helvetica,Arial,sans-serif!important;
  border-radius: 6px !important;
  padding: 2px 1px !important;
  font-size: 14px !important;
}

.introjs-helperLayer{
  background: inherit !important;
  opacity: 0.6 !important;
}

.customTooltip .introjs-tooltip-header {
  font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;
  color : #ffffff;
  text-shadow: none;
  background-color: #808080;
  margin: 0;
  padding: 0px 10px;
  border-bottom: 1px solid #ebebeb;
  border-radius: 5px 5px 0 0;
}

.customTooltip .introjs-tooltip-title {
  font-size: 14px;
  padding: 0px 8px;
  font-weight: 800;
}

.customTooltip .introjs-tooltiptext {
  color: #000000;
  line-height: 1.42857143;
}

.customTooltip .introjs-skipbutton {
  float: right;
  cursor: pointer;
  background-image: url(../icons/dialog-cancel.svg);
  width: 25px;
  height: 25px;
  background-size: 25px 25px;
  margin-top: 2px;
  padding: 0px;
  white-space: nowrap;
  color: transparent;
  line-height: 27px;
}

.customTooltip .introjs-nextbutton::before {
  content: "";
  margin-right: 6px;
  background-image: url(../icons/go-right.svg);
  width: 20px;
  height: 20px;
  background-size: 20px 20px;
}

.customTooltip .introjs-prevbutton::before {
  content: "";
  margin-right: 6px;
  background-image: url(../icons/go-left.svg);
  width: 20px;
  height: 20px;
  background-size: 20px 20px;
}

.customTooltip .introjs-tooltipbuttons {
  display: flex;
  flex-wrap:wrap;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border-top: 0px;
  padding: 0px;
  text-align: center;
  white-space: normal;
}

.customTooltip .introjs-button {
  text-shadow: none;
  border-radius: 22px;
  margin: 5px 8px 8px 8px;
  width: fit-content;
  background-color: #808080 !important;
  display: flex !important;
  align-items: center !important;
  color: white !important;
  padding: 6px 20px 6px 10px;
  border: 0px;
}

.customTooltip .introjs-button:focus {
  -webkit-box-shadow: 0 0 0 0rem rgba(158, 158, 158, .5);
  box-shadow: 0 0 0 0rem rgba(158, 158, 158, .5);
  border: 0px;
  background-color: #808080 !important;
}

.customTooltip .introjs-disabled {
  color: black !important;
  border: 0px;
  opacity: .65;
}

.customTooltip .introjs-disabled:focus {
  -webkit-box-shadow: 0 0 0 0rem rgba(158, 158, 158, .5);
  box-shadow: 0 0 0 0rem rgba(158, 158, 158, .5);
  border: 0px;
}
```
Finally we need to integrate icons used by Sugarizer buttons. So download icons `go-left.svg` [here](../../images/go-left.svg), `go-right.svg` [here](../../images/go-right.svg), `dialog-cancel.svg` [here](../../images/dialog-cancel.svg) and copy them in the `icons` directory.

Launch again the activity.

![](../../images/tutorial_step9_5.png)

It's much better now!


## Localize the tutorial

We're almost done but we must add a final step to our tutorial. As we've mentioned in Step 5, your activity should be localized to automatically adapt to the user language. The same is true for our tutorial.

So let's first prepare text to localize. We need to translate title and content for each dialog box and text for buttons. As we've learned during the Step 5, update your `locale.ini` file to define new resource strings:
```
TutoPrev=Prev
TutoNext=Next
TutoExplainTitle=Pawn Activity
TutoExplainContent=Welcome into the Pawn activity. This activity is an activity to test Sugarizer development.
TutoAddTitle=Add pawn
TutoAddContent=Click here to add one to three pawns on the board.
TutoBackgroundTitle=Change background
TutoBackgroundContent=Click here to choose a new background for the board.
```
You should add these strings in the `*` section and give their translations for `en`, `fr` and `es` sections.

Now you need to reference the [webL10n](https://github.com/fabi1cazenave/webL10n) JavaScript library into our `lib/tutorial.js`. Update the "define" line like this:
```js
define(["webL10n"], function (l10n) {
```
We're now able to reference our new resource strings by using call to `l10n.get()` method. First into steps:
```js
var steps = [
	{
		title: l10n.get("TutoExplainTitle"),
		intro: l10n.get("TutoExplainContent")
	},
	{
		element: "#add-button",
		position: "bottom",
		title: l10n.get("TutoAddTitle"),
		intro: l10n.get("TutoAddContent")
	},
	{
		element: "#picture-button",
		title: l10n.get("TutoBackgroundTitle"),
		intro: l10n.get("TutoBackgroundContent")
	}
];
```
Then into the `setoptions()` method to change the text for label of buttons:
```js
introJs().setOptions({
	tooltipClass:  'customTooltip',
	steps:  steps,
	prevLabel:  l10n.get("TutoPrev"),
	nextLabel:  l10n.get("TutoNext"),
	exitOnOverlayClick:  false,
	nextToDone:  false,
	showBullets:  false
}).start();
```
It's done.

Switch to French into Sugarizer settings and relaunch the activity:

![](../../images/tutorial_step9_6.png)

Congratulation! Your activity has now a tutorial perfectly integrated into Sugarizer environment.

[Go back to tutorial home](tutorial.md)