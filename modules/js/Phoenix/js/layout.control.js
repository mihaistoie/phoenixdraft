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
