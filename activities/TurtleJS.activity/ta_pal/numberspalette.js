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

function NumbersPalette(width, height, fill_color, layer, pal_desc, global_tracker){
    this.container = null;
    this.global_tracker = global_tracker;
    this.pal_desc = pal_desc;
    this.init_palette(width, height, fill_color, layer);
}

NumbersPalette.prototype = {
    constructor: NumbersPalette,
    init_palette: function(width, height, fill_color, layer){
        this.container = new PaletteContainer(width, height, fill_color, layer);
        this.make_block_factories();
    },
    show: function(){
        this.container.show();
    },
    hide: function(){
        this.container.hide();
    },
    is_visible: function(){
        return this.container.is_visible();
    },
    is_collide: function(point){
        return this.container.is_collide(point);
    },
    make_block_factories: function(){
        var sprit1 = new Sprite(image_tracker.get_resource('compare_purple'), this.container.layer, true);
        new BlockFactory([5, 5], sprit1, 'greaterthan_block', this, [DEFAULT_LANG, BLOCK_SIDE, 'greaterthan']);

        sprit1 = new Sprite(image_tracker.get_resource('number1arg_purple'), this.container.layer, true);
        new BlockFactory([5, 95], sprit1, 'identity_block', this, [DEFAULT_LANG, BLOCK_SIDE, 'backward']);

        var sprit1 = new Sprite(image_tracker.get_resource('numbern_purple'), this.container.layer, true);
        new BlockFactory([115, 5], sprit1, 'add_block', this, [DEFAULT_LANG, BLOCK_SIDE, 'add']);

        var sprit1 = new Sprite(image_tracker.get_resource('numbern_purple'), this.container.layer, true);
        new BlockFactory([215, 5], sprit1, 'multiply_block', this, [DEFAULT_LANG, BLOCK_SIDE, 'multiply']);

        var sprit1 = new Sprite(image_tracker.get_resource('numbern_purple'), this.container.layer, true);
        new BlockFactory([315, 5], sprit1, 'divide_block', this, [DEFAULT_LANG, BLOCK_SIDE, 'multiply']);
    }
}
