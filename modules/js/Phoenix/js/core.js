'use strict';
var Phoenix = (function() {
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
        }, 
        _find = function(parent, id) {
    		if (parent) {
    			if (parent.id == id) return parent;
    			return parent.querySelector('#'+id);
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
    	};

    phoenix.utils = {
        allocUuid: uuid,
        allocID: allocID,
        setDragData: _setDragData,
        getDragData: _getDragData,
        emit: _emitEvent,
        addListener: _regListener,
        rmvListener: _unregListener
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
    }
    return phoenix;
})();

window.Phoenix = Phoenix
