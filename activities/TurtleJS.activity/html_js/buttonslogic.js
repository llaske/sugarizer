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
    });
    $("#clear-bt").click(function(){
        draw_stage.draw_tracker.clear_canvas();
        block_tracker.on_infinite_loop = false;
    });
    $("#hideshow-bt").click(function(){
        if (!block_tracker.are_blocks_visible()){
            block_tracker.hide_blocks();
        }else{
            block_tracker.show_blocks();
        }
    });
    $("#open-bt").click(function(){
        $("#input-file").focus().click();
    });
    $("#save-bt").click(function(){
    });
	$("#stop-button").click(function(){
	});
    $("#input-file").change(function(evt){
        onFileSelect(evt, palette_tracker, block_tracker);
    });
});
