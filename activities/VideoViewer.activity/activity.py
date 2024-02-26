#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
# Video Viewer activity: A video viewer a set of videos on a server
# Lionel Laské


from gi.repository import Gtk, Gdk
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
        self.filter_status = ''

        self.make_toolbar()
        self.make_mainview()

    def filter_changed(self, button):
        if self.filter_status == button.get_label():
            self.filter_status = ''
        else:
            self.filter_status = button.get_label()
        self.enyo.send_message("filter_clicked", self.filter_status)

    def favorite(self, button):
        if self.favorite_status == 'favorite':
            self.favorite_button.icon_name = self.favorite_status = 'notfavorite'
            self.enyo.send_message("favorite_clicked", 0)
        else:
            self.favorite_button.icon_name = self.favorite_status = 'favorite'
            self.enyo.send_message("favorite_clicked", 1)

    def text_filter(self, entry):
        self.enyo.send_message("text_typed", entry.props.text)

    def library_clicked(self, button):
        self.enyo.send_message("library_clicked")

    def refresh(self, context):
        self.context = context
        web_app_page = os.path.join(activity.get_bundle_path(), "index.html")
        self.webview.load_uri('file://' + web_app_page+"?onsugar=1")

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
        else:
            self.enyo.send_message("library_clicked")

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
        self.enyo.connect("set_categories", self.set_categories)

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

        self.toolbarview = Gtk.Toolbar()
        langtoolbar_button = ToolbarButton(
            label=_('Filter'),
            page=self.toolbarview,
            icon_name='filter')
        langtoolbar_button.show()
        toolbar_box.toolbar.insert(langtoolbar_button, -1)
        self.toolbarview.show()

        box_search_item = Gtk.ToolItem()
        self.search_entry = Gtk.Entry()
        self.search_entry.connect('changed', self.text_filter)
        self.search_entry.set_size_request(300, -1)
        box_search_item.add(self.search_entry)
        self.search_entry.show()
        box_search_item.show()
        toolbar_box.toolbar.insert(box_search_item, -1)

        favorite_button = ToolButton(self.favorite_status)
        favorite_button.set_tooltip('Filter on favorite')
        favorite_button.connect('clicked', self.favorite)
        toolbar_box.toolbar.insert(favorite_button, -1)
        favorite_button.show()
        self.favorite_button = favorite_button

        library_button = ToolButton('library')
        library_button.set_tooltip('Show libraries')
        library_button.connect('clicked', self.library_clicked)
        toolbar_box.toolbar.insert(library_button, -1)
        library_button.show()

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

    def set_categories(self, categories):
        """Called when Enyo load a new database with new categories, udate the filter"""
        nitems = self.toolbarview.get_n_items()
        for i in range(0, nitems):
            self.toolbarview.remove(self.toolbarview.get_nth_item(0))
        for category in categories:
            btn = Gtk.Button.new_with_label(category['id'])
            btn.override_background_color(Gtk.StateFlags.NORMAL, Gdk.RGBA(0.1568, 0.1568, 0.1568, 1.0))
            btn.connect('clicked', self.filter_changed)
            btn.show()
            tool = Gtk.ToolItem()
            tool.add(btn)
            tool.show()
            self.toolbarview.insert(tool, -1)
        self.toolbarview.show()

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
