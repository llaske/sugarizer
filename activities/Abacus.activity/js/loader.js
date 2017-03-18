requirejs.config({
    baseUrl: "lib",
    shim: {
        easel: {
            exports: 'createjs'
        },
        tween: {
            deps: ['easel'],
            exports: 'Tween'
        }
    },
    paths: {
        easel: '../lib/easeljs',
        tween: '../lib/tweenjs',
        activity: "../js"
    },
    packages: []
});
requirejs(["activity/activity","sugar-web/graphics/xocolor"]);
