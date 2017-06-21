// Copyright (c) 2016 Walter Bender
// Copyright (c) 2016 Tymon Radzik
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the The GNU Affero General Public
// License as published by the Free Software Foundation; either
// version 3 of the License, or (at your option) any later version.
//
// You should have received a copy of the GNU Affero General Public
// License along with this library; if not, write to the Free Software
// Foundation, 51 Franklin Street, Suite 500 Boston, MA 02110-1335 USA
//

const NUMBERBLOCKDEFAULT = 100;

const DEFAULTPALETTE = 'turtle';

// We don't include 'extras' since we want to be able to delete
// plugins from the extras palette.
BUILTINPALETTES = ['turtle', 'pen', 'number', 'boolean', 'flow', 'boxes', 'action', 'media', 'sensors', 'heap', 'extras'];

const BUILTINPALETTESL23N = [_('turtle'), _('pen'), _('number'), _('boolean'), _('flow'), _('boxes'), _('actions'), _('media'), _('sensors'), _('heap'), _('extras')];


function getMainToolbarButtonNames(name) {
    return (['popdown-palette', 'run', 'step', 'stop-turtle', 'clear', 'palette', 'hide-blocks', 'collapse-blocks', 'go-home', 'help', 'sugarizer-stop'].indexOf(name) > -1);
};


function getAuxToolbarButtonNames(name) {
    return (['planet', 'open', 'save', 'paste-disabled', 'Cartesian', 'polar', 'utility', 'empty-trash', 'restore-trash'].indexOf(name) > -1);
}


function createDefaultStack() {
    DATAOBJS = [[0, 'start', 250, 150, [null, null, null]]];
};


function createHelpContent() {
    HELPCONTENT = [
        [_('Welcome to Turtle Blocks'), _('Turtle Blocks is a Logo-inspired turtle that draws colorful pictures with snap-together visual-programming blocks.'), 'activity/activity-icon-color.svg'],
        [_('Palette buttons'), _('This toolbar contains the palette buttons, click to show the palettes of blocks and drag blocks from the palettes onto the canvas to use them.'), 'images/icons.svg'],
        [_('Run'), _('Click to run the project in fast mode.') + ' / ' + _('Long press to run the project in slow mode.'), 'header-icons/run-button.svg'],
        [_('Run step by step'), _('Click to run the project step by step.'), 'header-icons/step-button.svg'],
        [_('Stop'), _('Stop the current project.'), 'header-icons/stop-turtle-button.svg'],
        [_('Clean'), _('Clear the screen and return the turtles to their initial positions.'), 'header-icons/clear-button.svg'],
        [_('Show/hide palettes'), _('Hide or show the block palettes.'), 'header-icons/palette-button.svg'],
        [_('Show/hide blocks'), _('Hide or show the blocks and the palettes.'), 'header-icons/hide-blocks-button.svg'],
        [_('Expand/collapse collapsable blocks'), _('Expand or collapse start and action stacks.'), 'header-icons/collapse-blocks-button.svg'],
        [_('Home'), _('Return all blocks to the center of the screen.'), 'header-icons/go-home-button.svg'],
        [_('Help'), _('Show these messages.'), 'header-icons/help-button.svg'],
        [_('Expand/collapse option toolbar'), _('Click this button to expand or collapse the auxillary toolbar.'), 'header-icons/menu-button.svg'],
        [_('Load samples from server'), _('This button opens a viewer for loading example projects.'), 'header-icons/planet-button.svg'],
        [_('Load project from files'), _('You can also load projects from the file system.'), 'header-icons/open-button.svg'],
        [_('Save project'), _('Save your project to a file.'), 'header-icons/save-button.svg'],
        [_('Copy'), _('The copy button copies a stack to the clipboard. It appears after a "long press" on a stack.'), 'header-icons/copy-button.svg'],
        [_('Paste'), _('The paste button is enabled when there are blocks copied onto the clipboard.'), 'header-icons/paste-disabled-button.svg'],
        [_('Save stack'), _('The save-stack button saves a stack onto a custom palette. It appears after a "long press" on a stack.'), 'header-icons/save-blocks-button.svg'],
        [_('Cartesian'), _('Show or hide a Cartesian-coordinate grid.'), 'header-icons/Cartesian-button.svg'],
        [_('Polar'), _('Show or hide a polar-coordinate grid.'), 'header-icons/polar-button.svg'],
        [_('Settings'), _('Open a panel for configuring Turtle Blocks.'), 'header-icons/utility-button.svg'],
        [_('Decrease block size'), _('Decrease the size of the blocks.'), 'header-icons/smaller-button.svg'],
        [_('Increase block size'), _('Increase the size of the blocks.'), 'header-icons/bigger-button.svg'],
        [_('Display statistics'), _('Display statistics about your Turtle project.'), 'header-icons/stats-button.svg'],
        [_('Load plugin from file'), _('You can load new blocks from the file system.'), 'header-icons/plugin-button.svg'],
        [_('Enable scrolling'), _('You can scroll the blocks on the canvas.'), 'header-icons/scroll-unlock-button.svg'],
        [_('Delete all'), _('Remove all content on the canvas, including the blocks.'), 'header-icons/empty-trash-button.svg'],
        [_('Undo'), _('Restore blocks from the trash.'), 'header-icons/restore-trash-button.svg'],
        [_('Congratulations.'), _('You have finished the tour. Please enjoy Turtle Blocks!'), 'activity/activity-icon-color.svg']
    ];
};
