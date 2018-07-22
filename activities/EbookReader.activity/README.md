# What is Ebook Reader activity ?

Ebook Reader activity is an Epub viewer that allow to browse and read a set of ebooks hosted on a server.
A set of ebooks in French and in English coming from [Gutenberg Project](http://www.gutenberg.org/) is provided natively with the activity. But you're able to change settings to point to your own set of ebooks.

Only [EPUB 3](http://www.idpf.org/epub/30/spec/epub30-overview.html) files could be read by the Ebook Reader activity. The ePub reader is based on [Future press Epub.js v0.3 library](https://github.com/futurepress/epub.js/).

# How it works ?

By default the activity call the library to the URL `http://sugarizer.org/content/books.php` and add to the URL a param with the current user Sugarizer [ISO 639-1 language code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes). So for example `http://sugarizer.org/content/books.php?lang=fr` if you're in French.

Once read, the library content is set in the Journal so this URL will not be read again for this instance.

An user could change this URL by clicking on the Settings icon of the toolbar. So, because the library content is set in the Journal, you could have in your Journal Ebook reader activity instance with libraries coming from different places.

The result of the URL call should be a JSON object describing the content of the library.
Here is an example of this JSON file:

	{
		"information": {
			"name": "contesen",
			"fileprefix": "https://sugarizer.org/content/books/en/",
			"imageprefix": "https://sugarizer.org/content/books/images/"
		},
		"database": [
			{
				"title": "Alice's Adventures in Wonderland",
				"author": "Lewis Carroll",
				"image": "alice.png",
				"file": "Carroll_Alice.epub"
			},
			{
				"title": "The Jungle Book",
				"author": "Rudyard Kipling",
				"image": "kipling_jungle.png",
				"file": "kipling_jungle_book.epub"
			},
			...
			{
				"title": "The Second Jungle Book",
				"author": "Rudyard Kipling",
				"image": "kipling_jungle2.png",
				"file": "kipling_second_jungle.epub"
			}
		]
	}

This JSON object is separated in two parts:

* **information**: informations about the library,
* **database**: list of books in the library.

Here what means each field in the `information` part:

* **name**: name is the unique identifier of the library.
* **fileprefix**: prefix used to compute ePub location for an ebook in the library: `fileprefix + file` should give the full URL of the ebook ePub file,
* **imageprefix**: prefix used to compute image location for an ebook in the library: `imageprefix + file` should give the full URL of the ebook cover image.

Here what means each field of objects in the `database` part:

* **title**: title of the book,
* **author**: author of the book,
* **image**: cover image to use for the ebook, it should be a JPG or PNG file and should be small (will be reduced to 150x200px). A default image is provided is this field is not set,
* **file**: epub file name.

It's important to say that the JSON file for the database is not necessarily static, it could be generated dynamically, for example depending of language.
