define(["sugar-web/activity/activity","sugar-web/datastore","activity/model","activity/view","activity/controller"], function (activity, datastore, model, view, controller) {

    // Manipulate the DOM only when it is ready.
    require(['domReady!'], function (doc) {

        var todo;

        // Initialize the activity.
        activity.setup();

    });

});
