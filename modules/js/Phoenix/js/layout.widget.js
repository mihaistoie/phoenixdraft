'use strict';
(function($l, $) {
    var l = $l.layout;
    var _dom = $l.dom;
    var _event2Id = function(event, root, layout) {
            var t = event.target,
                id = null, level, ll;
            while (t) {
                var id = t.getAttribute('data-layout');
                if (id) {
                	level = parseInt(t.getAttribute('data-level') || '1',10);
                	ll = layout.getLayoutById(id);
                	if (!ll || !l.utils.canSelect(ll, level)) id = null
                	if (id)
                    	break;
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
        	return event.originalEvent ? event.originalEvent: event;
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
            placeHolder.className = 'container-fluid no-x-padding drop-layouts-zone drop-fields-zone design drop-target' + (isLayout ? "" : " field") + (isWidget ?" widget": "");
            console.log(isWidget);
            return placeHolder;
        },

        _createDragImage = function(isLayout) {
            var crt = document.createElement('div');
            crt.className = 'bs-drag-image';
            document.body.appendChild(crt);
            return crt;
        },
        _findSelected = function(map) {
            var ids = Object.keys(map);
            var i = ids.length;
            while (i--) {
                if (map[ids[i]].selected) {
                    return ids[i];
                }
            }
            return null;
        },
        _showSelected = function($element, layout) {
            if (!$element) return;
            var e = _dom.find($element.get(0), layout.$idDrag);
            if (layout.selected)
                _dom.addClass(e, 'selected');
            else
            	_dom.removeClass(e, 'selected');
        },
        _notifySelectedChanged = function(layout) {
            $l.utils.emit("SelectedChanged", {
                type: "layout",
                data: layout
            });
        },
        _onSelectedChanged = function($element, layout, notify) {
            if (layout) {
                var p = _dom.find($element.get(0), layout.$idDrag);
                if ($element.get(0) != p) {
                    if (layout.selected) {
                        var r = $('<div class="bs-rt-button" data-remove="true"><span class="glyphicon glyphicon-remove-sign"></span></div>').get(0);
                        var c = p.childNodes;
                        if (c.length)
                        	_dom.before(c[0], r);
                        else
                        	_dom.append(p, r);
                    } else {
                       var rmv = p.querySelector('div[data-remove="true"]');
                       if (rmv) _dom.remove(rmv);
                    }
                }
            }
            if (notify) {
                $l.utils.emit("SelectedChanged", {
                    type: "layout",
                    data: layout
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
        _removeDesignModeEvents = function($check) {
        		$check.find('input[type="checkbox"]').off('click');

        },
        _setDesignModeEvents = function($check, layout, design) {
        	$check.find('input[type="checkbox"]').on('click', function(event) {
        		layout.setDesignMode(this.checked);
        	});

        },
        _accceptNewChild = function(p, td) {
        	if (td.isLayout) return true;
        	return (td.isField || td.isWidget);
        },
        _updateCss = function(item, element, layout, design) {
            var l1 = _dom.find(element, item.$id);
            var l2 = (item.$id != item.$idStep2) ? _dom.find(element, item.$idStep2) : null;
            l.utils.updateCssClass(l1, item, layout.getLayoutById(item.$parentId), {
                design: design,
                step: 1
            });
            if (l2)
                l.utils.updateCssClass(l2, item, layout.getLayoutById(item.$parentId), {
                    design: design,
                    step: 2
                });
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
                        $l.utils.setDragData(null);
                    },
                    _performDrop = function(td) {
                        console.log("Drop event");
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
                                    _updateCss(item, root, layout, design);
                                });
                                return;
                            } else {
                            	layout.check(moved, np);
                            }
                            layout.render(null, true);
                        }
                    };
                $element.on('click', function(event) {
                    var id = _event2Id(event, $element.get(0), layout);
                    if (_isRemoveButton(event, $element.get(0))) {
                    	layout.removeLayout(id);	
                    	return;	
                    }
                    layout.select(id);
                });
                $element.find('div[draggable="true"]').on('dragstart', function(event) {
                    event.stopPropagation();
                    var isField = false, isWidget=false;
                    var l = layout.getLayoutById(this.getAttribute('data-layout'));
                    if (!l) {
                    	l = layout.getFieldById(this.getAttribute('data-render'));
                    	isField = true;
                    	isWidget = (l.$config != null);
                    }
                    if (!l) {
                        event.preventDefault();
                        return false;
                    } else {
                        var dt = _event(event).dataTransfer;
                        dt.effectAllowed = 'move';
                        dt.setData('Text', 'data');
                        if (!isField && dt.setDragImage) {
                            dragImage = _createDragImage(true);
                            dt.setDragImage(dragImage, 0, 0);
                        }
                        $l.utils.setDragData({
                            data: l,
                            isLayout: !isField,
                            isField: isField,
                            isWidget: isWidget,
                            isNew: false
                        });
                        dragging = _dom.find($element.get(0), l.$idDrag);
                        startDrag = true;
                    }
                }).add($element).on('dragend', function(event) {
                    //end of the drag
                    console.log("dragend");
                    event.preventDefault();
                    event.stopPropagation();
                    _cleanUp();
                    return false;
                });
                $element.find('.drop-layouts-zone, .drop-fields-zone').add($element).on('dragover dragenter drop', function(event) {
                    var t = this,  
                        td = $l.utils.getDragData(),
                    	e =  _event(event),
                    	dt = e.dataTransfer;
                    event.stopPropagation();
					if (!td || (!td.isLayout && !_dom.hasClass(t, 'drop-fields-zone')) || 
                    	(td.isLayout && !_dom.hasClass(t,'drop-layouts-zone'))){
						dt.effectAllowed = 'none';
                        return true;                    	
                    }

                    if (event.type == 'drop') {
                        console.log("drop");
                        event.preventDefault();
                        var dst = layout.getLayoutById(t.getAttribute('data-layout'));
                        var dstLevel = t.getAttribute('data-level');
                        if (dst) {
                            td = $l.utils.getDragData();
                            td.dst = dst;
                            td.dstLevel = dstLevel;
                            td.indexInParent = _indexInParent(t, placeHolder, dragging, td.isLayout);
                            $l.utils.setDragData(td);
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
                        if (!_accceptNewChild(p, td)) {
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
        _layout = function(data) {
            this.$element = null;
            this.design = true;
            this.showPreview = true;
            this.map = {};
            this.mapFields = {};
            l.utils.check(data, null, this.map, this.mapFields);
            this.data = data;

            $l.utils.addListener('onToolBoxDragend', this, function() {
                if (this.$element) {
                    this.$element.trigger('dragend');
                }
            });
        },
        _methods = {
            renderLayout: function(layout) {
                var that = this;
                return $(l.toHtml(layout, null, {
                    design: that.design
                }));
            },
            render: function($parent, force) {
                var that = this;
                if (force && that.$element) {
                    $parent = $parent || that.$element.parent();
                    _removeEvents(that.$element, that, true);
                    that.$element.remove();
                    that.$element = null;
                }
                if (force && that.$check) {
                    _removeDesignModeEvents(that.$check);
                    that.$check.remove();
                    that.$check = null;
                }
                    
				if (this.showPreview) {
					that.$check = $(l.authModeHtml(this.design));
					if ($parent)
                        $parent.append(that.$check);					
					_setDesignModeEvents(that.$check, that, that.design);

				}
                if (!that.$element) {
                    that.$element = that.renderLayout(that.data);
                    if ($parent)
                        $parent.append(that.$element);
                    _setEvents(that.$element, that, that.design);
                    var sid = _findSelected(that.map);
                    if (that.design) 
                    	_onSelectedChanged(that.$element, that.map[sid], true);
                }
            },
            _destroy: function() {
                var that = this;
                if (that.$element) {
                    _removeEvents(that.$element, that, that.design)
                    that.$element = null;
                }
                if (that.$check) {
                    _removeDesignModeEvents(that.$check);
                    that.$check = null;
                }
                $l.utils.rmvListener(that);

            },
            check: function(layout, parent) {
            	l.utils.check(layout, parent, this.map, this.mapFields);
            },
            toString: function(layout) {
                var o = $.extend(true, {}, JSON.parse(JSON.stringify(layout || this.data)));

                l.utils.clearMeta(o);
                return JSON.stringify(o, 2)
            },
            removeLayout: function(id) {
            	var that = this;
            	if (!id || !that.design || !that.map[id]) return;
            	var d = that.map[id]
            	if (!d) return;
            	var p = that.map[d.$parentId];
            	if (!p) return;
            	var i = p.$items.indexOf(d);
            	p.$items.splice(i, 1);
            	delete that.map[d.$id];
            	l.utils.afterRemoveChild(p, this.map, this.mapFields);
            	that.render(null, true);

            },
            setDesignMode: function(value) {
            	var that = this;
            	if (that.design != value) {
            		that.design = value;
            		that.render(null, true);
            	}
            },
            select: function(id) {
                var that = this;
                var $e = that.$element;
                if (!id || !that.design || !that.map[id]) return;
                var old = _findSelected(that.map);
                if (old) {
                    var o = that.map[old]
                    o.selected = false;
                    _showSelected($e, o);
                    _onSelectedChanged(that.$element, o, false);
                }
                if (old == id) {
                    _onSelectedChanged(that.$element, null, true);
                    return;
                }
                var d = that.map[id]
                d.selected = true;
                _showSelected($e, d);
                _onSelectedChanged(that.$element, d, true);
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
            }
        };
    $.extend(_layout.prototype, _methods);

    $l.ui = $l.ui || {};
    $l.ui.Layout = _layout;

}(Phoenix, $));
