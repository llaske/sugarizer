define(function (require) {

    var controller = {};

    // Take a model and view and act as the controller between them.
    controller.Controller = function (model, view) {
        this.model = model;
        this.view = view;

        this.ENTER_KEY = 13;
        this.ESCAPE_KEY = 27;
    };

    controller.Controller.prototype.loadItems = function (items) {
        this.model.load(items);
        var list = document.getElementById("todo-list");
        list.innerHTML = this.view.show(items);
    };

    controller.Controller.prototype.addItem = function (title) {
        if (title.trim() === '') {
            return false;
        }
        var item = this.model.create(title);
        var list = document.getElementById("todo-list");
        list.innerHTML += this.view.show([item]);
        return true;
    };

    controller.Controller.prototype.removeItem = function (id) {
        this.model.remove(id);
        this.loadItems(this.model.items);
    };

    controller.Controller.prototype.toggleComplete = function (id, checkbox) {
        var completed = checkbox.checked ? 1 : 0;
        this.model.update(id, {completed: completed});
        this.loadItems(this.model.items);
    };

    return controller;

});
