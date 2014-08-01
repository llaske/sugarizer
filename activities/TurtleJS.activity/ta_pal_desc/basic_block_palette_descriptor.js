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

function BasicBlockDesc(){
    this.descriptors = [];
    this.init_descriptor();
}

BasicBlockDesc.prototype = {
    constructor: BasicBlockDesc,
    init_descriptor: function(){

        new BlockDescriptor(image_tracker.get_resource('basic1arg'), 'basic1arg', forward, null, ['forward_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors, ['int']]);

        new BlockDescriptor(image_tracker.get_resource('basic1arg'), 'basic1arg', backward, null, ['backward_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors, ['int']]);

        new BlockDescriptor(image_tracker.get_resource('basic1arg'), 'basic1arg', right, null, ['right_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors, ['int']]);

        new BlockDescriptor(image_tracker.get_resource('basic1arg'), 'basic1arg', left, null, ['left_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors, ['int']]);

        var descriptor = new BlockDescriptor(image_tracker.get_resource('box2_purple'), 'box', text_block, get_number, ['box_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors]);
        descriptor.component_positions = [0, 28, 82];

        new BlockDescriptor(image_tracker.get_resource('basic'), 'basic', clean_block, null, ['clean_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors]);

        var descriptor = new BlockDescriptor(image_tracker.get_resource('basic2arg2'), 'basic2arg', setxy, null, ['setxy_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors, ['int', 'int']]);
        descriptor.component_positions = [0, 38, 10];
        descriptor.base_clamp_height = 10;
        descriptor.user_resizable = [10, 55];

        var descriptor = new BlockDescriptor(image_tracker.get_resource('basic2arg2'), 'basic2arg', arc, null, ['arc_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors, ['int', 'int']]);
        descriptor.component_positions = [0, 38, 10];
        descriptor.base_clamp_height = 10;
        descriptor.user_resizable = [10, 55];

        new BlockDescriptor(image_tracker.get_resource('basic1arg'), 'basic1arg', set_heading, null, ['set_heading_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors, ['int']]);;

        var descriptor = new BlockDescriptor(image_tracker.get_resource('box2'), 'box', null, get_turtle_heading, ['heading_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors]);
        descriptor.component_positions = [0, 28, 82];

        var descriptor = new BlockDescriptor(image_tracker.get_resource('box2'), 'box', null, get_turtle_x, ['xcor_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors]);
        descriptor.component_positions = [0, 28, 82];

        var descriptor = new BlockDescriptor(image_tracker.get_resource('box2'), 'box', null, get_turtle_y, ['ycor_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors]);
        descriptor.component_positions = [0, 28, 82];
    },
    get_block_descriptor: function(name){
        return this.descriptors[name];
    }
}
