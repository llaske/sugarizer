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

function PaletteTracker(){
    this.palettes = [];
    this.id = 0;
    this.hide = false;
}

PaletteTracker.prototype = {
    constructor: PaletteTracker,
    add_palette: function(palette){
        this.palettes.push(palette);
    },
    get_visible_palette: function(){
        var palette = null;
        for (var i=0; i<this.palettes.length; i++){
            if (this.palettes[i].is_visible()){
                palette = this.palettes[i];
            }
        }
        return palette;
    },
    show_palette: function(palette){
        var visible_palette = this.get_visible_palette();
        if (visible_palette != null){
            visible_palette.hide();
        }
        palette.show();
    },
    search_factory: function(name){
        var factory = null;
        for (var i=0; i<this.palettes.length; i++){
            factory = this.palettes[i].container.get_factory(name);
            if (factory != null){
                break;
            }
        }
        return factory;
    },
    get_palettes: function(){
        return this.palettes;
    },
    hide_visible_palette: function(){
        var visible_palette = this.get_visible_palette();
        if (visible_palette != null){
            visible_palette.hide();
        }
    }
}
