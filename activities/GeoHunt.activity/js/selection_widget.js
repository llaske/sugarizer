var SelectionWidget = function(opts,choices){

    var selection_choices   = choices || [];
    var widget_element      = null;
    var subscribees         = [];

    var active_div          = null;
    var active_div__span    = null;
    var active_div__arrow   = null;
    var choices_div         = null;

    var choices_div__is_shown = null;

    function notify_subscribees(){
        subscribees.forEach(function(subscribee){ subscribee(active_div__span.innerText); });
    }

    function set___active_div__span(active, dispatch){
        active_div__span.innerText = active;
        if(dispatch != false ) notify_subscribees();
    }

    function toggle_active_div(){

        if(!choices_div__is_shown)
            choices_div.className = "choices is-shown";
        else
            choices_div.className = "choices";

        // toggle state
        choices_div__is_shown = !choices_div__is_shown;
    }

    function choices_option__click_handler(){
        set___active_div__span(this.innerText);
        toggle_active_div();
    }

    // API
    return {
        subscribe: function(subscribee){ subscribees.push(subscribee); },
		
		get_selected: function(){
			return active_div__span.innerText;
		},

        render: function(){
            if(widget_element) return widget_element;
			
            widget_element              = document.createElement('div');
            widget_element.className    = "selection_widget";
			widget_element.id			= opts['id'];
			
            active_div              = document.createElement('div');
            active_div.className    = 'active';

            active_div.onclick      = toggle_active_div;

            active_div__span    = document.createElement('span');
            set___active_div__span(selection_choices[0], false);

            active_div__arrow       = document.createElement('img');
            active_div__arrow.src   = opts['arrow_img'];

            active_div.appendChild(active_div__span);
            active_div.appendChild(active_div__arrow);

            choices_div             = document.createElement('div');
            choices_div.className   = "choices";

            selection_choices.forEach(function(option_text){
                var option          = document.createElement('div');
                option.className    = 'option';
                option.innerText    = option_text;
                option.onclick      = choices_option__click_handler;

                choices_div.appendChild(option);
            });

            widget_element.appendChild(active_div);
            widget_element.appendChild(choices_div);

            return widget_element;
        }
    };
};
