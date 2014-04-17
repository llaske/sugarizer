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

function DrawTracker(layer, turtle){
    this.lines = [];
    this.shapes = [];
    this.labels = [];
    this.pen_down = true;
    this.pen_size = 3;
    this.stroke_line = 'red';
    this.layer = layer;
    this.turtle = turtle;
    this.points = [];
    this.points.push(turtle.get_xy()[0]);
    this.points.push(turtle.get_xy()[1]);
    this.make_base_line();
}

DrawTracker.prototype = {
    constructor: DrawTracker,
    add_point: function(point){
        if (this.pen_down){
            this.points.push(point[0]);
            this.points.push(point[1]);
            this.line.setPoints(this.points);
        }else{
            this.lines.push(this.line);
            this.points = [this.turtle.get_xy()[0], this.turtle.get_xy()[1]];
            this.make_base_line();
        }
    },
    clear_canvas: function(){
        this.turtle.reset_pos();
        for (var i=0; i<this.lines.length; i++){
            this.lines[i].remove();
        }
        for (var i=0; i<this.shapes.length; i++){
            this.shapes[i].remove();
        }
        for (var i=0; i<this.labels.length; i++){
            this.labels[i].remove();
        }
        this.line.remove();
        this.lines = [];
        this.shapes = [];
        this.labels = [];
        this.points = [this.turtle.get_xy()[0], this.turtle.get_xy()[1]];
        this.make_base_line();
    },
    check_repos: function(){
        if (this.points.length == 2){
            this.points[0] = this.turtle.get_xy()[0];
            this.points[1] = this.turtle.get_xy()[1];
        }else{
            this.end_line();
        }
    },
    pen_up: function(){
        this.pen_down = false;
    },
    pen_down_action: function(){
        this.pen_down = true;
    },
    make_base_line: function(){
        this.line = new Kinetic.Line({
            points: this.points,
            strokeWidth: this.pen_size,
            lineCap: 'round',
            lineJoin: 'round',
            stroke: this.stroke_line
        });
        //this.line.opacity(1.0);
        this.layer.add(this.line);
    },
    set_pen_size: function(value){
        if (this.pen_size != value){
            this.pen_size = value;
            this.lines.push(this.line);
            this.points = [this.turtle.get_xy()[0], this.turtle.get_xy()[1]];
            this.make_base_line();
        }
    },
    set_pen_color: function(value){
        if (this.stroke_line != value){
            this.stroke_line = value;
            this.lines.push(this.line);
            this.points = [this.turtle.get_xy()[0], this.turtle.get_xy()[1]];
            this.make_base_line();
        }
    },
    add_shape: function(shape){
        this.shapes.push(shape);
        this.end_line();
    },
    add_label: function(str, turtle){
        var pos = turtle.get_xy();
        var lbl = new Kinetic.Text({
            x: pos[0] + 27,
            y: pos[1],
            text: str,
            fontSize: 19,
            fontFamily: 'Calibri',
            fill: this.stroke_line
        });
        this.labels.push(lbl);
        this.layer.add(lbl);
    },
    end_line: function(){
        if (this.points.length > 2){
            this.lines.push(this.line);
        }
        this.points = [this.turtle.get_xy()[0], this.turtle.get_xy()[1]];
        this.make_base_line();
    }
}
