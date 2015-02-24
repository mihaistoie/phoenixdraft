'use strict';
(function($l, $) {
    var _html = function(id, options) {
            var html = [
                '<nav class="navbar navbar-default" id="' + id + '">',
                '  <div class="container-fluid">',
                '    <div class="navbar-header">',
                '      <a class="navbar-brand" href="#">',
                         $l.locale.layouts.design.AuthoringMode,
                '      </a>',
                '    </div>',
                '    <div class="collapse navbar-collapse">',
                '     <form class="navbar-form navbar-left" role="search">',
                '       <button type="button" class="btn btn-default" id="' + id + '_save">',
                '         <span class="glyphicon glyphicon-floppy-save" aria-hidden="false"></span> ',
                          $l.locale.layouts.design.Save,
                '       </button>',
                '       <div class="checkbox">',
                '         <label>',
                '           <input type="checkbox" id="' + id + '_preview"'+ (options.design ? '': ' checked="true"') + '> ',
                          $l.locale.layouts.design.Preview,
                '          </label>',
                '       </div>',
                '       </form>',
                '    </div>',
                '  </div>',
                '</nav>'
            ];

            return html.join('');

        },
        _atb = function(options) {
            this.$element = null;
            this.$id = $l.utils.allocID();
            this.options = options || {};
        },
        _methods = {
            _removeEvents: function() {
                $($l.dom.find(this.$element.get(0), this.$id + "_save")).off('click');
                $($l.dom.find(that.$element.get(0), that.$id + "_preview")).off('click');

            },
            _setEvents: function() {
                var that = this;
                $($l.dom.find(that.$element.get(0), that.$id + "_save")).on('click', function(event) {
                    $l.ipc.emit('SaveLayout');
                    event.stopPropagation();
                    event.preventDefault();
                    return false;
                });
                $($l.dom.find(that.$element.get(0), that.$id + "_preview")).on('click', function(event) {
                    $l.ipc.emit('AuthoringModeChanged', !this.checked);
                    event.stopPropagation();
                });

            },
            _clearChildren: function() {},
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
    $.extend(_atb.prototype, _methods);
    $l.ui = $l.ui || {};
    $l.ui.AuthoringToolBar = _atb;
}(Phoenix, $));
