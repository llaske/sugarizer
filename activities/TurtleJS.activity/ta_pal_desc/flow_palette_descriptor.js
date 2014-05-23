/* Copyright (c) 2014 Jorge Alberto Gómez López <gomezlopez.jorge96@gmail.com>
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program. If not, see <http://www.gnu.org/licenses/>.*/

function FlowPaletteDesc(){
    this.descriptors = [];
    this.init_descriptor();
}

FlowPaletteDesc.prototype = {
    constructor: FlowPaletteDesc,
    init_descriptor: function(){
        var block_descriptor = new BlockDescriptor(image_tracker.get_resource('clampn_orange'), 'clampn', repeat, null, ['repeat_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors, ['int']]);
        block_descriptor.component_positions = [0, 52, 18];
        block_descriptor.base_clamp_height = 42;

        var block_descriptor = new BlockDescriptor(image_tracker.get_resource('clamp_orange'), 'clamp', forever, null, ['forever_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors]);
        block_descriptor.component_positions = [0, 44, 18];
        block_descriptor.base_clamp_height = 42;
		
        var block_descriptor = new BlockDescriptor(image_tracker.get_resource('clampb_orange'), 'clamp_bool', ifthen, null, ['ifthen_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors, ['bool']]);
        block_descriptor.component_positions = [0, 76, 18];
        block_descriptor.base_clamp_height = 42;

        var block_descriptor = new BlockDescriptor(image_tracker.get_resource('clampb_orange'), 'clamp_bool', whileb, null, ['while_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors, ['bool']]);
        block_descriptor.component_positions = [0, 76, 18];
        block_descriptor.base_clamp_height = 42;

        var block_descriptor = new BlockDescriptor(image_tracker.get_resource('clampb_orange'), 'clamp_bool', until, null, ['until_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors, ['bool']]);
        block_descriptor.component_positions = [0, 76, 18];
        block_descriptor.base_clamp_height = 42;

        new BlockDescriptor(image_tracker.get_resource('basic1arg'), 'basic1arg_orange', wait, null, ['wait_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors, ['int']]);
    },
    get_block_descriptor: function(name){
        return this.descriptors[name];
    }
}

