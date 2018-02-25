[Go back to tutorial home](tutorial.md)


# Step 1: create the activity from the template
*(Estimated time: 15mn)*

Sugarizer comes with an empty template that you could use as base of your new activity. So first, copy all content of the Sugarizer [activities/ActivityTemplate](activities/ActivityTemplate) directory in a new directory called `activities/Pawn.activity`. **Pawn** will be the name for our new activity.


### File structure

In your new directory, you will find the following file structure:

![](images/tutorial_step1_1.png)


* `activity/` contains information about your activity, including the name, ID, and the icon.
* `index.html` is where the elements that compose your activity are defined.  The template comes with a toolbar and a canvas where you can place your content.
* `js/activity.js` is where the logic of your activity lives.
* `css/activity.css` is where you add the styling of your activity.

Those are the files you'll modify in most cases. The others are:

* `js/loader.js` configures the libraries paths and loads your   `js/activity.js`
* `lib/` contains the libraries
* `package.json` contains information about the libraries the activity depends on
* `setup.py` is used if you want to run your activity in Sugar.


### Customize the activity

Then customize the activity using your text editor. Change the name for your activity. Write `Pawn` in the activity **name** and `org.sugarlabs.Pawn` in **bundle_id** properties in `activity/activity.info` of the new directory.

	[Activity]
	name = Pawn
	activity_version = 1
	bundle_id = org.sugarlabs.Pawn
	exec = sugar-activity-web
	icon = activity-icon

Use also your text editor to change the **title** tag of `index.html` to `Pawn Activity`.

	<!DOCTYPE html>
	<html>

	<head>
	<meta charset="utf-8" />
	<title>Pawn Activity</title>
	<meta name="viewport" content="user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width"/>
	<link rel="stylesheet" media="not screen and (device-width: 1200px) and (device-height: 900px)"
		href="lib/sugar-web/graphics/css/sugar-96dpi.css">
	<link rel="stylesheet" media="screen and (device-width: 1200px) and (device-height: 900px)"
		href="lib/sugar-web/graphics/css/sugar-200dpi.css">
	<link rel="stylesheet" href="css/activity.css">
	<script data-main="js/loader" src="lib/require.js"></script>
	</head>
	...

Finally, update the file `activities.json` at the root of the Sugarizer directory: add a new line for your activity. Update **id**, **name** and **directory** values on this new line to `org.sugarlabs.Pawn`, `Pawn` and `activities/Pawn.activity`.

	[
		{"id": "org.sugarlabs.Pawn", "name": "Pawn", "version": 1, "directory": "activities/Pawn.activity", "icon": "activity/activity-icon.svg", "favorite": true, "activityId": null},
		{"id": "org.sugarlabs.GearsActivity", "name": "Gears", "version": 6, "directory": "activities/Gears.activity", "icon": "activity/activity-icon.svg", "favorite": true, "activityId": null},
		{"id": "org.sugarlabs.MazeWebActivity", "name": "Maze Web", "version": 2, "directory": "activities/MazeWeb.activity", "icon": "activity/activity-icon.svg", "favorite": true, "activityId": null},

Now run Sugarizer, you should see the icon of a new activity like this:

![](images/tutorial_step1_2.png)

Let's run the activity by clicking on it. You will see the first step of your activity.

![](images/tutorial_step1_3.png)

Now you are ready to go ahead and customize your activity.

[Go to next step](tutorial_step2.md)