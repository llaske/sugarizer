# Migrate Vanilla.JS Activity to i18next internationalization framework
To migrate a Vanilla.JS Activity you would need to follow the steps mentioned below.

## Step1: Downloading dependencies
To add the i18next as a dependency you would need to download i18next min.js into the lib directory of the activity. You can download it from [here](../../activities/Measure.activity/lib/i18next.min.js).

You would also need to add axios min.js into the lib directory. You can download it from [here](../../activities/Measure.activity/lib/axios.min.js). 

## Step2: Convert ini file to json
Currently translation strings are stored in ini files but to adapt it to i18next format we need to convert it to seperate json files.

To achieve that you can use [this script](https://github.com/llaske/l10nstudy/blob/master/ini2json.js).

## Step3: Add new l10n.js file  
Create a new file named l10n.js in lib directory, you may download the file from [here](/activities/QRCode.activity/lib/l10n.js).  

Brief explanation of methods:  


- `l10n.init(lang)`: Initializes the i18next library with the specified language. It then calls `l10n.switchTo(lang)` to handle switching to the specified language.

- `l10n.get(key)`: Returns the translated string for the given translation key using i18next.

- `l10n.loadLanguageResource(lang)`: Fetches the language resource file for the specified language using axios. It returns a promise that resolves with the translation resources if the request is successful. If there is an error, it logs an error message and resolves with `null` to indicate failure.

- `l10n.switchTo(lang)`: Handles switching to the specified language. If the language resource bundle is not already loaded, it calls `l10n.loadLanguageResource(lang)` to load the resource. If the resource is successfully loaded, it adds it to i18next using `i18next.addResourceBundle`. If the resource is not available or loading fails, it falls back to initializing the default language ("en") using `l10n.init("en")`. After setting the language, it updates the `initialized` flag, and triggers a custom "localized" event.

- `triggerLocalizedEvent()`: Triggers a custom event named "localized" by creating a new event object and dispatching it on the `window` object. This event can be used by other parts of the application to respond to localization changes.

## Step4: Modify reference to webl10n in the code 
Now you need to replace the webl10n code with i18next.

You should update at least the file js/activity.js but references to webl10n in other js files in the activity should be updated as well.

You can refer to this [code](https://github.com/llaske/sugarizer/pull/1371/files#diff-b2447869bafe96b01d12ef5db78589d5a1aa490d31188e694300e3f674211d7fR3) and spin up a similar instance.

## Step5: Remove webl10n reference from sugarweb
Navigate to lib/sugarweb/activity.js and first remove webl10n code from requirejs statement like this.

```
define(["sugar-web/activity/shortcut",
        "sugar-web/bus",
        "sugar-web/env",
        "sugar-web/datastore",
		  "sugar-web/presence",
        "sugar-web/graphics/icon",
        "sugar-web/graphics/activitypalette"],
		function (shortcut, bus, env, datastore, presence, icon, activitypalette) {

```
Also remove ```l10n.start();``` activity.setup() function.

Now remove  ``` "webL10n": "lib/webL10n" ``` from test/loader.js and ```  "webL10n": "github:sugarlabs/webL10n",``` from sugar-web/package.json.

## Step6: Deleting unnecessary files
Delete files locale.ini (ini file), po directory and lib/webL10n.js.

Remove statement mentioned below from index.html file.
```
<link rel="prefetch" type="application/l10n" href="locale.ini" />
``` 

That's it, happy contributing.
