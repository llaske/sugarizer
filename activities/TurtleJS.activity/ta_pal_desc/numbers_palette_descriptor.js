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

function NumbersPaletteDesc(){
    this.descriptors = [];
    this.init_descriptor();
}

NumbersPaletteDesc.prototype = {
    constructor: NumbersPaletteDesc,
    init_descriptor: function(){
        new BlockDescriptor(image_tracker.get_resource('compare_purple'), 'bool2arg', null, greaterthan_block, ['greaterthan_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors, ['int', 'int']]);
        
        new BlockDescriptor(image_tracker.get_resource('compare_purple'), 'bool2arg', null, lowerthan_block, ['lowerthan_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors, ['int', 'int']]);
        
        new BlockDescriptor(image_tracker.get_resource('compare_purple'), 'bool2arg', null, equals_block, ['equals_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors, ['int', 'int']]);

        //new BlockDescriptor(image_tracker.get_resource('number1arg_purple'), 'number1arg', null, identity_block, ['identity_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors]);

        var block_descriptor = new BlockDescriptor(image_tracker.get_resource('numbern_purple'), 'numbern', null, mod_block, ['mod_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors, ['int', 'int']]);
        block_descriptor.component_positions = [0, 34, 15];
        block_descriptor.base_clamp_height = 15;
        block_descriptor.user_resizable = [18, 55];
        
        var block_descriptor = new BlockDescriptor(image_tracker.get_resource('numbern_purple'), 'numbern', null, add_block, ['add_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors, ['int', 'int']]);
        block_descriptor.component_positions = [0, 34, 15];
        block_descriptor.base_clamp_height = 15;
        block_descriptor.user_resizable = [18, 55];

        var block_descriptor = new BlockDescriptor(image_tracker.get_resource('numbern_purple'), 'numbern', null, multiply_block, ['multiply_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors, ['int', 'int']]);
        block_descriptor.component_positions = [0, 34, 15];
        block_descriptor.base_clamp_height = 15;
        block_descriptor.user_resizable = [18, 55];

        var block_descriptor = new BlockDescriptor(image_tracker.get_resource('numbern_purple'), 'numbern', null, divide_block, ['divide_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors, ['int', 'int']]);
        block_descriptor.component_positions = [0, 34, 15];
        block_descriptor.base_clamp_height = 15;
        block_descriptor.user_resizable = [18, 55];
        
        var block_descriptor = new BlockDescriptor(image_tracker.get_resource('numbern_purple'), 'numbern', null, substract_block, ['substract_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors, ['int', 'int']]);
        block_descriptor.component_positions = [0, 34, 15];
        block_descriptor.base_clamp_height = 15;
        block_descriptor.user_resizable = [18, 55];
		
		var block_descriptor = new BlockDescriptor(image_tracker.get_resource('number1arg_purple_2'), 'number1arg', null, identity_block, ['identity_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors, ['str_int']]);
        block_descriptor.component_positions = [0, 40, 60];
		block_descriptor.base_clamp_height = 15;
		block_descriptor.user_resizable = [85, 8];
        
        var block_descriptor = new BlockDescriptor(image_tracker.get_resource('number1arg_purple_2'), 'number1arg', null, sqrt_block, ['sqrt_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors, ['int']]);
        block_descriptor.component_positions = [0, 40, 60];
		block_descriptor.base_clamp_height = 15;
		block_descriptor.user_resizable = [85, 8];
        
        var block_descriptor = new BlockDescriptor(image_tracker.get_resource('numbern_purple'), 'numbern', null, rand_block, ['rand_block', DEFAULT_LANG, FACTORY_SIDE, this.descriptors, ['int', 'int']]);
        block_descriptor.component_positions = [0, 34, 15];
        block_descriptor.base_clamp_height = 15;
        block_descriptor.user_resizable = [18, 55];
        
        
    },
    get_block_descriptor: function(name){
        return this.descriptors[name];
    }
}
