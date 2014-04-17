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

function TurtleBlock(sprite, layer, descriptor, func, value_func, params){
    this.sprite = sprite;
    this.tracker = null;
    this.descriptor = descriptor;
    this.block_id = null;
    this.layer = layer;
    this.func = func;
    this.value_func = value_func;
    this.params = params;
    this.move_params = true;
    this.group = new Kinetic.Group({
        draggable: true
    });
    this.set_events();
    this.display_block();

    this.base_clamp_height = 45;
    this.actual_clamp_height = 45;
    this.joint_height = 4;

    this.block_value = 0;
    this.base_center_width = 28 + 70;
    this.actual_center_width = 28 + 70;

    this.box_start_pos = 20;
    this.last_label_width = 0;

    // set joined blocks
    this.receiver_slots = [];
    this.upper_block = [];
    this.lower_block = [];
    this.param_blocks = [];
    this.stack_slots = [null, null];
    // variable that stores tart point of drag
    this.start_drag_pos = this.get_xy();
    this.configure_receiver_slots();
}

TurtleBlock.prototype = {
    constructor: TurtleBlock,
    set_events: function(){
        var parent = this;
        this.group.on('click', function(){
            parent.func(parent.params);
        });
        this.group.on('mousedown', function(){
            parent.start_drag_pos = parent.get_xy();
        });
        this.group.on('dragstart', function(){
            parent.chain_bring_front();
        });
        this.group.on('dragmove', function(){
            if (parent.upper_block.length == 1){
                var already_resized = false;
                var stack_parent = parent.get_stack_top_block(parent);

                if (stack_parent != null && stack_parent.upper_block[0].block_id != parent.upper_block[0].block_id){
                    already_resized = true;
                    stack_parent.upper_block[0].base_clamp_height *= -1;
                    stack_parent.upper_block[0].calc_clamp_height(false, -(parent.chain_height() - parent.joint_height * 2), stack_parent.upper_block[0]);
                    stack_parent.upper_block[0].base_clamp_height *= -1;
                    parent.upper_block[0].lower_block = [];
                }

                if (!already_resized){
                    if (parent.upper_block[0].has_stack_dock()){
                        already_resized = true;
                        var index = parent.upper_block[0].stack_slots.indexOf(parent);
                        if (index != -1){
                            parent.upper_block[0].stack_slots[index] = null;

                            parent.upper_block[0].base_clamp_height *= -1;
                            parent.upper_block[0].calc_clamp_height(true, -parent.chain_height(), parent.upper_block[0]);
                            parent.upper_block[0].base_clamp_height *= -1;
                        } else{
                            parent.upper_block[0].lower_block = [];
                        }
                    } else{
                        parent.upper_block[0].lower_block = [];
                    }
                }

                var stack_parent = parent.get_stack_top_block(parent);
                if (stack_parent != null && (!already_resized)){
                    stack_parent.upper_block[0].calc_clamp_height(false, -(parent.chain_height() - parent.joint_height * 2), stack_parent.upper_block[0]);
                }
                parent.upper_block = [];
            }
            if (parent.has_giving_param()){
                if (parent.param_blocks.length > 0){
                    var index = parent.param_blocks[0].receiver_slots.indexOf(parent);
                    parent.param_blocks[0].receiver_slots[index] = null;
                    parent.param_blocks = [];
                }
            }

            var actual_pos = parent.get_xy();
            var movement = [0, 0];
            movement[0] = actual_pos[0] - parent.start_drag_pos[0];
            movement[1] = actual_pos[1] - parent.start_drag_pos[1];
            if (parent.upper_block.length > 0){
                parent.upper_block[0].group_movement(parent, movement, false, true);
            }
            if (parent.lower_block.length > 0){
                parent.lower_block[0].group_movement(parent, movement, false, true);
            }
            if (parent.param_blocks.length > 0){
                parent.param_blocks[0].group_movement(parent, movement, false, true);
            }
            if (parent.receiver_slots.length > 0){
                for (var i=0; i<parent.receiver_slots.length; i++){
                    if (parent.receiver_slots[i] != null){
                        parent.receiver_slots[i].group_movement(parent, movement, false, true);
                    }
                }
            }
            if (parent.stack_slots.length > 0){
                for (var i=0; i<parent.stack_slots.length; i++){
                    if (parent.stack_slots[i] != null){
                        parent.stack_slots[i].group_movement(parent, movement, false, true);
                    }
                }
            }
            parent.start_drag_pos = actual_pos;
        });
        this.group.on('dragend', function(){
            var collide = parent.tracker.get_collide_obj(parent);
            for (var i=0; i<collide.length; i++){
                parent.collide_action(parent, collide[i]);
            }
        });
    },
    collide_action: function(parent, collide){
        var upper_distance = -1;
        var lower_distance = -1;
        var op1 = -1;
        var op2 = -1;
                
        if (parent.has_upper_dock() && collide.has_lower_dock()){
            op1 = (parent.get_upper_dock()[0] + parent.get_xy()[0]);
            op1 -= (collide.get_lower_dock()[0] + collide.get_xy()[0]);
            op2 = (parent.get_upper_dock()[1] + parent.get_xy()[1]);
            op2 -= (collide.get_lower_dock()[1] + collide.get_xy()[1]);
            upper_distance = Math.sqrt(Math.pow(op1, 2) + Math.pow(op2, 2));
        }
        if (parent.has_giving_param() && collide.has_receiver_param()){
            var giving_point = parent.get_giving_point();
            var receiver_points = collide.get_receiver_points();
            var point_distances = [];
            for (var i=0; i<receiver_points.length; i++){
                op1 = (giving_point[0] + parent.get_xy()[0]);
                op1 -= (receiver_points[i][0] + collide.get_xy()[0]);
                op2 = (giving_point[1] + parent.get_xy()[1]);
                op2 -= (receiver_points[i][1] + collide.get_xy()[1]);
                point_distances.push(Math.sqrt(Math.pow(op1, 2) + Math.pow(op2, 2)));
            }
            for (var i=0; i< point_distances.length; i++){
                if (point_distances[i] < 23.0){
                    var align_point = receiver_points[i];
                    if (giving_point[2] == align_point[2]){
                        var point = [0, 0];
                        var movement = parent.get_xy();

                        point[0] = collide.get_xy()[0] + align_point[0] - 17;

                        if (align_point[1] <= 25){
                            point[1] = collide.get_xy()[1];
                        } else {
                            point[1] = collide.get_xy()[1] + align_point[1] - 25;
                        }

                        if (giving_point[2] == ROUND_DOCK){
                            point[0] += 17;
                            point[1] = point[1] - giving_point[1] + 25;
                        }

                        movement[0] = point[0] - movement[0];
                        movement[1] = point[1] - movement[1];

                        parent.set_xy(point);
                        collide.receiver_slots[i] = parent;
                        parent.param_blocks[0] = collide;
                        parent.group_movement(parent, movement, true, true);
                    }
                    break;
                }
            }
        }
        if (parent.has_upper_dock() && collide.has_stack_dock()){
            var stack_points = collide.get_stack_points();
            var upper_point = parent.get_upper_dock();
            var point_distances = [];
            for (var i=0; i<stack_points.length; i++){
                op1 = (upper_point[0] + parent.get_xy()[0]);
                op1 -= (stack_points[i][0] + collide.get_xy()[0]);
                op2 = (upper_point[1] + parent.get_xy()[1]);
                op2 -= (stack_points[i][1] + collide.get_xy()[1]);
                point_distances.push(Math.sqrt(Math.pow(op1, 2) + Math.pow(op2, 2)));
            }
            for (var i=0; i< point_distances.length; i++){
                if (point_distances[i] < 25.0){
                    var align_point = stack_points[i];
                    var point = [0, 0];
                    point[0] = collide.get_xy()[0] + align_point[0];
                    point[1] = collide.get_xy()[1] + align_point[1];
                    parent.set_xy(point);
                    var movement = [0, 0];
                    movement[0] = point[0] - parent.start_drag_pos[0];
                    movement[1] = point[1] - parent.start_drag_pos[1];
                    parent.group_movement(parent, movement, true, true);
                    //special case: add a block in the start of the stack of a flow block
                    var total_height = 0;
                    var stack_start = true;
                    if (collide.stack_slots[i] != null){
                        var flow_bottom_block = parent.get_flow_bottom_block(parent);
                        total_height = parent.chain_height();
                        flow_bottom_block.lower_block[0] = collide.stack_slots[i];
                        parent.upper_block[0] = collide;
                        collide.stack_slots[i] = parent;
                        flow_bottom_block.lower_block[0].upper_block[0] = flow_bottom_block;
                        total_height -= parent.joint_height; 
                        flow_bottom_block.lower_block[0].group_movement(flow_bottom_block.lower_block[0], [0, total_height], false, true);
                        total_height += parent.joint_height;
                        stack_start = false;
                    } else {
                        collide.stack_slots[i] = parent;
                        parent.upper_block[0] = collide;
                        total_height = parent.chain_height();
                    }
                    collide.calc_clamp_height(stack_start, total_height, collide);
                    break;
                }
            }
        }
        if(upper_distance > -1){
            if (upper_distance < 13.0 && upper_distance > 0){
                var point = [];
                point.push(collide.get_xy()[0]);
                point.push(collide.get_lower_dock()[1] + collide.get_xy()[1] - 1);
                parent.set_xy(point);
                var movement = [0, 0];
                movement[0] = point[0] - parent.start_drag_pos[0];
                movement[1] = point[1] - parent.start_drag_pos[1];
                parent.group_movement(parent, movement, true, true);
                // make the respective joints
                if (parent.upper_block.indexOf(collide) == -1){
                    var total_height = 0;
                    // special case: add block in the middle of a flow
                    if (collide.has_lower_block()){
                        var flow_bottom_block = parent.get_flow_bottom_block(parent);
                        total_height = parent.chain_height();
                        flow_bottom_block.lower_block[0] = collide.lower_block[0];
                        parent.upper_block[0] = collide;
                        collide.lower_block[0] = parent;
                        flow_bottom_block.lower_block[0].upper_block[0] = flow_bottom_block;
                        total_height -= parent.joint_height; 
                        flow_bottom_block.lower_block[0].group_movement(flow_bottom_block.lower_block[0], [0, total_height], false, true);
                        total_height += parent.joint_height;
                    } else{
                        parent.upper_block.push(collide);
                        collide.lower_block.push(parent);
                        total_height = parent.chain_height();
                    }
                    var stack_parent = collide.get_stack_top_block(parent);
                    if (stack_parent != null){
                        stack_parent.upper_block[0].calc_clamp_height(false, total_height, stack_parent.upper_block[0]);
                    }
                }
            }
        }
    },
    calc_clamp_height: function(is_stack_joint, height, clamp){
        var added_height = 0;
        if (is_stack_joint){
            added_height = height - clamp.base_clamp_height;
        } else{
            added_height = height - clamp.joint_height;
        }
        clamp.actual_clamp_height += added_height;
        clamp.sprite.img[2].setY(clamp.sprite.img[2].getY() + added_height);
        clamp.sprite.img[1].setHeight(clamp.sprite.img[1].getHeight() + added_height);
        clamp.calc_lower_dock(clamp, added_height);
        clamp.move_params = false;
        clamp.group_movement(clamp, [0, added_height], true, false);
        if (clamp.has_upper_block()){
            var parent_stack = clamp.get_stack_top_block(clamp);
            if (parent_stack != null){
                parent_stack.upper_block[0].calc_clamp_height(false, added_height+clamp.joint_height, parent_stack.upper_block[0]);
            }
        }
    },
    calc_lower_dock: function(clamp, vertical_movement){
        clamp.descriptor.lower_dock[0][1] += vertical_movement;
    },
    get_stack_top_block: function(block){
        var top_block = null;
        if (block.has_upper_block()){
            if (block.upper_block[0].has_stack_dock()){
                if (block.upper_block[0].stack_slots.indexOf(block) != -1){
                    top_block = block;
                } else {
                    top_block = block.upper_block[0].get_stack_top_block(block.upper_block[0]);
                }
            } else {
                top_block = block.upper_block[0].get_stack_top_block(block.upper_block[0]);
            }
        }
        return top_block;
    },
    get_flow_bottom_block: function(block){
        var bottom_block = null;
        if (block.has_lower_block()){
            bottom_block = block.lower_block[0].get_flow_bottom_block(block.lower_block[0]);
        } else{
            bottom_block = block;
        }
        return bottom_block;
    },
    box_block_normal_size: function(block){
		block.sprite.img[2].setX(block.sprite.img[2].getX() + 70);
        block.sprite.img[1].setWidth(block.sprite.img[1].getWidth() + 70);
    },
    calc_box_size: function(){
        if (this.sprite.get_label(0).getWidth() > (this.actual_center_width)){
            var added_width = this.sprite.get_label(0).getWidth() - (this.base_center_width);
            this.sprite.img[2].setX(this.sprite.img[2].getX() + added_width);
            this.actual_center_width = this.sprite.img[1].getWidth() + added_width;
            this.sprite.img[1].setWidth(this.sprite.img[1].getWidth() + added_width);
        } else{
            var substracted_width = (this.actual_center_width) - this.sprite.get_label(0).getWidth();
            if ((this.actual_center_width - substracted_width) >= this.base_center_width){
                var new_width = this.actual_center_width - substracted_width;
                this.actual_center_width = new_width;
                this.sprite.img[1].setWidth(new_width);
            } else{
                this.sprite.img[2].setX(this.sprite.img[1].getX() + 70 + 12);
                this.actual_center_width = 70 + 12;
                this.sprite.img[1].setWidth(70 + 12);
            }
        }
    },
    set_box_label: function(str){
        if (str.length > 15){
            this.sprite.set_label_text(0, str.substring(0, 12) + '...');
        } else{
            this.sprite.set_label_text(0, str);
        }
        this.calc_box_size();
        var horizontal_movement = this.sprite.get_label(0).getWidth() - this.last_label_width;
        var x_pos = this.sprite.get_label(0).getX() - horizontal_movement;
		
        if (x_pos < this.box_start_pos){
            x_pos = this.box_start_pos;
        } else{
            x_pos = ((this.sprite.safe_width() - this.box_start_pos) / 2) - (this.sprite.get_label(0).getWidth() / 2) + this.box_start_pos;
        }
        this.sprite.get_label(0).setX(x_pos);
        this.last_label_width = this.sprite.get_label(0).getWidth();
    },
    display_block: function(){
        this.group.add(this.sprite.group);
        this.layer.add(this.group);
    },
    exec_block: function(){
        var can_continue = true;
        if ((!this.has_giving_param() && this.has_receiver_param()) || (!this.has_giving_param() && !this.has_receiver_param())){
            can_continue = this.func(this.params);
        }
        return can_continue;
    },
    get_value: function(){
        return this.value_func(this.params);
    },
    move_relative: function(movement){
        var x_final = this.get_xy()[0] + movement[0];
        var y_final = this.get_xy()[1] + movement[1];
        this.set_xy([x_final, y_final]);
    },
    set_xy: function(point){
        this.group.setX(point[0]);
        this.group.setY(point[1]);
    },
    get_xy: function(){
        var pos = [this.group.getX(), this.group.getY()];
        return pos;
    },
    get_collide_points: function(){
        points = [];
        points.push(this.get_upper_left());
        points.push(this.get_upper_right());
        points.push(this.get_lower_left());
        points.push(this.get_lower_right());
        points.push(this.get_upper_mid());
        points.push(this.get_lower_mid());
        points.push(this.get_mid_left());
        points.push(this.get_mid_right());
        return points;
    },
    get_height: function(){
        return this.sprite.safe_height();
    },
    get_upper_left: function(){
        return this.get_xy();
    },
    get_upper_right: function(){
        pos = this.get_xy();
        pos[0] += this.sprite.safe_width();
        return pos;
    },
    get_lower_left: function(){
        pos = this.get_xy();
        pos[1] += this.sprite.safe_height();
        return pos;
    },
    get_lower_right: function(){
        pos = this.get_xy();
        pos[0] += this.sprite.safe_width();
        pos[1] += this.sprite.safe_height();
        return pos;
    },
    get_upper_mid: function(){
        pos = this.get_xy();
        pos[0] += parseInt(this.sprite.safe_width() / 2);
        return pos;
    },
    get_lower_mid: function(){
        pos = this.get_lower_left();
        pos[0] += parseInt(this.sprite.safe_width() / 2);
        return pos;
    },
    get_mid_left: function(){
        pos = this.get_xy();
        pos[1] += (this.sprite.safe_height() / 2);
        return pos;
    },
    get_mid_right: function(){
        pos = this.get_upper_right();
        pos[1] += (this.sprite.safe_height() / 2);
        return pos;
    },
    is_collide: function(point){
        min_x = this.group.getX();
        max_x = min_x + this.sprite.safe_width();
        min_y = this.group.getY();
        max_y = min_y + this.sprite.safe_height();

        if ((point[0] > min_x && point[0] < max_x) && (point[1] > min_y && point[1] < max_y)){
            return true;
        }else{
            return false;
        }
    },
    has_upper_dock: function(){
        return this.descriptor.has_upper_dock();
    },
    has_lower_dock: function(){
        return this.descriptor.has_lower_dock();
    },
    has_giving_param: function(){
        return this.descriptor.has_giving_param();
    },
    has_receiver_param: function(){
        return this.descriptor.has_receiver_param();
    },
    has_stack_dock: function(){
        return this.descriptor.has_stack_dock();
    },
    has_upper_block: function(){
        if (this.upper_block.length > 0){
            return true;
        }
        return false;
    },
    has_lower_block: function(){
        if (this.lower_block.length > 0){
            return true;
        }
        return false;
    },
    is_param_block: function(){
        if (this.has_giving_param() && !this.has_receiver_param()){
            return true;
        }
        return false;
    },
    is_start_block: function(){
        if (!this.has_upper_block() && !this.is_param_block()){
            return true;
        }
        return false;
    },
    chain_exec: function(){
        var can_continue = this.exec_block();
        if (this.receiver_slots.length > 0 && can_continue){
            for (var i=0; i<this.receiver_slots.length; i++){
                if (this.receiver_slots[i] != null){
                    this.receiver_slots[i].chain_exec();
                }
            }
        }
        if (this.lower_block.length > 0 && can_continue){
            this.lower_block[0].chain_exec();
        }
        return can_continue;
    },
    chain_height: function(){
        var total_height = this.get_height();
        if (this.lower_block.length > 0){
            total_height += this.lower_block[0].chain_height() - this.joint_height;
        }
        return total_height;
    },
    get_upper_dock: function(){
        return this.descriptor.get_upper_dock();
    },
    get_lower_dock: function(){
        return this.descriptor.get_lower_dock();
    },
    get_giving_point: function(){
        return this.descriptor.get_giving_point();
    },
    get_receiver_points: function(){
        return this.descriptor.get_receiver_points();
    },
    get_stack_points: function(){
        return this.descriptor.get_stack_points();
    },
    configure_receiver_slots: function(){
        var slots = this.descriptor.get_receiver_points();
        for (var i=0; i<slots.length; i++){
            this.receiver_slots[i] = null;
        }
    },
    has_all_slots: function(){
        for (var i=0; i<this.receiver_slots.length; i++){
            if (this.receiver_slots[i] == null){
                return false;
            }
        }
        return true;
    },
    get_slot_values: function(){
        var values = [];
        for (var i=0; i<this.receiver_slots.length; i++){
            values.push(this.receiver_slots[i].get_value());
        }
        return values;
    },
    group_movement: function(caller, movement, moved, move_stack){
        if (!moved){
            this.move_relative(movement);
            this.already_moved = false;
        }

        if (this.lower_block.length > 0 && this.lower_block[0] != caller){
            this.lower_block[0].group_movement(this, movement, false, true);
        }
        if (this.receiver_slots.length > 0){
            if (caller.move_params){
                for (var i=0; i<this.receiver_slots.length; i++){
                    if (this.receiver_slots[i] != null && this.receiver_slots[i] != caller){
                        this.receiver_slots[i].group_movement(this, movement, false, true);
                    }
                }
            } else{
                caller.move_params = true;
            }
        }
        if (this.param_blocks.length > 0 && this.param_blocks[0] != caller){
            this.param_blocks[i].group_movement(this, movement, false, true);
        }
        if (this.stack_slots.length > 0 && move_stack){
            for (var i=0; i<this.stack_slots.length; i++){
                if (this.stack_slots[i] != null && this.stack_slots[i] != caller){
                    this.stack_slots[i].group_movement(this, movement, false, true);
                }
            }
        }
    },
    chain_delete: function(){
        this.tracker.remove_block(this);
        this.hide();
        for (var i=0; i<this.receiver_slots.length; i++){
            if (this.receiver_slots[i] != null){
                this.receiver_slots[i].chain_delete();
            }
        }
        if (this.lower_block.length > 0){
            this.lower_block[0].chain_delete();
        }
        for (var i=0; i<this.stack_slots.length; i++){
            if (this.stack_slots[i] != null){
                this.stack_slots[i].chain_delete();
            }
        }
    },
    chain_bring_front: function(){
        this.group.moveToTop();
        for (var i=0; i<this.receiver_slots.length; i++){
            if (this.receiver_slots[i] != null){
                this.receiver_slots[i].chain_bring_front();
            }
        }
        if (this.lower_block.length > 0){
            this.lower_block[0].chain_bring_front();
        }
        for (var i=0; i<this.stack_slots.length; i++){
            if (this.stack_slots[i] != null){
                this.stack_slots[i].chain_bring_front();
            }
        }
    },
    is_attached_block: function(block){
        if (this.param_blocks.indexOf(block)){
            return true;
        }
        return false;
    },
    fire: function(evt){
        this.group.fire(evt);
    },
    hide: function(){
        this.group.remove();
    },
    show: function(){
        this.layer.add(this.group);
    }
}
