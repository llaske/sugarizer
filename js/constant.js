

// Constants
var constant = {};

constant.sugarizerVersion = "0.9";

constant.sizeOwner = 100;
constant.sizeJournal = 40;
constant.sizeEmpty = 50;
constant.sizeSettings = 70;
constant.sizeToolbar = 40;
constant.sizeNeighbor = 40;
constant.sizeNewUser = 150;
constant.iconSpacingFactor = 1.1;
constant.ringInitSpaceFactor = 2.2;
constant.ringSpaceFactor = 1.3;
constant.ringAdjustAngleFactor = 3.6;
constant.ringAdjustSizeFactor = 0.9;
constant.ringMinRadiusSize = 108;

constant.radialView = 0;
constant.listView = 1;
constant.journalView = 2;
constant.neighborhoodView = 3;
constant.viewNames = ['home_view', 'list_view', 'journal_view', 'neighborhood_view'];

constant.journalLocal = 0;
constant.journalRemotePrivate = 1;
constant.journalRemoteShared = 2;
constant.journalInitCount = 40;
constant.journalStepCount = 10;
constant.journalScrollLimit = 200;

constant.listInitCount = 30;
constant.listStepCount = 10;
constant.listScrollLimit = 200;

constant.timerUpdateNetwork = 1000;
constant.webAppType = 0; // thinClientType
constant.appType = 1;  // clientType

constant.staticInitActivitiesURL = "activities.json";
constant.http = "http://";
constant.dynamicInitActivitiesURL = "/api/v1/activities/";
constant.loginURL = "/auth/login/";
constant.signupURL = "/auth/signup/";
constant.initNetworkURL = "/api/v1/users/";
constant.sendCloudURL = "/api/v1/journal/";
constant.statsURL = "/api/v1/stats/";
constant.filterJournalURL = "/filter/";
constant.filterFieldURL = "/field/";
constant.fieldMetadata = "metadata";
constant.fieldText = "text";
constant.defaultServer = "server.sugarizer.org";

constant.iconSizeStandard = 55;
constant.iconSizeList = 40;
constant.iconSizeFavorite = 20;

constant.popupMarginLeft = 5;
constant.popupMarginTop = -50;

constant.timerPopupDuration = 1000;
constant.touchToPopupDuration = 500;

constant.maxPopupHistory = 5;

constant.maxCollisionTry = 20;

constant.wifiUpdateTime = 20000;
