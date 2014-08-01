function greaterthan_block(params){
    if (params[2].has_all_slots()){
        var values = params[2].get_slot_values();
        
        if (values[0][0]){
            var result = false;
            
            var results = [];
            results.push(eval_int_user_var(values[0][1]));
            results.push(eval_int_user_var(values[1][1]));
		
            for (i =0; i<results.length; i++){
                if (results[i][0] == 2){
                    values[i][1] = results[i][1];
                } else if(results[i][0] == 0 || results[i][0] == 1){
                    error_message_displayer.show_error(results[i][1]);
                    return [false, 0];
                }
            }
            
            if (values[0][1] > values[1][1]){
                result = true;
            }
            return [true, result];
        }
        return false;
    }else{
        return [false, false];
    }
}

function lowerthan_block(params){
    if (params[2].has_all_slots()){
        var values = params[2].get_slot_values();
        if (values[0][0]){
            var result = false;
            
            var results = [];
            results.push(eval_int_user_var(values[0][1]));
            results.push(eval_int_user_var(values[1][1]));
		
            for (i =0; i<results.length; i++){
                if (results[i][0] == 2){
                    values[i][1] = results[i][1];
                } else if(results[i][0] == 0 || results[i][0] == 1){
                    error_message_displayer.show_error(results[i][1]);
                    return [false, 0];
                }
            }
            
            if (values[0][1] < values[1][1]){
                result = true;
            }
            return [true, result];
        }
        return false;
    }else{
        return [false, false];
    }
}

function equals_block(params){
    if (params[2].has_all_slots()){
        var values = params[2].get_slot_values();
        if (values[0][0]){
            var result = false;
            
            var results = [];
            results.push(eval_int_user_var(values[0][1]));
            results.push(eval_int_user_var(values[1][1]));
		
            for (i =0; i<results.length; i++){
                if (results[i][0] == 2){
                    values[i][1] = results[i][1];
                } else if(results[i][0] == 0 || results[i][0] == 1){
                    error_message_displayer.show_error(results[i][1]);
                    return [false, 0];
                }
            }
            
            if (values[0][1] == values[1][1]){
                result = true;
            }
            return [true, result];
        }
        return false;
    }else{
        return [false, false];
    }
}

function add_block(params){
    if (params[2].has_all_slots()){
        var values = params[2].get_slot_values();
        if (values[0][0]){
            var results = [];
            results.push(eval_int_user_var(values[0][1]));
            results.push(eval_int_user_var(values[1][1]));

            for (i =0; i<results.length; i++){
                if (results[i][0] == 2){
                    values[i][1] = results[i][1];
                } else if(results[i][0] == 0 || results[i][0] == 1){
                    error_message_displayer.show_error(results[i][1]);
                    return [false, 0];
                }
            }

            var total = values[0][1] + values[1][1];
            return [true, total];
        }
        return [false, 0];
    }else{
        return [false, 0];
    }
}

function multiply_block(params){
    if (params[2].has_all_slots()){
        var values = params[2].get_slot_values();
        if (values[0][0]){
            var results = [];
            results.push(eval_int_user_var(values[0][1]));
            results.push(eval_int_user_var(values[1][1]));

            for (i =0; i<results.length; i++){
                if (results[i][0] == 2){
                    values[i][1] = results[i][1];
                } else if(results[i][0] == 0 || results[i][0] == 1){
                    error_message_displayer.show_error(results[i][1]);
                    return [false, 0];
                }
            }

            var total = values[0][1] * values[1][1];
            return [true, total];
        }
        return [false, 0];
    }else{
        return [false, 0];
    }
}

function divide_block(params){
    if (params[2].has_all_slots()){
        var values = params[2].get_slot_values();
        if (values[0][0]){
            var results = [];
            results.push(eval_int_user_var(values[0][1]));
            results.push(eval_int_user_var(values[1][1]));

            for (i =0; i<results.length; i++){
                if (results[i][0] == 2){
                    values[i][1] = results[i][1];
                } else if(results[i][0] == 0 || results[i][0] == 1){
                    error_message_displayer.show_error(results[i][1]);
                    return [false, 0];
                }
            }

            var total = (values[0][1] * 1.0) / (values[1][1] * 1.0);
            total = (Math.round(total * 100) / 100);
            return [true, total];
        }
        return [false, 0];
    }else{
        return [false, 0];
    }
}

function substract_block(params){
    if (params[2].has_all_slots()){
        var values = params[2].get_slot_values();
        if (values[0][0]){
            var results = [];
            results.push(eval_int_user_var(values[0][1]));
            results.push(eval_int_user_var(values[1][1]));

            for (i =0; i<results.length; i++){
                if (results[i][0] == 2){
                    values[i][1] = results[i][1];
                } else if(results[i][0] == 0 || results[i][0] == 1){
                    error_message_displayer.show_error(results[i][1]);
                    return [false, 0];
                }
            }

            var total = values[0][1] - values[1][1];
            return [true, total];
        }
        return [false, 0];
    }else{
        return [false, 0];
    }
}

function mod_block(params){
    if (params[2].has_all_slots()){
        var values = params[2].get_slot_values();
        if (values[0][0]){
            var results = [];
            results.push(eval_int_user_var(values[0][1]));
            results.push(eval_int_user_var(values[1][1]));

            for (i =0; i<results.length; i++){
                if (results[i][0] == 2){
                    values[i][1] = results[i][1];
                } else if(results[i][0] == 0 || results[i][0] == 1){
                    error_message_displayer.show_error(results[i][1]);
                    return [false, 0];
                }
            }

            var total = values[0][1] % values[1][1];
            return [true, total];
        }
        return [false, 0];
    }else{
        return [false, 0];
    }
}

function sqrt_block(params){
    if (params[2].has_all_slots()){
        var values = params[2].get_slot_values();
        if (values[0][0]){
            var results = [];
            results.push(eval_int_user_var(values[0][1]));
            
            for (i =0; i<results.length; i++){
                if (results[i][0] == 2){
                    values[i][1] = results[i][1];
                } else if(results[i][0] == 0 || results[i][0] == 1){
                    error_message_displayer.show_error(results[i][1]);
                    return [false, 0];
                }
            }
            
            var total = Math.sqrt(values[0][1]);
            return [true, total];
        }
        return [false, 0];
    }else{
        return [false, 0];
    }
}

function rand_block(params){
    if (params[2].has_all_slots()){
        var values = params[2].get_slot_values();
        if (values[0][0]){
            var results = [];
            results.push(eval_int_user_var(values[0][1]));
            results.push(eval_int_user_var(values[1][1]));

            for (i =0; i<results.length; i++){
                if (results[i][0] == 2){
                    values[i][1] = results[i][1];
                } else if(results[i][0] == 0 || results[i][0] == 1){
                    error_message_displayer.show_error(results[i][1]);
                    return [false, 0];
                }
            }
            
            var total = Math.floor((Math.random() * values[1][1]) + values[0][1]);
            return [true, total];
        }
        return [false, 0];
    }else{
        return [false, 0];
    }
}

function identity_block(params){
    if (params[2].has_all_slots()){
        var values = params[2].get_slot_values();
        if (values[0][0]){
            return [true, values[0][1]];
        }
        return [false, 0];
    }else{
        return [false, 0];
    }
}
