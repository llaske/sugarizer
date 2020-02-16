[Go back to tutorial home](tutorial.md)

# Step 7: use journal chooser dialog
*(Estimated time: 15mn)*

During [step 4](tutorial_step4.md) of this tutorial, we've seen how it's possible to store some content into the Journal and reload it into the activity.

In this step, we're going to see another way to integrate content from the Journal into your activity using the Journal chooser dialog.

### From an activity to another

Let's run the Moon activity from the Sugarizer home view.

This activity is a Moon phase viewer. It shows you Lunar phase information and a nice picture of the current Moon phase.
Let's suppose you want to reuse this picture in a drawing. To do that, we're going to save the current view into the Journal as an image.
Just click on the **Export to image** button.

![](images/tutorial_step7_1.png)

Then stop the activity and go to the Journal view.
You can see a new item named "Image Moon" for the exported image.

![](images/tutorial_step7_2.png)

Now launch the Paint activity and click on the **Insert Image** button in the toolbar.
The Journal chooser popup will appear.

![](images/tutorial_step7_3.png)

Click on the Image Moon item in the list, it will be added to your drawing and you will be able to paint on it!

![](images/tutorial_step7_4.png)

It's a way to use the result of an activity, here Moon, into another activity, here Paint.A Lot of other activities (Record, Labyrinth, Abecedarium, ...) are able to generate contents that other activities (Fototoon, Memorize, Paint, ...) can use. It's why it's useful to understand how the Journal chooser can be integrated into an activity.


### A button to customize the background

Let's suppose that we would like to let the user customize the background of our Pawn activity. So instead of an ugly gray background we could let the user replace it, for example, by a checkboard image.

To do that, let's first add a new button **Insert Image** button in the toolbar like the one in the Paint activity.

![](images/tutorial_step7_5.png)

First, let's retrieve the icon. 
You could download it [here](images/insert-picture.svg). Right-click on it and then save it as a SVG file in `icons/insert-picture.svg`.

Then, let's add our new button. You already know how to do it because you've done it during [step 3](tutorial_step3.md). You have to update the toolbar section of the `index.html` file for your activity. Add a `button` tag with the Sugar-Web `toolbutton` class. Here is the result:

	<div id="main-toolbar" class="toolbar">
	  ...

	  <button class="toolbutton" id="picture-button" title="Change background"></button>

	  ...
	</div>


We will now associate the icon to this new button. This association should be done in the `css/activity.css` file. Add these lines at the end of the file.

	#main-toolbar #picture-button {
		background-image: url(../icons/insert-picture.svg);
	}

Let's run the activity. Good job! the new button is here:

![](images/tutorial_step7_6.png)


### Display the Journal chooser popup

It's time now to add source code to display Journal chooser and integrate our background.


As usual, to integrate new features, we will update the dependencies list of libraries at the first line of `activity/activity.js`.

	define(["sugar-web/activity/activity", ... ,"sugar-web/graphics/presencepalette", "sugar-web/datastore","sugar-web/graphics/journalchooser"], function (activity, ... ,presencepalette, datastore, journalchooser) {
 
This time you need to add two libraries:

* `sugar-web/datastore` the library for all datastore features
* `sugar-web/graphics/journalchooser` the library to display the Journal chooser dialog.

Let's now handle click on the new button to display the Journal chooser. Like others buttons in our activity, 
 we have to add the event listener:

		document.getElementById("picture-button").addEventListener('click', function (e) {
			journalchooser.show(function (entry) {
				// Do nothing for the moment
			}, { mimetype: 'image/png' }, { mimetype: 'image/jpeg' });
		});

 This source code call the `show` method of the `journalchooser` library. This method take two parameters:
 
 * the first one is the callback called when the user click on the moment. For the moment, we're leave it empty
 * the second one is a list of filters to identify what type of Journal entries you're looking for. Here we're looking for images, so we set `mimetype` equal to `image/png` or `image/jpeg`. But it's possible too to ask for items from a specific activity by using something like `{ activity: 'org.sugarlabs.Pawn'}`.

Let's run again the activity. Now, when you click on the new toolbar button the Journal chooser is displayed and the list contains our Moon image.

![](images/tutorial_step7_7.png)

By the way nothing happens when the item is clicked.



### A nice background

We're going to start by importing a nice checkboard image. You could download it [here](images/checkboard.png). Right-click on it and then save it on your desktop. It looks like that:

![](images/checkboard.png)

By combining it multiple times it will become a very nice checkboard.

Let's import first this image into the Journal. To do that, go to the Journal view and click on the **Copy from device** button. Select the `checkboard.png` file then click Open button. 

![](images/tutorial_step7_8.png)

The file is now into the Journal.

![](images/tutorial_step7_9.png)

We will now ready to add the source code to change the background. Here's the new way to call the `journalchooser.show` method:

			journalchooser.show(function (entry) {
				// No selection
				if (!entry) {
					return;
				}
				// Get object content
				var dataentry = new datastore.DatastoreObject(entry.objectId);
				dataentry.loadAsText(function (err, metadata, data) {
					document.getElementById("canvas").style.backgroundImage = "url('"+data+"')";
				});
			}, { mimetype: 'image/png' }, { mimetype: 'image/jpeg' });

When the callback is called, if the `entry` parameter is `null` it's mean that the dialog box was closed without selection. 
Else the `entry` parameter contains metadata for the selected item. So we can create a `DatastoreObject` to handle the object and specifically load its content using the `loadAsText` method. We've already seen this method in [step 4](tutorial_step4.md) but this time it's not to load the Journal item associated with the activity but to load another Journal item.

The callback for the `loadAsText` method receive the content of the item into the `data` parameter. In the case of an image, it's a base64 encoding of the image. Something like: 

	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAIAAAAiOjnJAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4wIRCSUFWSm...

This format is natively supported in HTML, so we just need to set this value into the `background-image` style of the canvas element and voilà!
		 
		 document.getElementById("canvas").style.backgroundImage = "url('"+data+"')";

I'm sure you can't wait to test it. Relaunch the Pawn activity, click on the button to show the dialog then click on the checkboard.png image. Here what happens:

![](images/tutorial_step7_10.png)

Waooow, a very beautiful background for our pawns!

You've learned in this step how to integrate content from the Journal using the Journal chooser dialog. It's a nice way to allow learners to combine multiple activities and create powerful contents.


Note that the background chosen should be stored in the datastore object for the activity else it will be lost on the next launch. It should be interesting also to send it to other connected users. You could try to solve these issues as an exercise.


[Go to next step](tutorial_step8.md)