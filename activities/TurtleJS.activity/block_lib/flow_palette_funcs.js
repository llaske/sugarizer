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

function repeat(params, values){
    for (var i=0; i<values[0][1]; i++){
        params[2].stack_slots[0].chain_exec();
    }
    return true;
}

function ifthen(params, values){
    if (values[0][1] && params[2].stack_slots[0] != null){
        params[2].stack_slots[0].chain_exec();
    }
    return true;
}

function forever_exec(params){
    if (params[2].stack_slots[0] != null && params[3].on_infinite_loop){
        params[2].stack_slots[0].chain_exec();
        var myVar = setTimeout(function(){forever_exec(params)}, 500);
    }
}

function forever(params, values){
    params[3].on_infinite_loop = true;
    forever_exec(params);
    return false;
}

function while_exec(params){
    if (params[2].get_slot_values()[0][1] && params[2].stack_slots[0] != null && params[3].on_infinite_loop){
        params[2].stack_slots[0].chain_exec();
        var myVar = setTimeout(function(){while_exec(params)}, 500);
    } else{
        params[3].on_infinite_loop = false;
        params[2].lower_block[0].chain_exec();
    }
}

function whileb(params, values){
    params[3].on_infinite_loop = true;
    while_exec(params);
    return false;
}

function until(params, values){
    params[3].on_infinite_loop = true;
    if (params[2].stack_slots[0]){
        params[3].on_infinite_loop = true;
        params[2].stack_slots[0].chain_exec();
        var myVar = setTimeout(function(){while_exec(params)}, 500);
        return false;
    } else{
        params[3].on_infinite_loop = false;
        return true;
    }
}

function wait_exec(params){
    params[2].lower_block[0].chain_exec();
}

function wait(params, values){
    var myVar = setTimeout(function(){wait_exec(params)}, values[0][1]);
    return false;
}
