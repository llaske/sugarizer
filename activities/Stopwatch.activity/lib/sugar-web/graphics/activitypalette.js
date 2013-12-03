define(["sugar-web/graphics/palette",
        "sugar-web/datastore",
        "sugar-web/env",
        "sugar-web/bus"], function (palette, datastore, env, bus) {

    var activitypalette = {};

    activitypalette.ActivityPalette = function () {

        var activityTitle;
        var descriptionLabel;
        var descriptionBox;

        this.getPalette().id = "activity-palette";

        var titleContainer = document.createElement('div');
        titleContainer.className = "row";
        activityTitle = document.createElement('input');
        activityTitle.type = "text";
        activityTitle.id = "title";
        activityTitle.className = "expand";
        titleContainer.appendChild(activityTitle);

        var descLabelContainer = document.createElement('div');
        descLabelContainer.className = "row small";
        descriptionLabel = document.createElement('label');
        descriptionLabel.innerHTML = "Description:";
        descLabelContainer.appendChild(descriptionLabel);

        var descriptionContainer = document.createElement('div');
        descriptionContainer.className = "row expand";
        descriptionBox = document.createElement('textarea');
        descriptionBox.rows = "8";
        descriptionBox.id = "description";
        descriptionBox.className = "expand";
        descriptionContainer.appendChild(descriptionBox);

        this.setContent([titleContainer, descLabelContainer,
                         descriptionContainer]);

        var titleElem = document.getElementById("title");
        var descriptionElem = document.getElementById("description");
        var datastoreObject = new datastore.DatastoreObject();
        var mdata;
        var title;

        bus.listen();

        datastoreObject.getMetadata(function (error, metadata) {
            mdata = metadata;
            setTitleDescription();
        });

        setTitleDescription();

        function setTitleDescription() {
            if ((mdata === undefined) || (mdata.title === undefined)) {
                env.getEnvironment(function (error, environment) {
                    title = environment.activityName;
                    datastoreObject.setMetadata({
                        "activity": environment.bundleId,
                        "activity_id": environment.activityId,
                        "title": title
                    });
                    datastoreObject.save(function () {});
                    titleElem.value = title;
                });
            } else {
                if (mdata.title !== undefined) {
                    titleElem.value = mdata.title;
                    datastoreObject.setMetadata({
                        "activity": mdata.bundleId,
                        "activity_id": mdata.activityId,
                        "title": mdata.title
                    });
                    datastoreObject.save(function () {});
                }

                if (mdata.description !== undefined)
                    descriptionElem.value = mdata.description;
            }
        }

        titleElem.onblur = function () {
            datastoreObject.setMetadata({
                "title": this.value
            });
            datastoreObject.save(function () {});
        };

        descriptionElem.onblur = function () {
            datastoreObject.setMetadata({
                "description": this.value
            });
            datastoreObject.save(function () {});
        };
    };

    var activityButton = document.getElementById("activity-button");

    activitypalette.ActivityPalette.prototype =
        new palette.Palette(activityButton);

    return activitypalette;
});
