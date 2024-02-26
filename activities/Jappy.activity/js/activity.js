define(["sugar-web/env", "sugar-web/activity/activity"], function (env, activity) {

    // Manipulate the DOM only when it is ready.
    requirejs(['domReady!'], function (doc) {
        //
        // Initialize the python environment.
        compiler = RapydScript.create_embedded_compiler()

        // One event bus for all
        event_bus = riot.observable()

        // Setup custom script parser
        riot.parsers.js.Rapyd = function(js, options) {
          return (compiler.compile(js))
        }

        // Mount web components
        riot.compile(function() {
          // here tags are compiled and riot.mount works synchronously
          var tags = riot.mount('*')

          try {
            activity.setup()
            setTimeout(function(){
              event_bus.trigger('activity-ready', activity)
            }, 100)
          }
          catch(err) {
            // No datastore
            event_bus.trigger('activity-not-ready', err)
          }
        })

    });
});
