[Go back to tutorial home](tutorial.md)

# Step 5: Localize the activity
*(Estimated time: 15mn)*

Your current Sugarizer session talks probably the same language as you. At the first setup, Sugarizer detects the language of your browser and uses this language for the UI and the activities

You could also change the language from the settings. Hover the mouse on the XO buddy icon on the Sugarizer home view and then click on settings, then to "Language" to display the language settings window.

![](../../images/tutorial_step5_1.png)

If you choose another language, this new language will be used for all activities. Let's see how we could use it in our Pawn activity too.

## Identify strings to localize

Sugarizer and Sugar-Web use the [webL10n](https://github.com/fabi1cazenave/webL10n) JavaScript library to handle localization.

The first step when you localize an activity is to identify strings to localize. It means replace hard-coded string in your HTML or JavaScript files by localization resources. In the Pawn activity we've got three strings to localize:

* *"Hello {user}"*: the welcome message
* *"{user} played!"*: when the user played a pawn
* *"Add pawn"*: the helper message on the toolbar button

With the webL10n library, all strings have to be defined in a specific file where all translations for each string should be set. We call this file `locale.ini`. It is already present in the root of your activity, open it and add the following content: 
```ini
[*]
Hello=Hello {{name}}!
Played={{name}} played
AddPawn=Add pawn

[en]
Hello=Hello {{name}}!
Played={{name}} played
AddPawn=Add pawn

[fr]
Hello=Bonjour {{name}} !
Played={{name}} a joué
AddPawn=Ajouter pion

[es]
Hello=Hola {{name}} !
Played={{name}} jugó
AddPawn=Agrega un peón
```

This file is decomposed into sections. One section for each language with the language code between brackets as section name (**en**, **fr**, **es**, ...) and a special section (**\***) for unknown language.

In each section, you have to define translations for each string. The left side of the equal sign is the id of the string (**Hello**, **Played**, **AddPawn**), the right side of the equal sign is the translated string.

For parameterized strings (i.e. strings where a value is inside the string), the double curved bracket **\{\{\}\}** notation is used.

If you notice, the file is already included in `index.html` with an HTML `link` tag and has a `application/l10n` type to be recognized by webL10n library.

## Initialize localization

We will now see how to initialize localization into the activity source code.

Once again we will have first to integrate a new component. So let's add the `SugarL10n` to `index.html` and create an instance:
```html
		...
		<!-- Inside app element -->
		<sugar-localization ref="SugarL10n"></sugar-localization>
	</div>

	...
	<!-- After script loads -->
	<script src="js/components/SugarL10n.js"></script>
	<script src="js/activity.js"></script>
</body>
```

Now in `js/activity.js`, let's keep a data variable as a reference to this component instance as it might be used multiple times in the activity.
```js
data: {
	currentenv: null,
	SugarL10n: null,
	...
},
mounted: function () {
	this.SugarL10n = this.$refs.SugarL10n;
},
```

The `SugarL10n` component automatically detects the language set by the user using the environment and configures the webL10n library accordingly.

## Set strings value depending on the language

To get the localized version of a string, the webL10n framework provide a simple `get` method. You pass to the method the id of the string (the left side of the plus sign in the INI file) and, if need, the string parameter. You can call the `get` method of the Sugar component which will work the same way. The `SugarL10n` also provides a `localize(object)` method to localize a JavaScript object containing string id's. 

So for the welcome message, here is the line to write in `js/activity.js`:
```js
this.displayText = this.SugarL10n.get("Hello", { name: this.currentenv.user.name });
```
As you could see the first `get` parameter is the id of the string (**Hello**) and the second parameter is a JavaScript object where each property is the name of the parameter (the one provided inside double curved brackets **\{\{\}\}**, **name** here). The result of the function is the string localized in the current language set in webL10n.

In a same way, the pawn played message could be rewrite as: 
```js
this.displayText = this.SugarL10n.get("Played", { name: this.currentenv.user.name });
```

To set localized titles to toolbar items, let's define a JavaScript object `l10n` which will store string id's of the strings we want (strings here should be static, i.e. without parameters)
```js
data: {
	...
	l10n: {
		stringAddPawn: ''
	}
}
```
***NOTE:*** *The string id's inside the object should be prefixed by the word "string". For example in this case we want the string for `AddPawn`, so in the object we will write `stringAddPawn: ''`.*

We can localize this object by calling the `localize` method: 
```js
this.SugarL10n.localize(this.l10n);
```

Let's bind this to the title of add-button in `index.html`:
```html
<sugar-toolitem id="add-button" v-bind:title="l10n.stringAddPawn" v-on:click="onAddClick"></sugar-toolitem>
```

One point however: we need to wait to initialize strings that the `locale.ini` is read. It's possible because the webL10n framework raises a new `localized` event on the window when the language is ready. Our `SugarL10n` component will emit a Vue event called `localized` as well, that too only after the activity has been initialized.

So we will now initialize the welcome message in the `localized` event listener, which we add in `js/activity.js` file:
```js
initialized: function () {
	// Initialize Sugarizer
	this.currentenv = this.$refs.SugarActivity.getEnvironment();
	// (Removed displayText definition from here)
},

// Handles localized event
localized: function () {
	this.displayText = this.SugarL10n.get("Hello", { name: this.currentenv.user.name });
	this.SugarL10n.localize(this.l10n);
},
```

And let's add this listener to the `v-on` directive too. Make these changes to the `sugar-localization` instance created in `index.html`:
```html
<sugar-localization ref="SugarL10n" v-on:localized="localized"></sugar-localization>
```

Everything is now ready to handle localization.

Let's test it. Change the Sugarizer language to French and let's see the result.


![](../../images/tutorial_step5_2.png)

The welcome message and the button placeholder is now in French. The played message works too.

[Go to next step](step6.md)