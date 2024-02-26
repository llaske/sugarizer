
window._isOffline = (document.getElementById("myBlocks")&&document.getElementById("myBlocks").className=="offlinemode");

requirejs.config({
    baseUrl: "lib",
    paths: {
        activity: "../js"
    }
});

requirejs(["activity/activity"]);
