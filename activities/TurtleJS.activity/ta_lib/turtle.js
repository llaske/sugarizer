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

function Turtle(startpos, layer){
    this.layer = layer;
    this.img = new Sprite([NA_ARRANGE, 'turtle.png'], layer, false, true, this.turtle_drag, this);
    this.img.group.setX(startpos[0]);
    this.img.group.setY(startpos[1]);
    this.img.group.offsetX(27);
    this.img.group.offsetY(27);
    this.rotation = 0;
    this.start_pos = startpos;
    this.draw_tracker = null;
}

Turtle.prototype = {
    constructor: Turtle,
    move: function(pos){
        var coord = [0, 0];
        if (this.rotation == 0){
            coord[1] = -pos;
        }else if (Math.abs(this.rotation) == 90){
            coord[0] = pos;
        }else if (Math.abs(this.rotation) == 180){
            coord[1] = pos;
        }else if (Math.abs(this.rotation) == 270){
            coord[0] = -pos;
        }else{
            var h = pos;
            var o = 0;
            var a = 0;
            var ang = 0;
            var sign = +1;

            if (pos < 0){
                h = Math.abs(pos);
                sign = -1;
            }

            if (this.rotation > 0 && this.rotation < 90){
                ang = 90 - this.rotation;
            }else if (this.rotation > 90 && this.rotation < 180){
                ang = 180 - this.rotation;
            }else if (this.rotation > 180 && this.rotation < 270){
                ang = 270 - this.rotation;
            }else if (this.rotation > 270 && this.rotation < 360){
                ang = this.rotation - 270;
            }
            ang = (ang * Math.PI) / 180;
            o = Math.round(Math.sin(ang) * h);
            a = Math.round(Math.cos(ang) * h);
            if (this.rotation > 0 && this.rotation < 90){
                coord[0] = a * sign;
                coord[1] = -o * sign;
            }else if (this.rotation > 90 && this.rotation < 180){
                coord[0] = o * sign;
                coord[1] = a * sign;
            }else if (this.rotation > 180 && this.rotation < 270){
                coord[0] = -a * sign;
                coord[1] = o * sign;
            }else if (this.rotation > 270 && this.rotation < 360){
                coord[0] = -a * sign;
                coord[1] = -o * sign;
            }
        }
        this.img.move_relative(coord);
        this.bring_front();
        
        var x = this.get_xy()[0];
        var y = this.get_xy()[1];
        
        this.on_turtle_move();
    },
    rotate: function(degrees){
        this.img.group.rotateDeg(degrees);
        if (this.rotation == 0 && degrees < 0){
            this.rotation = 360 + degrees;
        }else{
            this.rotation += degrees;
        }
        if (this.rotation < 0){
            this.rotation = 360 + this.rotation;
        }
        if (Math.abs(this.rotation) >= 360){
            if (this.rotation < 0){
                this.rotation += 360;
            }else{
                this.rotation -= 360;
            }
        }
        this.bring_front();
    },
    get_xy: function(){
        return this.img.get_xy();
    },
    bring_front: function(){
        this.img.group.moveToTop();
    },
    reset_pos: function(){
        this.set_xy(this.start_pos);
        this.reset_rotation();
    },
    turtle_drag: function(turtle){
        //alert(turtle.draw_tracker);
        turtle.draw_tracker.check_repos();
    },
    set_xy: function(pos){
        this.img.group.setX(pos[0]);
        this.img.group.setY(pos[1]);
        this.on_turtle_move();
    },
    reset_rotation: function(){
        this.img.group.rotateDeg(360 - this.rotation);
        this.rotation = 0;
    },
    on_turtle_move: function(){
        var x = this.get_xy()[0];
        var y = this.get_xy()[1];
        
        //console.log("turtle x: " + x + " turtle y: " + y);
        
        if (x < draw_stage.draw_tracker.min_x_cache){
            draw_stage.draw_tracker.min_x_cache = x;
        }
        if (x > draw_stage.draw_tracker.max_x_cache){
            draw_stage.draw_tracker.max_x_cache = x;
        }
        
        if (y < draw_stage.draw_tracker.min_y_cache){
            draw_stage.draw_tracker.min_y_cache = y;
        }
        if (y > draw_stage.draw_tracker.max_y_cache){
            draw_stage.draw_tracker.max_y_cache = y;
        }
    }
}
