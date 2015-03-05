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
                hnd(data);
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
        _getPromise = function() { return local.Promise || local.ES6Promise.Promise;},
        _get = function(url, headers) {
            var _promise = _getPromise();
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
        _put = function(url, data, headers) {
            var _promise = _getPromise();
            return new _promise(function(resolve, reject) {
                $.ajax({
                        type: 'PUT',
                        contentType : 'application/json',
                        url: url,
                        data: JSON.stringify(data)
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
        _getScript = function(url) {
            var _promise = _getPromise();
            return new _promise(function(resolve, reject) {
                $.ajax({
                        url: url,
                        dataType: "script",
                        cache: true
                    })
                    .done(function(data, textStatus, jqXHR) {
                        resolve(true);
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
            if (!_renders[context]) return null;
            return _renders[context][name];
        },
        _parseStyle = function(style, css) {
            if (style) {
                var a = style.split(" ");
                a.forEach(function(e, index) {
                    e = e.trim();
                    if (e && (e.charAt(0) === "$"))
                        e = 'bs-style-' + e.substring(1);
                    css.push(e);
                });
            }
        },
        _text = function(node, text) {
            if (text === undefined)
                return node.textContent;
            node.textContent = text;
        },
        entityMap = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': '&quot;',
            "'": '&#39;',
            "/": '&#x2F;'
        },
        _escapeHtml = function(value) {
            return (value || '').replace(/[&<>"'\/]/g, function(s) {
                return entityMap[s];
            });
        };

    phoenix.render = {
        register: _registerRender, // function(context, name, handler)
        get: _getRender // function(context, name)
    };

    phoenix.utils = {
        allocUuid: uuid,
        allocID: allocID,
        escapeHtml: _escapeHtml //function(value)
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
        addClass: _addClass, //function(element, className)
        removeClass: _removeClass, //function(element, className)
        hasClass: _hasClass,
        before: _before,
        append: _append,
        remove: _remove,
        detach: _detach,
        text: _text // function(node, text)

    };
    phoenix.ajax = {
        get: _get,
        getScript: _getScript,//function(url) {
        put: _put//function(url, data) {

    };

    phoenix.styles = {
        parse: _parseStyle //function(style, css) {
    };

    return phoenix;
})(this);

this.Phoenix = Phoenix

'use strict';
(function($l) {

    var ll = {
    	design: {
    		Save: "Save",
    		Preview: "Preview",
            AuthoringMode: "Authoring"
    	},
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
            $l.styles.parse(layout.$style, css);
        },
        _css = function(layout, parent, options) {
            var css = [],
                canAddLayouts;
            switch (layout.$type) {
                case "block":
                    css.push("container-fluid");
                    if (options.design && layout.selected)
                        css.push("selected");
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
            if (layout.$type == "panel" && options.step == 1) {
                var t = $l.dom.find(e, layout.$id + "_title");
                if (t) $l.dom.text(t, layout.$title || "");
            } else if (layout.$type == "html" && options.step == 1) {
                e.innerHTML = layout.$html || '';
            }
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
        _addLayoutId = function(html, step, layout, design) {
            if (design) {
                html.push(' data-layout="');
                html.push(layout.$id);
                html.push('"');
            }
            if (design && step > 1) {
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
            _addLayoutId(html, 1, layout, design);
            _addId(html, layout);
            html.push('>');
            html.push('<div class="panel-heading"');
            html.push('>');
            html.push('<h4 class="panel-title" id="' + layout.$id + '_title"');
            html.push('>');
            html.push(utils.escapeHtml(layout.$title));
            html.push('</h4></div>');
            layout.$idStep2 = layout.$id + "_s2";
            layout.$idDesign = layout.$idStep2;
            html.push('<div');
            _addLayoutCss(html, layout, parent, {
                design: design,
                step: 2
            });
            _addLayoutId(html, 2, layout, design);
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
            _addLayoutId(html, 1, layout, design);
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
            _addLayoutId(html, 1, layout, design);
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
            _addLayoutId(html, 1, layout, design);
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
            _addLayoutId(html, 1, layout, design);
            _addDataStep(html, 1, design);
            html.push('>');
            layout.$idStep2 = layout.$id + "_s2";
            html.push('<div');
            _addLayoutCss(html, layout, parent, {
                design: design,
                step: 2
            });
            _addLayoutId(html, 2, layout, design);
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
            _addLayoutId(html, 1, layout, design);
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
            _addLayoutId(html, 2, layout, design);
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
        _nullHtmlFieldRender = function(html, item, layout, model, options) {
            html.push('<div class="bs-island' + (options.design ? ' design' : '') + (item.$config ? ' bs-widget' : ' bs-field') + (item.selected ? ' selected"' : '"'));
            if (options.design) html.push(' draggable="true"')
            html.push(' data-render="' + item.$id + '"');
            html.push(' id="' + item.$id + '"');
            html.push('></div>')
        },
        _nullWidgetRender = function(html, item, layout, model, options) {
            html.push('<div id="' + item.$id + '"></div>');
        },
        _renderLayout = function(layout, model, html, locale, utils, options) {
            var wHtmlFieldRender = $l.render.get(options.context, "widget") || _nullWidgetRender;
            var fHtmlFieldRender = $l.render.get(options.context, "field") || _nullHtmlFieldRender;
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
                    if (item.$config)
                        wHtmlFieldRender(html, item, parent, model, options);
                    else
                        fHtmlFieldRender(html, item, parent, model, options);
                }
            }, true);
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
            if (before) {
                if (isLayout) {
                    if (clearIds) delete item.$id;
                    delete item.$render;
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
                } else {
                    delete item.$render;
                    if (clearIds) delete item.$id;
                    delete item.$parentId;
                    delete item.$idDrag;                    
                }
            }
        }, true);
    };

    _l.utils.clearMaps = function(layout, map, mapFields) {
        var fields = {};
        _enumElements(layout, null, function(item, parent, isLayout, before) {
            if (before) {
                if (isLayout)
                    delete map[item.$id];
                else
                    delete mapFields[item.$id];
            }
        }, true);
    };
    _l.utils.afterRemoveChild = function(layout, map, mapFields) {
        if (layout.$type == "row") {
            layout.$items.forEach(function(item) {
                item.$type = "column";
                delete item.$colSize;
            });
            _checkRowChilds(layout);
            layout.$items.forEach(function(item) {
                _l.utils.check(item, layout, map, mapFields);
            });
        }
    };
    _l.utils.canDropChild = _canDropChild;
    _l.utils.canSelect = _canSelectLayout;
    _l.utils.updateCssClass = _setLayoutCss;
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
    var _layout = function(data, options) {
            //Layout
            this.$element = null;
            this.$content = null;

            this.options = options || {};
            this.options.context = this.options.context || "javascript";
            this.map = {};
            this.mapFields = {};
            data = data || {};
            l.utils.check(data, null, this.map, this.mapFields);
            this.data = data;
            data.map = this.map;
            data.fields = this.mapFields;
            this.children = {};
            this._setDesignListeners();
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
        _methods = {
            _setDesignListeners: function() {},
            _removeEvents: function() {},
            _addEvents: function() {},
            _onSelectedChanged: function(element, data, notify) {},
            _showSelected: function($element, layout) {},
            toString: function(layout) {
                return null;
            },
            _renderLayout: function(layout) {
                var that = this;
                var $e = $($l.layout.toHtml(layout, null, {
                    design: that.options.design,
                    context: that.options.context
                }));
                that._renderChildren($e);
                return $e;
            },
            _renderChildren: function($e) {
                var that = this;
                var e = $e.get(0);
                var wc = $l.render.get(that.options.context, "widget.control");
                var fc = $l.render.get(that.options.context, "field.control");
                if (wc || fc) {
                    Object.keys(that.mapFields).forEach(function(fn) {
                        var fd = that.mapFields[fn];
                        var _constructor = fd.$config ? wc : fc;
                        if (_constructor) {
                            var p = new _constructor(fd, {
                                context: that.options.context,
                                design: that.options.design,
                                replaceParent: true
                            });
                            p.render($($l.dom.find(e, fd.$id)));
                            that.children[fn] = p;
                        }

                    });
                }
            },
            _clearChildren: function() {
                var that = this;
                var children = that.children;
                that.children = {};
                Object.keys(children).forEach(function(v) {
                    children[v].destroy();
                });
            },
            _refreshSelected: function() {
                var that = this;
                if (that.options.design) {
                    var o = _findSelected([that.map, that.mapFields]);
                    that._onSelectedChanged(that.$element.get(0), o, true);
                }
            },
            render: function($parent) {
                var that = this;
                if (that.$content) {
                    if (that.$element) {
                        that._clearChildren();
                        that._removeEvents();
                        if (that.options.beforeRemove)
                            that.options.beforeRemove(that.$element);
                        that.$element.remove();
                        that.$element = null;
                    }
                } else
                    that.$content = $('<div></div>');

                if (!that.$element) {
                    that.$element = that._renderLayout(that.data);
                    if (that.options.beforeAdd)
                        that.options.beforeAdd(that.$element);
                    that.$content.append(that.$element);
                    that._addEvents();
                    that._refreshSelected();
                }
                if ($parent) {
                    if (that.options.replaceParent)
                        $parent.replaceWith(that.$content);
                    else
                        $parent.append(that.$content);
                }
                return that.$content;
            },
            destroy: function() {
                var that = this;
                $l.ipc.unlisten(that);
                that._clearChildren();
                if (that.$element) {
                    that._removeEvents();
                    that.$element = null;
                }
                that.map = null;
                that.mapFields = null;                
                l.utils.clearMeta(that.data, false);
            },
            check: function(layout, parent) {
                var that = this;
                $l.layout.utils.check(layout, parent, that.map, that.mapFields);
            },
            _afterStructureChanged: function(layout) {
                var that = this;
                that.render();
            },
            _afterPropsChanged: function(item) {
                var that = this;
                if (!this.$element) return;
                var element = this.$element.get(0);
                if (!element) return;
                var l1 = $l.dom.find(element, item.$id);
                var l2 = (item.$id != item.$idStep2) ? $l.dom.find(element, item.$idStep2) : null;
                if (l1)
                    l.utils.updateCssClass(l1, item, that.getLayoutById(item.$parentId), {
                        design: that.options.design,
                        step: 1
                    });
                if (l2)
                    l.utils.updateCssClass(l2, item, that.getLayoutById(item.$parentId), {
                        design: that.options.design,
                        step: 2
                    });
                if (item.selected)
                    that._refreshSelected();
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
                l.utils.afterRemoveChild(p, that.map, that.mapFields);
                that._afterStructureChanged(p);

            },
            setDesignMode: function(value) {
                var that = this;
                if (that.options.design != value) {
                    that.options.design = value;
                    that.render();
                }
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
            },
            select: function(id) {
                var that = this;
                var $e = that.$element;
                if (!id || !that.options.design) return;
                var o = _findSelected([that.map, that.mapFields]);
                if (o) {
                    o.selected = false;
                    that._showSelected($e, o);
                    that._onSelectedChanged($e.get(0), o, false);
                    if (o.$id == id) {
                        that._onSelectedChanged($e.get(0), null, true);
                        return;
                    }
                }
                var d = (that.map[id] ? that.map[id] : that.mapFields[id]);
                d.selected = true;
                that._showSelected($e, d);
                that._onSelectedChanged($e.get(0), d, true);
            },
            updateField: function(id, data) {
                var that = this;
                var dst = that.mapFields[id];
                 if (!dst) return;
                 if (dst.$render && dst.$config) {
                    Object.keys(data.$config).forEach(function(pn) {
                        if (pn == "data") return;
                        if (dst.$render[pn] != data.$config[pn]) {
                            dst.$render[pn] = data.$config[pn];
                        }
                    });
                 }
            },
            updateLayout: function(id, data) {
                var that = this;
                var dst = that.map[id];
                var structChanged = false;
                var propsChanged = false;
                if (dst) {
                    delete data.$type;
                    delete data.selected;
                    if (dst.$type == "row") {
                        if (data.$columns && data.$columns != dst.$items.length) {
                            if (data.$columns > 12) data.$columns = 12;
                            for (var i = dst.$items.length; i < data.$columns; i++) {
                                var d = {
                                    $items: [],
                                    $type: "column"
                                };
                                dst.$items.push(d);
                            }
                            for (var i = data.$columns; i < dst.$items.length; i++) {
                                var d = dst.$items[i];
                                l.utils.clearMaps(d, that.map, that.mapFields);
                            }
                            dst.$items.splice(data.$columns, dst.$items.length);
                            l.utils.afterRemoveChild(dst, that.map, that.mapFields);
                            structChanged = true;
                        }
                        delete data.$columns;
                    }
                    that.disableRules = true;
                    Object.keys(data).forEach(function(pn) {
                        if (data[pn] != dst[pn]) {
                            dst[pn] = data[pn];
                            propsChanged = true;

                        }
                    });
                    that.disableRules = false;

                    if (structChanged)
                        that._afterStructureChanged(dst);
                    else if (propsChanged)
                        that._afterPropsChanged(dst);
                    else
                        that._refreshSelected();

                }


            }
        };
    $.extend(_layout.prototype, _methods);
    $l.ui = $l.ui || {};
    $l.ui.Layout = _layout;

}(Phoenix, $));

'use strict';
(function($l) {
    //Widget data
    // {$config: {$title, $titleIsHidden, $border, $style, $height, data}}
    var _widgetClass = function(data, options) {
            var cfg = data.$config;
            var css = ["bs-island bs-widget"];
            $l.styles.parse(cfg.$style, css);
            if (cfg.$border) css.push("border");
            if (options.design) css.push("design");
            if (data.$selected) css.push("selected");
            return css.join(' ');
        },
        _beforeWidget = function(html, data, options) {
            html.push('<div class="');
            html.push(_widgetClass(data, options));
            html.push('"');
            if (options.design) html.push(' draggable="true"')
            html.push(' data-render="' + data.$id + '"');
            html.push(' id="' + data.$id + '"');
            html.push('>');
            _addTitle(html, data.$id, data.$config, options);
            var contentRender = $l.render.get(options.context, "widget.content");
            if (contentRender) {
                contentRender(html, data.$config, options);
            }

        },
        _addTitle = function(html, id, data, options) {
            html.push('<h4 class="bs-widget-title' + (data.$titleIsHidden?' bs-none':'')+ '" id="' + id + '_title">');
            html.push($l.utils.escapeHtml(data.$title));
            html.push('</h4>');
        },
        _afterWidget = function(html) {
            html.push('</div>');
        },
        _renderWiget = function(html, data, parent, model, options) {
            _beforeWidget(html, data, options);
            _afterWidget(html);
        };
    $l.widget = {
        toHtml: function(data, options, parent, model) {
            var html = [];
            _renderWiget(html, data, parent, model, options);
            return html.join('');
        }
    }
    return $l;
}(Phoenix));

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
