Jappy.activity
==============

A tribute to Pippy activity.

*Shall work with Sugar and Sugarizer, deploy everywhere.*

It currently implements the [RapydScript-NG transpiler](https://github.com/kovidgoyal/rapydscript-ng)'s python-like language.

## Development

### Launch

In order to launch the app, simply open `Jappy.activity/index.html` in a browser, served by http.

A bare webserver is implemented in Flask for convenience and experimentation. 
```
python dev.py
```
And then open http://localhost:5000/

You may need to install requirements with `pip install -r requirements.txt` first. 

## References

https://wiki.sugarlabs.org/go/Project/Develop_Activity

Artisan Workbench
=================

A *Develop Activity* proposal for Sugar and Sugarizer.

Web Apps for Sugarizer and any Platform

 - Python
 - Game
 - Tool

Collaboration, Simplicity, Reflection
    "Never loose work"

Issues
======

- Might consider method to avoid *infinite loops*. Currently they **crash the tab or browser or PC**.
