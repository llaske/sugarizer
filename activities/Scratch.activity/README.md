# Scratch.activity
![Scratch](http://i68.tinypic.com/103zn7s.png)

Hello! I am Emily, a GCI`17 participant for Sugar Labs and this is one of the projects that I have worked on- Scratch 3.0 integration into Sugarizer.

## Definitions

If you have noticed, [Scratch 3.0](https://github.com/LLK/scratch-gui) uses many `.jsx` and `.ejs` files. 

+ [JSX is a preprocessor step that adds XML syntax to JavaScript. You can definitely use React without JSX but JSX makes React a lot more elegant.](http://buildwithreact.com/tutorial/jsx)

+ [EJS (Embedded Javascript) is a client-side templating language.](http://www.embeddedjs.com/)

What I did first was to translate the `.jsx` into `.js` code. This can easily be done using [Babel](https://babeljs.io/), a first-generation Javascript compiler, which would be useful in porting `.jsx` into `.js`.

Following which, I adapted the `.ejs` into `.html`, and of course, including the Sugar toolbar and artwork.

```
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" media="not screen and (device-width: 1200px) and (device-height: 900px)"
  href="static/lib/sugar-web/graphics/css/sugar-96dpi.css">
<link rel="stylesheet" media="screen and (device-width: 1200px) and (device-height: 900px)"
  href="static/lib/sugar-web/graphics/css/sugar-200dpi.css">
<link rel="stylesheet" href="static/css/activity.css">
<script data-main="static/js/loader" src="static/lib/require.js"></script>

...

<div id="main-toolbar" class="toolbar">
  <button class="toolbutton" id="activity-button" title="Scratch"></button>

  <!-- Add more buttons here -->

  <!-- Buttons with class="pull-right" will be right aligned -->
  <button class="toolbutton pull-right" id="stop-button" title="Stop"></button>
</div>

```

## Sugarizing 

In order to create a Sugar compatible activity, do also include the following files:

1. src/setup.py
2. activity/activity-icon.svg 
3. activity/activity.info
4. static/activity.css
5. static/js/activity.js
6. static/js/loader.js
7. static/lib

Download this [file](http://wiki.laptop.org/go/File:Scratch-25.xo) to extract activity-icon.svg, and sugariconfiy it using this [script](https://github.com/sugarlabs/sugar-docs/blob/master/sugar-iconify.md).

All these are available in the [activity template](https://github.com/llaske/sugarizer/tree/master/activities/ActivityTemplate).

You would now need to configure your `package.json` file- do make the following edits:

```
"author": "Massachusetts Institute of Technology",
  "license": "BSD-3-Clause",
  "homepage": "./", //this would allow the source to be built offline
  "repository": {
    "type": "git",
    "url": "git+ssh://git@github.com/LLK/scratch-gui.git"
   
```

```
"jest": {
    ...
  },
  "amd": {},
  "volo":{
    "baseUrl": "lib",
    "dependencies": {
        "sugar-web": "github:sugarlabs/sugar-web/master",
        "domReady": "github:requirejs/domReady/2.0.1"
    }
  }
}
```

## Precautions

Afterwhich, it is important to look through all the files again and replace `.jsx` with `.js` because we do not want to `require` a file that no longer exists. It is also crucial to upate the `webpackconfig.js` and `package.json` files, and replace `.jsx` with `.js` and `.ejs` with `.html`.

This will ensure that the file paths are correct and the activity can be compiled on the `localhost`. 

```
Project is running at http://0.0.0.0:8601/
webpack output is served from /
Content not from webpack is served from /Users/emilyong/scratch-gui/build
Hash: 14d37b50edea5264797e
Version: webpack 3.10.0
Time: 21251ms
```

## Building

```
cd scratch-gui
npm run build
```

Configure the file path to that of this repository.

### Note

You can take a look at my prebuild source code [here](https://github.com/EmilyOng/scratch-source/tree/master).

## Integrating Datastore

In order to integrate Sugarizer's [datastore](https://github.com/llaske/sugarizer/tree/master/activities/ActivityTemplate/lib/sugar-web/datastore) function, I inputed the `json` data collected from `containters/save-button.js` into a `div` value. The lines of codes are commented out so that the saved data would not be downloaded.

```

key: "handleClick",
      value: function handleClick() {
        var json = this.props.saveProjectSb3();
        document.getElementById("myBlocks").value = json;
        console.log(json);
        // Download project data into a file - create link element,
        // simulate click on it, and then remove it.
        // var saveLink = document.createElement("a");
        // document.body.appendChild(saveLink);
        //
        // var data = new Blob([json], { type: "text" });
        // var url = window.URL.createObjectURL(data);
        // saveLink.href = url;
        //
        // // File name: project-DATE-TIME
        // var date = new Date();
        // var timestamp =
        //   date.toLocaleDateString() + "-" + date.toLocaleTimeString();
        // saveLink.download = "project-" + timestamp + ".json";
        // saveLink.click();
        // window.URL.revokeObjectURL(url);
        // document.body.removeChild(saveLink);
      }
      
```

I removed the unnecessary `FileReader()` from `containers/load-button.js` and used the `div` value to load the blocks onto the canvas.

```

key: "handleChange",
      value: function handleChange(e) {
        console.log("load");
        return this.props.loadProject(document.getElementById("myBlocks").value);
      }

```

In `components/load-button.js`, instead of going with an `input` element for the load button, I changed it to a `div` element and changed the function to render the blocks (`onChange`) on click.

```
_react2.default.createElement("div", {
      className: _loadButton2.default.fileInput,
      ref: inputRef,
      // type: "file",
      onClick: onChange
    })
    
```
In `js/activity.js`, I simulated a `save` button click when the Sugar user clicks on the `stop` button, and did the same for the `load` button when the Sugar user reenters the activity, before passing the stored JSON data from the `div` into the same `div` (`document.getElementById("myBlocks").value = data`).

```
for (var i = 0; i < document.body.getElementsByTagName("span").length; i++){
      if (document.getElementsByTagName("span")[i].innerHTML == "Save"){
        document.getElementsByTagName("span")[i].click();
        console.log("Saved successfully");
      }
      else{
        console.log("Unable to save");
      }
}

```

This meant that with the datastore function, which aligns with [Sugar Labs' pedagogy of not having a complicated save/load system](https://wiki.sugarlabs.org/go/Human_Interface_Guidelines/The_Sugar_Interface), the blue menu bar is no longer necessary. However, we cannot remove it from the `gui` because it would mean that the click simualtions would be impossible to complete. Instead I set the display to `none` in `container/menu-bar.css`.

## Acknowledgements

This was a challenging project for me, and would never have been possible without the guidance of the kind mentors! 

+ Samson
+ Ignacio Rodriguez
+ Michael Ohayon
+ Lionel Laské
+ Abdulsamad Aliyu
+ Nnachi Isaac Onuwa
+ Hrishi Patel
+ Walter Bender
