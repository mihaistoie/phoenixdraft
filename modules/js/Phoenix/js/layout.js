﻿'use strict';
(function($l) {
    var _locale = $l.locale.layouts;
    var _checkLayout = function(layout, parent, utils, map) {
    		if (!layout.$id)
                layout.$id = utils.allocID();
            if (parent)
                layout.$parentId = parent.$id;
            layout.$idDesign = layout.$id;
            layout.$idDrag = layout.$id;
            layout.$type = layout.$type || "block";
            layout.$items = layout.$items || [];
            if (map) map[layout.$id] = layout;
            if (layout.$type == "panel" && !layout.$title) {
                layout.$title = _locale.PanelTitle;
            } else if (layout.$type == "html" && !layout.$html) {
            	layout.$html = _locale.Html;
            }

        },
        _checkRowChilds = function(layout) {
            if (!layout.$items.length) {
                layout.$items.push({});
            }
            var setCol = false;
            layout.$items.forEach(function(item) {
                item.$type = "column";
                if (!item.$colSize)
                    setCol = true;
            });
            if (setCol) {
                var value = Math.max(1, Math.floor(12 / layout.$items.length));
                layout.$items.forEach(function(item) {
                    item.$colSize = value;
                });
            }
        },

        _canAddLayouts = function(layout) {
            if ((layout.$type === "row") || (layout.$type === "accordion") || (layout.$type === "html"))
                return false;
            if (layout.$items.length > 0) {
                var l = layout.$items[0];
                if (!l.$items)
                    return false;
            }
            return true;
        },
        _needParentPadding = function(layout) {
        	return (layout.$type == "panel");
        },
        _noPadding = function(layout) {
        	var res = true;
        	if (!layout.$items.length)  return res;
        	layout.$items.forEach(function(item){
        		if (res) {
       				res = !_needParentPadding(item);
        		}
        	});
        	return res;

        },
		_canAddFields = function(layout) {
			if (layout.$type && !layout.$items) layout.$items = [];
            if ((layout.$type === "row") || (layout.$type === "accordion") || (layout.$type === "html"))
                return false;
            if (layout.$items.length > 0) {
                var l = layout.$items[0];
                if (l.$type || layout.$items )
                    return false
            }
            return true;
        },
        _addStdThemes = function(layout, css) {
            if (layout.$style) {
                var a = layout.$style.split(" ");
                a.forEach(function(e, index) {
                    e = e.trim();
                    if (e && (e.charAt(0) === "$"))
                        e = 'bs-style-' + e.substring(1);
                    css.push(e);
                });
            }
        },
        _css = function(layout, parent, options) {
            var css = [];
            switch (layout.$type) {
                case "block":
                    css.push("container-fluid");
                    if (_canAddLayouts(layout)) {
                    	if (options.design || _noPadding(layout))
                        	css.push("no-x-padding");
                        if (options.design)
                            css.push("drop-layouts-zone");
                    }
                    if (_canAddFields(layout)) {
                        if (options.design)
                            css.push("drop-fields-zone");
                    }
                    if (options.design) {
                        css.push("design");
                        if (layout.selected)
                            css.push("selected");
                    }
                    _addStdThemes(layout, css);
                    break;
                case "accordion":
                    if (options.step == 1) {
                        css.push("panel-group");
                        if (options.design) {
                            css.push("design");
                            if (layout.selected)
                                css.push("selected");
                        }
                        _addStdThemes(layout, css);
                    }
                    break;
                case "row":
                    if (options.step == 1) {
                        css.push("container-fluid");
                        if (options.design) {
                            css.push("design");
                            css.push("no-x-padding");
                            if (layout.selected)
                                css.push("selected");

                        }
                        _addStdThemes(layout, css);
                    } else if (options.step == 2) {
                        css.push("row");
                        if (options.design)
                            css.push("design-table");
                    }
                    break;
                case "panel":
                    if (options.step == 1) {
                        css.push("panel");
                        css.push("panel-default");
                        if (options.design) {
                            css.push("design");
                            if (layout.selected)
                                css.push("selected");
                        }
                    } else if (options.step == 2) {
                        css.push("panel-body");
                        if (_canAddLayouts(layout)) {
                        	if (options.design || _noPadding(layout)) {
                        		css.push("no-x-padding");
                            	css.push("no-y-padding");
                            }
                            
                            if (options.design)
                                css.push("drop-layouts-zone");
                        }
                        if (_canAddFields(layout)) {
                            if (options.design)
                                css.push("drop-fields-zone");
                        }
                        _addStdThemes(layout, css);

                    }
                    break;

                case "column":
                    if (options.step == 1) {
                        if (options.design)
                            css.push("col-xs-" + layout.$colSize);
                        else
                            css.push("col-" + (layout.$colType || "sm") + "-" + layout.$colSize);
                    	css.push("no-x-padding");
                        if (options.design)
                            css.push("drop-layouts-zone");
                    } else if (options.step == 2) {
                    	css.push("container-fluid");
                        if (_canAddLayouts(layout)) {
	                    	if (options.design || _noPadding(layout)) {
	                    		css.push("no-x-padding");
	                        }
                            if (options.design)
                                css.push("drop-layouts-zone");
                        }
                        if (_canAddFields(layout)) {
                            if (options.design)
                                css.push("drop-fields-zone");
                        }

                        if (options.design) {
                            css.push("design col");
                            if (layout.selected)
                                css.push("selected");
                        }
                        _addStdThemes(layout, css);
                    }
                    break;
                case "html":
                    if (options.design) {
                        css.push("design");
                        if (layout.selected)
                            css.push("selected");
                    }
                    _addStdThemes(layout, css);
                    break;
            }
            return css;
        },
        _setLayoutCss = function($e, layout, parent, options) {
            var css = _css(layout, parent, options);
            $e.attr('class', css.join(' '));
        },

        _addLayoutCss = function(html, layout, parent, options) {
            var css = _css(layout, parent, options);
            if (css.length) {
                html.push(' class="');
                html.push(css.join(' '));
                html.push('"');
            }
        },
        _addId = function(html, layout) {
            html.push(' id="');
            html.push(layout.$id);
            html.push('"');
        },
        _addDataStep = function(html, step, design) {
            if (design) {
                html.push(' data-level="');
                html.push(step);
                html.push('"');
            }
        },
        _addLayoutId = function(html, step, layout) {
            html.push(' data-layout="');
            html.push(layout.$id);
            html.push('"');
            if (step > 1) {
                var id = layout['$idStep' + step];
                if (id) {
                    html.push(' id="');
                    html.push(id);
                    html.push('"');
                }
            }
        },

        _panelBefore = function(html, layout, parent, schema, model, locale, utils, design) {
            html.push('<div');
            if (design) html.push(' draggable="true"');
            _addLayoutCss(html, layout, parent, {
                design: design,
                step: 1
            });
            _addLayoutId(html, 1, layout);
            _addId(html, layout);
            html.push('>');
            html.push('<div class="panel-heading"');
            html.push('>');
            html.push('<h4 class="panel-title"');
            html.push('>');
            html.push(layout.$title);
            html.push('</h4></div>');
            layout.$idStep2 = layout.$id + "_s2";
            layout.$idDesign = layout.$idStep2;
            html.push('<div');
            _addLayoutCss(html, layout, parent, {
                design: design,
                step: 2
            });
            _addLayoutId(html, 2, layout);
            _addDataStep(html, 2, design);
            html.push('>');

        },
        _panelAfter = function(html, layout, parent, schema, model, locale, utils, design) {
            html.push('</div>');
            if (layout.$footer) {
            	html.push('<div class="panel-footer">');
      			html.push(layout.$footer);
      			html.push('</div>');
            }
            html.push('</div>');
        },
        _blockBefore = function(html, layout, parent, schema, model, locale, utils, design) {
            html.push('<div');
            if (design) html.push(' draggable="true"')
            _addLayoutCss(html, layout, parent, {
                design: design,
                step: 1
            });
            _addLayoutId(html, 1, layout);
            _addId(html, layout);
            _addDataStep(html, 1, design);
            html.push('>');
        },
        _blockAfter = function(html, layout, schema, model, locale, utils, design) {
            html.push('</div>');
        },
        _htmlBefore = function(html, layout, parent, schema, model, locale, utils, design) {
            html.push('<div');
            if (design) html.push(' draggable="true"');
            _addLayoutCss(html, layout, parent, {
                design: design,
                step: 1
            });
            _addLayoutId(html, 1, layout);
            _addId(html, layout);
            _addDataStep(html, 1, design);
            html.push('>');
            if (layout.$html)
            	html.push(layout.$html);
        },
        _htmlAfter = function(html, layout, schema, model, locale, utils, design) {
            html.push('</div>');
        },
        _accordionBefore = function(html, layout, parent, schema, model, locale, utils, design) {
            html.push('<div role="tablist" aria-multiselectable="true"');
            if (design) html.push(' draggable="true"');
            _addLayoutCss(html, layout, parent, {
                design: design,
                step: 1
            });
            _addLayoutId(html, 1, layout);
            _addId(html, layout);
            _addDataStep(html, 1, design);
            html.push('>');
        },
        _accordionAfter = function(html, layout, parent, schema, model, locale, utils, design) {
            html.push('</div>');
        },
        _rowBefore = function(html, layout, parent, schema, model, locale, utils, design) {
            html.push('<div');
            if (design) html.push(' draggable="true"')
            _addLayoutCss(html, layout, parent, {
                design: design,
                step: 1
            });
            _addId(html, layout);
            _addLayoutId(html, 1, layout);
            _addDataStep(html, 1, design);
            html.push('>');
            layout.$idStep2 = layout.$id + "_s2";
            html.push('<div');
            _addLayoutCss(html, layout, parent, {
                design: design,
                step: 2
            });
            _addLayoutId(html, 2, layout);
            _addDataStep(html, 2, design);
            html.push('>');
            _checkRowChilds(layout);
        },
        _rowAfter = function(html, layout, parent, schema, model, locale, utils, design) {
            html.push('</div></div>');
        },
        _columnBefore = function(html, layout, parent, schema, model, locale, utils, design) {
            html.push('<div');
            _addLayoutCss(html, layout, parent, {
                design: design,
                step: 1
            });
            _addLayoutId(html, 1, layout);
            _addId(html, layout);
            _addDataStep(html, 1, design);
            html.push('>');
            html.push('<div');
            _addLayoutCss(html, layout, parent, {
                design: design,
                step: 2
            });
            if (design) html.push(' draggable="true"')
            layout.$idDesign = layout.$id + "_design";
            layout.$idDrag = layout.$idDesign;
            layout.$idStep2 = layout.$idDesign;
            _addLayoutId(html, 2, layout);
            _addDataStep(html, 2, design);
            html.push('>');
        },
        _columnAfter = function(html, layout, parent, schema, model, locale, utils, design) {
            html.push('</div></div>');

        },
        _enumLayouts = function(layout, parent, onlayout) {
            var onlyFields = false;
            if (layout) {
                onlayout(layout, parent, true);
                if (_canAddFields(layout)) {} else {
                    if (layout.$items)
                        layout.$items.forEach(function(item) {
                            _enumLayouts(item, layout, onlayout)
                        });
                }
                onlayout(layout, parent, false);
            }
        },
        _renderLayout = function(layout, schema, model, html, locale, utils, options) {
            _enumLayouts(layout, null, function(item, parent, before) {
                var rb = _blockBefore;
                var ra = _blockAfter;
                switch (item.$type) {
                    case "row":
                        rb = _rowBefore;
                        ra = _rowAfter;
                        break;
                    case "column":
                        rb = _columnBefore;
                        ra = _columnAfter;
                        break;
                    case "panel":
                        rb = _panelBefore;
                        ra = _panelAfter;
                        break;
                    case "html":
                        rb = _htmlBefore;
                        ra = _htmlAfter;
                        break;
                }
                if (before) {
                    rb(html, item, parent, schema, model, locale, utils, options.design);
                } else {
                    ra(html, item, parent, schema, model, locale, utils, options.design);
                }
            });
        },
        _createAuthoringMode = function(design) {
            var html = [
                '<div class="checkbox">',
                '    <label>',
                '      <input type="checkbox"' + (design ? ' checked="true"' : '') + '>',
                _locale.AuthoringMode,
                '    </label>',
                '</div>'
            ];
            return html.join('');

        },
        _canDropChild = function(child, parent, parentLevel) {
        	parentLevel = parseInt(parentLevel || '1', 10);
            if (!parent || !child) return false;
            if (parent.$type == 'column') {
                if (parentLevel == '1') {
                    return (parent == child)
                }
            }
            if (child.$type == 'column') return false;
            console.log('_canDropChild');
            return true;
        },
        _canSelectLayout = function(layout, level) {
        	if (layout.$type == "column" && level == 1) return false;
        	return true;
        }

    $l.layout = $l.layout || {};
    var _l = $l.layout;
    _l.utils = _l.utils || {};
    _l.utils.check = function(layout, map, parentLayout) {
        _enumLayouts(layout, parentLayout, function(item, parent, before) {
            if (before) {
                _checkLayout(item, parent, $l.utils, map);
            }
        });
    };
    _l.utils.clearMeta = function(layout) {
        _enumLayouts(layout, null, function(item, parent, before) {
            if (before) {
                delete item.$id;
                delete item.$idDesign;
                delete item.$idDrag;
                delete item.$parentId;
                delete item.$idStep2;
                if (item.$type == 'column')
                    delete item.$type;
                else if (layout.$type == "panel") {
                    if (layout.$title == _locale.PanelTitle)
                        delete layout.$title; 
                } else if (layout.$type == "html") {
                    if (layout.$html == _locale.Html)
                        delete layout.$html; 
                }
            }
        });
    };
    _l.utils.afterRemoveChild = function(layout, map) {
        if (layout.$type == "row") {
            layout.$items.forEach(function(item) {
                item.$type = "column";
                delete item.$colSize;
            });
            var docheck = !layout.$items.length;
            _checkRowChilds(layout);
            layout.$items.forEach(function(item) {
                _l.utils.check(item, map, layout);
            });
        }
    };
    _l.utils.canDropChild = _canDropChild;
    _l.utils.canSelect = _canSelectLayout; 
    _l.utils.updateCssClass = _setLayoutCss;
    _l.authModeHtml = _createAuthoringMode;
    _l.toHtml = function(layout, schema, model, options) {
        var html = [];
        _renderLayout(layout, schema, model, html, $l.locale, $l.utils, options);
        return html.join('');
    }
    return $l;
}(Phoenix));


