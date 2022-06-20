# Architecture

## Global overview
Sugarizer is fully written in HTML5 and JavaScript.

> Sugarizer is composed of three components:

| Component | Description |
| --------- | ----------- |
| **Sugarizer Core** | It implements the main Sugarizer UI (*Home view, List view, Journal view, Neighborhood view*) and is the launcher for all activities. |
| **Sugar-Web** | It contains `JavaScript libraries` and `CSS styles` that expose UI and functions to handle Journal, collaboration and controls. |
| **Activities** | It is the set of *Pedagogic Activities* included in **Sugarizer**. |

![](images/global-architecture.svg)

| **Component** | **Description(Detailed)** |
| ------------- | ------------------------- |
| **Sugarizer Core** | It is independent of activities. **Sugarizer Core** has it's own `index.html` and redirects the browser to the `index.html` for activities when an activity is launched. The UI of Sugarizer Core uses the **[Enyo Framework](http://enyojs.com/)** and, like activities, rely on Sugar-Web to handle Journal and collaboration. |
| **Sugar-Web** | It uses `localStorage` and `IndexedDB` features of the browser to store Journal content. localStorage is used to store metadata entries, IndexedDB is used to store data entries. localStorage also contains user settings. **Sugar-Web** uses Web Sockets for real-time communication (presence) with the server and XmlHttpRequest calls on the server REST API to handle remote Journal. **Sugar-Web** relies on **[require.js](http://www.requirejs.org/)** to handle JavaScript libraries dependencies. |
| **Activities** | They must use Sugar-Web but could be written using any existing JavaScript framework. Most activities are written without any framework (`vanilla JS`), some are written using `ReactJS`, `Vue.js`, `Enyo` or other frameworks. When an activity is called by Sugarizer Core, the `QUERY_STRING` contains a calling context. See the dedicated **[tutorial](tutorial.md)** for more about activity development. |

## Portability

The main conception rule of Sugarizer is that all platforms must share the same source code. <br>
So Sugarizer runs the same JavaScript/HTML5 code whatever device used :
* **Web**
* **Mobile**
* **Computer**

To do that, the JavaScript/HTML5 code used for the web application is encapsulated into a container to be packaged as an application. <br>
See below how it works :arrow_down:.

### Mobile App

On Mobile Platforms such as **Android** or **iOS**, Sugarizer relies on **[Cordova](http://cordova.apache.org/)** to package the source code as a native application.

![](images/mobile-architecture.svg)

*On Android, it's possible to build **Sugarizer** as a launcher to be able to run native applications directly from the Home view. <br>
This feature is implemented in a dedicated **Cordova** plugin named **[cordova-plugin-sugarizeros](https://github.com/llaske/cordova-plugin-sugarizeros)**.*


### Desktop App

On Desktop Platforms such as **GNU Linux**, **Mac OS** or **Windows**, Sugarizer relies on **[electron](https://github.com/electron/electron)** to package the source code as a native application.

![](images/app-architecture.svg)
