requirejs.config({
    baseUrl: "lib",
    paths: {
        activity: "../js"
    }
});

var getUrlParameter = function(name) {
	var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
	return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
};
if (!getUrlParameter("onsugar")) {
	requirejs(["activity/activity"]);
}
