requirejs.config({
    baseUrl: "lib",
    shim: {
        easel: {
            exports: "createjs"
        },
    },
    paths: {
        activity: "../js",
        easel: "../lib/easeljs-0.8.1.min",
        preload: "../lib/preloadjs-0.6.1.min",
        toon: "../js/toon",
        textpalette: "../js/textpalette",
        jszip: "../lib/jszip.min",
        localizationData: "../js/localization_data",
        filesaver: "../lib/FileSaver.min",
        canvasToBlob: "../lib/canvas-toBlob",
        persistence: "../js/persistence",
    }
});

requirejs(["activity/activity"]);
