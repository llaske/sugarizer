define([
  'sugar-web/activity/activity',
  'webL10n',
  'helper',
  'sugar-web/env',
  'sugar-web/graphics/icon',
], function(activity, webL10n, helper, env) {
  // Manipulate the DOM only when it is ready.
  requirejs(['domReady!'], function(doc) {
    // Initialize the activity.
    activity.setup();

    let ENV,
      previousLanguageCode = null;

    //get environment variables for user
    env.getEnvironment(function(err, environment) {
      var defaultLanguage =
        typeof chrome != 'undefined' && chrome.app && chrome.app.runtime
          ? chrome.i18n.getUILanguage()
          : navigator.language;
      var language = environment.user
        ? environment.user.language
        : defaultLanguage;
      webL10n.language.code = language;
      ENV = environment;
    });

    //DOM Nodes references
    let weightButton = document.getElementById('weight-button');
    let rulerButton = document.getElementById('ruler-button');
    let container = document.getElementById('container');

    //function to fill DOM with INPUTS
    function paintDOM(data) {
      let lengthKeys = Object.keys(data);
      lengthKeys.forEach(element => {
        let child = document.createElement('div');
        child.classList.add(...['form-group', 'col-md-3', 'col-sm-6', 'col-8']);
        child.innerHTML = `<Label class="control-label">${webL10n
          .get(element)
          .toUpperCase()}</Label><input type="number" min="0" oninput="converter(this.value,this.name)" onchange="converter(this.value,this.name)" class="elem form-control" name=${
          data[element]
        } id="${element}" /> `;
        container.appendChild(child);
      });
    }

    //use weight conversion data
    weightButton.addEventListener('click', function() {
      container.innerHTML = '';
      paintDOM(helper.weights);
    });

    //use lengrh conversion data
    rulerButton.addEventListener('click', function() {
      container.innerHTML = '';
      paintDOM(helper.lengths);
    });

    //paint the dom when we get the language code for the user
    window.addEventListener(
      'localized',
      function() {
        if (webL10n.language.code !== previousLanguageCode) {
          //greeting message for user
          document.getElementById('user').innerHTML =
            '<h4 class="pt-4 text-center">' +
            webL10n.get('Hello', { name: ENV.user.name }) +
            '</h4>';
          previousLanguageCode = webL10n.language.code;
          paintDOM(helper.lengths);
        }
      },
      false,
    );
  });
});
