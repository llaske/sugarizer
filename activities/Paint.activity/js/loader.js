requirejs.config({
  baseUrl: "lib",
  shim: {},
  paths: {
    activity: "../js",
    mustache: '../lib/mustache'
  }
});

requirejs(["activity/activity"]);
