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

function PenPalette(width, height, fill_color, layer, pal_desc, global_tracker){
    this.container = null;
    this.global_tracker = global_tracker;
    this.pal_desc = pal_desc;
    this.init_palette(width, height, fill_color, layer);
}
PenPalette.prototype = {
    constructor: PenPalette,
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
        var sprit1 = new Sprite(image_tracker.get_resource('basic_blue'), this.container.layer, true);
        new BlockFactory([255, 5], sprit1, 'penup_block', this, [DEFAULT_LANG, BLOCK_SIDE, 'penup']);

        sprit1 = new Sprite(image_tracker.get_resource('basic_blue'), this.container.layer, true);
        new BlockFactory([255, 55], sprit1, 'pendown_block', this, [DEFAULT_LANG, BLOCK_SIDE, 'pendown']);

        sprit1 = new Sprite(image_tracker.get_resource('basic1arg_blue'), this.container.layer, true);
        block_factory1 = new BlockFactory([375, 5], sprit1, 'set_pen_size_block', this, [DEFAULT_LANG, BLOCK_SIDE, 'setpensize']);

        sprit1 = new Sprite(image_tracker.get_resource('box2_blue'), this.container.layer, true, false, null, null, [0, 28, 82]);
        new BlockFactory([500, 5], sprit1, 'pensize_block', this, [DEFAULT_LANG, BLOCK_SIDE, 'pensize']);

        sprit1 = new Sprite(image_tracker.get_resource('basic_blue'), this.container.layer, true);
        block_factory1 = new BlockFactory([375, 55], sprit1, 'start_fill_block', this, [DEFAULT_LANG, BLOCK_SIDE, 'startfill']);

        sprit1 = new Sprite(image_tracker.get_resource('basic_blue'), this.container.layer, true);
        block_factory1 = new BlockFactory([375, 105], sprit1, 'end_fill_block', this, [DEFAULT_LANG, BLOCK_SIDE, 'stopfill']);
        
        sprit1 = new Sprite(image_tracker.get_resource('basic3arg_blue'), this.container.layer, true);
        block_factory1 = new BlockFactory([500, 55], sprit1, 'fill_screen_block', this, [DEFAULT_LANG, BLOCK_SIDE, 'fillscreen2']);

        sprit1 = new Sprite(image_tracker.get_resource('basic1arg_blue'), this.container.layer, true);
        new BlockFactory([5, 5], sprit1, 'set_color_block', this, [DEFAULT_LANG, BLOCK_SIDE, 'setcolor']);

        sprit1 = new Sprite(image_tracker.get_resource('basic1arg_blue'), this.container.layer, true);
        new BlockFactory([5, 55], sprit1, 'set_shade_block', this, [DEFAULT_LANG, BLOCK_SIDE, 'setshade']);

        sprit1 = new Sprite(image_tracker.get_resource('basic1arg_blue'), this.container.layer, true);
        new BlockFactory([5, 105], sprit1, 'set_gray_block', this, [DEFAULT_LANG, BLOCK_SIDE, 'setgray']);

        sprit1 = new Sprite(image_tracker.get_resource('box2_blue'), this.container.layer, true, false, null, null, [0, 28, 82]);
        new BlockFactory([120, 5], sprit1, 'color_block', this, [DEFAULT_LANG, BLOCK_SIDE, 'color']);

        sprit1 = new Sprite(image_tracker.get_resource('box2_blue'), this.container.layer, true, false, null, null, [0, 28, 82]);
        new BlockFactory([120, 55], sprit1, 'shade_block', this, [DEFAULT_LANG, BLOCK_SIDE, 'shade']);

        sprit1 = new Sprite(image_tracker.get_resource('box2_blue'), this.container.layer, true, false, null, null, [0, 28, 82]);
        new BlockFactory([120, 105], sprit1, 'gray_block', this, [DEFAULT_LANG, BLOCK_SIDE, 'gray']);
    }
}

