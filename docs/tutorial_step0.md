[Go back to tutorial home](tutorial.md)


# Step 0: set up the development environment

For this tutorial, you will just need a browser and a text editor. We will run Sugarizer from a local directory.

To start, download Sugarizer from [here](https://github.com/llaske/sugarizer/archive/dev.zip) and unzip it. If you're familiar with git, you could clone the repository - dev branch - instead.

Then go in the new created directory with:

	cd sugarizer-dev

We will use Chrome in this tutorial but any other browser will work as well. To run Sugarizer locally in Chrome, close any running instances of Chrome and re-launch it using the command line:

    chrome --allow-file-access-from-files index.html

The option `--allow-file-access-from-files` is required to enable access to local files using XMLHttpRequest. Equivalent options for other browser [are available](https://github.com/mrdoob/three.js/wiki/How-to-run-things-locally).

After typing your name and choosing your color, you should see something like that:

![](images/tutorial_step0_1.png)

To debug your code, it's a good practice too to use the development console of your browser. See [here](https://developers.google.com/web/tools/chrome-devtools/) how to activate this console on Chrome.


[Go to next step](tutorial_step1.md)