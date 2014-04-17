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

function PaletteContainer(width, height, fill_color, layer, block_tracker){
    this.width = width;
    this.height = height;
    this.fill_color = fill_color;
    this.group = null;
    this.rect = null;
    this.visible = false;
    this.layer = layer;
    this.elements = [];
    this.block_tracker = block_tracker;
    this.init();
}

PaletteContainer.prototype = {
    constructor: PaletteContainer,
    init: function(){
        this.group = new Kinetic.Group({
            draggable: false
        });
        this.rect = new Kinetic.Rect({
            fill: this.fill_color,
            width: this.width,
            height: this.height
        });
        this.group.add(this.rect);
    },
    add_block_factory: function(key, block){
        this.elements[key] = block;
        this.group.add(block.group);
    },
    show: function(){
        this.visible = true;
        this.layer.add(this.group);
    },
    hide: function(){
        this.visible = false;
        this.group.remove();
    },
    is_visible: function(){
        return this.visible;
    },
    get_xy: function(){
        var pos = [this.group.getX(), this.group.getY()];
    },
    is_collide: function(point){
        min_x = this.group.getX();
        max_x = min_x + this.rect.getWidth();
        min_y = this.group.getY();
        max_y = min_y + this.rect.getHeight();

        if ((point[0] > min_x && point[0] < max_x) && (point[1] > min_y && point[1] < max_y)){
            return true;
        }else{
            return false;
        }
    },
    get_factory: function(name){
        return this.elements[name];
    }
}
