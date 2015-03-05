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

    var _toolBox = function(data, options) {
            this.$element = null;
            this.map = {};
            this.options = options || {};
            data = data || {};
            data.$type = data.$type || "groups";
            l.utils.check(data, this.map);
            this.data = data;
            this._setListeners();

        },
        _methods = {
            renderToolBox: function(data, parentData) {
                return $(l.toHtml(data, parentData));
            },
            render: function($parent) {
                var that = this;
                if (!that.$element) {
                    that.$element = that.renderToolBox(that.data, null);
                    that.setDesignMode(that.options.design);
                    _setEvents(that.$element, that);
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
            _clearChildren: function() {},
            destroy: function() {
                var that = this;
                that._clearChildren();
                if (that.$element) {
                    that._removeEvents();
                    that.$element = null;
                }
                $l.ipc.unlisten(that);
            },
            getItemById: function(id) {
                if (!id) return null;
                var that = this;
                return that.map[id];
            },
            _setListeners: function() {
                $l.ipc.listen('onAuthoringModeChanged', function(value) {
                    this.setDesignMode(value);
                },this);

            },            
            setDesignMode: function(value) {
                var that = this;
                that.options.design = value;
                if (this.$element) {
                    if (this.options.design)
                        $l.dom.removeClass(this.$element.get(0), 'bs-none');
                    else
                        $l.dom.addClass(this.$element.get(0), 'bs-none');
                }

            }

        };
    $.extend(_toolBox.prototype, _methods);
    $l.ui = $l.ui || {};
    $l.ui.ToolBox = _toolBox;
}(Phoenix, $));
