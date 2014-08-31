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

function DrawStage(container, width, height){
    this.container = container;
    this.width = width;
    this.height = height;
    this.stage = null;
    this.layer = null;
    this.draw_layer;
    this.anim = null;
    this.draw_anim = null;
    this.turtle = null;
    this.draw_tracker = null;
    this.bg = null;
    this.init_stage();
    
    this.drag_start = [0, 0];
    this.drag_current = [0, 0];
}

DrawStage.prototype = {
    constructor: DrawStage,
    init_stage: function(){
        this.stage = new Kinetic.Stage({
            container: this.container,
            width: this.width,
            height: this.height
        });

        this.layer = new Kinetic.Layer();
        this.draw_layer = new Kinetic.Layer({draggable: MOBILE_VER});
        this.palette_layer = new Kinetic.Layer();
        this.block_layer = new Kinetic.Layer();
        this.scroll_layer = new Kinetic.Layer();
        
        var parent = this;
        
        if (MOBILE_VER){
            this.draw_layer.on('dragstart', function(){
                parent.drag_start[0] = parent.stage.getPointerPosition().x;
                parent.drag_start[1] = parent.stage.getPointerPosition().y;
            });
            
            this.draw_layer.on('dragmove', function(){
                parent.drag_current[0] = parent.stage.getPointerPosition().x;
                parent.drag_current[1] = parent.stage.getPointerPosition().y;
                parent.dragBound(parent);
                parent.drag_start[0] = parent.drag_current[0];
                parent.drag_start[1] = parent.drag_current[1];
            });
        }

        this.bg = new Kinetic.Rect({
            x: 0,
            y: 0,
            width: 2000,
            height: 2000,
            fill: '#FFF8DE'
        });
        this.draw_layer.add(this.bg);

        this.anim = new Kinetic.Animation(function(frame) {}, this.layer);
        this.anim.start();
        
        this.anim_movement = new Kinetic.Animation(function(frame) {}, this.block_layer);
        this.anim_movement.start();
        
        this.anim_scroll = new Kinetic.Animation(function(frame) {}, this.scroll_layer);
        this.anim_scroll.start();
        
        this.stage.add(this.draw_layer).add(this.layer).add(this.palette_layer).add(this.block_layer).add(this.scroll_layer);

        this.turtle = new Turtle([this.bg.width()/2, this.bg.height()/2], this.layer);
        this.draw_tracker = new DrawTracker(this.draw_layer, this.turtle);
        this.draw_tracker.bg_obj = this.bg;
        this.turtle.draw_tracker = this.draw_tracker;
        //this.stage.setSize(this.width, 1000);
        //window.scroll(500, 500);
    },
    dragBound: function(parent){
        var x_distance = parent.drag_current[0] - parent.drag_start[0];
        var y_distance = parent.drag_current[1] - parent.drag_start[1];
        
        var x_pos = parent.draw_layer.x();
        var y_pos = parent.draw_layer.y();
        
        if ((x_distance > 0) && ((x_pos - x_distance) > 0)){
            x_pos = 0;
        } else{
            x_pos = x_pos - x_distance;
        }
        
        if ((y_distance > 0) && ((y_pos - y_distance) > 0)){
            y_pos = 0;
        } else{
            y_pos = y_pos - y_distance;
        }
        
        if ((x_pos + 2000) < ($(window).width() - 5)){
            x_pos = $(window).width() - 2000 - 2;
        }
        
        if ((y_pos + 2000) < ($(window).height() - 62)){
            y_pos = $(window).height() - 62 - 2000;
        }
        
        console.log("pos: " + x_pos + " " + y_pos);
        parent.draw_layer.x(x_pos);
        parent.draw_layer.y(y_pos);
        
        parent.layer.x(x_pos);
        parent.layer.y(y_pos);
        
        parent.block_layer.x(x_pos);
        parent.block_layer.y(y_pos);
    },
    redraw_layers: function(){
        this.draw_layer.draw();
        this.layer.batchDraw();
        this.palette_layer.draw();
        this.block_layer.draw();
        this.scroll_layer.draw();
    }
}
