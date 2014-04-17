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
        var block_descriptor = new BlockDescriptor(image_tracker.get_resource('clampn'), 'clampn', repeat_block, null, ['repeat_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors]);
        block_descriptor.component_positions = [0, 52, 18];
        block_descriptor.base_clamp_height = 42;

        var block_descriptor = new BlockDescriptor(image_tracker.get_resource('clamp'), 'clamp', forever_block, null, ['forever_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors]);
        block_descriptor.component_positions = [0, 44, 18];
        block_descriptor.base_clamp_height = 42;
		
        var block_descriptor = new BlockDescriptor(image_tracker.get_resource('clampb'), 'clamp_bool', ifthen_block, null, ['ifthen_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors]);
        block_descriptor.component_positions = [0, 76, 18];
        block_descriptor.base_clamp_height = 42;

        var block_descriptor = new BlockDescriptor(image_tracker.get_resource('clampb'), 'clamp_bool', while_block, null, ['while_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors]);
        block_descriptor.component_positions = [0, 76, 18];
        block_descriptor.base_clamp_height = 42;

        var block_descriptor = new BlockDescriptor(image_tracker.get_resource('clampb'), 'clamp_bool', until_block, null, ['until_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors]);
        block_descriptor.component_positions = [0, 76, 18];
        block_descriptor.base_clamp_height = 42;

        new BlockDescriptor(image_tracker.get_resource('basic1arg'), 'basic1arg', wait_block, null, ['wait_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors]);
    },
    get_block_descriptor: function(name){
        return this.descriptors[name];
    }
}

