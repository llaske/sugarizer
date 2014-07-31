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

function DockTracker(){
    this.dic = {};
    this.special_types = ["clampn", "clamp", "clamp_bool", "numbern", "basic_resize", "number1arg", "basic2arg"];

    this.add_dock("basic1arg", this.make_dock_descriptor([17, 1], [17, 43], [[115, 25, SQUARE_DOCK]], null));
    this.add_dock("box", this.make_dock_descriptor(null, null, [[17, 25, SQUARE_DOCK]], null));
    //this.add_dock("number1arg", this.make_dock_descriptor(null, null, [[17, 25, SQUARE_DOCK], [131, 25, SQUARE_DOCK]], null));
    this.add_dock("basic", this.make_dock_descriptor([17, 1], [17, 35], null, null));
    //this.add_dock("basic2arg", this.make_dock_descriptor([17, 1], [17, 85], [[115, 25, SQUARE_DOCK], [115, 67, SQUARE_DOCK]], null));
    this.add_dock("basic3arg", this.make_dock_descriptor([17, 1], [17, 127], [[115, 25, SQUARE_DOCK], [115, 67, SQUARE_DOCK], [115, 109, SQUARE_DOCK]], null));
    this.add_dock("bool2arg", this.make_dock_descriptor(null, null, [[0, 74, ROUND_DOCK], [103, 25, SQUARE_DOCK], [103, 67, SQUARE_DOCK]], null));
    this.add_dock("head", this.make_dock_descriptor(null, [17, 47], null, null));
    this.add_dock("head1arg", this.make_dock_descriptor(null, [17, 55], [[115, 37, SQUARE_DOCK]], null));
}

DockTracker.prototype = {
    constructor: DockTracker,
    add_dock: function(name, dock){
        this.dic[name] = dock;
    },
    get_dock: function(name){
        if (this.special_types.indexOf(name) > -1){
            if (name == "clampn"){
                return this.make_dock_descriptor([17, 1], [17, 99], [[133, 25, SQUARE_DOCK]], [[18, 42]]);
            } else if (name == "clamp"){
                return this.make_dock_descriptor([17, 1], [17, 90], null, [[18, 34]]);
            } else if (name == "clamp_bool"){
                return this.make_dock_descriptor([17, 1], [17, 123], [[56, 40, ROUND_DOCK]], [[18, 66]]);
	        } else if (name == "numbern"){
	            return this.make_dock_descriptor(null, null, [[17, 25, SQUARE_DOCK], [85, 25, SQUARE_DOCK], [85, 67, SQUARE_DOCK]], null);
	        } else if (name == "basic_resize"){
	            return this.make_dock_descriptor([18, 1], [18, 35], null, null);
	        } else if (name == "number1arg"){
	            return this.make_dock_descriptor(null, null, [[17, 25, SQUARE_DOCK], [131, 25, SQUARE_DOCK]], null);
	        } else if (name == "basic2arg"){
                return this.make_dock_descriptor([17, 1], [17, 85], [[115, 25, SQUARE_DOCK], [115, 67, SQUARE_DOCK]], null);
            }
        }
        return this.dic[name];
    },
    make_dock_descriptor: function(upper, lower, params, stack){
        var dock_descriptor = new DockDescriptor();

        if (upper != null){
            dock_descriptor.add_upper_dock(upper);
        }
        if (lower != null){
            dock_descriptor.add_lower_dock(lower);
        }
        if (params != null){
            for (var i=0; i<params.length; i++){
                dock_descriptor.add_param_dock(params[i]);
            }
        }
        if (stack != null){
            for (var i=0; i<stack.length; i++){
                dock_descriptor.add_stack_dock(stack[i]);
            }
        }

        return dock_descriptor;
    }
}
