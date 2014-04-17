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

function DockDescriptor(){
    this.upper_dock = [];
    this.lower_dock = [];
    this.param_dock = [];
    this.stack_dock = [];
}

DockDescriptor.prototype = {
    constructor: DockDescriptor,
    add_upper_dock: function(point){
        this.upper_dock.push(point);
    },
    add_lower_dock: function(point){
        this.lower_dock.push(point);
    },
    add_param_dock: function(point){
        this.param_dock.push(point);
    },
    add_stack_dock: function(point){
        this.stack_dock.push(point);
    },
    has_upper_dock: function(){
        if (this.upper_dock.length > 0){
            return true;
        }else{
            return false;
        }
    },
    has_lower_dock: function(){
        if (this.lower_dock.length > 0){
            return true;
        }else{
            return false;
        }
    },
    has_param_dock: function(){
        if (this.param_dock.length > 0){
            return true;
        }else{
            return false;
        }
    },
    has_stack_dock: function(){
        if (this.stack_dock.length > 0){
            return true;
        }else{
            return false;
        }
    },
    get_upper_dock: function(){
        return this.upper_dock[0];
    },
    get_lower_dock: function(){
        return this.lower_dock[0];
    },
    has_giving_param: function(){
        var result = false;
        for (var i=0; i<this.param_dock.length; i++){
            if (this.param_dock[i][0] < 50){
                result = true;
                break;
            }
        }
        return result;
    },
    get_giving_point: function(){
        var point = null;
        for (var i=0; i<this.param_dock.length; i++){
            if (this.param_dock[i][0] < 50){
                point = this.param_dock[i];
                break;
            }
        }
        return point;
    },
    has_receiver_param: function(){
        var result = false;
        for (var i=0; i<this.param_dock.length; i++){
            if (this.param_dock[i][0] > 50){
                result = true;
                break;
            }
        }
        return result;
    },
    get_receiver_points: function(){
        var point_array = [];
        for (var i=0; i<this.param_dock.length; i++){
            if (this.param_dock[i][0] > 50){
                point_array.push(this.param_dock[i]);
            }
        }
        return point_array;
    },
    get_stack_points: function(){
        return this.stack_dock;
    }
}
