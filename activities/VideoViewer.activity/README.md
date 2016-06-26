# What is Video Viewer ?

Video Viewer is a viewer for a set of videos hosted on a server. 
Two set of videos are linked natively with the activity: [Khan Academy](http://khanacademy.org/) and [Canopé](https://www.reseau-canope.fr/lesfondamentaux/accueil.html). But you're able to adapt easily the activity to point to your own set of videos.

# How it works ?

Video Viewer is a Sugar-Web activity, it could work both into Sugar Learning platform and in Sugarizer.

A standard set of libraries is set with the activity (see `constant.libraries` property in [constant.js](constant.js)). You could add your own library using the library dialog (click on the library icon on the toolbar). You should provide to the dialog the URL of a JSON file that include an object with all these properties:

	{
		name: "canope",
		title: "Canopé",
		image: "images/canope.png",
		database: "http://sugarizer.org/content/canope.php",
		videos: "https://videos.reseau-canope.fr/download.php?file=lesfondamentaux/%id%_sd",
		images: "https://www.reseau-canope.fr/lesfondamentaux/uploads/tx_cndpfondamentaux/%image%.png"
	}

Here what means each field:

* **name**: name is the unique identifier of the library.
* **image**: the image for the library. For included libraries, it's a local path but it could be a remote image as well.
* **title**: title is the description of the library. It's used as title for the library into the library selection window.
* **database**: database is the URL for the JSON file where the content is described (see below). You could include a `%language%` string into the URL that will be replaced by the language [ISO 639-1 code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) of the current user.
* **videos**: videos is the URL used to retrieve the video when the user click on it. You could include `%id%`, `%image%`, `%category%`, `%title%` in the URL (see below). They will be replaced by values of these fields for the clicked video. 
* **images**: images is the URL used for the preview image of the video. You could include `%id%`, `%image%`, `%category%`, `%title%` in the URL (see below). They will be replaced by values of these fields for the video.

To be able to display a library, the VideoViewer activity, you need to provide the content of the library. You could do that with the `%database%` field. This field must point to an URL that return a JSON file describing all items in the library. Here is a description of this JSON file:

	[
	    {"id":"...", "title":"...", "image":"...", "category": "..."},
	    {"id":"...", "title":"...", "image":"...", "category": "..."},
	    {"id":"...", "title":"...", "image":"...", "category": "..."},
		...
	]

Each line represent one video, fields are:

* **id**: unique identifier of the video (need),
* **title**: title of the video (need),
* **image**: preview image of the video (optional),
* **category**: category of the video (optional). If provided, it will allow user to filter videos by categories using the menu.

To compute the exact URL of the video and of the preview image, the activity will use the `videos` and `images` URL provided in the library settings and will replace `%id%`, `%category%`, `%image%` and `%title%` by value of these properties for the current video. So it's up to you to decide which field you need. For example, if you have a look on Khan Academy library settings you could see that: no `%category%` is present and that `%image%` is not used  because image preview URL is computed using only video the `%id%` field.

Note that items will be displayed by the VideoViewer activity in the order of your JSON file. So it's up to you to choose the optimal order for your user.

Finally, it's important to say that the JSON file for the database is not necessarily static, it could be generated dynamically.

# Image credits

* play-video by jayson lim from the Noun Project 
* Filter by Kevin Augustine LO from the Noun Project
* Library by vicentnovoa from the Noun Project
