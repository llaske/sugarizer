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
    this.error_messages = {};
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
    add_error_message: function(lang, id, text){
        if (!this.error_messages[id]){
            this.error_messages[id] = {};
        }
        this.error_messages[id][lang] = text;
    },
    get_labels: function(block_name, lang, type){
        if (this.words[block_name][lang] != null){
            return this.words[block_name][lang][type];
        } else{
            return this.words[block_name]['en_US'][type];
        }
    },
    get_err_msg: function(lang, id, params){
        var error_message;

        if (this.error_messages[id][lang] != null){
            error_message = this.error_messages[id][lang];
        } else{
            error_message = this.error_messages[id]['en_US'];
        }
        
        var block_keys = Object.keys(this.words);
        
        for (var i=0; i<params.length; i++){
            var block_name = params[i];
            
            if (block_keys.indexOf(params[i]) != -1){
                block_name = this.words[params[i]][lang][FACTORY_SIDE][0][0];
            }
            error_message = error_message.replace("{" + i + "}", block_name);
        }
        return error_message;
    },
    change_language: function(lang){
        if (DEFAULT_LANG != lang){
            DEFAULT_LANG = lang;
            this.change_palette_labels();
            this.change_block_labels();
        }
    },
    change_palette_labels: function(){
        var palettes = palette_tracker.get_palettes();
        for (var i=0; i<palettes.length; i++){
            var factories = palettes[i].container.get_factories();
            var keys = [];
            var descriptors = palettes[i].pal_desc.descriptors;
            var descriptor_keys = [];
            
            for (var key in factories){
                if (factories.hasOwnProperty(key)){
                    keys.push(key);
                }
            }

            for (var key in descriptors){
                if (descriptors.hasOwnProperty(key)){
                    descriptor_keys.push(key);
                }
            }

            for (var key in factories){
                this.change_factory_labels(factories[key]);
            }
            
            for (var i2=0; i2<descriptor_keys.length; i2++){
                var descriptor = descriptors[descriptor_keys[i2]];
                descriptor.delete_all_labels();
                descriptor.add_labels(descriptor.block_name, DEFAULT_LANG, FACTORY_SIDE);
            }
        }
        draw_stage.palette_layer.draw();
    },
    change_factory_labels: function(factory){
        factory.sprite.delete_all_labels();
        factory.sprite.set_labels(this.get_labels(factory.block_name, DEFAULT_LANG, BLOCK_SIDE));
    },
    change_block_labels: function(){
        var blocks = block_tracker.get_blocks();
        var box_types = ['box_block', 'number', 'text_block'];
        
        for (var i=0; i<blocks.length; i++){
            var block = blocks[i];
            if (box_types.indexOf(block.block_type) == -1){
                block.sprite.delete_all_labels();
                block.sprite.set_labels(this.get_labels(block.block_type, DEFAULT_LANG, BLOCK_SIDE));
            }
        }
    }
}

var i18n_tracker = new I18n();
