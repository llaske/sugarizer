/* This file is generated, do not edit directly */
riot.tag2('tool-bar', '<div id="main-toolbar" class="toolbar"> <button class="toolbutton" id="activity-button" title="Jappy Activity"></button> <hr> <button class="toolbutton" id="example-button" title="Load an example" ref="examplebutton"></button> <hr> <button class="toolbutton {colored: window.state!=\'run\'}" id="run-button" title="Execute" ref="runbutton"></button> <button class="toolbutton {colored: window.state==\'run\'}" id="break-button" title="Break execution" ref="breakbutton"></button> <button class="toolbutton {colored: window.state!=\'clean\'}" id="erase-button" title="Clear the canvas" ref="erasebutton"></button> <button class="toolbutton {hidden: window.state==\'run\'}" id="start-button" title="Start fullscreen" ref="startbutton"></button> <button class="toolbutton {hidden: window.state==\'stopped\'} {hidden: window.state==\'clean\'}" id="full-button" title="View fullscreen" ref="fullbutton"></button> <button class="toolbutton" id="export-button" title="Export or publish" ref="exportbutton"></button> <button class="toolbutton pull-right" id="stop-button" title="Stop" ref="stopbutton"></button> </div>', 'tool-bar #main-toolbar #run-button,[data-is="tool-bar"] #main-toolbar #run-button{ background-image: url(icons/run_bw.svg); } tool-bar #main-toolbar #run-button.colored,[data-is="tool-bar"] #main-toolbar #run-button.colored{ background-image: url(icons/run_color.svg); } tool-bar #main-toolbar #break-button,[data-is="tool-bar"] #main-toolbar #break-button{ background-image: url(icons/stopit_bw.svg); } tool-bar #main-toolbar #break-button.colored,[data-is="tool-bar"] #main-toolbar #break-button.colored{ background-image: url(icons/stopit_color.svg); } tool-bar #main-toolbar #erase-button,[data-is="tool-bar"] #main-toolbar #erase-button{ background-image: url(icons/eraser_bw.svg); } tool-bar #main-toolbar #erase-button.colored,[data-is="tool-bar"] #main-toolbar #erase-button.colored{ background-image: url(icons/eraser_color.svg); } tool-bar #main-toolbar #example-button,[data-is="tool-bar"] #main-toolbar #example-button{ background-image: url(icons/load-example.svg); } tool-bar #main-toolbar #start-button,[data-is="tool-bar"] #main-toolbar #start-button{ background-image: url(icons/activity-start.svg); } tool-bar #main-toolbar #full-button,[data-is="tool-bar"] #main-toolbar #full-button{ background-image: url(icons/view-fullscreen.svg); } tool-bar #main-toolbar #export-button,[data-is="tool-bar"] #main-toolbar #export-button{ background-image: url(icons/export-or-publish.svg); } tool-bar .hidden,[data-is="tool-bar"] .hidden{ display: none !important; }', '', function(opts) {
var tag, examples;
tag = this;
examples = ρσ_list_decorate([ "welcome.pyj", "memorize.pyj", "mandala.pyj", "input.pyj", "repl.pyj", "unicode.pyj" ]);
window.state = "clean";
function init() {
    this.refs.runbutton.onclick = function () {
        window.state = "run";
        tag.update();
        event_bus.trigger("run-code");
    };
    this.refs.startbutton.onclick = function () {
        window.state = "run";
        tag.update();
        event_bus.trigger("run-fullscreen");
    };
    this.refs.fullbutton.onclick = function () {
        window.state = "run";
        tag.update();
        event_bus.trigger("run-fullscreen", false);
    };
    this.refs.breakbutton.onclick = function () {
        window.state = "stopped";
        tag.update();
        event_bus.trigger("break-code");
    };
    this.refs.erasebutton.onclick = function () {
        window.state = "clean";
        event_bus.trigger("clear-output");
        event_bus.trigger("traybutton-close", false);
        tag.update();
    };
    function activity_ready(activity) {
        tag.refs.stopbutton.onclick = function () {
            event_bus.trigger("activity-save", activity);
        };
    };
    if (!activity_ready.__argnames__) Object.defineProperties(activity_ready, {
        __argnames__ : {value: ["activity"]}
    });

    event_bus.on("activity-ready", activity_ready);
    function enable_standalone() {
        tag.refs.stopbutton.onclick = function () {
            var base_url;
            event_bus.trigger("activity-save", activity);
            base_url = window.location.protocol + "//" + window.location.host + "/";
            window.location = base_url + "shutdown";
        };
    };

    event_bus.on("enable-standalone", enable_standalone);
    requirejs(ρσ_list_decorate([ "sugar-web/graphics/palette" ]), (function() {
        var ρσ_anonfunc = function (palette) {
            var items, row, item, span, text, i;
            tag.example_palette = new palette.Palette(tag.refs.examplebutton, "Load an example");
            items = ρσ_list_decorate([]);
            var ρσ_Iter0 = ρσ_Iterable(examples);
            for (var ρσ_Index0 = 0; ρσ_Index0 < ρσ_Iter0.length; ρσ_Index0++) {
                i = ρσ_Iter0[ρσ_Index0];
                row = document.createElement("div");
                row.classList.add("menu");
                item = document.createElement("button");
                item.classList.add("icon");
                span = document.createElement("span");
                span.classList.add("pyj");
                text = document.createTextNode(i);
                item.appendChild(span);
                item.appendChild(text);
                function trigger_load(el) {
                    return function () {
                        tag.example_palette.popDown();
                        event_bus.trigger("example-load", el);
                    };
                };
                if (!trigger_load.__argnames__) Object.defineProperties(trigger_load, {
                    __argnames__ : {value: ["el"]}
                });

                item.onclick = trigger_load(i);
                row.appendChild(item);
                items.append(row);
            }
            tag.example_palette.setContent(items);
            tag.export_palette = new palette.Palette(tag.refs.exportbutton, "Export");
            function as_zip() {
                if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
                as_zip.prototype.__init__.apply(this, arguments);
            }
            as_zip.prototype.__init__ = function __init__ () {
                            };
            as_zip.prototype.__repr__ = function __repr__ () {
                                return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
            };
            as_zip.prototype.__str__ = function __str__ () {
                return this.__repr__();
            };
            Object.defineProperty(as_zip.prototype, "__bases__", {value: []});
            as_zip.prototype.label = "Export as zipped HTML";
            as_zip.prototype.icon = "html";
            as_zip.prototype.trigger = "save-as-zip";

            function import_file() {
                if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
                import_file.prototype.__init__.apply(this, arguments);
            }
            import_file.prototype.__init__ = function __init__ () {
                            };
            import_file.prototype.__repr__ = function __repr__ () {
                                return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
            };
            import_file.prototype.__str__ = function __str__ () {
                return this.__repr__();
            };
            Object.defineProperty(import_file.prototype, "__bases__", {value: []});
            import_file.prototype.label = "Import";
            import_file.prototype.icon = "zip";
            import_file.prototype.trigger = "import-file";

            items = ρσ_list_decorate([]);
            var ρσ_Iter1 = ρσ_Iterable(ρσ_list_decorate([ new as_zip, new import_file ]));
            for (var ρσ_Index1 = 0; ρσ_Index1 < ρσ_Iter1.length; ρσ_Index1++) {
                i = ρσ_Iter1[ρσ_Index1];
                row = document.createElement("div");
                row.classList.add("menu");
                item = document.createElement("button");
                item.classList.add("icon");
                span = document.createElement("span");
                span.classList.add(i.icon);
                text = document.createTextNode(i.label);
                item.appendChild(span);
                item.appendChild(text);
                function trigger_export(event) {
                    return function () {
                        tag.export_palette.popDown();
                        event_bus.trigger(event);
                    };
                };
                if (!trigger_export.__argnames__) Object.defineProperties(trigger_export, {
                    __argnames__ : {value: ["event"]}
                });

                item.onclick = trigger_export(i.trigger);
                row.appendChild(item);
                items.append(row);
            }
            tag.export_palette.setContent(items);
        };
        if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
            __argnames__ : {value: ["palette"]}
        });
        return ρσ_anonfunc;
    })());
};

this.on("mount", init);
});
