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
                if (l.data.$type == "layout") {
                    $l.utils.setDragData({
                        isLayout: true,
                        isNew: true,
                        layout: l.data.data
                    });
                }
            }
        }).on('dragend', function(event) {
            //end of the drag
            console.log('dragend - tool box');
            $l.utils.setDragData(null);
            event.preventDefault();
            event.stopPropagation();
            return false;

        });
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
