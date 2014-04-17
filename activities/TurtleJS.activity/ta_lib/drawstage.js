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
    this.anim = null;
    this.turtle = null;
    this.draw_tracker = null;
    this.bg = null;
    this.init_stage();
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
        this.stage.add(this.layer);
        this.anim = new Kinetic.Animation(function(frame) {}, this.layer);
        this.anim.start();
        this.bg = new Kinetic.Rect({
            x: 0,
            y: 0,
            width: this.width,
            height: this.height,
            fill: 'white'
        });
        this.layer.add(this.bg);
        this.turtle = new Turtle([this.width/2, this.height/2], this.layer);
        this.draw_tracker = new DrawTracker(this.layer, this.turtle);
        this.turtle.draw_tracker = this.draw_tracker;
        //this.stage.setSize(this.width, 1000);
        //window.scroll(500, 500);
    }
}
