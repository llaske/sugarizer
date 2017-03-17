define(["sugar-web/activity/activity","webL10n","sugar-web/datastore","activity/model","activity/view","activity/controller"], function (activity, webL10n, datastore, model, view, controller) {

    // Manipulate the DOM only when it is ready.
    require(['domReady!'], function (doc) {

        var todo;

        // Initialize the activity.
        activity.setup();
	    document.getElementById("new-todo").placeholder = l10n_s.get("new-todo");

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

        var draggedElement; // save the dragged element globally

        document.allowDrop = function(ev) {
            ev.preventDefault();
        }

        document.drag = function(ev) {
            draggedElement = ev.target;
            ev.dataTransfer.setData("text/plain", ev.target.id);
        }

        document.drop = function(ev) {
            ev.preventDefault();

            var draggedElementLabel = draggedElement.childNodes[0].childNodes[1];
            var draggedElementID =  parseInt(draggedElement.dataset.id);

            var droppedOnElementLabel = ev.target;
            var droppedOnElement = ev.target.parentNode.parentNode;
            var droppedOnElementID = parseInt(droppedOnElement.dataset.id);

            // Swap the labels (visual)
            var tempSaveLabel = droppedOnElementLabel.innerText;
            droppedOnElementLabel.innerText = draggedElementLabel.innerText;
            draggedElementLabel.innerText = tempSaveLabel;

            // Swap the complete and checked boxes (visual)
            // swap complete attribute
            var tempSaveCompleteVisual = droppedOnElement.className;
            droppedOnElement.className = draggedElement.className;
            draggedElement.className = tempSaveCompleteVisual;

            // swap check box (visual)
            if (droppedOnElement.childNodes[0].childNodes[0].hasAttribute("checked")) {
                if (! draggedElement.childNodes[0].childNodes[0].hasAttribute("checked")) {
                    // swap: uncheck droppedOnElement and check draggedElement
                    droppedOnElement.childNodes[0].childNodes[0].removeAttribute("checked");
                    draggedElement.childNodes[0].childNodes[0].setAttribute("checked", null);
                } // else do nothing
            }
            else if (draggedElement.childNodes[0].childNodes[0].hasAttribute("checked")) {
                if (! droppedOnElement.childNodes[0].childNodes[0].hasAttribute("checked")) {
                    // swap: uncheck draggedOnElement and check droppedOnElement
                    draggedElement.childNodes[0].childNodes[0].removeAttribute("checked");
                    droppedOnElement.childNodes[0].childNodes[0].setAttribute("checked", null);
                } // else do nothing
            }

            // Find the index of the labels in the controler and overwritte the labels and completed elements
            var draggedElementIndex = todo.controller.model.items.map(function(x) { return x.id; }).indexOf(draggedElementID);
            var droppedOnElementIndex = todo.controller.model.items.map(function(x) { return x.id; }).indexOf(droppedOnElementID);

            // swap the labels in the controller
            todo.controller.model.items[draggedElementIndex].title = draggedElementLabel.innerText;
            todo.controller.model.items[droppedOnElementIndex].title = droppedOnElementLabel.innerText;


            // swap the completed elements in the controller
            var tempSaveCompleteInController = parseInt(todo.controller.model.items[droppedOnElementIndex].completed);
            todo.controller.model.items[droppedOnElementIndex].completed = todo.controller.model.items[draggedElementIndex].completed;
            todo.controller.model.items[draggedElementIndex].completed = tempSaveCompleteInController;

        }

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
