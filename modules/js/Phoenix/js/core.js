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
