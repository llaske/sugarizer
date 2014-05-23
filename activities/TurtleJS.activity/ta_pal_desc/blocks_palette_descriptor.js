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

function BlocksPaletteDesc(){
    this.descriptors = [];
    this.init_descriptor();
}

BlocksPaletteDesc.prototype = {
    constructor: BlocksPaletteDesc,
    init_descriptor: function(){
        var descriptor = new BlockDescriptor(image_tracker.get_resource('box2'), 'box', string_block, get_number, ['text_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors]);
        descriptor.component_positions = [0, 28, 82];

        new BlockDescriptor(image_tracker.get_resource('basic1arg'), 'basic1arg', show, null, ['show_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors, ['str_int']]);
        
        new BlockDescriptor(image_tracker.get_resource('basic2arg'), 'basic2arg', store_in_box, null, ['store_in_box_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors, ['str_no_parse', 'str_int']]);
    },
    get_block_descriptor: function(name){
        return this.descriptors[name];
    }
}
