

// Constants
var constant = {};

constant.sugarizerVersion = "1.0";

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
constant.https = "https://";
constant.dynamicInitActivitiesURL = "/api/v1/activities/";
constant.serverInformationURL = "/api/";
constant.loginURL = "/auth/login/";
constant.signupURL = "/auth/signup/";
constant.initNetworkURL = "/api/v1/users/";
constant.sendCloudURL = "/api/v1/journal/";
constant.statsURL = "/api/v1/stats/";
constant.filterJournalURL = "/filter/";
constant.filterFieldURL = "/field/";
constant.fieldMetadata = "metadata";
constant.fieldText = "text";
constant.defaultServer = constant.http + "server.sugarizer.org";
constant.minPasswordSize = 4;

constant.syncJournalLimit = 100;

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

constant.maxUserHistory = 3;

constant.statPackageSize = 5;
constant.statMaxLocalSize = 20;

constant.emojis = [
	{"name": "dog", "value": "1F436", "letter": "a", "category": "animal"},
	{"name": "cat", "value": "1F431", "letter": "b", "category": "animal"},
	{"name": "cow", "value": "1F42E", "letter": "c", "category": "animal"},
	{"name": "horse", "value": "1F434", "letter": "d", "category": "animal"},
	{"name": "pig", "value": "1F437", "letter": "e", "category": "animal"},
	{"name": "mouse", "value": "1F42D", "letter": "f", "category": "animal"},
	{"name": "rabbit", "value": "1F430", "letter": "g", "category": "animal"},
	{"name": "bear", "value": "1F43B", "letter": "h", "category": "animal"},
	{"name": "chicken", "value": "1F414", "letter": "i", "category": "animal"},
	{"name": "fish", "value": "1F41F", "letter": "j", "category": "animal"},

	{"name": "smiling", "value": "1F60A", "letter": "k", "category": "emoticon"},
	{"name": "winking", "value": "1F609", "letter": "l", "category": "emoticon"},
	{"name": "angry", "value": "1F620", "letter": "m", "category": "emoticon"},
	{"name": "grinning", "value": "1F600", "letter": "n", "category": "emoticon"},
	{"name": "heart-eyes", "value": "1F60D", "letter": "o", "category": "emoticon"},
	{"name": "sunglasses", "value": "1F60E", "letter": "p", "category": "emoticon"},
	{"name": "pensive", "value": "1F614", "letter": "q", "category": "emoticon"},
	{"name": "astonished", "value": "1F632", "letter": "r", "category": "emoticon"},
	{"name": "crying", "value": "1F622", "letter": "s", "category": "emoticon"},
	{"name": "screaming", "value": "1F631", "letter": "t", "category": "emoticon"},

	{"name": "apple", "value": "1F34E", "letter": "u", "category": "food"},
	{"name": "banana", "value": "1F34C", "letter": "v", "category": "food"},
	{"name": "grapes", "value": "1F347", "letter": "w", "category": "food"},
	{"name": "cherry", "value": "1F352", "letter": "x", "category": "food"},
	{"name": "strawberry", "value": "1F353", "letter": "y", "category": "food"},
	{"name": "hamburger", "value": "1F354", "letter": "z", "category": "food"},
	{"name": "pizza", "value": "1F355", "letter": "0", "category": "food"},
	{"name": "cake", "value": "1F382", "letter": "1", "category": "food"},
	{"name": "cocktail", "value": "1F378", "letter": "2", "category": "food"},
	{"name": "coffee", "value": "2615", "letter": "3", "category": "food"},

	{"name": "soccer", "value": "26BD", "letter": "4", "category": "sport"},
	{"name": "baseball", "value": "26BE", "letter": "5", "category": "sport"},
	{"name": "basket", "value": "1F3C0", "letter": "6", "category": "sport"},
	{"name": "football", "value": "1F3C8", "letter": "7", "category": "sport"},
	{"name": "tennis", "value": "1F3BE", "letter": "8", "category": "sport"},
	{"name": "bowling", "value": "1F3B3", "letter": "9", "category": "sport"},
	{"name": "golf", "value": "26F3", "letter": "A", "category": "sport"},
	{"name": "target", "value": "1F3AF", "letter": "B", "category": "sport"},
	{"name": "skying", "value": "1F3BF", "letter": "C", "category": "sport"},
	{"name": "video", "value": "1F3AE", "letter": "D", "category": "sport"},

	{"name": "car", "value": "1F697", "letter": "E", "category": "travel"},
	{"name": "bicycle", "value": "1F6B2", "letter": "F", "category": "travel"},
	{"name": "train", "value": "1F685", "letter": "G", "category": "travel"},
	{"name": "airplane", "value": "2708", "letter": "H", "category": "travel"},
	{"name": "helicopter", "value": "1F681", "letter": "I", "category": "travel"},
	{"name": "boat", "value": "1F6A2", "letter": "J", "category": "travel"},
	{"name": "sailboat", "value": "26F5", "letter": "K", "category": "travel"},
	{"name": "bus", "value": "1F68C", "letter": "L", "category": "travel"},
	{"name": "tractor", "value": "1F69C", "letter": "M", "category": "travel"},
	{"name": "rocket", "value": "1F680", "letter": "N", "category": "travel"},

	{"name": "watch", "value": "231A", "letter": "O", "category": "things"},
	{"name": "gift", "value": "1F381", "letter": "P", "category": "things"},
	{"name": "trophey", "value": "1F3C6", "letter": "Q", "category": "things"},
	{"name": "computer", "value": "1F4BB", "letter": "R", "category": "things"},
	{"name": "television", "value": "1F4FA", "letter": "S", "category": "things"},
	{"name": "guitar", "value": "1F3B8", "letter": "T", "category": "things"},
	{"name": "book", "value": "1F4D6", "letter": "U", "category": "things"},
	{"name": "wrench", "value": "1F527", "letter": "V", "category": "things"},
	{"name": "telephone", "value": "260E", "letter": "W", "category": "things"},
	{"name": "camera", "value": "1F4F7", "letter": "X", "category": "things"}
]
