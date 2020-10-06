# Tutorial
##### This Tutorial will help You to : Easily `Install` and `Run` *Sugarizer Desktop* and *Sugarizer Web* on `Windows`.

## Prerequisites
Download Sugarizer Package from [Here](https://github.com/llaske/sugarizer). *See below screen to Get Idea :arrow_down:*

<img src = "https://github.com/Mrhb787/sugarizer/blob/master/docs/tutorial/Windows%20Installation%20And%20Launching/dwnsugar.png">

:point_right: **After Successful Download, Extract the `sugarizer-master.zip` file on `Desktop` or in any *folder/directory* you want.**

:point_right: **After Extraction of `sugarizer-master.zip` Open the *folder/directory* named `sugarizer-master`.** *See below Image :arrow_down:*

<img src= "https://github.com/Mrhb787/sugarizer/blob/master/docs/tutorial/Windows%20Installation%20And%20Launching/sugarizer-master-dir.png">

> Your Directory should look like Above image.

:point_right: **Now Install `Node.js` and `npm` on your computer.**

:point_right: **To Install `Node.js` and `npm` Go [Here](https://nodejs.org/en/download/)**

> You Would see a screen like below :arrow_down:

<img src="https://github.com/Mrhb787/sugarizer/blob/master/docs/tutorial/Windows%20Installation%20And%20Launching/trv1.png">

:point_right: **Click on `Windows Installer` to download Node.js for Windows.**

> Note here that npm is the default package manager for the JavaScript runtime environment Node.js. So you don't need to install it because it's already present with Node.js

:point_right: **Now Install the Node.js package on your Computer.**

:point_right: **After Successful Installation Open `Node.js command prompt`**. *See below image to get an idea :arrow_down:*

<img src = "https://github.com/Mrhb787/sugarizer/blob/master/docs/tutorial/Windows%20Installation%20And%20Launching/trv2.jpg">

:point_right: **After Opening it If you See a screen like Below then You have successfully installed Node.js on Your Computer and You are ready to Install Sugarizer neccessary modules.**

<img src="https://github.com/Mrhb787/sugarizer/blob/master/docs/tutorial/Windows%20Installation%20And%20Launching/trv3.png">

## Installing specific modules for Sugarizer 
- Step 1 : *Open `Node.js command prompt`*.
<img src="https://github.com/Mrhb787/sugarizer/blob/master/docs/tutorial/Windows%20Installation%20And%20Launching/trv3.png">

<hr>

- Step 2 : *Go to the directory/folder where Your Sugarizer-master package is present.*
    - *Use command ` cd [directory-name] ` to move into a directory/folder.*
    - **In this tutorial Package is present in `desktop`.**
    - **Refer below image to get idea :arrow_down:**.
<img src = "https://github.com/Mrhb787/sugarizer/blob/master/docs/tutorial/Windows%20Installation%20And%20Launching/trv4.png">
<img src = "https://github.com/Mrhb787/sugarizer/blob/master/docs/tutorial/Windows%20Installation%20And%20Launching/trv5.png">

<hr>

- Step 3 : *Now you are inside sugarizer-master directory. lets install the `electron` and other necessary modules for sugarizer.*
  - **Now type `npm install` and hit Enter to install all necessary modules for Sugarizer.**
  - **See Below Image to get idea :arrow_down:**
<img src = "https://github.com/Mrhb787/sugarizer/blob/master/docs/tutorial/Windows%20Installation%20And%20Launching/trv6.png">

<hr>

- Step 4 : *If all Modules get Successfully installed you will see a new folder named `node_modules` in your `sugarizer-master` directory/folder.* 
  - **If you don't find this folder it means packages are not installed and you need to perform `Step-3` again.**
  - **See Below Image to get idea :arrow_down:**.
<img src = "https://github.com/Mrhb787/sugarizer/blob/master/docs/tutorial/Windows%20Installation%20And%20Launching/trv7.png" >

<hr>

- Step 5 : **Congratulation** you have successfully setup every thing. Now lets launch the Sugarizer in `Desktop` and `Web`.

## Launching Sugarizer in Windows

:point_right: **Type `npm start` and hit enter to launch the sugarizer in Windows. Remember you need to be in the directory of `sugarizer-master` package.**
:point_right: **See below image for reference. :arrow_down:**

<img src = "https://github.com/Mrhb787/sugarizer/blob/master/docs/tutorial/Windows%20Installation%20And%20Launching/trv8.png">

:point_right: **You Should see a window (full-screen) appear like below :arrow_down:**.

<img src = "https://github.com/Mrhb787/sugarizer/blob/master/docs/tutorial/Windows%20Installation%20And%20Launching/trv9.png" >

:point_right: **Now You are ready to use Sugarizer Desktop.**

## Launching Sugarizer Application into the Web Browser.

:point_right: **To run locally Sugarizer Application into the Web Browser (GNU Linux/Mac OS/Windows), you should launch it with a special option to enable access to local files.**

:point_right: **For Chrome, Close ALL running instances of Chrome and re-launch it using the `Node.js command prompt.`**

:point_right: **In `Node.js command prompt` Type the below code syntax and hit enter to launch chrome with local files access.**

```
"[location of chrome.exe file]" --allow-file-access-from-files "[location of index.html file of sugarizer]"
```
:point_right: **In this case the code will be like below.**

```
"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --allow-file-access-from-files "C:\Users\HB SINGH\Desktop\sugarizer-master\index.html"
```
:point_right: **See below image for reference**.

<img src = "https://github.com/Mrhb787/sugarizer/blob/master/docs/tutorial/Windows%20Installation%20And%20Launching/trv11.png" >

:point_right: **You will see a screen like below after successful re-launch.**

<img src = "https://github.com/Mrhb787/sugarizer/blob/master/docs/tutorial/Windows%20Installation%20And%20Launching/trv10.png" >

### Congratulations you have successfully launched the sugarizer locally on web-browser.

<hr>

#### Thanks for reading till bottom. Hope it helped you. :blush:
