//This file only shows the libs loading event
//Please look at calculateapp.js to see the related functions

/* Start of the app, we require everything that is needed */
define(["sugar-web/activity/activity","mustache","sugar-web/graphics/palette","activity/calculate-activity","activity/calculate-app","math","parser","nanomodal"], function (activity, mustache, calcpalette) {
  CalculateApp.libs.palette = calcpalette;

  //function-plot depends on d3.
  requirejs(["d3"], function(d) {
    requirejs(["function-plot"], function(p) {
      CalculateApp.libs.functionPlot = p;
    });
  });

  CalculateApp.libs.activity = activity;
  CalculateApp.libs.mustache = mustache;

  requirejs(['domReady!', 'activity/trigo-palette', 'activity/algebra-palette', 'webL10n', 'sugar-web/datastore'], function(doc, trigoPaletteLib, algebraPaletteLib, webL10n, datastore) {
    CalculateApp.libs.webL10n = webL10n;
    CalculateApp.libs.trigopalette = trigoPaletteLib;
    CalculateApp.libs.algebrapalette = algebraPaletteLib;

    initGui();

    //Localization handling
    window.addEventListener('localized', function() {
      if (datastore !== undefined && datastore.localStorage !== undefined) {
        var preferences = datastore.localStorage.getValue('sugar_settings');
        if (preferences === null || preferences.name === undefined) {
          return;
        }
        if (preferences.language !== undefined) {
          if (CalculateApp.libs.webL10n.language.code !== preferences.language)
            CalculateApp.libs.webL10n.language.code = preferences.language;
        }
      }

      CalculateApp.transateGui();
    }, false);

    //We auto focus if needed
    CalculateApp.focus();

    //We auto fire the onResize event
    CalculateApp.onResize();


    //Launch of the activity, color and data fetch
    activity.setup();
    activity.getXOColor(function(s, color) {
      if (color !== undefined) {
        CalculateApp.data.buddyColor = color;
        CalculateApp.displayAllCalculations();
      }
    });

    activity.getDatastoreObject().loadAsText(function(error, metadata, jsonData) {
      var data = JSON.parse(jsonData);
      if (data !== undefined) {
        CalculateApp.data.calculations = data;
        CalculateApp.displayAllCalculations();
      }
    });
  });

});
