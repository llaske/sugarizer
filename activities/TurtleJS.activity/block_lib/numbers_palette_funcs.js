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
