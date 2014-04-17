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

function I18n(){
    this.words = {};
}

I18n.prototype = {
    constructor: I18n,
    add_label: function(block_name, lang, type, properties){
        if(!this.words[block_name]){
            this.words[block_name] = {};
        }
        if (!this.words[block_name][lang]){
            this.words[block_name][lang] = {};
        }
        for(var i=0; i<type.length; i++){
           if (!this.words[block_name][lang][type[i]]){
               this.words[block_name][lang][type[i]] = [];
           }
           this.words[block_name][lang][type[i]].push(properties);
        }
    },
    get_labels: function(block_name, lang, type){
        return this.words[block_name][lang][type];
    }
}

var i18n_tracker = new I18n();
