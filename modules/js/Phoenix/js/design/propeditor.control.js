'use strict';
(function($l, $) {
    var _html = function(id, options) {
            var html = [
                '<form id="' + id + '" class="'+(options.design ? '': 'bs-none')+'">',
                '    <div class="form-group">',
                '        <textarea class="form-control" rows="3"  id="' + id + '_json"></textarea>',
                '    </div>',
                '    <button type="button" class="form-group btn btn-default pull-right" id="' + id + '_apply">Apply</button>',
                '</form>',
            ];
            return html.join('');

        },
        _pe = function(options) {
            this.$element = null;
            this.$id = $l.utils.allocID();
            this.options = options || {};
            this.selected = null;
            this._setListeners();
        },
        _methods = {
            _removeEvents: function() {
                $($l.dom.find(this.$element.get(0), this.$id + "_apply")).off('click');
            },
            _setEvents: function() {
                var that = this;
                $($l.dom.find(that.$element.get(0), that.$id + "_apply")).on('click', function(event) {
                    if (that.selected && that.selected.id) {
                        var v = $l.dom.find(that.$element.get(0), that.$id + "_json").value;
                        try {
                            that.selected.data = JSON.parse(v);
                        } catch (ex) {
                            alert(ex.message);
                            return;
                        }
                        $l.ipc.emit('UpdateSelected', that.selected);
                    }
                });
            },
            _setListeners: function(layout) {
                $l.ipc.listen('onSelectedChanged', function(data) {
                    this.selected = data;
                    if (this.$element)
                        this._setJson(JSON.stringify(data.data, null, true));
                }, this);
                $l.ipc.listen('onAuthoringModeChanged', function(value) {
                    this.setDesignMode(value);
                },this);

            },
            _setJson: function(value) {
                var e = $l.dom.find(this.$element.get(0), this.$id + "_json");
                if (e) {
                    e.value = value;
                }
            },
            setDesignMode: function(value) {
                var that = this;
                this.options.design = value;
                if (this.$element) {
                    if (this.options.design)
                        $l.dom.removeClass(this.$element.get(0), 'bs-none');
                    else
                        $l.dom.addClass(this.$element.get(0), 'bs-none');
                }

            },
            _clearChildren: function() {
            },
            render: function($parent) {
                var that = this;
                if (!that.$element) {
                    that.$element = $(_html(that.$id, that.options));
                    that._setEvents();
                    if (that.options.beforeAdd)
                        that.options.beforeAdd(that.$element);
                }
                if ($parent) {
                    if (that.options.replaceParent)
                        $parent.replaceWith(that.$element);
                    else
                        $parent.append(that.$element);
                }
                return that.$element;
            },
            destroy: function() {
                var that = this;
                that._clearChildren();
                if (that.$element) {
                    that._removeEvents();
                    that.$element = null;
                }
                $l.ipc.unlisten(that);
            }
        };
    $.extend(_pe.prototype, _methods);
    $l.ui = $l.ui || {};
    $l.ui.PropertyEditor = _pe;
}(Phoenix, $));
