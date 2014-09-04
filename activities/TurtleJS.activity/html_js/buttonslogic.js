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

var project_count = 1;

function documentReady() {
    
    $("#saved-image").attr("height", parseInt($(window).height() * 0.45));
    $("#saved-image").attr("width", parseInt($(window).width() * 0.45));
	
	$('#popupShowHelp').css('overflow-y', 'scroll');
    $('#popupShowCode').css('overflow-y', 'scroll');
	
    $('.card').click(function(){
        var id = $(this).find('img')[0];
        id = $(id).attr('id');
        
        var json_obj = JSON.parse(examples[id]);
        parseTAFile(json_obj, palette_tracker, block_tracker);
    });
    
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
        var func_blocks = block_tracker.get_func_blocks();
        
        for (var i = 0; i<func_blocks.length; i++){
            func_blocks[i].exec_block();
        }
        
        var starter_blocks = block_tracker.get_starter_blocks();
        var can_continue = true;
        //var start_blocks = [];
        
        for (var i=0; i<starter_blocks.length; i++){
            can_continue = starter_blocks[i].chain_exec();
            if (!can_continue || block_tracker.on_infinite_loop){
                break;
            }
        }
        check_block_visibility(true);
        draw_stage.draw_tracker.save_cache();
        draw_stage.draw_layer.draw();
        //draw_stage.draw_tracker.destroy_draw_objects();
        //center_scrollbars();
    });
    $("#clear-bt").click(function(){
        draw_stage.draw_tracker.clear_canvas();
        user_vars_tracker.clear();
        user_funcs_tracker.clear();
        block_tracker.on_infinite_loop = false;
    });
    $("#hideshow-bt").click(function(){
        check_block_visibility(false);
    });
    $("#open-bt").click(function(){
        $("#input-file").focus().click();
    });
    $("#save-bt").click(function(){
        var data = exportTAFile();
        var array = new Array();
        array[0] = data;
        var blob = new Blob(array, {type: "text/plain;charset=utf-8"});
        saveAs(blob, "project" + project_count + ".ta");
        project_count++;
    });
	$("#help-bt").click(function(){
    });
    
    function on_saved_image(data){
        $("#saved-image").attr("src", data);
        $("#saved-image").attr("height", parseInt($(window).height() * 0.45));
        $("#saved-image").attr("width", parseInt($(window).width() * 0.45));
    }
    
    $("#img-save-bt").click(function(){
        draw_stage.stage.toDataURL({callback: on_saved_image});
        //$("#saved-image").attr("src", data);
    });
	
	if (DEFAULT_LANG == 'en_US')
		document.getElementById("en-lang-bt").classList.add('active');
    $("#es-lang-bt").click(function(){
        i18n_tracker.change_language('es_ES');
		document.getElementById("es-lang-bt").classList.add('active');
		document.getElementById("en-lang-bt").classList.remove('active');
		document.getElementById("fr-lang-bt").classList.remove('active');
    });
    $("#en-lang-bt").click(function(){
        i18n_tracker.change_language('en_US');
		document.getElementById("es-lang-bt").classList.remove('active');
		document.getElementById("en-lang-bt").classList.add('active');		
		document.getElementById("fr-lang-bt").classList.remove('active');		
    });
    $("#fr-lang-bt").click(function(){
        i18n_tracker.change_language('fr_FR');
		document.getElementById("es-lang-bt").classList.remove('active');
		document.getElementById("en-lang-bt").classList.remove('active');	
		document.getElementById("fr-lang-bt").classList.add('active');	
    });	
    $("#stop-button").click(function(){
		var activity = require("sugar-web/activity/activity");
		var datastoreObject = activity.getDatastoreObject();
		var jsonData = JSON.stringify({blocks: exportTAFile(), i18n: DEFAULT_LANG});
		datastoreObject.setDataAsText(jsonData);
		datastoreObject.save(function() {});
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
    
    $(window).resize(function(){
        if (!MOBILE_VER){
            draw_stage.stage.height($(window).height() - 62);
            draw_stage.stage.width($(window).width() - 5);
            remove_scrolls();
            make_scrolls();
        } else{
            center_touch_bg();
        }
    });

    var check_block_visibility = function(caller){
        if (!block_tracker.are_blocks_visible() || caller){
            block_tracker.hide_blocks();
        }else{
            block_tracker.show_blocks();
        }
    };
    
    if (!MOBILE_VER){
        make_scrolls();
    } else{
        center_touch_bg();
    }
	
	$('#canvas').css('cursor', 'url(ta_icons/arrow.cur), auto');
	$('#main-toolbar').css('cursor', 'url(ta_icons/arrow.cur), auto');
	$('#basictb-bt').css('cursor', 'url(ta_icons/arrow.cur), auto');
	$('#pentb-bt').css('cursor', 'url(ta_icons/arrow.cur), auto');
	$('#colortb-bt').css('cursor', 'url(ta_icons/arrow.cur), auto');
	$('#numberstb-bt').css('cursor', 'url(ta_icons/arrow.cur), auto');
	$('#flowtb-bt').css('cursor', 'url(ta_icons/arrow.cur), auto');
	$('#blockstb-bt').css('cursor', 'url(ta_icons/arrow.cur), auto');
	$('#run-bt').css('cursor', 'url(ta_icons/arrow.cur), auto');
	$('#clear-bt').css('cursor', 'url(ta_icons/arrow.cur), auto');
	$('#hideshow-bt').css('cursor', 'url(ta_icons/arrow.cur), auto');
	$('#basictb-bt').css('cursor', 'url(ta_icons/arrow.cur), auto');
	$('#open-bt').css('cursor', 'url(ta_icons/arrow.cur), auto');
	$('#save-bt').css('cursor', 'url(ta_icons/arrow.cur), auto');
	$('#img-save-bt').css('cursor', 'url(ta_icons/arrow.cur), auto');
	$('#help-bt').css('cursor', 'url(ta_icons/arrow.cur), auto');
	$('#es-lang-bt').css('cursor', 'url(ta_icons/arrow.cur), auto');
	$('#en-lang-bt').css('cursor', 'url(ta_icons/arrow.cur), auto');
	$('#stop-button').css('cursor', 'url(ta_icons/arrow.cur), auto');
}
