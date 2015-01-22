function mmm() {
	$("#xxx").jsonDesign({});
}



$.fn.jsonDesign = function(options) {
	return this.each(function() {
		var $e = $(this);
		$e.on('click', function(ev){
			console.log(ev.target);
		});
		console.log("xxx");
	});
};



