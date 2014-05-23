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

function BlockFactory(pos, sprite, block_name, palette, properties){
    this.pos = pos;
    this.group = null;
    this.sprite = sprite;
    this.block_name = block_name;
    this.palette = palette;
    if(properties != null){
        this.add_labels(block_name, properties[0], properties[1]);
    }
    this.init_factory();
    if(properties != null){
        this.palette.container.add_block_factory(properties[2], this);
    }
}

BlockFactory.prototype = {
    constructor: BlockFactory,
    init_factory: function(){
        var parent = this;
        this.group = new Kinetic.Group({
            x: this.pos[0],
            y: this.pos[1],
            draggable: false
        });
        this.group.add(this.sprite.group);
        this.group.on('mousedown touchstart', function(){
            parent.make_block(parent.block_name, true);
        });
    },
    get_sprite: function(){
        return this.sprite;
    },
    fire: function(evt){
        this.group.fire(evt);
    },
    end_event: function(){
        this.fire('mouseup');
    },
    get_pos: function(){
        var pos = [0, 0];
        pos[0] = this.pos[0] + Math.abs(draw_stage.layer.x());
        pos[1] = this.pos[1] + Math.abs(draw_stage.layer.y());
        return pos;
    },
    add_labels: function(block_name, lang, type){
        var labels = i18n_tracker.get_labels(block_name, lang, type);
        for(var i=0; i<labels.length; i++){
            var lbl = labels[i];
            this.sprite.set_label(lbl[0], lbl[1], lbl[2], lbl[3], lbl[4], lbl[5]);
        }
    },
    make_block: function(name, user_action){
        var box_types = ['box_block', 'number', 'text_block'];

        var color_blocks = {
            'red_block' : '#FF0000',
            'green_block' : '#00FF00',
            'purple_block' : '#551A8B',
            'orange_block' : '#FFA500',
            'cyan_block' : '#00FFFF',
            'white_block' : '#FFFFFF',
            'yellow_block' : '#FFFF00',
            'blue_block' : '#0000FF',
            'black_block' : '#000000'
        };

        if (user_action){
            this.end_event();
        }

        var draw_stage = this.palette.global_tracker.get_var('draw_stage');
        var block_tracker = this.palette.global_tracker.get_var('block_tracker');
        var dock_tracker = this.palette.global_tracker.get_var('dock_tracker');
        var block_descriptor = this.palette.pal_desc.descriptors[name];

        var dock_descriptor = dock_tracker.get_dock(block_descriptor.dock_desc);

        var sprit1 = new Sprite(block_descriptor.block_img, draw_stage.layer, true, false, null, null, block_descriptor.component_positions);
        for (var i=0; i<block_descriptor.labels.length; i++){
            this.make_label(sprit1, block_descriptor.labels[i]);
        }

        var block1 = new TurtleBlock(sprit1, draw_stage.layer, dock_descriptor, block_descriptor.callback_func, block_descriptor.value_func, [draw_stage.turtle, draw_stage.draw_tracker, null, block_tracker]);
        block1.block_type = name;
        block1.param_types = block_descriptor.param_types;
        block1.params[2] = block1;
        block1.base_clamp_height = block_descriptor.base_clamp_height;
        block1.actual_clamp_height = block_descriptor.base_clamp_height;
        block_tracker.add_block(block1);
        block1.block_id = block_tracker.get_next_id();
        block1.set_xy(this.get_pos());

        if (box_types.indexOf(name) != -1){
            var block_value = parseInt(block1.sprite.get_label(0).getText());
            if (block_value >= 0 || block_value <= -1){
                block1.block_value = block_value;
            } else{
                block1.block_value = block1.sprite.get_label(0).getText();
            }
            block1.last_label_width = block1.sprite.get_label(0).getWidth();
        }

        if (color_blocks[name] != null){
            block1.block_value = color_blocks[name];
        }

        if (user_action){
            block1.fire('mousedown');
        }

        return block1;
    },
    make_label: function(sprit, label){
        sprit.set_label(label['value'], label['x'], label['y'], label['font_size'], label['font_type'], label['font_color']);
    },
    box_block_normal_size: function(){
        this.sprite.img[2].setX(this.sprite.img[2].getX() + 70);
        this.sprite.img[1].setWidth(this.sprite.img[1].getWidth() + 70);
    }
}
