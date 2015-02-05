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
