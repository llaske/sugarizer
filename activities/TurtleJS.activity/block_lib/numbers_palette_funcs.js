function greaterthan_block(params){
    if (params[2].has_all_slots()){
        var values = get_block_data(params, i18n_tracker.get_labels(params[2].block_type, DEFAULT_LANG, FACTORY_SIDE)[0][0]);
        
        if (!values[0]){
            return [false, values[1]];
        }
        values = values[1];
        
        if (values[0][0]){
            var result = false;
            
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
        var values = get_block_data(params, i18n_tracker.get_labels(params[2].block_type, DEFAULT_LANG, FACTORY_SIDE)[0][0]);
        
        if (!values[0]){
            return [false, values[1]];
        }
        values = values[1];
        
        if (values[0][0]){
            var result = false;
            
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
        var values = get_block_data(params, i18n_tracker.get_labels(params[2].block_type, DEFAULT_LANG, FACTORY_SIDE)[0][0]);
        
        if (!values[0]){
            return [false, values[1]];
        }
        values = values[1];
        
        if (values[0][0]){
            var result = false;
            
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
		var values = get_block_data(params, i18n_tracker.get_labels(params[2].block_type, DEFAULT_LANG, FACTORY_SIDE)[0][0]);
        
        if (!values[0]){
            return [false, values[1]];
        }
        values = values[1];
        
        if (values[0][0]){
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
        var values = get_block_data(params, i18n_tracker.get_labels(params[2].block_type, DEFAULT_LANG, FACTORY_SIDE)[0][0]);
        
        if (!values[0]){
            return [false, values[1]];
        }
        values = values[1];
        
        if (values[0][0]){
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
        var values = get_block_data(params, i18n_tracker.get_labels(params[2].block_type, DEFAULT_LANG, FACTORY_SIDE)[0][0]);
        
        if (!values[0]){
            return [false, values[1]];
        }
        values = values[1];
        
        if (values[0][0]){
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
        var values = get_block_data(params, i18n_tracker.get_labels(params[2].block_type, DEFAULT_LANG, FACTORY_SIDE)[0][0]);
        
        if (!values[0]){
            return [false, values[1]];
        }
        values = values[1];
        
        if (values[0][0]){
			//alert(values);
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
        var values = get_block_data(params, i18n_tracker.get_labels(params[2].block_type, DEFAULT_LANG, FACTORY_SIDE)[0][0]);
        
        if (!values[0]){
            return [false, values[1]];
        }
        values = values[1];
        
        if (values[0][0]){
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
        var values = get_block_data(params, i18n_tracker.get_labels(params[2].block_type, DEFAULT_LANG, FACTORY_SIDE)[0][0]);
        
        if (!values[0]){
            return [false, values[1]];
        }
        values = values[1];
        
        if (values[0][0]){
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
        var values = get_block_data(params, i18n_tracker.get_labels(params[2].block_type, DEFAULT_LANG, FACTORY_SIDE)[0][0]);
        
        if (!values[0]){
            return [false, values[1]];
        }
        values = values[1];
        
        if (values[0][0]){
            var total = 0;
            
            if (values[0][1] < 0){
                total = Math.floor((Math.random() * (values[1][1] + Math.abs(values[0][1]) + 1)) + values[0][1]);
            } else{
                total = Math.floor(Math.random() * (values[1][1] - values[0][1] + 1) + values[0][1]);
            }
            
            return [true, total];
        }
        return [false, 0];
    }else{
        return [false, 0];
    }
}

function identity_block(params){
    if (params[2].has_all_slots()){
        var values = get_block_data(params, i18n_tracker.get_labels(params[2].block_type, DEFAULT_LANG, FACTORY_SIDE)[0][0]);
        
        if (!values[0]){
            return [false, values[1]];
        }
        values = values[1];
        
        if (values[0][0]){
            return [true, values[0][1]];
        }
        return [false, 0];
    }else{
        return [false, 0];
    }
}
