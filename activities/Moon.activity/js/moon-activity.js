define(['activity/data-model', 'activity/draw', 'webL10n', 'sugar-web/env', 'sugar-web/datastore', 'moment-with-locales.min'], function(DataModel, Draw, l10n, env, datastore, moment) {

    'use strict';

    var toggleGridBtn = document.querySelector('#toggle-grid-button'),
        toggleHemisphereBtn = document.querySelector('#toggle-hemisphere-button');

    var canvas = document.querySelector('canvas'),
        ctx = canvas.getContext('2d');

    var _ = l10n.get;

	var first = true;

	l10n.ready(function() {
		if (first) {
			first = false;
			getSugarSettings(function(settings) {
				l10n.language.code = settings.language;
				moment.locale(settings.language);
				var refreshTime = setTimeout(function() {
					clearTimeout(refreshTime);
					updateView();
				}, 50);
			});
		}
	});

    var IMAGE_SIZE, HALF_SIZE, updateTimeout;
    var showGrid, showSouth;



    function setup() {
        /*
            Exposed function - calls all other functions
        */

        initEventListeners();
        updateSizes();
    }


    function initPrefs(pref) {
        /*
            Read user preferences from datastore
        */

        showGrid = pref.showGrid;
        if (showGrid) {
            showGrid = true;
            toggleGridBtn.classList.add('active');
        } else {
            showGrid = false;
            toggleGridBtn.classList.remove('active');
        }

        showSouth = pref.showSouth;
        if (showSouth) {
            showSouth = true;
            toggleHemisphereBtn.classList.add('active');
        } else {
            showSouth = false;
            toggleHemisphereBtn.classList.remove('active');
        }

    }

    function getPrefs() {
		return {
			showGrid: showGrid,
			showSouth: showSouth
		};
	}


	function getSugarSettings(callback) {
		var defaultSettings = {
			name: "",
			language: navigator.language
		};
		if (!env.isSugarizer()) {
			callback(defaultSettings);
			return;
		}
		if (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) {
			var loadedSettings = JSON.parse(values.sugar_settings);
			chrome.storage.local.get('sugar_settings', function(values) {
				callback(loadedSettings);
			});
		} else {
			var loadedSettings = JSON.parse(localStorage.sugar_settings);
			callback(loadedSettings);
		}
	}


    function updateSizes() {
        /*
            Dynamically resize elements as and when the window resizes.
        */

        var navbarOffset = document.querySelector('#main-toolbar').clientHeight;
        document.querySelector('#panel-container').style.height = (window.innerHeight - navbarOffset) + 'px';

        var canvasPanelHeight = document.querySelector('#panel-right').clientHeight;
        var canvasPanelWidth = document.querySelector('#panel-right').clientWidth;
        var paddingPercent = 0.05;

        IMAGE_SIZE = (1 - paddingPercent) * Math.min(canvasPanelWidth, canvasPanelHeight);
        HALF_SIZE = 0.5 * IMAGE_SIZE;

        canvas.width = IMAGE_SIZE;
        canvas.height = IMAGE_SIZE;

        canvas.style.top = 0.5 * (canvasPanelHeight - canvas.height) + 'px';
        canvas.style.left = 0.5 * (canvasPanelWidth - canvas.width) + 'px';
    }


    function updateView() {
        /*
            Update moon data and
            draw moon, repeteadly, after a fixed interval.

            Also, depending on user's preferences:
                * Toggle hemisphere
                * Draw grid
        */

        clearTimeout(updateTimeout);
        updateInfo();
        Draw.setImageSize(IMAGE_SIZE);
        Draw.moon();
        if (showSouth) {
            ctx.save();
            ctx.rotate(Math.PI);
            ctx.drawImage(canvas, -IMAGE_SIZE, -IMAGE_SIZE);
            ctx.restore();

            if (showGrid) {
                Draw.grid(_('SNWE'));
            }
        } else if (showGrid) {
            Draw.grid(_('NSEW'));
        }
        updateTimeout = setTimeout(updateView, 5000);
    }


    function updateInfo() {
        /*
            Update moon data and
            render updated information as HTML
        */

        DataModel.update_moon_calculations();

        var infoParts = {};
        var keys = [
            'moonInfo',
            'phase',
            'julian',
            'age',
            'lunation',
            'visibility',
            'seleno',
            'full',
            'new',
            'lunar',
            'solar'
        ];

        infoParts[_(keys[0])] = [
            formatDate()
        ];

        infoParts[_(keys[1])] = [
            _(DataModel.moon_phase_name())
        ];

        infoParts[_(keys[2])] = [
            DataModel.julian_date.toFixed(2),
            _('astro')
        ];

        infoParts[_(keys[3])] = [DataModel.days_old,
            _('days') + ',',
            DataModel.hours_old,
            _('hours') + ',',
            DataModel.minutes_old,
            _('minutes')
        ];

        infoParts[_(keys[4])] = [
            (100 * DataModel.phase_of_moon).toFixed(4) + '%',
            _('thru'),
            DataModel.lunation
        ];

        infoParts[_(keys[5])] = [
            (100 * DataModel.percent_of_full_moon).toFixed(4) + '%',
            _('estimated')
        ];

        infoParts[_(keys[6])] = [
            DataModel.selenographic_deg.toFixed(2) + '\u00b0',
            _(DataModel.west_or_east),
            '(' + _(DataModel.rise_or_set) + ')'
        ];

        infoParts[_(keys[7])] = [
            formatDate(DataModel.next_full_moon_date),
            _('in'),
            DataModel.days_until_full_moon.toFixed(),
            _('days')
        ];

        infoParts[_(keys[8])] = [
            formatDate(DataModel.next_new_moon_date),
            _('in'),
            DataModel.days_until_new_moon.toFixed(),
            _('days')
        ];

        infoParts[_(keys[9])] = [
            formatDate(DataModel.next_lunar_eclipse_date),
            _('in'),
            DataModel.days_until_lunar_eclipse.toFixed(),
            _('days')
        ];

        infoParts[_(keys[10])] = [
            formatDate(DataModel.next_solar_eclipse_date),
            _('in'),
            DataModel.days_until_solar_eclipse.toFixed(),
            _('days')
        ];


        var infoHTML = [];
        for (var k in infoParts) {
            var html = '<p>' + k + ':<br>' + infoParts[k].join(' ') + '</p>';
            infoHTML.push(html);
        }

        infoHTML = infoHTML.join('');
        document.querySelector('#panel-left').innerHTML = infoHTML;

		 document.getElementById("toggle-grid-button").title = _('ToggleGrid');
		 document.getElementById("toggle-hemisphere-button").title = _('ToggleHemisphere');
		 document.getElementById("save-image-button").title = _('SaveImage');
    }


    function initEventListeners() {
        /*
            Bind event-listeners.
        */

        window.addEventListener('resize', function() {
            updateSizes();
            updateView();
        });

        toggleGridBtn.addEventListener('click', toggleGrid);
        toggleHemisphereBtn.addEventListener('click', toggleHemisphere);
        document.querySelector('#save-image-button').addEventListener('click', saveImage);
    }


    function toggleGrid() {
        /*
            Show/hide grid
        */

        showGrid = !showGrid;
        if (showGrid) {
            toggleGridBtn.classList.add('active');
        } else {
            toggleGridBtn.classList.remove('active');
        }

        updateView();
    }


    function toggleHemisphere() {
        /*
            Rotate moon image to represent southern-hemisphere view.
        */

        showSouth = !showSouth;
        if (showSouth) {
            toggleHemisphereBtn.classList.add('active');
        } else {
            toggleHemisphereBtn.classList.remove('active');
        }

        updateView();
    }


    function saveImage() {
        /*
            Read canvas data as base64 string and
            store image in datastore
        */

		var mimetype = 'image/jpeg';
        var inputData = canvas.toDataURL(mimetype, 1);
		var metadata = {
			mimetype: mimetype,
			title: "Image Moon",
			activity: "org.olpcfrance.MediaViewerActivity",
			timestamp: new Date().getTime(),
			creation_time: new Date().getTime(),
			file_size: 0
		};
		datastore.create(metadata, function() {
			console.log("export done.")
		}, inputData);
    }


    function formatDate(date) {
        /*
            Modify rendered dates to match Sugar Moon format
        */

        if (!date) {
            date = new Date();
        } else {

            date = new Date(1000 * date);
        }

		var momentDate = moment(date);
        return momentDate.format('LLLL').replace(momentDate.format('LT'), momentDate.format('LTS'));
    }

    return {
        setup: setup,
		initPrefs: initPrefs,
		getPrefs: getPrefs,
        updateInfo: updateInfo
    };
});
