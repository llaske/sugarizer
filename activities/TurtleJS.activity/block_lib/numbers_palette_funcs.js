function greaterthan_block(params){
    if (params[2].has_all_slots()){
        var values = params[2].get_slot_values();
        if (values[0][0]){
            var result = false;
            if (parseInt(values[0][1]) > parseInt(values[1][1])){
                result = true;
            }
            return [true, result];
        }
        return false;
    }else{
        alert('Missing value from set Greater than block');
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
        alert('Missing value from Add block');
        return [false, 0];
    }
}

function multiply_block(params){
    if (params[2].has_all_slots()){
        var values = params[2].get_slot_values();
        if (values[0][0]){
            var total = values[0][1] * values[1][1];
            return [true, total];
        }
        return [false, 0];
    }else{
        alert('Missing value from Multiply block');
        return [false, 0];
    }
}

function divide_block(params){
    if (params[2].has_all_slots()){
        var values = params[2].get_slot_values();
        if (values[0][0]){
            var total = (values[0][1] * 1.0) / (values[1][1] * 1.0);
            total = (Math.round(total * 100) / 100);
            return [true, total];
        }
        return [false, 0];
    }else{
        alert('Missing value from Multiply block');
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
        alert('Missing value from Identity block');
        return [false, 0];
    }
}
