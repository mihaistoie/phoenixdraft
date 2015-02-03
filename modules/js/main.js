$(function() {
	var layout = {
		"$items": [
			{"$items": [{"$items": []}, {"$items": [{"$type":"row", "$items": [{"$items": []}, {"$items": []}]}]}]},
			{"$type":"row", "$items": [{"$items": []}, {"$items": []}, {"$items": []}]},
			{"$items": [], "$title":"Panel title", "$type": "panel"}, 
			{"$items": []}
			
		]
	};
	var tbData = {
		"$type": "groups",
		"$items": [
			{"$type": "group", "$title": "Layouts",  "$items": [
				{"$type": "item", "$title": "Block", "data": {"$type": "layout", "data": {"$type": "block", "$items": []}}},
				{"$type": "item", "$title": "Panel", "data": {"$type": "layout", "data": {"$type": "panel", "$title": "Panel title ...", "$items": []}}},
				{"$type": "item", "$title": "Row", "data": {"$type": "layout", "data": {"$type": "row", "$items":[{"$items": []},{"$items": []}]}}},
				{"$type": "item", "$title": "Html", "data": {"$type": "layout", "data": {"$type": "html"}}}
				]},
			{"$type": "group", "$title": "Fields",  "$items": []}
		]
	};
				

	var cl = new Phoenix.ui.Layout(layout);
	cl.render($('#yyy'));
	cl = new Phoenix.ui.ToolBox(tbData);
	cl.render($('#zzz'));
	
	
});

