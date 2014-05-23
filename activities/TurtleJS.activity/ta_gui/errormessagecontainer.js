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

function ErrorMessage(startpos, layer){
    this.layer = layer;
    this.rect = new Kinetic.Rect({
        x: 0,
        y: 0,
        width: 550,
        height: 40,
        fill: 'green',
        stroke: 'black',
        cornerRadius: 14,
        strokeWidth: 1
    });
    this.img = null;
    this.mess = "";
    this.visible = false;
    this.label = new Kinetic.Text({
            x: 10,
            y: 10,
            text: this.mess,
            fontSize: 23,
            fontFamily: 'Calibri',
            fill: 'black'
    });
    this.group = new Kinetic.Group({
        draggable: false
    });

    this.group.add(this.rect);
    this.group.add(this.label);

    var imageObj = new Image();
    var parent = this;
    imageObj.onload = parent.close_on_load(parent, imageObj);
    imageObj.src = "ta_icons/no.png";
}

ErrorMessage.prototype = {
    constructor: ErrorMessage,
    repos: function(){
        this.group.setX($("#canvas").scrollLeft() + 20);
        this.group.setY($("#canvas").scrollTop() + $(window).height() - 130);
    },
    close_on_load: function(parent, imageObj){
        var img = new Kinetic.Image({
            image: imageObj,
            width: imageObj.width,
            height: imageObj.height,
        });

        img.on('click', function(){
            parent.hide();
        });

        parent.img = img;
        parent.group.add(img);
        img.setX(520);
        img.setY(12);
        //parent.layer.add(parent.group);
    },
    show_error: function(error){
        this.label.setText(error);
        this.show();
    },
    show: function(){
        if (!this.visible){
            this.layer.add(this.group);
            this.visible = true;
        }
    },
    hide: function(){
        if (this.visible){
            this.group.remove();
            this.visible = false;
        }
    },
    is_visible: function(){
        return this.visible;
    }
}
