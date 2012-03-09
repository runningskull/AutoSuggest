 /*
 *  tokenInput - by Juan Patten (@runningskull, https://github.com/runningskull/)
 *
 * this plugin is forked from 
 * Drew Wilson's AutoSuggest (https://github.com/drewwilson/autosuggest)
 */

(function($){
	$.fn.tokenInput = function(options) {
		var defaults = { 
			asHtmlID: false,
			selectedItemProp: "value", //name of object property
			selectedValuesProp: "value", //name of object property
		  	start: function(){},
		  	selectionClick: function(elem){},
		  	selectionAdded: function(elem){},
		  	selectionRemoved: function(elem){ elem.remove(); },
	  	}

	 	,   opts = $.extend(defaults, options);	 	
		
        return this.each(function(x){
            var x_id

            if(!opts.asHtmlID){
                x = x+""+Math.floor(Math.random()*100); //this ensures there will be unique IDs on the page if autoSuggest() is called multiple times
                x_id = "as-input-"+x;
            } else {
                x = opts.asHtmlID;
                x_id = x;
            }

            var input = $(this)
            ,   input_focus = false
            
            // "start" event
            opts.start.call(this);

            input
                .attr("autocomplete","off")
                .addClass("as-input")
                .attr("id",x_id)
            
            // Setup basic elements and render them to the DOM
            input
                .wrap('<ul class="as-selections" id="as-selections-'+x+'"></ul>')
                .wrap('<li class="as-original" id="as-original-'+x+'"></li>');

            var selections_holder = $("#as-selections-"+x)
            ,   org_li = $("#as-original-"+x)
            ,   results_holder = $('<div class="as-results" id="as-results-'+x+'"></div>').hide()
            ,   results_ul =  $('<ul class="as-list"></ul>')
            ,   values_input = $('<input type="hidden" class="as-values" name="as_values_'+x+'" id="as-values-'+x+'" />')

            input.after(values_input);
            selections_holder.click(function(){
                input_focus = true;
                input.focus();
            }).mousedown(function(){ input_focus = false; }).after(results_holder);	

            var timeout = null
            ,   prev = ""
            ,   totalSelections = 0
            ,   tab_press = false
            
            // Handle input field events
            input
                .focus(function(){			
                    if(input_focus){
                        $("li.as-selection-item", selections_holder).removeClass("blur");
                        if($(this).val() != ""){
                            results_ul.css("width",selections_holder.outerWidth());
                            results_holder.show();
                        }
                    }
                    input_focus = true;
                    return true;
                })
            
                .blur(function(){
                    if(input_focus){
                        $("li.as-selection-item", selections_holder).addClass("blur").removeClass("selected");
                        results_holder.hide();
                    }				
                })
            
                .keydown(function(e) {
                    // track last key pressed
                    lastKeyPressCode = e.keyCode;
                    first_focus = false;
                    switch(e.keyCode) {
                        case 8:  // delete
                            if(input.val() == ""){							
                                var last = values_input.val().split(",");
                                last = last[last.length - 2];
                                selections_holder.children().not(org_li.prev()).removeClass("selected");
                                if(org_li.prev().hasClass("selected")){
                                    values_input.val(values_input.val().replace(","+last+",",","));
                                    opts.selectionRemoved.call(this, org_li.prev());
                                } else {
                                    opts.selectionClick.call(this, org_li.prev());
                                    org_li.prev().addClass("selected");		
                                }
                            }
                            if(input.val().length == 1){
                                results_holder.hide();
                                 prev = "";
                            }
                            break;
                        case 9: case 188:  // tab or comma
                            tab_press = true;
                            var i_input = input.val().replace(/(,)/g, "");
                            if(i_input != "" && values_input.val().search(","+i_input+",") < 0){	
                                e.preventDefault();
                                var n_data = {};
                                n_data[opts.selectedItemProp] = i_input;
                                n_data[opts.selectedValuesProp] = i_input;																				
                                var lis = $("li", selections_holder).length;
                                add_selected_item(n_data, "00"+(lis+1));
                                input.val("");
                            }
                            break;
                    }
                })
            
            function add_selected_item(data, num){
                values_input.val(values_input.val()+data[opts.selectedValuesProp]+",");
                var item = $('<li class="as-selection-item" id="as-selection-'+num+'"></li>').click(function(){
                        opts.selectionClick.call(this, $(this));
                        selections_holder.children().removeClass("selected");
                        $(this).addClass("selected");
                    }).mousedown(function(){ input_focus = false; });
                var close = $('<a class="as-close">&times;</a>').click(function(){
                        values_input.val(values_input.val().replace(","+data[opts.selectedValuesProp]+",",","));
                        opts.selectionRemoved.call(this, item);
                        input_focus = true;
                        input.focus();
                        return false;
                    });
                org_li.before(item.html(data[opts.selectedItemProp]).prepend(close));
                opts.selectionAdded.call(this, org_li.prev());	
            }
        });
	}
})(jQuery);  	
