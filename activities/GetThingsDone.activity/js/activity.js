define(["sugar-web/activity/activity","webL10n","sugar-web/datastore","activity/model","activity/view","activity/controller"], l10n, function (activity, webL10n, datastore, model, view, controller) {

    // Manipulate the DOM only when it is ready.
    require(['domReady!'], function (doc) {

        var todo;

        // Initialize the activity.
        activity.setup();
		document.ElementById("new-todo") = l10n.get("new-todo");

        var stopButton = document.getElementById("stop-button");
        stopButton.addEventListener('click', function (event) {
            console.log("writing...");
            var jsonData = JSON.stringify(todo.model.items);
            activity.getDatastoreObject().setDataAsText(jsonData);
            activity.getDatastoreObject().save(function (error) {
                if (error === null) {
                    console.log("write done.");
                }
                else {
                    console.log("write failed.");
                }
            });
        });

        // Set up a brand new TODO list

        function Todo() {
            this.model = new model.Model();
            this.view = new view.View();
            this.controller = new controller.Controller(this.model, this.view);
        }

        todo = new Todo();
        var datastoreObject = activity.getDatastoreObject();
        function onLoaded(error, metadata, data) {
            todo.controller.loadItems(JSON.parse(data));
        }
        datastoreObject.loadAsText(onLoaded);

        var input = document.getElementById("new-todo");
        input.addEventListener('keypress', function (e) {
            if (e.keyCode === todo.controller.ENTER_KEY) {
                var success = todo.controller.addItem(e.target.value);
                if (success) {
                    e.target.value = '';
                }
            }
        });

        var inputButton = document.getElementById("new-todo-button");
        inputButton.addEventListener('click', function (e) {
            var success = todo.controller.addItem(input.value);
            if (success) {
                input.value = '';
            }
        });

        // Find the model ID of the clicked DOM element

        function lookupId(target) {
            var lookup = target;

            while (lookup.nodeName !== 'LI') {
                lookup = lookup.parentNode;
            }

            return lookup.dataset.id;
        }

        var list = document.getElementById("todo-list");
        list.addEventListener('click', function (e) {
            var target = e.target;

            if (target.className.indexOf('remove') > -1) {
                todo.controller.removeItem(lookupId(target));
            }

            if (target.className.indexOf('toggle') > -1) {
                todo.controller.toggleComplete(lookupId(target), target);
            }

        });

    });

});
