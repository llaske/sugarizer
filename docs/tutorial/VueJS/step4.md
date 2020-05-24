[Go back to tutorial home](tutorial.md)

# Step 4: Handle journal and datastore
*(Estimated time: 30mn)*

In the previous step, we've started to see how to use the unique Sugar UI. Let's see now another major feature of Sugar, the Journal, and how to handle it from our activity.

## What is the Journal?

Launch the Paint activity from the Sugarizer home view.

![](../images/tutorial_step4_1.png)

Draw something.

![](../images/tutorial_step4_2.png)

Then stop the activity by clicking on the Stop button to the right.

Relaunch it. You will retrieve the same drawing. That what the Journal is for: take care of your work without need to save it. Stop the activity again and go to the home view. Now just let the mouse on the Paint icon without clicking on it. A popup will appear after one second.

![](../images/tutorial_step4_3.png)

Click on the **Start new** item.

This time a new drawing is created. Draw something else and click on the Paint icon to access the activity menu. Change the text to "*My second drawing*".


![](../images/tutorial_step4_4.png)

Stop the activity to go back to the Sugarizer home view. Then click on the Journal icon under the XO buddy icon.

![](../images/tutorial_step4_5.png)

It will display the Journal view. You will see here all your past work: the initial drawing and the second drawing that you've renamed. Just click on one of these lines to relaunch the activity in the exact state where you leave it. That's why the Journal is so useful.

![](../images/tutorial_step4_6.png)

Note that in the Journal you will see also your new Pawn activity. Let's see how we could handle context saving in this activity like Paint activity.

## Identify the context

The "context" for our Pawn activity is the current number of pawns on the board. So a user could expect to retrieve the same number of pawns when he reopens the activity.

The array `pawns` contain all pawns. It's the context for our activity.

## Store context in the datastore

To store the context, we have to handle the **datastore**. The datastore is the place where Sugar stores the Journal. During the activity setup, Sugar-Web automatically initializes the datastore for the activity. 

First include the `SugarJournal` component in your activity and instantiate it inside the app element.
```html
    ...
    <sugar-activity ref="SugarActivity" v-on:initialized="initialized"></sugar-activity>
    <sugar-journal ref="SugarJournal"></sugar-journal>
  </div>

  <script src="js/Pawn.js"></script>
  <script src="js/components/SugarActivity.js"></script>
  <script src="js/components/SugarToolbar.js"></script>
  <script src="js/components/SugarJournal.js"></script>
  <script src="js/activity.js"></script>
</body>
```

The `ref` property is very important for the Vue.js components, it is how we will access the component throughtout the Vue instance. It is also important to follow the naming convention for `ref`, it should be the same as the name of the component file (`js/components/{FileName}.js` => `ref="FileName"`) for Sugar components.

The `saveData()` method allows you to store a JavaScript object into the datastore which can be retrieved later. The data is converted to JSON automatically and stored as a text string.

The `SugarJournal` component automatically retrieves the data inside Journal (if any) for the current activity and emits an event `journal-data-loaded`. You are free to handle this event whichever way you like. The data is parsed from the JSON format and returned as a JavaScript object.

So below is the source code to store the context in the datastore.

First, convert the **pawns** array as JSON string and store it in the current object.
```js
var context = {
  pawns: this.pawns
};
this.$refs.SugarJournal.saveData(context);
```

This whole code should be called at the end of the activity. To do that we have to catch the click on the Stop button of the activity. So let's create another method in `js/activity.js` to call when stopping the activity.
```js
onStop: function () {
  // Save current pawns in Journal on Stop
  var context = {
    pawns: this.pawns
  };
  this.$refs.SugarJournal.saveData(context);
}
```

Then add the event listener to the stop-button in `index.html`:
```html
<sugar-toolitem id="stop-button" title="Stop" class="pull-right" v-on:click="onStop"></sugar-toolitem>
```

It's the first step: the board is now safely saved in the datastore.

Let's know how we could retrieve it.

## Detect the need to load the context

Our Pawn activity works well when it's called from the **Start new** menu, i.e. with a new instance. Because in that case, we don't have to reload the context.
So the first question to ask is: how to detect that we need to load the context?

Once again, the Sugar-Web environment could help us. When an activity is launched from an existing context, the environment contains an `objectId` property with the identifier for the datastore object. When an activity is launch with a new instance, this property is null.

The good part is, `SugarJournal` handles this for you! It provides some events which you can handle however you want to. The events are:
1. `journal-new-instance`: Emitted when the activity is a new instance.
2. `journal-data-loaded`: Emitted when the activity is an existing instance and if there is some data stored in the journal. It returns two parameters: data and metadata.
3. `journal-load-error`: Emitted when the activity is an existing instance and if some error occurred while loading data.

Let's handle these events from the `SugarJournal` component. Add the following basic methods:
```js
onJournalNewInstance: function() {
  console.log("New instance");
},

onJournalDataLoaded: function (data, metadata) {
  console.log("Existing instance");
},

onJournalLoadError: function(error) {
  console.log("Error loading from journal");
},
```

Add bind them at the component instance:
```html
<sugar-journal ref="SugarJournal" v-on:journal-data-loaded="onJournalDataLoaded" v-on:journal-load-error="onJournalLoadError" v-on:journal-new-instance="onJournalNewInstance"></sugar-journal>
```

Now display the JavaScript console on your browser and test it. Launch the Pawn activity from the **Start new** menu or from List view of activities. Here is the result:

![](../images/tutorial_step4_7.png)

Now open the Pawn activity from the Journal or by clicking on the Pawn icon on the Home view. Here is the result:

![](../images/tutorial_step4_8.png)

Of course, the context is not loaded for the moment in the activity but at least we've understood which events to handle.


## Load context from the datastore

WAs we saw, when our activity is launched with an existing instance, `SugarJournal` will emit the event `journal-data-loaded` with the loaded parsed data when the activity starts. Let's use this `data` in the event handler:
```js
onJournalDataLoaded: function(data, metadata) {
  console.log("Existing instance");
  this.pawns = data.pawns;
},
```
We get the pawns array from the context we stored in the Journal and we set the `pawns` data property to it.

Let's try if it works.

Launch the Pawn activity from the **Start new** menu. Here is the result:

![](../images/tutorial_step4_9.png)

The activity displays a blank board as expected.

Click a few times on the Plus button to add some pawns and stop the activity. Now re-open the activity by clicking on the Pawn icon on the Home view (Or Journal view). Here is the result:

![](../images/tutorial_step4_10.png)

Yes! It's what we expected too: the activity reopens with the right number of pawns.

The Journal is now fully supported by the Pawn activity.

[Go to next step](step5.md)