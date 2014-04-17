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

function FlowPalette(width, height, fill_color, layer, pal_desc, global_tracker){
    this.container = null;
    this.global_tracker = global_tracker;
    this.pal_desc = pal_desc;
    this.init_palette(width, height, fill_color, layer);
}

FlowPalette.prototype = {
    constructor: FlowPalette,
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
        var sprit1 = new Sprite(image_tracker.get_resource('basic1arg'), this.container.layer, true);
        new BlockFactory([5, 5], sprit1, 'wait_block', this, [DEFAULT_LANG, BLOCK_SIDE, 'wait']);

        var sprit1 = new Sprite(image_tracker.get_resource('clampn'), this.container.layer, true, false, null, null, [0, 52, 18]);
        new BlockFactory([145, 5], sprit1, 'repeat_block', this, [DEFAULT_LANG, BLOCK_SIDE, 'repeat']);

        var sprit1 = new Sprite(image_tracker.get_resource('clamp'), this.container.layer, true, false, null, null, [0, 44, 18]);
        new BlockFactory([5, 55], sprit1, 'forever_block', this, [DEFAULT_LANG, BLOCK_SIDE, 'forever']);
		
        var sprit1 = new Sprite(image_tracker.get_resource('clampb'), this.container.layer, true, false, null, null, [0, 76, 18]);
        new BlockFactory([280, 5], sprit1, 'ifthen_block', this, [DEFAULT_LANG, BLOCK_SIDE, 'ifthen']);

        var sprit1 = new Sprite(image_tracker.get_resource('clampb'), this.container.layer, true, false, null, null, [0, 76, 18]);
        new BlockFactory([370, 5], sprit1, 'while_block', this, [DEFAULT_LANG, BLOCK_SIDE, 'while']);

        var sprit1 = new Sprite(image_tracker.get_resource('clampb'), this.container.layer, true, false, null, null, [0, 76, 18]);
        new BlockFactory([460, 5], sprit1, 'until_block', this, [DEFAULT_LANG, BLOCK_SIDE, 'until']);
    }
}

