function get_block_data(params, name){
    var result = [false, null, null];
    var success = true;

    if (params[2].has_all_slots()){
        var values = params[2].get_slot_values();
        var types = params[2].get_param_types();
        
        for (var i=0; i<values.length; i++){
            if (values[i][0]){
                if (types[i] == 'int'){
                    parse_result = eval_int_user_var(values[i][1]);
                
                    if ((parse_result[0] == 0) || (parse_result[0] == 1)){
                        result[1] = parse_result[1];
                        success = false;
                        break;
                    } else if(parse_result[0] != -1){
                        values[i][1] = parse_result[1];
                    }
                } else if (types[i] == 'str_int' || types[i] == 'str'){
                    parse_result = eval_str_user_var(values[i][1]);
                    if (parse_result[0] == -1 && types[i] == 'str'){
                        result[1] = parse_result[1];
                        success = false;
                        break;
                    } else if (parse_result[0] == 2){
                        if (isNaN(parseInt(parse_result[1])) && types[i] == 'str'){
                            result[1] = i18n_tracker.get_err_msg(DEFAULT_LANG, 
                                'not_str_value_error', [values[i][1]]);
                            success = false;
                            break;
                        }
                        values[i][1] = parse_result[1];
                    }
                    //alert("Valor final de retorno de string " + values[i][1]);
                } else if (types[i] == 'bool'){
                    // at the moment... just skip any analysis of bool params
                } else if (types[i] == 'str_no_parse'){
                    if (!isNaN(parseInt(values[i][1]))){
                        result[1] = i18n_tracker.get_err_msg(DEFAULT_LANG, 
                                'not_str_value_error', [values[i][1]]);
                        success = false;
                        break;
                    }
                }
            } else{
                success = false;
                result[1] = values[i][1];
                break;
            }
        }

        if (success){
            result[0] = true;
            result[1] = values;
            result[2] = params[2];
            //alert(result[1][0][1]);
        }
    } else{
        result[1] = i18n_tracker.get_err_msg(DEFAULT_LANG, 'missing_value_error', [name]);
    }
    return result;   
}

function eval_int_user_var(name){
    var result = [-1, null];
    
    if (isNaN(parseInt(name))){
        var data = user_vars_tracker.get_var(name);
        if (data != null){
            if (isNaN(parseInt(data))){
                result[0] = 1;
                result[1] = i18n_tracker.get_err_msg(DEFAULT_LANG, 'not_int_value_error', [name]);
            } else{
                result[0] = 2;
                result[1] = data;
            }
        } else{
            result[0] = 0;
            result[1] = i18n_tracker.get_err_msg(DEFAULT_LANG, 'var_not_exist_error', [name]);
            // da bien: alert("resultado 1 es:" + result[1]);
        }
    }
    return result;
}

function eval_str_user_var(name){
    var result = [-1, null];
    
    if (isNaN(parseInt(name))){
        var data = user_vars_tracker.get_var(name);
        if (data != null){
            result[0] = 2;
            result[1] = data;
        } else{
            result[0] = 1;
        }
    }
    return result;
}

function collide_helper(parent, collide){
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
                //parent.set_xy(point);
                var movement = [0, 0];
                movement[0] = point[0] - parent.start_drag_pos[0];
                movement[1] = point[1] - parent.start_drag_pos[1];
                parent.group_movement(parent, movement, false, true);
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
            //parent.set_xy(point);
            var movement = [0, 0];
            movement[0] = point[0] - parent.start_drag_pos[0];
            movement[1] = point[1] - parent.start_drag_pos[1];
            parent.group_movement(parent, movement, false, true);
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
}
