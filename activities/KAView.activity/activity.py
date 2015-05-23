#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
# KAView activity: A Khan Academy video viewer.
# Lionel Laské 


from gi.repository import Gtk
import logging
import os

from gettext import gettext as _

from sugar3.activity import activity
from sugar3.graphics.toolbarbox import ToolbarBox
from sugar3.graphics.toolbutton import ToolButton
from sugar3.activity.widgets import ActivityButton
from sugar3.activity.widgets import TitleEntry
from sugar3.activity.widgets import StopButton
from sugar3.activity.widgets import ShareButton
from sugar3.activity.widgets import DescriptionItem
from sugar3.presence import presenceservice
from sugar3.activity.widgets import ActivityToolbarButton
from sugar3.graphics.toolbarbox import ToolbarButton

from gi.repository import WebKit
import logging
import gconf

from datetime import date

from enyo import Enyo


class EnyoActivity(activity.Activity):
    """EnyoActivity class as specified in activity.info"""

    def __init__(self, handle):
        """Set up the activity."""
        activity.Activity.__init__(self, handle)

        self.max_participants = 1
        self.context = {}

        self.favorite_status = 'notfavorite'

        self.make_toolbar()
        self.make_mainview()

    def language_en(self, button):
        self.enyo.send_message("language_clicked", "en")

    def language_es(self, button):
        self.enyo.send_message("language_clicked", "es")

    def language_fr(self, button):
        self.enyo.send_message("language_clicked", "fr")

    def favorite(self, button):
        if self.favorite_status == 'favorite':
            self.favorite_button.icon_name = self.favorite_status = 'notfavorite'
            self.enyo.send_message("favorite_clicked", 0)
        else:
            self.favorite_button.icon_name = self.favorite_status = 'favorite'
            self.enyo.send_message("favorite_clicked", 1)

    def refresh(self, context):
        self.context = context
        web_app_page = os.path.join(activity.get_bundle_path(), "index.html")
        self.webview.load_uri('file://' + web_app_page+"?onsugar=1")

    def settings(self, button):
        self.enyo.send_message("settings_clicked")

    def init_context(self, args):
        """Init Javascript context sending buddy information"""
        # Get XO colors
        buddy = {}
        client = gconf.client_get_default()
        colors = client.get_string("/desktop/sugar/user/color")
        buddy["colors"] = colors.split(",")

        # Get XO name
        presenceService = presenceservice.get_instance()
        buddy["name"] = presenceService.get_owner().props.nick

        self.enyo.send_message("buddy", buddy)
        if self.context != {}:
            self.enyo.send_message("load-context", self.context)

    def make_mainview(self):
        """Create the activity view"""
        # Create global box
        vbox = Gtk.VBox(True)

        # Create webview
        self.webview = webview  = WebKit.WebView()
        webview.show()
        vbox.pack_start(webview, True, True, 0)
        vbox.show()

        # Activate Enyo interface
        self.enyo = Enyo(webview)
        self.enyo.connect("ready", self.init_context)
        self.enyo.connect("save-context", self.save_context)
        self.enyo.connect("refresh-screen", self.refresh)

        # Go to first page
        web_app_page = os.path.join(activity.get_bundle_path(), "index.html")
        self.webview.load_uri('file://' + web_app_page+"?onsugar=1")

        # Display all
        self.set_canvas(vbox)
        vbox.show()

    def make_toolbar(self):
        # toolbar with the new toolbar redesign
        toolbar_box = ToolbarBox()

        activity_button = ActivityToolbarButton(self)
        toolbar_box.toolbar.insert(activity_button, 0)
        activity_button.show()

        toolbarview = Gtk.Toolbar()
        langtoolbar_button = ToolbarButton(
            label=_('View'),
            page=toolbarview,
            icon_name='settings')
        langtoolbar_button.show()
        toolbar_box.toolbar.insert(langtoolbar_button, -1)
        tool = ToolButton('en')
        tool.set_tooltip(_('English'))
        tool.connect('clicked', self.language_en)
        tool.show()
        toolbarview.insert(tool, -1)
        tool = ToolButton('es')
        tool.set_tooltip(_('Spanish'))
        tool.connect('clicked', self.language_es)
        tool.show()
        toolbarview.insert(tool, -1)
        tool = ToolButton('fr')
        tool.set_tooltip(_('French'))
        tool.connect('clicked', self.language_fr)
        tool.show()
        toolbarview.insert(tool, -1)
        tool = ToolButton('remote')
        tool.set_tooltip(_('Server settings'))
        tool.connect('clicked', self.settings)
        tool.show()
        toolbarview.insert(tool, -1)
        toolbarview.show()

        favorite_button = ToolButton(self.favorite_status)
        favorite_button.set_tooltip('Filter on favorite')
        favorite_button.connect('clicked', self.favorite)
        toolbar_box.toolbar.insert(favorite_button, -1)
        favorite_button.show()
        self.favorite_button = favorite_button

        separator = Gtk.SeparatorToolItem()
        separator.props.draw = False
        separator.set_expand(True)
        toolbar_box.toolbar.insert(separator, -1)
        separator.show()

        stop_button = StopButton(self)
        toolbar_box.toolbar.insert(stop_button, -1)
        stop_button.show()

        self.set_toolbar_box(toolbar_box)
        toolbar_box.show()

    def write_file(self, file_path):
        """Called when activity is saved, get the current context in Enyo"""
        self.file_path = file_path
        self.enyo.send_message("save-context")

    def save_context(self, context):
        """Called by Enyo to save the current context"""
        file = open(self.file_path, 'w')
        try:
            file.write(self.enyo.json_encode(context)+'\n')
        finally:
            file.close()

    def read_file(self, file_path):
        """Called when activity is loaded, load the current context in the file"""
        file = open(file_path, 'r')
        self.context = {}
        try:
            self.context = self.enyo.json_decode(file.readline().strip('\n'))
        finally:
            file.close()