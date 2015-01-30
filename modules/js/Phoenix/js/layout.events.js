'use strict';
(function($l, $) {
	var _selected =  function($layout, layout) {
		$layout.on("click", function(event){
			var t = $(event.target), id = null;
			while(t) {
				var id = t.attr("data-layout");
				if (id) 
					break;
				t = (t == $layout) ? null :t.parent();
			}			
			if (id) {
				
			}
		});
	};
	$l.events = $l.events || {};
	$l.events.clickLayout = function($layout, layout) {
		_selected($layout, layout);
	};
 }(Phoenix,$));