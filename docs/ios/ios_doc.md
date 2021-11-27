# Build Application for IOS

To build Sugarizer for ios, first install Cordova as described [here](https://cordova.apache.org/#getstarted) and Xcode on your machine.

Then create cordova project name "sugarizer-cordova" at the same location where [sugarizer](https://github.com//llaske/sugarizer) directory is present

    cordova create sugarizer-cordova

Go inside sugarizer-cordova directory

    cd sugarizer-cordova/

Put [make_ios.sh](./make_ios.sh) and [exclude.ios](./exclude.ios) file in the directory.

Run make_ios.sh script using below command:

For minified version
      
    sh make_ios.sh
For normal version

    sh make_ios.sh full
    
After execution of script, go to "platforms/ios/" directory and open Sugarizer.xcworkspace file in Xcode by double clicking it.

Click on "Sugarizer" title and then click on "build settings"

![buildsettings](https://user-images.githubusercontent.com/42293606/121804462-26855400-cc64-11eb-9727-baabe627e19e.JPG)

Scroll down you'll find "Swift Compiler - Language" section. In this section, select "Swift Language Version" as 3 or above

![Swift Language Setting](https://user-images.githubusercontent.com/42293606/121804549-8976eb00-cc64-11eb-9f33-fe107a7a3ecd.JPG)

Then go to "platforms/ios/Sugarizer/Plugins/cordova-plugin-file-transfer/" directory and open "CDVFileTransfer.m" file. Comment line 107-110 and save the file.

![CDVFileTransfer comment](https://user-images.githubusercontent.com/42293606/121804587-bc20e380-cc64-11eb-9843-ffc6e2a9624e.JPG)
    
Then go to "platforms/ios/CordovaLib/Classes/Private/Plugins/CDVWebViewEngine/" directory and open "CDVWebViewEngine.m" file. Add following lines after line 205:

    WKWebView* wkWebView = [[WKWebView alloc] initWithFrame:self.engineWebView.frame configuration:configuration];
    // add begin
    #if __IPHONE_OS_VERSION_MAX_ALLOWED >= 110000
    if (@available(iOS 11.0, *)) {
        [wkWebView.scrollView setContentInsetAdjustmentBehavior:UIScrollViewContentInsetAdjustmentNever];
    }
    #endif
    // add end
    wkWebView.UIDelegate = self.uiDelegate;

![play](https://user-images.githubusercontent.com/42293606/121804642-0904ba00-cc65-11eb-8df8-d79798e0fba8.JPG)

That's it. You'll see screen like below.

![sugarizer_on simulator](https://user-images.githubusercontent.com/42293606/121804668-33567780-cc65-11eb-8fee-e44a4fc87338.JPG)
