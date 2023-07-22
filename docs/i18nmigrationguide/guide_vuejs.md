# Migrate Vue.JS Activity to i18next internationalization framework
To migrate a Vue.JS Activity you would need to follow certain steps.

## Step1: Downloading dependencies
To add the i18next as a dependency you would need to download i18next min.js into the lib directory of the activity. You can download it from [here](../../activities/Measure.activity/lib/i18next.min.js).

You would also need to add axios min.js into the lib directory. You can download it from [here](../../activities/Measure.activity/lib/axios.min.js). 

## Step2: Convert ini file to json
Currently translation strings are stored in ini files but to adapt it to i18next format we need to convert it to seperate json files.

To achieve that you can use the following [script](https://github.com/llaske/l10nstudy/blob/master/ini2json.js).

## Step3: Downloading New SugarL10n component
Replace the current SugarL10n component present in the js/components directory with the [new SugarL10n Component](/activities/Measure.activity/js/components/SugarL10n.js).

Here, *loadLanguageFile* Method is responsible for loading the language file and initializing the i18next. After initializing i18next, the method updates various properties of the Vue instance. The l10n property is assigned the initialized i18next instance, code is updated with the current language code obtained from i18next.language, and dictionary is set with the translation resource bundle for the current language, accessed using i18next.getResourceBundle

*subscribeLanguageFile* Method sets up a listener for the 'languageChanged' event in i18next. This event is triggered whenever the language is changed in i18next. The listener updates the code property with the new language code and updates the dictionary property with the updated translation resource bundle for the new language.
## Step4: Remove webl10n reference from sugarweb
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

## Step5: Deleting unnecessary files
Delete files locale.ini (ini file), po directory and lib/webL10n.js.

Remove statement mentioned below from index.html file.
```
<link rel="prefetch" type="application/l10n" href="locale.ini" />
``` 

That's it, happy contributing.