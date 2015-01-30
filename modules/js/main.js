$(function() {
	var layout = {
		"$items": [
			{"$items": [{"$items": []}, {"$items": [{"$type":"row", "$items": [{"$items": []}, {"$items": []}]}]}]},
			{"$type":"row", "$items": [{"$items": []}, {"$items": []}, {"$items": []}]},
			{"$items": []}, 
			{"$items": []}
			
		]
	};
	var cl = new Phoenix.ui.Layout(layout);
	cl.render($('#yyy'));
});

