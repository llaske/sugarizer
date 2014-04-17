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

function BlockImageTracker(){
    this.dic = {};
    this.add_resource('basic1arg', [NA_ARRANGE, 'block_res/basic1arg.svg']);
    this.add_resource('box2', [HORIZ_ARRANGE, 'block_res/box-left.svg', 'block_res/box-center.svg', 'block_res/box-right.svg']);
    this.add_resource('basic', [NA_ARRANGE, 'block_res/basic.svg']);
    this.add_resource('basic2arg', [NA_ARRANGE, 'block_res/basic2arg.svg']);
    this.add_resource('box', [NA_ARRANGE, 'block_res/box.svg']);
    this.add_resource('compare', [NA_ARRANGE, 'block_res/compare.svg']);
    this.add_resource('clampn', [VERT_ARRANGE, 'block_res/repeat-top.svg', 'block_res/clamp-filler.svg', 'block_res/clamp-bottom.svg']);
    this.add_resource('clamp', [VERT_ARRANGE, 'block_res/clamp-top.svg', 'block_res/clamp-filler.svg', 'block_res/clamp-bottom.svg']);
    this.add_resource('clampb', [VERT_ARRANGE, 'block_res/clampboolean.svg', 'block_res/clamp-filler.svg', 'block_res/clamp-bottom.svg']);
    this.add_resource('numbern', [NA_ARRANGE, 'block_res/numbern.svg']);
}

BlockImageTracker.prototype = {
    constructor: BlockImageTracker,
    add_resource: function(name, properties){
        this.dic[name] = properties;
    },
    get_resource: function(name){
        return this.dic[name];
    }
}
