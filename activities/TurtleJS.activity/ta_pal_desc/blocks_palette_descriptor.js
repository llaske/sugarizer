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

        new BlockDescriptor(image_tracker.get_resource('basic1arg_yellow'), 'basic1arg', show, null, ['show_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors, ['str_int']]);
        
        var descriptor = new BlockDescriptor(image_tracker.get_resource('basic2arg2'), 'basic2arg', store_in_box, null, ['store_in_box_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors, ['str_no_parse', 'str_int']]);
        descriptor.component_positions = [0, 38, 10];
        descriptor.base_clamp_height = 10;
        descriptor.user_resizable = [10, 55];
        
      
        new BlockDescriptor(image_tracker.get_resource('head'), 'head', start_block, null, ['start_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors]);
      
        new BlockDescriptor(image_tracker.get_resource('head1arg'), 'head1arg', action_block, null, ['action_make_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors, ['str_no_parse']]);
        
        new BlockDescriptor(image_tracker.get_resource('basic1arg_yellow'), 'basic1arg', action_exec_block, null, ['action_call_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors, ['str_no_parse']]);
        
        new BlockDescriptor(image_tracker.get_resource('basic1arg_yellow'), 'basic1arg', turtle_color_block, null, ['turtle_color_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors, ['str_int']]);
        
        descriptor = new BlockDescriptor(image_tracker.get_resource('box2_blue_c'), 'box', null, get_width_block, ['width_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors]);
        descriptor.component_positions = [0, 28, 82];
        
        descriptor = new BlockDescriptor(image_tracker.get_resource('box2_blue_c'), 'box', null, get_height_block, ['height_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors]);
        descriptor.component_positions = [0, 28, 82];
        
        descriptor = new BlockDescriptor(image_tracker.get_resource('box2_blue_c'), 'box', null, get_left_block, ['left2_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors]);
        descriptor.component_positions = [0, 28, 82];
        
        descriptor = new BlockDescriptor(image_tracker.get_resource('box2_blue_c'), 'box', null, get_right_block, ['right2_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors]);
        descriptor.component_positions = [0, 28, 82];
        
        descriptor = new BlockDescriptor(image_tracker.get_resource('box2_blue_c'), 'box', null, get_bottom_block, ['bottom_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors]);
        descriptor.component_positions = [0, 28, 82];
        
        descriptor = new BlockDescriptor(image_tracker.get_resource('box2_blue_c'), 'box', null, get_top_block, ['top_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors]);
        descriptor.component_positions = [0, 28, 82];
    },
    get_block_descriptor: function(name){
        return this.descriptors[name];
    }
}
