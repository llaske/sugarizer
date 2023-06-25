date

echo --- Deleting previous content...
cordova plugin remove cordova-plugin-sugarizeros

rm config.xml
cd www
rm -rf *
cd ..


echo --- Minimize
if [ "$1" != "full" -a "$2" != "full" ]; then
  cd ../sugarizer
  grunt -v
  cd ../sugarizer-cordova
fi

echo --- Copying content
rsync -av --exclude-from='exclude.ios' ../sugarizer/* www
cp ../sugarizer/config.xml .
sed -i -e "s/\({\"id\": \"org.sugarlabs.TurtleBlocksJS\",.*\},\)//" www/activities.json
sed -i -e "s/\({\"id\": \"org.somosazucar.JappyActivity\",.*\},\)//" www/activities.json
rm -rf www/activities/Jappy.activity www/activities/TurtleBlocksJS.activity

cordova platform add ios
cordova plugin add https://github.com/llaske/cordova-plugin-wkwebview-file-xhr.git

echo --- Build Cordova debug version
cordova -d build ios 
cp ../sugarizer/res/icon/ios/* res/icon/ios
cp ../sugarizer/res/icon/ios/* platforms/ios/sugarizer/Images.xcassets/AppIcon.appiconset
LaunchImage.launchimage

echo --- Use XCode to generate and copy to device

date




