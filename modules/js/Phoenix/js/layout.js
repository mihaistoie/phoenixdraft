'use strict';
(function($l) {
	var _checkLayout = function(layout, utils) {
		if (!layout.$id)  
			layout.$id = utils.allocUuid();
		layout.$type = layout.$type || "block";
		layout.$items = layout.$items || [];
	},
	_checkRowChilds = function(layout) {
		if (!layout.$items.length) {
			layout.$items.push({$items: []});
		}
		var setCol = false;
		layout.$items.forEach( function(item) {
			item.$type = "column";
			if (!item.$colSize) 
				setCol = true;
		});
		if (setCol) {
			var value = Math.max(1, Math.trunc(12 / layout.$items.length)); 
			layout.$items.forEach( function(item) {
				item.$colSize = value;
			});
		}
	}, 
	_canAddLayouts = function(layout) {
		if ((layout.$type === "row" ) || (layout.$type === "accordion") || (layout.$type === "html")) 
			return false;
		if (layout.$items.length > 0) {
			var l = layout.$items[0];
			if (!l.$items)
				return false;
		}
		return true;
	},
	_canAddFields = function (layout) {
		if ((layout.$type === "row" ) || (layout.$type === "accordion") || (layout.$type === "html")) 
			return false;
		if (layout.$items.length > 0) {
			var l = layout.$items[0];
			if (l.$items)
				return false
		}
		return true;
	},
	_addStdThemes = function (layout, css) {
		if (layout.$style) {
			var a = layout.$style.split(" "); 
			a.forEach(function(e, index){
				e = e.trim();
				if (e && (e.charAt(0) === "$")) 
					e= 'bs-style-' + e.substring(1);
				css.push(e);
			});
		}
	},	
	_css = function(layout, options){
		var css = [];
		switch (layout.$type) {
			case "block": 
				css.push("container-fluid");
				if (_canAddLayouts(layout)) {
					css.push("no-x-padding");
					css.push("drop-layouts-zone");
				} 
				if (_canAddFields(layout)) {
					css.push("drop-fields-zone");
				}
				if (options.design) 
					css.push("design");
				_addStdThemes(layout, css);
				break;
			case "row":
				if (options.step == 1) {
					css.push("container-fluid");
					if (options.design) 
						css.push("design");
					_addStdThemes(layout, css);
				} else if (options.step == 2) {
					css.push("row");
				}
				break;
			case "column":
				if (options.step == 1) {
					css.push("col-" + (layout.$colType || "sm") + "-" +  layout.$colSize);
					css.push("no-x-padding");
				} else if (options.step == 2) {
					if (_canAddLayouts(layout)) {
						css.push("no-x-padding");
						css.push("drop-layouts-zone");
					}
					if (_canAddFields(layout)) 
						css.push("drop-fields-zone");
					if (options.design) 
						css.push("design col");
					_addStdThemes(layout, css);
				}
				break;
			case "html": 
				if (options.design) 
					css.push("design");
				_addStdThemes(layout, css);
				break;
		 }
		 return css;
	}, 
	_addLayoutCss = function (html, layout, options) {
		var css = _css(layout, options);
		if (css.length) {
			html.push(' class="');
			html.push(css.join(' '));
			html.push('"');
		}
	},
	blockBefore = function (html, layout, schema, model, locale, utils, design) {
		html.push('<div');
		_addLayoutCss(html, layout, {design: design, step: 1});
		html.push('>');
		if (layout.$title) 
			html.push('<p>' + layout.$title + '</p>');
	},
	blockAfter = function(html, layout, schema, model, locale, utils, design) {
		html.push('</div>');
	},
	htmlBefore = function (html, layout, schema, model, locale, utils, design) {
		html.push('<div');
		_addLayoutCss(html, layout, {design: design, step: 1});
		html.push('>');
		if (layout.$html) 
			html.push(html);
	},
	htmlAfter = function(html, layout, schema, model, locale, utils, design) {
		html.push('</div>');
	},
	rowBefore = function (html, layout, schema, model, locale, utils, design) {
		html.push('<div');
		_addLayoutCss(html, layout, {design: design, step: 1});
		html.push('>');
		html.push('<div');
		_addLayoutCss(html, layout, {design: design, step: 2});
		html.push('>');
		_checkRowChilds(layout);
	},
	rowAfter = function (html, layout, schema, model, locale, utils, design) {
		html.push('</div>');
		html.push('</div>');
	},
	columnBefore =  function (html, layout, schema, model, locale, utils, design) {
		html.push('<div');
		_addLayoutCss(html, layout, {design: design, step: 1});
		html.push('>');
		html.push('<div');
		_addLayoutCss(html, layout, {design: design, step: 2});
		html.push('>');
	},
	columnAfter = function (html, layout, schema, model, locale, utils, design) {
		html.push('</div>');
		html.push('</div>');
	}, renderLayout = function (layoutMap, layout, schema, model, html, locale, utils, options) {
		var onlyFields = false;
		if (layout) {
			_checkLayout(layout, utils);
			layoutMap[layout.id] = layout;
			onlyFields = _canAddFields(layout);
			var rb = blockBefore;
			var ra = blockAfter;
			var addChilds = true;
			switch (layout.$type) {
				case "row":
					rb = rowBefore;
					ra = rowAfter;
					break;
				case "column":
					rb = columnBefore;
					ra = columnAfter;
					break;
				case "html":
					rb = htmlBefore;
					ra = htmlAfter;
					addChilds = false;
					break;
			}
			rb(html, layout, schema, model, locale, utils, options.design);
			if (onlyFields) {
			} else {
				layout.$items.forEach(function(item){
					item.$parent = layout;
					renderLayout(layoutMap, item, schema, model, html, locale, utils, options);
				});
			}
			ra(html, layout, schema, model, locale, utils, options.design);
		}
	};
	$l.renders = $l.renders || {};
	$l.renders.renderLayout = function(layout, schema, model, options) {
		layout.map = layout.map || {};
		var html = [];
		renderLayout(layout.map, layout, schema, model, html, $l.locale, $l.utils, options);
		return html.join('');
	}
	return $l;
}(Phoenix));