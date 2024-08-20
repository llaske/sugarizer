define(["platform/mobile", "platform/desktop", "platform/web"], function (
	{ saveFileMobile, openDocInMobile },
	{ saveFileElectron, readFileElecton },
	{ saveFileWeb, readFileWeb, openDocInWeb }
) {
	const PLATFORM = sugarizer.getClientPlatform();

	// Map functions
	const platformActions = {
		saveFile: {
			[sugarizer.constant.webAppType]: saveFileWeb,
			[sugarizer.constant.mobileType]: saveFileMobile,
			[sugarizer.constant.desktopAppType]: saveFileElectron,
		},
		readFile: {
			[sugarizer.constant.webAppType]: readFileWeb,
			[sugarizer.constant.mobileType]: readFileWeb, //web works for mobile
			[sugarizer.constant.desktopAppType]: readFileElecton,
		},
		openAsDocument: {
			[sugarizer.constant.webAppType]: openDocInWeb,
			[sugarizer.constant.mobileType]: openDocInMobile,
			[sugarizer.constant.desktopAppType]: openDocInWeb, //web works for desktop
		},
	};

	const platform = new Proxy(platformActions, {
		get:
			(target, prop) =>
			(...args) =>
				target[prop][PLATFORM](...args),
	});

	return platform;
});
