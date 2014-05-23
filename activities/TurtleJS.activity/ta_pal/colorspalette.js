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

function ColorsPalette(width, height, fill_color, layer, pal_desc, global_tracker){
    this.container = null;
    this.global_tracker = global_tracker;
    this.pal_desc = pal_desc;
    this.init_palette(width, height, fill_color, layer);
}
ColorsPalette.prototype = {
    constructor: ColorsPalette,
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
        sprit1 = new Sprite(image_tracker.get_resource('box2_red'), this.container.layer, true, false, null, null, [0, 28, 82]);
        new BlockFactory([5, 5], sprit1, 'red_block', this, [DEFAULT_LANG, BLOCK_SIDE, 'red']);

        sprit1 = new Sprite(image_tracker.get_resource('box2'), this.container.layer, true, false, null, null, [0, 28, 82]);
        new BlockFactory([130, 5], sprit1, 'green_block', this, [DEFAULT_LANG, BLOCK_SIDE, 'green']);

        sprit1 = new Sprite(image_tracker.get_resource('box2_purple'), this.container.layer, true, false, null, null, [0, 28, 82]);
        new BlockFactory([260, 5], sprit1, 'purple_block', this, [DEFAULT_LANG, BLOCK_SIDE, 'purple']);

        sprit1 = new Sprite(image_tracker.get_resource('box2_orange'), this.container.layer, true, false, null, null, [0, 28, 82]);
        new BlockFactory([385, 5], sprit1, 'orange_block', this, [DEFAULT_LANG, BLOCK_SIDE, 'orange']);

        sprit1 = new Sprite(image_tracker.get_resource('box2_cyan'), this.container.layer, true, false, null, null, [0, 28, 82]);
        new BlockFactory([5, 55], sprit1, 'cyan_block', this, [DEFAULT_LANG, BLOCK_SIDE, 'cyan']);

        sprit1 = new Sprite(image_tracker.get_resource('box2_white'), this.container.layer, true, false, null, null, [0, 28, 82]);
        new BlockFactory([130, 55], sprit1, 'white_block', this, [DEFAULT_LANG, BLOCK_SIDE, 'white']);

        sprit1 = new Sprite(image_tracker.get_resource('box2_yellow'), this.container.layer, true, false, null, null, [0, 28, 82]);
        new BlockFactory([260, 55], sprit1, 'yellow_block', this, [DEFAULT_LANG, BLOCK_SIDE, 'yellow']);

        sprit1 = new Sprite(image_tracker.get_resource('box2_blue_c'), this.container.layer, true, false, null, null, [0, 28, 82]);
        new BlockFactory([385, 55], sprit1, 'blue_block', this, [DEFAULT_LANG, BLOCK_SIDE, 'blue']);

        sprit1 = new Sprite(image_tracker.get_resource('box2_black'), this.container.layer, true, false, null, null, [0, 28, 82]);
        new BlockFactory([5, 110], sprit1, 'black_block', this, [DEFAULT_LANG, BLOCK_SIDE, 'black']);
    }
}

