'use strict';
(function($l, $) {
	var _widget = function(data, options) {
			this.item = data || {};
			if (!this.item.$id) this.item.$id = $l.utils.allocID();
			this.data = data.$config || {};
			data.$config.data =  data.$config.data  || {};
			this.props = {};
			this.item.$render = this.props;
			this.props.data = data.$config.data;
			this.options = options || {};
			this.contentRender = null;
			this._defineProps();
		},
		_methods = {
			_dp: function(propertyName) {
				var self = this;
				Object.defineProperty(self.props, propertyName, {
					get: function() {
						return self.data[propertyName];
					},
					set: function(value) {
						if (value != self.data[propertyName]) {
							self.data[propertyName] = value;
							self._notifyChange(propertyName);
						}
					},
					enumerable: true

				});
			},
			_defineProps: function() {
				var self = this;
				self._dp("$title");
				self._dp("$border");
				self._dp("$titleIsHidden");
			},
			_notifyChange: function(propertyName) {
				var self = this;
				switch (propertyName) {
					case "$title":
						self._updateTitle();
						break;
					case "$border":
					case "$titleIsHidden":
						self._updateCssClass();
						break;
				}


			},
			_updateTitle: function() {
				var that = this;
				if (that.$element) {
					var t = $l.dom.find(that.$element.get(0),that.item.$id + "_title");
					if (t) $l.dom.text(t, this.data.$title)
				}

			},
			_updateCssClass: function() {
				console.log("_updateCssClass");
			},
			render: function($parent) {
				var that = this;
				if (!that.$element) {
					that.$element = $($l.widget.toHtml(that.item, that.options));
					var cr = $l.render.get(this.options.context, "widget.content.control." + that.data.$type, _widget);
					if (cr) {
						that.contentRender = new cr(that.props, {context: that.options.context, replaceParent: false});
						that.contentRender.render(that.$element);
					} 
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
				if (that.contentRender) {
					that.contentRender.destroy();
					that.contentRender = null;
				}
				this.item.$render = null;
				that.$element = null;
			}
		};
	$.extend(_widget.prototype, _methods);
	$l.ui = $l.ui || {};
	$l.ui.Widget = _widget;
	$l.render.register("javascript", "widget.control", _widget);
}(Phoenix, $));
