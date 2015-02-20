$(function() {
	var layout = {
		"$type": "block",
		"$items": [
			{"$items": [
					{"$type": "block"}, 
					{"$type":"row", "$items": [{}, {"$items":[{"$bind":"text"}]}]}
				]
			},
			{"$type":"row", "$items": [{}, {}, {}]},
			{"$type": "panel"}, 
			{"$type": "block"}
			
		]
	};
	var tbData = {
		"$type": "groups",
		"$items": [
			{"$type": "group", "$title": "Layouts", "$items": [
				{"$type": "item", "$title": "Block", "data": {"$type": "layout", "data": {"$type": "block"}}},
				{"$type": "item", "$title": "Panel", "data": {"$type": "layout", "data": {"$type": "panel"}}},
				{"$type": "item", "$title": "Row", "data": {"$type": "layout", "data": {"$type": "row", "$items":[{},{}]}}},
				{"$type": "item", "$title": "Html", "data": {"$type": "layout", "data": {"$type": "html"}}}
				]},
			{"$type": "group", "$title": "Fields",  "$items": [
				{"$type": "item", "$title": "Simple field", "data": {"$type": "field", "data": {"$bind": "string"}}}
			]},
			{"$type": "group", "$title": "Widgets",  "$items": [
				{"$type": "item", "$title": "Widget Image", "data": {"$type": "widget", "data": {"$config": {"$title": "Image", "$type": "image"}}}},
				{"$type": "item", "$title": "Widget GMaps", "data": {"$type": "widget", "data": {"$config": {"$title": "Gmaps", "$type": "gmaps"}}}},
				{"$type": "item", "$title": "Widget Test", "data": {"$type": "widget", "data": {"$config": {"$title": "Test", "$type": "test"}}}}
			]},
			{"$type": "group", "$title": "Property Editor",  "$items": []}
		]
	};
				

	var cl = new Phoenix.ui.Layout(layout, {design:true, showPreview: true});
	cl.render($('#yyy'));
	cl = new Phoenix.ui.ToolBox(tbData);
	cl.render($('#zzz'));
	
});

