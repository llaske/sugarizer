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

$(document).ready(function() {
    var count = 0;
    
    $("#basictb-bt").click(function(){
        if (basic1.is_visible()){
            basic1.hide();
        }else{
            palette_tracker.show_palette(basic1);
        }
    });
    $("#pentb-bt").click(function(){
        if (pen_palette.is_visible()){
            pen_palette.hide();
        }else{
            palette_tracker.show_palette(pen_palette);
        }
    });
    $("#colortb-bt").click(function(){
        if (colors_palette.is_visible()){
            colors_palette.hide();
        }else{
            palette_tracker.show_palette(colors_palette);
        }
    });
    $("#flowtb-bt").click(function(){
        if (flow_palette.is_visible()){
            flow_palette.hide();
        }else{
            palette_tracker.show_palette(flow_palette);
        }
    });
    $("#blockstb-bt").click(function(){
        if (blocks_palette.is_visible()){
            blocks_palette.hide();
        }else{
            palette_tracker.show_palette(blocks_palette);
        }
    });
    $("#numberstb-bt").click(function(){
        if (numbers_palette.is_visible()){
            numbers_palette.hide();
        }else{
            palette_tracker.show_palette(numbers_palette);
        }
    });
    $("#run-bt").click(function(){
        var starter_blocks = block_tracker.get_starter_blocks();
        var can_continue = true;
        for (var i=0; i<starter_blocks.length; i++){
            can_continue = starter_blocks[i].chain_exec();
            if (!can_continue || block_tracker.on_infinite_loop){
                break;
            }
        }
        check_block_visibility(true);
        draw_stage.draw_tracker.save_cache();
        draw_stage.draw_layer.draw();
    });
    $("#clear-bt").click(function(){
        draw_stage.draw_tracker.clear_canvas();
        user_vars_tracker.clear();
        block_tracker.on_infinite_loop = false;
    });
    $("#hideshow-bt").click(function(){
        check_block_visibility(false);
    });
    $("#open-bt").click(function(){
        $("#input-file").focus().click();
    });
    $("#save-bt").click(function(){
    });
    $("#es-lang-bt").click(function(){
        i18n_tracker.change_language('es_ES');
    });
    $("#en-lang-bt").click(function(){
        i18n_tracker.change_language('en_US');
    });
    $("#stop-button").click(function(){
    });
    $("#input-file").change(function(evt){
        onFileSelect(evt, palette_tracker, block_tracker);
    });
    
    $("#canvas").scrollTop(1000 - ($(window).height()/2) + 25);
    $("#canvas").scrollLeft(1000 - ($(window).width()/2));

    error_message_displayer.repos();
    
    $("#canvas").scroll(function(){
        var pal = palette_tracker.get_visible_palette();
        
        if (pal != null){
            pal.container.repos();
        }
        error_message_displayer.repos();
        //console.log($("#canvas").scrollTop(0));
    });
    
    $("#canvas").click(function(){
        if ($("#text_input").is(":visible")){
            count++;
            if (count == 2){
                $("#text_input").remove();
                count = 0;
            }
        }
    });

    var check_block_visibility = function(caller){
        if (!block_tracker.are_blocks_visible() || caller){
            block_tracker.hide_blocks();
        }else{
            block_tracker.show_blocks();
        }
    };
});
