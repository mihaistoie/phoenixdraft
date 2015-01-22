$(function() {
	var layout = {
		"$items": [
			{"$items": [{"$items": []}, {"$items": [{"$type":"row", "$items": [{"$items": []}, {"$items": []}]}]}]},
			{"$type":"row", "$items": [{"$items": []}, {"$items": []}, {"$items": []}]},
			{"$items": [{"$items": []}, {"$items": []}]}
		]
	};
	$('#yyy').append(Phoenix.renders.renderLayout(layout, null, null, {design: true}));
});

