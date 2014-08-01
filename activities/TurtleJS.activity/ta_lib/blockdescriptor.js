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

function BlockDescriptor(block_img, dock_desc, callback_func, value_func, properties){
    this.block_name = properties[0];
    this.block_img = block_img;
    this.dock_desc = dock_desc;
    this.callback_func = callback_func;
    this.value_func = value_func;
    this.labels = [];
    this.component_positions = null;
    this.base_clamp_height = 0;
    this.add_labels(this.block_name, properties[1], properties[2]);
    this.param_types = null;
    this.user_resizable = null;
    properties[3][this.block_name] = this;
    if (properties.length == 5){
        this.param_types = properties[4];
    }
}

BlockDescriptor.prototype = {
    constructor: BlockDescriptor,
    add_label: function(value, x, y, font_size, font_type, font_color){
        var label = [];
        label["value"] = value;
        label["x"] = x;
        label["y"] = y;
        label["font_size"] = font_size;
        label["font_type"] = font_type;
        label["font_color"] = font_color;
        this.labels.push(label);
    },
    delete_all_labels: function(){
        this.labels = [];
    },
    add_labels: function(block_name, lang, type){
        var labels = i18n_tracker.get_labels(block_name, lang, type);
        for(var i=0; i<labels.length; i++){
            var lbl = labels[i];
            this.add_label(lbl[0], lbl[1], lbl[2], lbl[3], lbl[4], lbl[5]);
        }
    }
}
