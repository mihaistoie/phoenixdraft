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
                if (items) data.$items = [];
                if (data.$type == "row") {
                    data.$columns = items.length;
                }
            }
            var o = $.extend(true, {}, data);
            if (restoreMap) {
                data.map = map;
                data.fields = fields;
                delete o.fields;
                delete o.map;
            }
            if (onlySelf) {
                data.$items = items;
                delete data.$columns;
            }

            if (o.$type) {
                l.utils.clearMeta(o, !onlySelf);
                if (onlySelf) delete o.$items;
            } else {
                delete o.$parentId;
                delete o.$idDrag;
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
            placeHolder.className = 'container-fluid no-x-padding drop-layouts-zone drop-fields-zone design drop-target' + (isField ? " bs-island bs-field" : "") + (isWidget ? " bs-island bs-widget" : "");
            return placeHolder;
        },

        _createDragImage = function(isLayout) {
            var crt = document.createElement('div');
            crt.className = 'bs-drag-image';
            document.body.appendChild(crt);
            return crt;
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
                        var old = p.querySelector('div[data-remove="true"]');
                        if (!old) {
                            var r = $('<div class="bs-rt-button" data-remove="true"><span class="glyphicon glyphicon-remove-sign"></span></div>').get(0);
                            var c = p.childNodes;
                            if (c.length)
                                _dom.before(c[0], r);
                            else
                                _dom.append(p, r);
                        }
                    } else {
                        var rmv = p.querySelector('div[data-remove="true"]');
                        if (rmv) _dom.remove(rmv);
                    }
                }
            }
            if (notify) {
                var cd = _cleanCopy(data, true);
                if (cd) delete cd.$id;
                $l.ipc.emit("SelectedChanged", {
                    type: data ? (data.$type ? "layout" : (data.$config ? "widget" : "field")) : null,
                    id: data ? data.$id : null,
                    data: cd
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
                                    layout._afterPropsChanged(item);
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
                        isLayout = true,
                        isWidget = false;

                    var l = layout.getLayoutById(this.getAttribute('data-layout'));
                    if (!l) {
                        l = layout.getFieldById(this.getAttribute('data-render'));
                        isWidget = (l.$config != null);
                        isField = !isWidget;
                        isLayout = false;
                    }
                    if (!l) {
                        event.preventDefault();
                        return false;
                    } else {
                        var dt = _event(event).dataTransfer;
                        dt.effectAllowed = 'move';
                        dt.setData('Text', 'data');
                        if (isLayout && dt.setDragImage) {
                            dragImage = _createDragImage(true);
                            dt.setDragImage(dragImage, 0, 0);
                        }
                        $l.drag.setData({
                            data: l,
                            isLayout: isLayout,
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
                        if (!l.utils.canDropChild(td.data, p, level)) {
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
        _layout = $l.ui.Layout,
        _methods = {
            _setDesignListeners: function(layout) {
                $l.ipc.listen('onToolBoxDragend', function() {
                    if (this.$element) {
                        this.$element.trigger('dragend');
                    }
                }, this);
                $l.ipc.listen('onUpdateSelected', function(data) {
                    if (data.type == "layout") {
                        this.updateLayout(data.id, data.data);
                    }
                }, this);
                $l.ipc.listen('onAuthoringModeChanged', function(value) {
                    layout.setDesignMode(value);
                },this) 
                    
            },
            _removeEvents: function() {
                _removeEvents(this.$element, this, true);
            },
            _addEvents: function() {
                _setEvents(this.$element, this, this.options.design);
            },
            _onSelectedChanged: function(element, data, notify) {
                _onSelectedChanged(element, data, notify);
            },
            toString: function(layout) {
                var o = _cleanCopy(layout || this.data, false);
                return JSON.stringify(o, 2)
            },
            _showSelected: function($element, layout) {
                _showSelected($element, layout);
            },
            toString: function(layout) {
                var o = _cleanCopy(layout || this.data, false);
                return JSON.stringify(o, 2)
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
