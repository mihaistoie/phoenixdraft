'use strict';
(function($l) {
	var _checkLayout = function(layout, parent, utils, map) {
		if (!layout.$id) 
			layout.$id = utils.allocUuid();
		if (parent)
			layout.$parentId = parent.$id;
		layout.$idDesign = layout.$id;
		layout.$type = layout.$type || "block";
		layout.$items = layout.$items || [];
		if (map) map[layout.$id] = layout;
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
			var value = Math.max(1, Math.floor(12 / layout.$items.length)); 
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
			if (l.$items || (l.$type=="html"))
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
					if (options.design) 
						css.push("design-table");
				}
				break;
			case "column":
				if (options.step == 1) 
				{
					if (options.design) 
						css.push("col-xs-" +  layout.$colSize);
					else 
						css.push("col-" + (layout.$colType || "sm") + "-" +  layout.$colSize);
					css.push("no-x-padding");
					css.push("drop-layouts-zone");
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
	_addId = function (html, layout) {
		html.push(' id="');
		html.push(layout.$id);
		html.push('"');
	},
	_addDataStep = function (html, step, design) {
		if (design) {
			html.push(' data-level="');
			html.push(step);
			html.push('"');
		}
	},
	_addLayoutId = function (html, layout) {
		html.push(' data-layout="');
		html.push(layout.$id);
		html.push('"');
		if (layout.$idDesign != layout.$id) {
			html.push(' id="');
			html.push(layout.$idDesign);
			html.push('"');
		}
	},

	_blockBefore = function (html, layout, schema, model, locale, utils, design) {
		html.push('<div');
		if (design) html.push(' draggable="true"') 
		_addLayoutCss(html, layout, {design: design, step: 1});
		_addLayoutId(html, layout);
		_addId(html, layout);
		_addDataStep(html, 1, design);
		html.push('>');
		if (layout.$title) 
			html.push('<p>' + layout.$title + '</p>');
	},
	_blockAfter = function(html, layout, schema, model, locale, utils, design) {
		html.push('</div>');
	},
	_htmlBefore = function (html, layout, schema, model, locale, utils, design) {
		html.push('<div');
		if (design) html.push(' draggable="true"');
		_addLayoutCss(html, layout, {design: design, step: 1});
		_addLayoutId(html, layout);
		_addId(html, layout);
		_addDataStep(html, 1, design);
		html.push('>');
		if (layout.$html) 
			html.push(html);
	},
	_htmlAfter = function(html, layout, schema, model, locale, utils, design) {
		html.push('</div>');
	},
	_rowBefore = function (html, layout, schema, model, locale, utils, design) {
		html.push('<div');
		if (design) html.push(' draggable="true"') 
		_addLayoutCss(html, layout, {design: design, step: 1});
		_addId(html, layout);
		_addLayoutId(html, layout);
		_addDataStep(html, 1, design);
		html.push('>');
		html.push('<div');
		_addLayoutCss(html, layout, {design: design, step: 2});
		_addLayoutId(html, layout);
		_addDataStep(html, 2, design);
		html.push('>');
		_checkRowChilds(layout);
	},
	_rowAfter = function (html, layout, schema, model, locale, utils, design) {
		html.push('</div>');
		html.push('</div>');
	},
	_columnBefore =  function (html, layout, schema, model, locale, utils, design) {
		layout.$idDesign =  layout.$id;
		html.push('<div');
		_addLayoutCss(html, layout, {design: design, step: 1});
		_addLayoutId(html, layout);
		_addId(html, layout);
		_addDataStep(html, 1, design);
		html.push('>');
		html.push('<div');
		_addLayoutCss(html, layout, {design: design, step: 2});
		if (design) html.push(' draggable="true"') 
		layout.$idDesign = layout.$id + "_design";
		_addLayoutId(html, layout);
		_addDataStep(html, 2, design);
		html.push('>');
	},
	_columnAfter = function (html, layout, schema, model, locale, utils, design) {
		html.push('</div>');
		html.push('</div>');
	}, _enumLayouts = function (layout, parent, onlayout) {
		var onlyFields = false;
		if (layout) {
			onlayout(layout, parent, true);
			if (_canAddFields(layout)) {
			} else {
				if (layout.$items)
					layout.$items.forEach(function(item){
						_enumLayouts(item, parent, onlayout)
					});
			}
			onlayout(layout, false);
		}
	}, _renderLayout = function (layout, schema, model, html, locale, utils, options) {
		_enumLayouts(layout, null, function(item, parent, before) {
			var rb = _blockBefore;
			var ra = _blockAfter;
			var addChilds = true;
			switch (item.$type) {
				case "row":
					rb = _rowBefore;
					ra = _rowAfter;
					break;
				case "column":
					rb = _columnBefore;
					ra = _columnAfter;
					break;
				case "html":
					rb = _htmlBefore;
					ra = _htmlAfter;
					addChilds = false;
					break;
			}
			if (before) {
				rb(html, item, schema, model, locale, utils, options.design);
			} else {
				ra(html, item, schema, model, locale, utils, options.design);
			}
		});
	};
	
	$l.layout = $l.layout || {};
	var _l = $l.layout;
	_l.utils = _l.utils || {};
	_l.utils.check = function(layout, map) {
		_enumLayouts(layout, null, function(item, parent, before) {
			if (before) {
				_checkLayout(item, parent, $l.utils, map);
			}
		});
	};
	
	_l.toHtml = function(layout, schema, model, options) {
		var html = [];
		_renderLayout(layout, schema, model, html, $l.locale, $l.utils, options);
		return html.join('');
	}
	return $l;
}(Phoenix));


