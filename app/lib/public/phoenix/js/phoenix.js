'use strict';
var Phoenix = (function(local) {
    var phoenix = {};

    var _p8 = function(s) {
            var p = (Math.random().toString(16) + "000000000").substr(2, 8);
            return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
        },
        uuid = function() {
            return _p8() + _p8(true) + _p8(true) + _p8();
        },
        allocID = function() {
            return "I" + _p8() + _p8() + _p8() + _p8();
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
                var hnd = item.listener ? item.handler.bind(item.listener) : item.handler;
                hnd();
            });
        },
        _regListener = function(eventName, handler, listener) {
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
        },
        _find = function(parent, id) {
            if (parent) {
                if (parent.id == id) return parent;
                return parent.querySelector('#' + id);
            }
            return document.getElementById(id);

        },
        _addClass = function(element, className) {
            element.classList.add(className);
        },
        _removeClass = function(element, className) {
            element.classList.remove(className);
        },
        _hasClass = function(element, className) {
            return element.classList.contains(className);
        },
        _remove = function(element) {
            element.parentNode.removeChild(element);
        },
        _detach = function(element) {
            return element.parentNode.removeChild(element);
        },
        _append = function(parent, element) {
            parent.appendChild(element);
        },
        _before = function(child, element) {
            child.parentNode.insertBefore(element, child);
        },
        _get = function(url, headers) {
            var _promise = local.Promise  || local.ES6Promise.Promise;
            return new _promise(function(resolve, reject) {
                $.ajax({
                        url: url
                    })
                    .done(function(data, textStatus, jqXHR) {
                        resolve(data);
                    }).fail(function(jqXHR, textStatus, errorThrown) {
                        reject(errorThrown || {
                            message: textStatus
                        });
                    });
            });
        },
        _renders = {},
        _registerRender = function(context, name, handler) {
            _renders[context] = _renders[context] || {};
            _renders[context][name] = handler;
        },        
        _getRender = function(context, name) {
            if  (!_renders[context]) return null;
            return _renders[context][name];
        };

    phoenix.render = {
        register : _registerRender,
        get : _registerRender
    };

    phoenix.utils = {
        allocUuid: uuid,
        allocID: allocID
    };
    phoenix.drag = {
        setData: _setDragData,
        getData: _getDragData,
    };

    phoenix.ipc = {
        emit: _emitEvent,
        listen: _regListener,
        unlisten: _unregListener
    };
    phoenix.dom = {
        find: _find,
        addClass: _addClass,
        removeClass: _removeClass,
        hasClass: _hasClass,
        before: _before,
        append: _append,
        remove: _remove,
        detach: _detach
    };
    phoenix.ajax = {
        get: _get
    };
    return phoenix;
})(this);

this.Phoenix = Phoenix

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
        _checkField = function(field, parent, utils, map) {
            if (!field.$id)
                field.$id = utils.allocID();
            if (parent)
                field.$parentId = parent.$id;
            field.$idDrag = field.$id;
            if (map) map[field.$id] = field;
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
        _hasBorder = function(layout) {
            return (layout.$type == "panel");
        },
        _needParentPadding = function(layout) {

            return _hasBorder(layout);
        },
        _noPadding = function(layout) {
            var res = true;
            if (!layout.$items.length || !_hasBorder(layout)) return res;
            layout.$items.forEach(function(item) {
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
                if (l.$type || l.$items)
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
            var css = [],
                canAddLayouts;
            switch (layout.$type) {
                case "block":
                    css.push("container-fluid");
                    canAddLayouts = _canAddLayouts(layout);
                    if (canAddLayouts) {
                        if (options.design || _noPadding(layout))
                            css.push("no-x-padding");
                        if (options.design)
                            css.push("drop-layouts-zone");
                    }
                    if (_canAddFields(layout)) {
                        if (options.design) {
                            css.push("drop-fields-zone");
                            if (!canAddLayouts)
                                css.push("no-x-padding");
                        }
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
                        canAddLayouts = _canAddLayouts(layout);
                        if (canAddLayouts) {
                            if (options.design || _noPadding(layout)) {
                                css.push("no-x-padding");
                                css.push("no-y-padding");
                            }

                            if (options.design)
                                css.push("drop-layouts-zone");
                        }
                        if (_canAddFields(layout)) {
                            if (options.design) {
                                css.push("drop-fields-zone");
                                if (!canAddLayouts)
                                    css.push("no-x-padding");
                            }
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
                        canAddLayouts = _canAddLayouts(layout);
                        if (canAddLayouts) {
                            if (options.design || _noPadding(layout)) {
                                css.push("no-x-padding");
                            }
                            if (options.design)
                                css.push("drop-layouts-zone");
                        }
                        if (_canAddFields(layout)) {
                            if (options.design) {
                                css.push("drop-fields-zone");
                                if (!canAddLayouts)
                                    css.push("no-x-padding");
                            }
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
        _setLayoutCss = function(e, layout, parent, options) {
            var css = _css(layout, parent, options);
            e.className = css.join(' ');
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

        _panelBefore = function(html, layout, parent, model, locale, utils, design) {
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
        _panelAfter = function(html, layout, parent, model, locale, utils, design) {
            html.push('</div>');
            if (layout.$footer) {
                html.push('<div class="panel-footer">');
                html.push(layout.$footer);
                html.push('</div>');
            }
            html.push('</div>');
        },
        _blockBefore = function(html, layout, parent, model, locale, utils, design) {
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
        _blockAfter = function(html, layout, model, locale, utils, design) {
            html.push('</div>');
        },
        _htmlBefore = function(html, layout, parent, model, locale, utils, design) {
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
        _htmlAfter = function(html, layout, model, locale, utils, design) {
            html.push('</div>');
        },
        _accordionBefore = function(html, layout, parent, model, locale, utils, design) {
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
        _accordionAfter = function(html, layout, parent, model, locale, utils, design) {
            html.push('</div>');
        },
        _rowBefore = function(html, layout, parent, model, locale, utils, design) {
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
        _rowAfter = function(html, layout, parent, model, locale, utils, design) {
            html.push('</div></div>');
        },
        _columnBefore = function(html, layout, parent, model, locale, utils, design) {
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
        _columnAfter = function(html, layout, parent, model, locale, utils, design) {
            html.push('</div></div>');

        },
        _enumElements = function(layout, parent, onElement, root) {
            if (layout) {
                if (root && !layout.$type && !layout.$items) {
                    onElement(layout, parent, false, true);
                    return;
                }
                onElement(layout, parent, true, true);
                if (_canAddFields(layout)) {
                    if (layout.$items)
                        layout.$items.forEach(function(item) {
                            onElement(item, layout, false, true);
                        });

                } else {
                    if (layout.$items)
                        layout.$items.forEach(function(item) {
                            _enumElements(item, layout, onElement, false);
                        });
                }
                onElement(layout, parent, true, false);
            }
        },
        _nullHtmlFieldRender = function(html, item, layout, model, locale, utils, design) {
            html.push('<div class="field' + (design ? ' design' : '') + (item.$config ? ' widget"' : '"') + (item.selected ? ' selected"' : '"'));
            if (design) html.push(' draggable="true"')
            html.push(' data-render="' + item.$id + '"');
            html.push(' id="' + item.$id + '"');
            html.push('></div>')
        },
        _renderLayout = function(layout, model, html, locale, utils, options) {
            var htmlFieldRender = _nullHtmlFieldRender;
            if (!options.design) {

            }
            _enumElements(layout, null, function(item, parent, isLayout, before) {
                if (isLayout) {
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
                        rb(html, item, parent, model, locale, utils, options.design);
                    } else {
                        ra(html, item, parent, model, locale, utils, options.design);
                    }
                } else {
                    if (htmlFieldRender) {
                        htmlFieldRender(html, item, parent, model, locale, utils, options.design);

                    }

                }
            }, true);
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
            if (child.$type) {
                /* child is layout */
                parentLevel = parseInt(parentLevel || '1', 10);
                if (!parent || !child) return false;
                if (parent.$type == 'column') {
                    if (parentLevel == '1') {
                        return (parent == child)
                    }
                }
                if (child.$type == 'column') return false;
                return true;
            } else if (child.$bind || child.$config) {
                /* child is field or widget */
                var i = parent.$items.length;
                if (!i)
                    return true;
                var ctype = child.$bind ? '$bind' : '$config';
                while (i--) {
                    if (!parent.$items[i][ctype]) return false;
                }
                return true;

            }
            return false;
        },
        _canSelectLayout = function(layout, level) {
            if (layout.$type == "column" && level == 1) return false;
            return true;
        }

    $l.layout = $l.layout || {};
    var _l = $l.layout;
    _l.utils = _l.utils || {};
    _l.utils.check = function(layout, parentLayout, map, mapFields) {
        _enumElements(layout, parentLayout, function(item, parent, isLayout, before) {
            if (before) {
                if (isLayout)
                    _checkLayout(item, parent, $l.utils, map);
                else
                    _checkField(item, parent, $l.utils, mapFields);
            }
        }, true);
    };

    _l.utils.clearMeta = function(layout, clearIds) {
        _enumElements(layout, null, function(item, parent, isLayout, before) {
            if (isLayout && before) {
                if (clearIds) delete item.$id;
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
        }, true);
    };

    _l.utils.clearMaps = function(layout, map, mapFields) {
            _enumElements(layout, null, function(item, parent, isLayout, before) {
                if (before) {
                    if (isLayout)
                        delete map[item.$id];
                    else
                        delete mapFields[item.$id];
                }
            }, true);
        },
        _l.utils.afterRemoveChild = function(layout, map, mapFields) {
            if (layout.$type == "row") {
                layout.$items.forEach(function(item) {
                    item.$type = "column";
                    delete item.$colSize;
                });
                var docheck = !layout.$items.length;
                _checkRowChilds(layout);
                layout.$items.forEach(function(item) {
                    _l.utils.check(item, layout, map, mapFields);
                });
            }
        };
    _l.utils.canDropChild = _canDropChild;
    _l.utils.canSelect = _canSelectLayout;
    _l.utils.updateCssClass = _setLayoutCss;
    _l.authModeHtml = _createAuthoringMode;
    _l.toHtml = function(layout, model, options) {
        var html = [];
        _renderLayout(layout, model, html, $l.locale, $l.utils, options);
        return html.join('');
    }
    return $l;
}(Phoenix));

'use strict';
(function($l, $) {
    var l = $l.layout;
    var _dom = $l.dom;
    var _event2Id = function(event, root, layout) {
            var t = event.target,
                id = null,
                level, ll;
            while (t) {
                var id = t.getAttribute('data-layout');

                if (id) {
                    level = parseInt(t.getAttribute('data-level') || '1', 10);
                    ll = layout.getLayoutById(id);
                    if (!ll || !l.utils.canSelect(ll, level)) id = null
                    if (id)
                        break;
                } else {
                    id = t.getAttribute('data-render');
                    if (id) break;
                }
                t = (t == root) ? null : t.parentNode;
            }
            return id;
        },
        _isRemoveButton = function(event, root) {
            var t = event.target;
            while (t) {
                if (t.hasAttribute('data-remove'))
                    return true;
                t = (t == root) ? null : t.parentNode;
            }
            return false;
        },
        _event = function(event) {
            return event.originalEvent ? event.originalEvent : event;
        },
        _cleanCopy = function(data, onlySelf) {
            if (!data) return null;
            var restoreMap, map, fields, items;
            if (data.map) {
                restoreMap = true;
                map = data.map;
                data.map = null;
                fields = data.fields;
                data.fields = null;
            }
            if (onlySelf) {
                items = data.$items;
                if (items) data.$items = []
            }
            var o = $.extend(true, {}, data);
            if (restoreMap) {
                data.map = map;
                data.fields = fields;
                delete o.fields;
                delete o.map;
            }
            if (onlySelf) 
                data.$items = items;

            if (o.$type) {
                l.utils.clearMeta(o, !onlySelf);
                if (onlySelf) delete o.$items;
            }
            return o;
        },            
        _createTopList = function(p, exclude, placeHolder) {
            var res = [];
            var childs = p.childNodes;
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
        _indexInParent = function(parent, placeHolder, dragging, isLayout) {
            var j = 0;
            for (var i = 0, len = parent.childNodes.length; i < len; i++) {
                var c = parent.childNodes[i];
                if (c == placeHolder) return j;
                if (c == dragging) continue;
                if (isLayout && !c.hasAttribute('data-layout')) continue;
                if (!isLayout && !c.hasAttribute('data-render')) continue;
                j++;
            }
            return 0;
        },
        _appendPlaceHolder = function(parent, list, index, placeHolder, parentLayout, level) {
            var _beforeAppend = function(sameParent) {
                if (placeHolder.parentNode)
                    _dom.remove(placeHolder);
                if (parentLayout.$type && !sameParent) {
                    if (parentLayout.$type == 'column' && level == 1) {
                        _dom.addClass(placeHolder, 'col');
                    } else {
                        _dom.removeClass(placeHolder, 'col');
                    }
                }
            }
            if (!list.length) {
                _beforeAppend(false);
                _dom.append(parent, placeHolder);
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
                _dom.append(parent, placeHolder);
            } else {
                var c = parent.childNodes[index];
                _beforeAppend(phIndex >= 0);
                _dom.before(c, placeHolder);
            }
            return true;
        },
        _createPlaceHolderOnStart = function(proto, placeHolder, isLayout, isField, isWidget) {
            if (isLayout) {
                if (placeHolder)
                    _dom.remove(placeHolder);
                placeHolder = document.createElement('div');
                placeHolder.className = proto.className;
                _dom.addClass(placeHolder, 'drop-target');
                _dom.before(proto, placeHolder);
                return placeHolder;
            } else {
                placeHolder = _createEmptyPlaceHolderOnStart(placeHolder, false, isField, isWidget);
                _dom.before(proto, placeHolder);
            }
            return placeHolder;
        },
        _createEmptyPlaceHolderOnStart = function(placeHolder, isLayout, isField, isWidget) {
            if (placeHolder)
                _dom.remove(placeHolder);
            placeHolder = document.createElement('div');
            placeHolder.className = 'container-fluid no-x-padding drop-layouts-zone drop-fields-zone design drop-target' + (isLayout ? "" : " field") + (isWidget ? " widget" : "");
            return placeHolder;
        },

        _createDragImage = function(isLayout) {
            var crt = document.createElement('div');
            crt.className = 'bs-drag-image';
            document.body.appendChild(crt);
            return crt;
        },
        _findSelected = function(maps) {
            var j = maps.length;
            while (j--) {
                var map = maps[j];
                var ids = Object.keys(map);
                var i = ids.length;
                while (i--) {
                    var o = map[ids[i]];
                    if (o.selected) {
                        return o;
                    }
                }
            }
            return null;
        },
        _showSelected = function($element, layout) {
            if (!$element) return;
            var e = _dom.find($element.get(0), layout.$idDrag);
            if (layout.selected)
                _dom.addClass(e, 'selected');
            else
                _dom.removeClass(e, 'selected');
        },
        _onSelectedChanged = function(element, data, notify) {
            if (data) {
                var p = _dom.find(element, data.$idDrag);
                if (element != p) {
                    if (data.selected) {
                        var r = $('<div class="bs-rt-button" data-remove="true"><span class="glyphicon glyphicon-remove-sign"></span></div>').get(0);
                        var c = p.childNodes;
                        if (c.length)
                            _dom.before(c[0], r);
                        else
                            _dom.append(p, r);
                    } else {
                        var rmv = p.querySelector('div[data-remove="true"]');
                        if (rmv) _dom.remove(rmv);
                    }
                }
            }
            if (notify) {
                $l.ipc.emit("SelectedChanged", {
                    type: data ? (data.$type ? "layout" : (data.$config ? "widget": "field")) : null,
                    data: _cleanCopy(data, true)
                });
            }
        },
        _startDrag = function($element, layout) {
            if (!$element) return;
            var e = _dom.find($element.get(0), layout.$idDrag);
            if (layout.selected)
                _dom.addClass(e, 'selected');
            else
                _dom.removeClass(e, 'selected');
        },
        _removeEvents = function($element, layout, design) {
            if (design) {
                $element.off('click');
                $element.find('div[draggable="true"]').off('dragstart').add($element).off('dragend');
                $element.find('div[draggable="true"]').off('dragstart');
                $element.find('.drop-layouts-zone, .drop-fields-zone').add($element).off('dragover dragenter drop');
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
        _accceptNewChild = function(p, td) {
            if (td.isLayout) return true;
            return (td.isField || td.isWidget);
        },
        _updateCss = function(item, element, layout, design) {
            var l1 = _dom.find(element, item.$id);
            var l2 = (item.$id != item.$idStep2) ? _dom.find(element, item.$idStep2) : null;
            l.utils.updateCssClass(l1, item, layout.getLayoutById(item.$parentId), {
                design: design,
                step: 1
            });
            if (l2)
                l.utils.updateCssClass(l2, item, layout.getLayoutById(item.$parentId), {
                    design: design,
                    step: 2
                });
        },
        _setEvents = function($element, layout, design) {
            if (design) {
                var dragging, dragImage, startDrag, placeHolder, topList;
                var _cleanUp = function() {
                        if (dragging) {
                            _dom.removeClass(dragging, 'bs-none');
                            dragging = null;
                        }
                        if (placeHolder) {
                            _dom.remove(placeHolder);
                            placeHolder = null;
                        }
                        if (dragImage) {
                            _dom.remove(dragImage)
                            dragImage = null;
                        }
                        topList = null;
                        startDrag = false;
                        $l.drag.setData(null);
                    },
                    _performDrop = function(td) {
                        var root = $element.get(0);
                        if (td) {
                            if (td.data == td.dst) return;
                            var ni, oi, op,
                                np = td.dst,
                                moved = td.data;
                            var e = _dom.find(root, moved.$id),
                                p = _dom.find(root, np.$idDesign),
                                c;
                            if (moved.$parentId == np.$id) {
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
                                if (oi >= 0) e = _dom.detach(e);
                                if (ni == (np.$items.length - 1))
                                    _dom.append(p, e);
                                else {
                                    c = _dom.find(root, np.$items[ni + 1].$id);
                                    _dom.before(c, e);
                                }

                                var toUpdate = [op];
                                if (td.isLayout)
                                    toUpdate.push(moved);
                                if (np != op) toUpdate.push(np);
                                // setevents
                                _removeEvents($element, layout, design);
                                _setEvents($element, layout, design);
                                //update css 
                                toUpdate.forEach(function(item) {
                                    _updateCss(item, root, layout, design);
                                });
                                return;
                            } else {
                                layout.check(moved, np);
                            }
                            layout.render();
                        }
                    };
                $element.on('click', function(event) {
                    var id = _event2Id(event, $element.get(0), layout);
                    if (_isRemoveButton(event, $element.get(0))) {
                        layout.removeChild(id);
                        return;
                    }
                    layout.select(id);
                });
                $element.find('div[draggable="true"]').on('dragstart', function(event) {
                    event.stopPropagation();
                    var isField = false,
                        isWidget = false;
                    var l = layout.getLayoutById(this.getAttribute('data-layout'));
                    if (!l) {
                        l = layout.getFieldById(this.getAttribute('data-render'));
                        isField = true;
                        isWidget = (l.$config != null);
                    }
                    if (!l) {
                        event.preventDefault();
                        return false;
                    } else {
                        var dt = _event(event).dataTransfer;
                        dt.effectAllowed = 'move';
                        dt.setData('Text', 'data');
                        if (!isField && dt.setDragImage) {
                            dragImage = _createDragImage(true);
                            dt.setDragImage(dragImage, 0, 0);
                        }
                        $l.drag.setData({
                            data: l,
                            isLayout: !isField,
                            isField: isField,
                            isWidget: isWidget,
                            isNew: false
                        });
                        dragging = _dom.find($element.get(0), l.$idDrag);
                        startDrag = true;
                    }
                }).add($element).on('dragend', function(event) {
                    //end of the drag
                    event.preventDefault();
                    event.stopPropagation();
                    _cleanUp();
                    return false;
                });
                $element.find('.drop-layouts-zone, .drop-fields-zone').add($element).on('dragover dragenter drop', function(event) {
                    var t = this,
                        td = $l.drag.getData(),
                        e = _event(event),
                        dt = e.dataTransfer;
                    event.stopPropagation();
                    if (!td || (!td.isLayout && !_dom.hasClass(t, 'drop-fields-zone')) ||
                        (td.isLayout && !_dom.hasClass(t, 'drop-layouts-zone'))) {
                        dt.effectAllowed = 'none';
                        return true;
                    }

                    if (event.type == 'drop') {
                        event.preventDefault();
                        var dst = layout.getLayoutById(t.getAttribute('data-layout'));
                        var dstLevel = t.getAttribute('data-level');
                        if (dst) {
                            td = $l.drag.getData();
                            td.dst = dst;
                            td.dstLevel = dstLevel;
                            td.indexInParent = _indexInParent(t, placeHolder, dragging, td.isLayout);
                            $l.drag.setData(td);
                            _cleanUp();
                            _performDrop(td);
                            return false;
                        }
                        _cleanUp();
                        return false;
                    }
                    dt.getData('Text');
                    if (startDrag) {
                        if (!dragging) return
                        startDrag = false;
                        if (!td.isNew) {
                            placeHolder = _createPlaceHolderOnStart(dragging, placeHolder, td.isLayout, td.isField, td.isWidget);
                            _dom.addClass(dragging, 'bs-none');
                            event.preventDefault();
                            return false
                        }
                    }
                    var p = layout.getLayoutById(t.getAttribute('data-layout'));
                    var level = t.getAttribute('data-level');

                    if (!placeHolder) {
                        if (!td.isNew) return true;
                        if (!_accceptNewChild(p, td)) {
                            dt.effectAllowed = 'none';
                            return true;
                        }
                        topList = _createTopList(t, dragging, placeHolder);
                        var iph = _newIndex(topList, e.pageY);
                        placeHolder = _createEmptyPlaceHolderOnStart(placeHolder, td.isLayout, td.isField, td.isWidget);
                        _appendPlaceHolder(t, topList, iph, placeHolder, p, level);
                        topList = null;
                        event.preventDefault();
                        return false;
                    }
                    if (event.type == 'dragenter') topList = null;
                    if (dragging == t) {
                        dt.effectAllowed = 'none';
                        return true;
                    }
                    if (!l.utils.canDropChild(td.data, p, level)) {
                        dt.effectAllowed = 'none';
                        return true;
                    }
                    if (!topList)
                        topList = _createTopList(t, dragging, placeHolder);

                    var ii = _newIndex(topList, e.pageY);
                    if (_appendPlaceHolder(t, topList, ii, placeHolder, p, level)) {
                        topList = null;
                    }
                    event.preventDefault();
                    return false;
                });
            }

        },
        _layout = function(data, options) {
            //Layout
            this.$element = null;
            //Mode design
            this.$check = null;
            //Content = this.$check + this.$element;
            this.$content = null;

            this.options = options || {};
            this.options.context = this.options.context || "widget";
            this.map = {};
            this.mapFields = {};
            data = data || {};
            l.utils.check(data, null, this.map, this.mapFields);
            this.data = data;
            data.map = this.map;
            data.fields = this.mapFields;

            $l.ipc.listen('onToolBoxDragend', function() {
                if (this.$element) {
                    this.$element.trigger('dragend');
                }
            }, this);
        },
        _methods = {
            _renderLayout: function(layout) {
                var that = this;
                return $(l.toHtml(layout, null, {
                    design: that.options.design, context: that.options.context
                }));
            },
            render: function($parent) {
                var that = this;

                if (that.$content) {
                    if (that.$element) {
                        _removeEvents(that.$element, that, true);
                        if (that.options.beforeRemove)
                            that.options.beforeRemove(that.$element);
                        that.$element.remove();
                        that.$element = null;
                    }
                    if (that.$check) {
                        _removeDesignModeEvents(that.$check);
                        that.$check.remove();
                        that.$check = null;
                    }
                } else {
                    that.$content = $('<div></div>');
                }
                if (that.options.showPreview && !that.$check) {
                    that.$check = $(l.authModeHtml(that.options.design));
                    that.$content.append(that.$check);
                    _setDesignModeEvents(that.$check, that, that.options.design);
                }
                if (!that.$element) {
                    that.$element = that._renderLayout(that.data);
                    that.$content.append(that.$element);
                    _setEvents(that.$element, that, that.options.design);
                    var o = _findSelected([that.map, that.mapFields]);
                    if (that.options.design)
                        _onSelectedChanged(that.$element.get(0), o, true);
                }
                if ($parent) {
                    if (that.options.beforeAdd)
                        that.options.beforeAdd(that.$element);
                    if (that.options.replaceParent)
                        $parent.replaceWith(that.$content);
                    else
                        $parent.append(that.$content);
                }
                return that.$content;
            },
            destroy: function() {
                var that = this;
                if (that.$element) {
                    _removeEvents(that.$element, that, that.options.design)
                    that.$element = null;
                }
                if (that.$check) {
                    _removeDesignModeEvents(that.$check);
                    that.$check = null;
                }
                $l.ipc.unlisten(that);

            },
            check: function(layout, parent) {
                l.utils.check(layout, parent, this.map, this.mapFields);
            },
            toString: function(layout) {
                var o = _cleanCopy(layout || this.data, false);
                return JSON.stringify(o, 2)
            },
            removeChild: function(id) {
                var that = this;
                if (!id || !that.options.design) return;
                var d = that.map[id] || that.mapFields[id];
                if (!d) return;
                var p = that.map[d.$parentId];
                if (!p) return;
                var i = p.$items.indexOf(d);
                p.$items.splice(i, 1);
                l.utils.clearMaps(d, this.map, this.mapFields);
                l.utils.afterRemoveChild(p, this.map, this.mapFields);
                that.render();

            },
            setDesignMode: function(value) {
                var that = this;
                if (that.options.design != value) {
                    that.options.design = value;
                    that.render();
                }
            },
            select: function(id) {
                var that = this;
                var $e = that.$element;
                if (!id || !that.options.design) return;
                var o = _findSelected([that.map, that.mapFields]);
                if (o) {
                    o.selected = false;
                    _showSelected($e, o);
                    _onSelectedChanged($e.get(0), o, false);
                    if (o.$id == id) {
                        _onSelectedChanged($e.get(0), null, true);
                        return;
                    }
                }
                var d = (that.map[id] ? that.map[id] : that.mapFields[id]);
                d.selected = true;
                _showSelected($e, d);
                _onSelectedChanged($e.get(0), d, true);
            },
            getLayoutById: function(id) {
                if (!id) return null;
                var that = this;
                return that.map[id];
            },
            getFieldById: function(id) {
                if (!id) return null;
                var that = this;
                return that.mapFields[id];
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
            item.$id = utils.allocID();
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
                    var td = {
                        isNew: true,
                        data: $.extend(true, {}, l.data.data)
                    };
                    switch (l.data.$type) {
                        case "layout":
                            td.isLayout = true;
                            break;
                        case "field":
                            td.isField = true;
                            break;
                        case "widget":
                            td.isWidget = true;
                            break;
                    }
                    $l.drag.setData(td);
                }
            }).on('dragend', function(event) {
                //end of the drag
                $l.ipc.emit('ToolBoxDragend')
                $l.drag.setData(null);
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
