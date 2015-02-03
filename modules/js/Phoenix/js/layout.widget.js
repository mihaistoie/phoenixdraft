'use strict';
(function($l, $) {
    var l = $l.layout;
    var _event2Id = function(event, root) {
            var t = $(event.target),
                id = null;
            while (t) {
                var id = t.attr('data-layout');
                if (id)
                    break;
                t = (t == root) ? null : t.parent();
            }
            return id;
        },
        _createTopList = function($p, exclude, placeHolder) {
            var res = [];
            var childs = $p.children();
            for (var i = 0, len = childs.length; i < len; i++) {
                var c = childs[i];
                var o = $(c).offset();
                res.push({
                    top: o.top + (o.height >> 1),
                    ignore: (c == exclude),
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
        _indexInParent = function(parent, placeHolder, dragging) {
            var j = 0;
            for (var i = 0, len = parent.childNodes.length; i < len; i++) {
                var c = parent.childNodes[i];
                if (c == placeHolder) return j;
                if (c == dragging) continue;
                if (!c.hasAttribute('data-layout')) continue;
                j++;
            }
            return 0;
        },
        _appendPlaceHolder = function($parent, list, index, $placeHolder, parent, level) {
            var _beforeAppend = function(sameParent) {
                $placeHolder.remove();
                if (!sameParent) {
                    if (parent.$type == 'column' && level == 1) {
                        $placeHolder.addClass('col')
                    } else {
                        $placeHolder.removeClass('col')
                    }
                }
            }
            if (!list.length) {
                _beforeAppend(false);
                $parent.append($placeHolder);
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
                $parent.append($placeHolder);
            } else {
                var $c = $($parent.get(0).childNodes[index]);
                _beforeAppend(phIndex >= 0);
                $c.before($placeHolder);
            }
            return true;
        },
        _createPlaceHolderOnStart = function(proto, placeHolder) {
            placeHolder && placeHolder.remove();
            placeHolder = $('<div></div>');
            placeHolder.addClass(proto.attr('class'));
            placeHolder.addClass('drop-target');
            proto.before(placeHolder);
            return placeHolder;
        },
        _createEmptyPlaceHolderOnStart = function(placeHolder, $p, $index) {
            placeHolder && placeHolder.remove();
            placeHolder = $('<div></div>');
            placeHolder.addClass("container-fluid no-x-padding drop-layouts-zone drop-fields-zone design drop-target");
            return placeHolder;
        },

        _createDragImage = function(isLayout) {
            var crt = $('<div class="bs-drag-image"></div>');
            document.body.appendChild(crt.get(0));
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
        _findElement = function($root, id) {
            return $('#' + id);
        },
        _showSelected = function($element, layout) {
            if (!$element) return;
            var $e = _findElement($element, layout.$idDrag);
            if (layout.selected)
                $e.addClass('selected');
            else
                $e.removeClass('selected');
        },
        _startDrag = function($element, layout) {
            if (!$element) return;
            var $e = _findElement($element, layout.$idDrag);
            if (layout.selected)
                $e.addClass('selected');
            else
                $e.removeClass('selected');
        },
        _acceptLayoutAsChild = function(parent, child, parentLevel) {
            if (!parent || !child) return false;
            if (parent.$type == 'column') {
                if (parentLevel == '1') {
                    return (parent == child)
                }
            }
            if (child.$type == 'column') return false;

            return true;
        },
        _removeEvents = function($element, layout, design) {
            if (design) {
                $element.off('click');
                $element.find('div[draggable="true"]').off('dragstart dragend');
                $element.find('div[draggable="true"]').off('dragstart');
                $element.find('.drop-layouts-zone').add($element).off('dragover dragenter drop');
            }
        },
        _updateCss = function(item, $element, layout, design) {
            var $l1 = _findElement($element, item.$id);
            var $l2 = (item.$id != item.$idStep2) ? _findElement($element, item.$idStep2) : null;
            l.setClassName($l1, item, layout.getLayoutById(item.$parentId), {
                design: design,
                step: 1
            });
            if ($l2)
                l.setClassName($l2, item, layout.getLayoutById(item.$parentId), {
                    design: design,
                    step: 2
                });
        },
        _setEvents = function($element, layout, design) {
            if (design) {
                var dragging, dragImage, startDrag, placeHolder, topList, success = false;;
                var _cleanUp = function() {
                        if (dragging) {
                            dragging.removeClass('bs-none');
                            dragging = null;
                        }
                        if (placeHolder) {
                            placeHolder.remove();
                            placeHolder = null;
                        }
                        if (dragImage) {
                            dragImage.remove()
                            dragImage = null;
                        }
                        topList = null;
                        $l.utils.setDragData(null);
                    },
                    _performDrop = function(td) {
                        console.log("perform drop");
                        if (td && td.isLayout) {
                            if (td.layout == td.dst) return;
                            var ni, oi, op,
                                np = td.dst,
                                moved = td.layout;
                            var $e = _findElement($element, moved.$id),
                                $p = _findElement($element, np.$idDesign),
                                $c;
                            if (moved.$parentId == np) {
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
                            console.log(oi);
                            moved.$parentId = np.$id;
                            if (oi >= 0) op.$items.splice(oi, 1);
                            np.$items.splice(ni, 0, moved);
                            if (!td.isNew) {
                                if (oi >= 0) $e.detach();
                                if (ni == (np.$items.length - 1))
                                    $p.append($e);
                                else {
                                    $c = _findElement($element, np.$items[ni + 1].$id);
                                    $c.before($e);
                                }

                                var toUpdate = [moved, op];
                                if (np != op) toUpdate.push(np);
                                // setevents
                                _removeEvents($element, layout, design);
                                _setEvents($element, layout, design);
                                //update css 
                                toUpdate.forEach(function(item) {
                                    _updateCss(item, $element, layout, design);
                                });
                                return;
                            } else {
                                layout.check(moved);
                            }
                            layout.render(null, true);
                        }
                    };
                $element.on('click', function(event) {
                    var id = _event2Id(event, $element);
                    layout.select(id);
                    _cleanUp();

                });
                $element.find('div[draggable="true"]').on('dragstart', function(event) {
                    event.stopPropagation();
                    var l = layout.getLayoutById($(this).attr('data-layout'));
                    if (!l) {
                        event.preventDefault();
                        return false;
                    } else {
                        var dt = (event.originalEvent ? event.originalEvent.dataTransfer : event.dataTransfer);
                        dt.effectAllowed = 'move';
                        dt.setData('Text', 'data');
                        if (dt.setDragImage) {
                            dragImage = _createDragImage(true);
                            dt.setDragImage(dragImage.get(0), 0, 0);
                        }
                        $l.utils.setDragData({
                            layout: l,
                            isLayout: true,
                            isNew: false
                        });
                        dragging = _findElement($element, l.$idDrag);
                        startDrag = true;
                    }
                }).on('dragend', function(event) {
                    //end of the drag
                    console.log("dragend");
                    event.preventDefault();
                    event.stopPropagation();
                    if (success) {
                        success = false;
                        var td = $l.utils.getDragData();
                        _cleanUp();
                        _performDrop(td);
                    } else
                        _cleanUp();
                    return false;

                });
                $element.find('.drop-layouts-zone').add($element).on('dragover dragenter drop', function(event) {
                    var $t = $(this),
                        td;
                    var e = event.originalEvent ? event.originalEvent : event;
                    event.stopPropagation();
                    event.preventDefault();
                    if (event.type == 'drop') {
                        var dst = layout.getLayoutById($t.attr('data-layout'));
                        var dstLevel = $t.attr('data-level');
                        if (dst) {
                            td = $l.utils.getDragData();
                            td.dst = dst;
                            td.dstLevel = dstLevel;
                            td.indexInParent = _indexInParent($t.get(0), placeHolder.get(0), dragging ? dragging.get(0) : null);
                            $l.utils.setDragData(td);
                            if (td.isNew)
                                setTimeout(function() {
                                    _performDrop(td);
                                }, 100);
                            else {
                                success = true;
                                return false;
                            }
                        }
                        _cleanUp();
                        event.preventDefault();
                        return false;
                    }

                    var dt = e.dataTransfer;
                    var t = dt.getData('Text');
                    td = $l.utils.getDragData();
                    if (startDrag) {
                        if (!dragging) return
                        startDrag = false;
                        if (!td.isNew) {
                            placeHolder = _createPlaceHolderOnStart(dragging, placeHolder);
                            dragging.addClass('bs-none');
                            event.preventDefault();
                            return false
                        }
                    }
                    if (!placeHolder) {
                        if (!td.isNew) return true;
                        if (td.isLayout) {
                            topList = _createTopList($t, (dragging ? dragging.get(0) : null), (placeHolder ? placeHolder.get(0) : 0));
                            var iph = _newIndex(topList, e.pageY);
                            placeHolder = _createEmptyPlaceHolderOnStart(placeHolder);
                            var php = layout.getLayoutById($t.attr('data-layout'));
                            var phplevel = $t.attr('data-level');
                            _appendPlaceHolder($t, topList, iph, placeHolder, php, phplevel);
                            topList = null;
                            event.preventDefault();
                            return false;
                        }
                    }

                    if (td.isLayout) {
                        if (event.type == 'dragenter') topList = null;
                        if (dragging && (dragging.get(0) == $t.get(0))) {
                            dt.effectAllowed = 'none';
                            return true;
                        }
                        var p = layout.getLayoutById($t.attr('data-layout'));
                        var level = $t.attr('data-level');
                        if (!_acceptLayoutAsChild(p, td.layout, $t.attr('data-level'))) {
                            dt.effectAllowed = 'none';
                            return true;
                        }
                        if (!topList)
                            topList = _createTopList($t, (dragging ? dragging.get(0) : null), (placeHolder ? placeHolder.get(0) : 0));

                        var ii = _newIndex(topList, e.pageY);
                        if (_appendPlaceHolder($t, topList, ii, placeHolder, p, level)) {
                            topList = null;
                        }
                        event.preventDefault();
                        return false;
                    }
                    dt.effectAllowed = 'none';
                    return true;
                });
            }

        },
        _layout = function(data) {
            this.$element = null;
            this.design = true;
            this.map = {};
            l.utils.check(data, this.map);
            this.data = data;
        },
        _methods = {
            renderLayout: function(layout) {
                var that = this;
                return $(l.toHtml(layout, null, null, {
                    design: that.design
                }));
            },
            render: function($parent, force) {
                var that = this;
                if (force && that.$element) {
                    $parent = $parent || that.$element.parent();
                    that.$element.remove();
                    that.$element = null;
                }
                if (!that.$element) {
                    that.$element = that.renderLayout(that.data);
                    if ($parent)
                        $parent.append(that.$element);
                    _setEvents(that.$element, that, that.design);
                }
            },
            check: function(layout) {
                l.utils.check(layout, this.map);
            },
            toString: function(layout) {
                var o = JSON.parse(JSON.stringify(layout || this.data));
                l.utils.clearMeta(o);
                return JSON.stringify(o, 2)
            },
            select: function(id) {
                var that = this;
                var $e = that.$element;
                if (!id || !that.design || !that.map[id]) return;
                var old = _findSelected(that.map);
                if (old == id) return;
                if (old) {
                    var o = that.map[old]
                    o.selected = false;
                    _showSelected($e, o);
                }
                var d = that.map[id]
                d.selected = true;
                _showSelected($e, d);
            },
            getLayoutById: function(id) {
                if (!id) return null;
                var that = this;
                return that.map[id];
            }
        };
    $.extend(_layout.prototype, _methods);

    $l.ui = $l.ui || {};
    $l.ui.Layout = _layout;

}(Phoenix, $));
