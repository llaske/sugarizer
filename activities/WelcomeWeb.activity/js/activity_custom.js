var setUpdateTime;

requirejs(["../lib/settingspalette"], function(settingspalette) {
    
    var selected_topic = 0; //The topic actually displayed
    var selected_slide = 1; // The slide actually displayed
    var update_time = 1000; // The time between each slide change in ms

    var topics = [
        "Init-",
        "1-PrenderPesonalizar-",
        "2-ElFrame-",
        "3-LasVistas-",
        "4-AbrirCerrar-",
        "5-Journal-",
        "6-ApagarXO-"
    ];

    var topics_sizes = [1, 11, 9, 4, 8, 6, 5]; // Number of slides in each topic

    function previous(){ //Goes back to the previous slide
        if (selected_topic > 0){
        selected_topic--;
        selected_slide = 1;
        setDots();
        }
    }

    function next(){ //Goes to the next slide
        if (selected_topic < topics.length)
        {
        selected_topic++;
        selected_slide = 1;
        setDots();
        }
    }

    function change_topic(div){ //Called by the onclick on the dots. Changes the topic according to the clicked dot
        var id = parseInt(div.id[div.id.length - 1])
        selected_topic = id;
        selected_slide = 1;
        display_slide();
    }

    function setDots(){ //Displays the dots according to the topic currently displayed
        var html_content = "";
        for (var i = 0; i < topics.length; i++){
        if (i == selected_topic)
            html_content += "<div id='select_" + i + "' class='current' onclick='change_topic(this)'></div>  ";
        else
            html_content += "<div id='select_" + i + "' class='current-no' onclick='change_topic(this)'></div>  ";
        }
        $("#points").empty();
        $("#points").html(html_content);
    }

    function display_slide(){//Displays the actual slide
        $("#help").remove();
        var html_content = "<img id='help' src='images/" + selected_topic + "/" + topics[selected_topic] + selected_slide + ".gif'>";
        setDots();
        $("#here").after(html_content);
    }

    setUpdateTime = function() {
        var plaintime = $("#delaytime").val();
        var time = plaintime*1000;
        if(time < 100) {
            time = 100;
            $("#delaytime").val(0.1);
        }
        if(time > 10000) {
            time = 10000;
            $("#delaytime").val(10);
        }
        document.getElementById("delaytime").title = plaintime + " s";
        update_time = time;
        update();
    }

    function setUpPalette() {
        settingspalette = new settingspalette.SettingsPalette(document.getElementById("settings-button"), undefined);
    }

    function update(){ //Displays the actual slide and switches to the next slide
        display_slide();
        if (selected_slide >= topics_sizes[selected_topic]){
        selected_slide = 1;
        selected_topic++;
        }
        else
        selected_slide++;
        if (selected_topic >= topics.length){
        selected_topic = 0;
        selected_slide = 1;
        }
        clearTimeout(id);
        id = setTimeout(update, update_time);
    }

    $(document).ready(function() {
        $("#delaytime").val(update_time/1000);
        $("#unfullscreen").hide();
        $("#prev-bt").click(previous);
        $("#next-bt").click(next);
        $("#apply-bt").click(setUpdateTime);
        $("#fullscreen").click(function() {
        $(".toolbar").fadeIn('slow');
        $("#canvas").css('top', '0px');
        $("#unfullscreen").show();
        });
        setUpPalette();
        $("#unfullscreen").click(function() {
        $(".toolbar").show()
        $("#canvas").css('top', '55px');
        $("#unfullscreen").hide();
        }); 
    });

    var id = setTimeout(update, update_time);
});