#!/usr/bin/env python
# -*- coding: utf-8 -*-

# Sugar interface for Enyo JavaScript framework

import logging
import json
import inspect


class Enyo:
    """Class to handle communication with Enyo"""

    def __init__(self, webview):
        """Constructor: link to the WebKit widget"""
        self.webview = webview
        self.handlers = {}
        self.webview.connect("console-message", self._message_emitted)

    def connect(self, name, callback):
        """Add a new handler for an event"""
        self.handlers[name] = callback

    def send_message(self, name, args=None):
        """Send a message to Enyo"""
        script = "enyo.Sugar.sendMessage('"+name+"', "
        if not args is None:
            value = "'"+self.json_encode(args)+"'"
        else:
            value = "null"
        script = script+value+")"
        logging.warning("sugar://"+name+"/"+value)
        return self.webview.execute_script(script)

    def _message_emitted(self, widget, value, line, source):
        """Raised when a message from Enyo has been received"""
        # Only consider prefixed message
        prefix = "enyo://"
        if not value.startswith(prefix):
            return False

        # Get name
        prefixlen = len(prefix)
        size = value[prefixlen:prefixlen+value[prefixlen:].index("/")]
        start = prefixlen+1+len(size)
        name = value[start:start+int(size)]

        # Get param
        start = start + len(name)+1
        size = value[start:start+value[start:].index("/")]
        if int(size) == 0:
            args = None
        else:
            start = start+1+len(size)
            args = value[start:start+int(size)]

        # Call handler if exist
        logging.warning(value);
        if name in self.handlers:
            callback = self.handlers[name]
            if args:
                callback(json.loads(args))
            else:
                callback(None)

        return True

    def json_encode(self, obj):
        """Encode object as a JSON string"""
        try:
            result = json.dumps(obj)
        except TypeError:
            result = "{"
            first = True
            for name in dir(obj):
                value = getattr(obj, name)
                if not name.startswith('__') and not inspect.ismethod(value) and not inspect.isroutine(value) and not inspect.isbuiltin(value) and not isinstance(value, obj.__class__):
                    if not first:
                        result = result + ', '
                    else:
                        first = False
                    result = result + '"'+name+'": '
                    result = result + self.json_encode(value)
            result = result + "}"
        return result

    def json_decode(self, str):
        """Decode JSON string as object"""
        return json.loads(str)