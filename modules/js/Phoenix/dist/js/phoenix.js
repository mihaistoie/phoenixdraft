'use strict';
var Phoenix = (function() {
    var phoenix = {};
    var uuid = function() {
            function _p8(s) {
                var p = (Math.random().toString(16) + "000000000").substr(2, 8);
                return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
            }
            return _p8() + _p8(true) + _p8(true) + _p8();
        },
        _eventListeners = {},
        _dragData,
        _setDragData = function(data) {
            _dragData = data;
        },
        _getDragData = function() {
            return _dragData;
        },
        _emitEvent = function(eventName, data) {
        	var evname = 'on' + eventName;
            var l = _eventListeners[evname];
            if (l) l.forEach(function(item) {
                item.handler.bind(item.listener)();
            });
        },
        _regListener = function(eventName, listener, handler) {
            _eventListeners[eventName] = _eventListeners[eventName] || [];
            var l = _eventListeners[eventName];
            l.push({
                listener: listener,
                handler: handler
            });
        },
        _unregListener = function(listener, eventName) {
            function _rmvlistener(res) {
                if (res) {
                    var i = res.length;
                    while (i--) {
                        var o = res[i]
                        if (o.listener == listener)
                            res.splice(i, 1);
                    }
                }
            }
            if (eventName) {
                _rmvlistener(_eventListeners[eventName]);
            } else {
                Object.keys(_eventListeners).forEach(function(evn) {
                    _rmvlistener(_eventListeners[evn]);
                });
            }
        };
    phoenix.utils = {
        allocUuid: uuid,
        setDragData: _setDragData,
        getDragData: _getDragData,
        emit: _emitEvent,
        addListener: _regListener,
        rmvListener: _unregListener
    };
    return phoenix;
})();

window.Phoenix = Phoenix

'use strict';
(function($l) {
	
	var ll = {
		AuthoringMode: 'Authoring Mode',
		PanelTitle: 'Panel title',
		Html: '<p class="text-primary text-center">Block Html</p>'
	}
	$l.locale = $l.locale || {};
	$l.locale.layouts = $l.locale.layouts || ll;
	
    return $l;
}(Phoenix));

'use strict';
(function($l) {
    var _locale = $l.locale.layouts;
    var _checkLayout = function(layout, parent, utils, map) {
    		console.log(layout);
            if (!layout.$id)
                layout.$id = utils.allocUuid();
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
            return true;
        },
        _canSelectLayout = function(layout, level) {
        	console.log(layout.$type + "  " +level) ;
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
    _l.setClassName = _setLayoutCss;
    _l.authModeHtml = _createAuthoringMode;
    _l.toHtml = function(layout, schema, model, options) {
        var html = [];
        _renderLayout(layout, schema, model, html, $l.locale, $l.utils, options);
        return html.join('');
    }
    return $l;
}(Phoenix));

'use strict';
(function($l, $) {
    var l = $l.layout;
    var _event2Id = function(event, root, layout) {
            var t = $(event.target),
                id = null, level, ll;
            while (t &&  t.get(0)) {
                var id = t.attr('data-layout');
                if (id) {
                	level = parseInt(t.attr('data-level') || '1',10);
                	ll = layout.getLayoutById(id);
                	if (!ll || !l.utils.canSelect(ll, level)) id = null
                	if (id) 
                    	break;
                }
                t = (t.get(0) == root.get(0)) ? null : t.parent();
            }
            return id;
        },
		_isRemoveButton = function(event, root) {
            var t = $(event.target);
            while (t && t.get(0)) {
                if (t.attr('data-remove'))
                	return true;
                t = (t.get(0) == root.get(0)) ? null : t.parent();
            }
            return false;
        },        
        _createTopList = function($p, exclude, placeHolder) {
            var res = [];
            var childs = $p.children();
            for (var i = 0, len = childs.length; i < len; i++) {
                var c = childs[i];
                var o = $(c).offset();
                res.push({
                    top: o.top + (o.height >> 1),
                    ignore: (c == exclude) || c.hasAttribute('data-remove'),
                    placeHolder: (c == placeHolder)
                });
            }
            return res;
        },
        _newIndex = function(list, top) {
            var index = 0;
            if (list.length) {
                for (var i = 0, len = list.length; i < len; i++) {
                    var v = list[i];
                    if (!v.ignore && (top < v.top)) {
                        return i;
                    }
                    index = i + 1;
                }
                return index;
            }
            return index;
        },
        _indexInParent = function(parent, placeHolder, dragging) {
            var j = 0;
            for (var i = 0, len = parent.childNodes.length; i < len; i++) {
                var c = parent.childNodes[i];
                if (c == placeHolder) return j;
                if (c == dragging) continue;
                if (!c.hasAttribute('data-layout')) continue;
                j++;
            }
            return 0;
        },
        _appendPlaceHolder = function($parent, list, index, $placeHolder, parent, level) {
            var _beforeAppend = function(sameParent) {
                $placeHolder.remove();
                if (!sameParent) {
                    if (parent.$type == 'column' && level == 1) {
                        $placeHolder.addClass('col')
                    } else {
                        $placeHolder.removeClass('col')
                    }
                }
            }
            if (!list.length) {
                _beforeAppend(false);
                $parent.append($placeHolder);
                return true;
            }
            var phIndex = -1;
            for (var i = 0, len = list.length; i < len; i++) {
                var e = list[i];
                if (e.placeHolder) {
                    phIndex = i;
                    if ((i == index) || (i == (index - 1))) {
                        return false;
                    }
                } else if (e.ignore) {
                    if ((i == index) && (i + 1 < len) && list[i + 1].placeHolder)
                        return false;
                    if ((i == (index - 1)) && (i > 0) && list[i - 1].placeHolder)
                        return false;
                }
            }
            if (phIndex < 0 || index >= list.length) {
                _beforeAppend(phIndex >= 0);
                $parent.append($placeHolder);
            } else {
                var $c = $($parent.get(0).childNodes[index]);
                _beforeAppend(phIndex >= 0);
                $c.before($placeHolder);
            }
            return true;
        },
        _createPlaceHolderOnStart = function(proto, placeHolder) {
            placeHolder && placeHolder.remove();
            placeHolder = $('<div></div>');
            placeHolder.addClass(proto.attr('class'));
            placeHolder.addClass('drop-target');
            proto.before(placeHolder);
            return placeHolder;
        },
        _createEmptyPlaceHolderOnStart = function(placeHolder, $p, $index) {
            placeHolder && placeHolder.remove();
            placeHolder = $('<div></div>');
            placeHolder.addClass("container-fluid no-x-padding drop-layouts-zone drop-fields-zone design drop-target");
            return placeHolder;
        },

        _createDragImage = function(isLayout) {
            var crt = $('<div class="bs-drag-image"></div>');
            document.body.appendChild(crt.get(0));
            return crt;
        },
        _findSelected = function(map) {
            var ids = Object.keys(map);
            var i = ids.length;
            while (i--) {
                if (map[ids[i]].selected) {
                    return ids[i];
                }
            }
            return null;
        },
        _findElement = function($root, id) {
            return $('#' + id);
        },
        _showSelected = function($element, layout) {
            if (!$element) return;
            var $e = _findElement($element, layout.$idDrag);
            if (layout.selected)
                $e.addClass('selected');
            else
                $e.removeClass('selected');
        },
        _notifySelectedChanged = function(layout) {
            $l.utils.emit("SelectedChanged", {
                type: "layout",
                data: layout
            });
        },
        _onSelectedChanged = function($element, layout, notify) {
            if (layout) {
                var $p = _findElement($element, layout.$idDrag);
                if ($element.get(0) != $p.get(0)) {
                    if (layout.selected) {
                        var $r = $('<div class="bs-rt-button" data-remove="true"><span class="glyphicon glyphicon-remove-sign"></span></div>')
                        var c = $p.children();
                        if (c.length)
                            $(c.get(0)).before($r);
                        else
                            $p.append($r);
                    } else {
                        $p.children('div[data-remove="true"]').remove();
                    }
                }
            }
            if (notify) {
                $l.utils.emit("SelectedChanged", {
                    type: "layout",
                    data: layout
                });
            }
        },
        _startDrag = function($element, layout) {
            if (!$element) return;
            var $e = _findElement($element, layout.$idDrag);
            if (layout.selected)
                $e.addClass('selected');
            else
                $e.removeClass('selected');
        },
        _removeEvents = function($element, layout, design) {
            if (design) {
                $element.off('click');
                $element.find('div[draggable="true"]').off('dragstart').add($element).off('dragend');
                $element.find('div[draggable="true"]').off('dragstart');
                $element.find('.drop-layouts-zone').add($element).off('dragover dragenter drop');
            }
        },
        _removeDesignModeEvents = function($check) {
        		$check.find('input[type="checkbox"]').off('click');

        },
        _setDesignModeEvents = function($check, layout, design) {
        	$check.find('input[type="checkbox"]').on('click', function(event) {
        		layout.setDesignMode(this.checked);
        	});

        },
        _updateCss = function(item, $element, layout, design) {
            var $l1 = _findElement($element, item.$id);
            var $l2 = (item.$id != item.$idStep2) ? _findElement($element, item.$idStep2) : null;
            l.setClassName($l1, item, layout.getLayoutById(item.$parentId), {
                design: design,
                step: 1
            });
            if ($l2)
                l.setClassName($l2, item, layout.getLayoutById(item.$parentId), {
                    design: design,
                    step: 2
                });
        },
        _setEvents = function($element, layout, design) {
            if (design) {
                var dragging, dragImage, startDrag, placeHolder, topList;
                var _cleanUp = function() {
                        if (dragging) {
                            dragging.removeClass('bs-none');
                            dragging = null;
                        }
                        if (placeHolder) {
                            placeHolder.remove();
                            placeHolder = null;
                        }
                        if (dragImage) {
                            dragImage.remove()
                            dragImage = null;
                        }
                        topList = null;
                        startDrag = false;
                        $l.utils.setDragData(null);
                    },
                    _performDrop = function(td) {
                        console.log("Drop event");
                        if (td && td.isLayout) {
                            if (td.layout == td.dst) return;
                            var ni, oi, op,
                                np = td.dst,
                                moved = td.layout;
                            var $e = _findElement($element, moved.$id),
                                $p = _findElement($element, np.$idDesign),
                                $c;
                            if (moved.$parentId == np) {
                                // same parent
                                op = td.dst;
                                oi = op.$items.indexOf(moved);
                                ni = td.indexInParent;
                                if (ni == oi) return;
                            } else {
                                op = td.isNew ? null : layout.getLayoutById(moved.$parentId);
                                oi = op ? op.$items.indexOf(moved) : -1;
                                ni = td.indexInParent;
                            }
                            moved.$parentId = np.$id;
                            if (oi >= 0) op.$items.splice(oi, 1);
                            np.$items.splice(ni, 0, moved);
                            if (!td.isNew) {
                                if (oi >= 0) $e.detach();
                                if (ni == (np.$items.length - 1))
                                    $p.append($e);
                                else {
                                    $c = _findElement($element, np.$items[ni + 1].$id);
                                    $c.before($e);
                                }

                                var toUpdate = [moved, op];
                                if (np != op) toUpdate.push(np);
                                // setevents
                                _removeEvents($element, layout, design);
                                _setEvents($element, layout, design);
                                //update css 
                                toUpdate.forEach(function(item) {
                                    _updateCss(item, $element, layout, design);
                                });
                                return;
                            } else {
                                layout.check(moved, np);
                            }
                            layout.render(null, true);
                        }
                    };
                $element.on('click', function(event) {
                    var id = _event2Id(event, $element, layout);
                    if (_isRemoveButton(event, $element)) {
                    	layout.removeLayout(id);	
                    	return;	
                    }
                    layout.select(id);
                });
                $element.find('div[draggable="true"]').on('dragstart', function(event) {
                    event.stopPropagation();
                    var l = layout.getLayoutById($(this).attr('data-layout'));
                    if (!l) {
                        event.preventDefault();
                        return false;
                    } else {
                        var dt = (event.originalEvent ? event.originalEvent.dataTransfer : event.dataTransfer);
                        dt.effectAllowed = 'move';
                        dt.setData('Text', 'data');
                        if (dt.setDragImage) {
                            dragImage = _createDragImage(true);
                            dt.setDragImage(dragImage.get(0), 0, 0);
                        }
                        $l.utils.setDragData({
                            layout: l,
                            isLayout: true,
                            isNew: false
                        });
                        dragging = _findElement($element, l.$idDrag);
                        startDrag = true;
                    }
                }).add($element).on('dragend', function(event) {
                    //end of the drag
                    console.log("dragend");
                    event.preventDefault();
                    event.stopPropagation();
                    _cleanUp();
                    return false;
                });
                $element.find('.drop-layouts-zone').add($element).on('dragover dragenter drop', function(event) {
                    var $t = $(this),
                        td;
                    var e = event.originalEvent ? event.originalEvent : event;
                    event.stopPropagation();
                    if (event.type == 'drop') {
                        console.log("drop");
                        event.preventDefault();
                        var dst = layout.getLayoutById($t.attr('data-layout'));
                        var dstLevel = $t.attr('data-level');
                        if (dst) {
                            td = $l.utils.getDragData();
                            td.dst = dst;
                            td.dstLevel = dstLevel;
                            td.indexInParent = _indexInParent($t.get(0), placeHolder.get(0), dragging ? dragging.get(0) : null);
                            $l.utils.setDragData(td);
                            _cleanUp();
                            _performDrop(td);
                            return false;
                        }
                        _cleanUp();
                        return false;
                    }
                    var dt = e.dataTransfer;
                    var t = dt.getData('Text');
                    td = $l.utils.getDragData();
                    if (startDrag) {
                        if (!dragging) return
                        startDrag = false;
                        if (!td.isNew) {
                            placeHolder = _createPlaceHolderOnStart(dragging, placeHolder);
                            dragging.addClass('bs-none');
                            event.preventDefault();
                            return false
                        }
                    }
                    if (!placeHolder) {
                        if (!td.isNew) return true;
                        if (td.isLayout) {
                            topList = _createTopList($t, (dragging ? dragging.get(0) : null), (placeHolder ? placeHolder.get(0) : 0));
                            var iph = _newIndex(topList, e.pageY);
                            placeHolder = _createEmptyPlaceHolderOnStart(placeHolder);
                            var php = layout.getLayoutById($t.attr('data-layout'));
                            var phplevel = $t.attr('data-level');
                            _appendPlaceHolder($t, topList, iph, placeHolder, php, phplevel);
                            topList = null;
                            event.preventDefault();
                            return false;
                        }
                    }
                    if (td.isLayout) {
                        if (event.type == 'dragenter') topList = null;
                        if (dragging && (dragging.get(0) == $t.get(0))) {
                            dt.effectAllowed = 'none';
                            return true;
                        }
                        var p = layout.getLayoutById($t.attr('data-layout'));
                        var level = $t.attr('data-level');

                        if (!l.utils.canDropChild(td.layout, p, $t.attr('data-level'))) {
                            dt.effectAllowed = 'none';
                            return true;
                        }
                        if (!topList)
                            topList = _createTopList($t, (dragging ? dragging.get(0) : null), (placeHolder ? placeHolder.get(0) : 0));

                        var ii = _newIndex(topList, e.pageY);
                        if (_appendPlaceHolder($t, topList, ii, placeHolder, p, level)) {
                            topList = null;
                        }
                        event.preventDefault();
                        return false;
                    }
                    event.preventDefault();
                    dt.effectAllowed = 'none';
                    return true;
                });
            }

        },
        _layout = function(data) {
            this.$element = null;
            this.design = true;
            this.showPreview = true;
            this.map = {};
            l.utils.check(data, this.map);
            this.data = data;

            $l.utils.addListener('onToolBoxDragend', this, function() {
                if (this.$element) {
                    this.$element.trigger('dragend');
                }
            });
        },
        _methods = {
            renderLayout: function(layout) {
                var that = this;
                return $(l.toHtml(layout, null, null, {
                    design: that.design
                }));
            },
            render: function($parent, force) {
                var that = this;
                if (force && that.$element) {
                    $parent = $parent || that.$element.parent();
                    _removeEvents(that.$element, that, true);
                    that.$element.remove();
                    that.$element = null;
                }
                if (force && that.$check) {
                    _removeDesignModeEvents(that.$check);
                    that.$check.remove();
                    that.$check = null;
                }
                    
				if (this.showPreview) {
					that.$check = $(l.authModeHtml(this.design));
					if ($parent)
                        $parent.append(that.$check);					
					_setDesignModeEvents(that.$check, that, that.design);

				}
                if (!that.$element) {
                    that.$element = that.renderLayout(that.data);
                    if ($parent)
                        $parent.append(that.$element);
                    _setEvents(that.$element, that, that.design);
                    var sid = _findSelected(that.map);
                    if (that.design) 
                    	_onSelectedChanged(that.$element, that.map[sid], true);
                }
            },
            _destroy: function() {
                var that = this;
                if (that.$element) {
                    _removeEvents(that.$element, that, that.design)
                    that.$element = null;
                }
                if (that.$check) {
                    _removeDesignModeEvents(that.$check);
                    that.$check = null;
                }
                $l.utils.rmvListener(that);

            },
            check: function(layout, parent) {
                l.utils.check(layout, this.map, parent);
            },
            toString: function(layout) {
                var o = $.extend(true, {}, JSON.parse(JSON.stringify(layout || this.data)));

                l.utils.clearMeta(o);
                return JSON.stringify(o, 2)
            },
            removeLayout: function(id) {
            	var that = this;
            	if (!id || !that.design || !that.map[id]) return;
            	var d = that.map[id]
            	if (!d) return;
            	var p = that.map[d.$parentId];
            	if (!p) return;
            	var i = p.$items.indexOf(d);
            	p.$items.splice(i, 1);
            	delete that.map[d.$id];
            	l.utils.afterRemoveChild(p, this.map);
            	that.render(null, true);

            },
            setDesignMode: function(value) {
            	var that = this;
            	if (that.design != value) {
            		that.design = value;
            		that.render(null, true);
            	}
            },
            select: function(id) {
                var that = this;
                var $e = that.$element;
                if (!id || !that.design || !that.map[id]) return;
                var old = _findSelected(that.map);
                if (old) {
                    var o = that.map[old]
                    o.selected = false;
                    _showSelected($e, o);
                    _onSelectedChanged(that.$element, o, false);
                }
                if (old == id) {
                    _onSelectedChanged(that.$element, null, true);
                    return;
                }
                var d = that.map[id]
                d.selected = true;
                _showSelected($e, d);
                _onSelectedChanged(that.$element, d, true);
            },
            getLayoutById: function(id) {
                if (!id) return null;
                var that = this;
                return that.map[id];
            }
        };
    $.extend(_layout.prototype, _methods);

    $l.ui = $l.ui || {};
    $l.ui.Layout = _layout;

}(Phoenix, $));

'use strict';
(function($l) {
    //Toolbar element 
    // {$type: "layout", $stype: "block/html/row/panel/accordion", $title:[]}
    var _checkItem = function(item, parent, map, utils) {
            item.$id = utils.allocUuid();
            if (parent) item.$parentId = parent.$id;
            if (item.$items) item.$contentId = utils.allocUuid();
            if (map) map[item.$id] = item;
        },

        _beforeGroups = function(html, item, parent) {
            html.push('<div class="panel-group" id="' + item.$id + '">');
        },
        _afterGroups = function(html, item, parent) {
            html.push('</div>');
        },
        _beforeGroup = function(html, item, parent) {
            html.push('<div class="panel panel-default" id="' + item.$id + '">');
            html.push('<div class="panel-heading">');
            html.push('<h3 class="panel-title">');
            html.push('<a data-toggle="collapse" draggable="false" data-parent="#' + parent.$id + '" href="#' + parent.$contentId + '"><span class="glyphicon glyphicon-folder-close bs-icon-space">');
            html.push('</span>');
            html.push(item.$title);
            html.push('</a></h3></div>');
            html.push('<div id="' + parent.$contentId + '" class="panel-collapse collapse in">');
            html.push(' <ul class="list-group">');
        },
        _afterGroup = function(html, item) {
            html.push('</ul></div></div>');
        },

        _beforeItem = function(html, item, parent) {
            html.push('<li draggable="true" class="list-group-item bs-cursor-p" data-toolbox="' + item.$id + '" id="' + item.$id + '">');
            html.push('<span class="glyphicon glyphicon-flash text-success bs-icon-space"></span>');
            html.push(item.$title);
            html.push('</li>');
        },
        _afterItem = function(html, item) {},
        _enumItems = function(item, parent, onItem) {
            var onlyFields = false;
            if (item) {
                onItem(item, parent, true);
                if (item.$items)
                    item.$items.forEach(function(ci) {
                        _enumItems(ci, item, onItem)
                    });
                onItem(item, parent, false);
            }
        },
        _renderToolBox = function(data, dataParent, html, utils, locale) {
            _enumItems(data, dataParent, function(item, parent, before) {
                var rb = _beforeItem;
                var ra = _afterItem;
                switch (item.$type) {
                    case "groups":
                        rb = _beforeGroups;
                        ra = _afterGroups;
                        break;
                    case "group":
                        rb = _beforeGroup;
                        ra = _afterGroup;
                        break;
                    default:
                        rb = _beforeItem;
                        ra = _afterItem;
                        break;
                }
                if (before) {
                    rb(html, item, parent);
                } else {
                    ra(html, item, parent);
                }
            });


        };
    $l.toolBox = $l.toolBox || {};
    var _l = $l.toolBox;
    _l.utils = _l.utils || {};
    _l.utils.check = function(data, map) {
        _enumItems(data, null, function(item, parent, before) {
            if (before) {
                _checkItem(item, parent, map, $l.utils);
            }
        });
    };

    _l.toHtml = function(data, parent) {
        var html = [];
        _renderToolBox(data, parent, html, $l.locale, $l.utils);
        return html.join('');
    }
    return $l;
}(Phoenix));

'use strict';
(function($l, $) {
    var l = $l.toolBox;
    var _setEvents = function($element, toolBox) {
            $element.find('li[draggable="true"]').on('dragstart', function(event) {
                event.stopPropagation();
                var l = toolBox.getItemById($(this).attr('data-toolbox'));
                if (!l || !l.data) {
                    event.preventDefault();
                    return false;
                } else {
                    var dt = (event.originalEvent ? event.originalEvent.dataTransfer : event.dataTransfer);
                    dt.effectAllowed = 'move';
                    dt.setData('Text', 'Data');
                    $l.utils.setDragData({
                        isLayout: (l.data.$type == "layout"),
                        isNew: true,
                        layout: $.extend(true, {}, l.data.data)
                    });
                }
            }).on('dragend', function(event) {
                //end of the drag
                console.log('dragend - tool box');
                $l.utils.emit('ToolBoxDragend')
                $l.utils.setDragData(null);
                event.preventDefault();
                event.stopPropagation();
                return false;

            });
        },
      	_rmvEvents = function($element, toolBox) {
            $element.find('li[draggable="true"]').off('dragstart dragend');
        };

    var _toolBox = function(data) {
            this.$element = null;
            this.map = {};
            l.utils.check(data, this.map);
            this.data = data;
        },
        _methods = {
            renderToolBox: function(data, parentData) {
                var that = this;
                return $(l.toHtml(data, parentData));
            },
            render: function($parent) {
                var that = this;
                if (!that.$element) {
                    that.$element = that.renderToolBox(that.data);
                    if ($parent)
                        $parent.append(that.$element);
                    _setEvents(that.$element, that);
                }
            },
            _destroy: function() {
                var that = this;
                if (that.$element) {
                    _rmvEvents(that.$element, that);
                    that.$element = null;
                }
            },
            getItemById: function(id) {
                if (!id) return null;
                var that = this;
                return that.map[id];
            }
        };
    $.extend(_toolBox.prototype, _methods);

    $l.ui = $l.ui || {};
    $l.ui.ToolBox = _toolBox;

}(Phoenix, $));
