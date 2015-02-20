'use strict';
(function($l, $) {
	var _content = function(data, options) {
			this.data = data|| {};
			this.options = options || {};
		},
		_methods = {
			render: function($parent) {
				this.data.$title= "Test widget ... ";
				var that = this;
				if (!that.$element) {
					that.$element = $('<div>Test</div>');
				}
				if ($parent) {
					if (that.options.beforeAdd)
						that.options.beforeAdd(that.$element);
					if (that.options.replaceParent)
						$parent.replaceWith(that.$element);
					else
						$parent.append(that.$element);
				}

				return that.$element;
			},
			destroy: function() {
				var that = this;
				that.$element = null;
			}
		};
	$.extend(_content.prototype, _methods);
	$l.render.register("javascript", "widget.content.control.test", _content);
}(Phoenix, $));
