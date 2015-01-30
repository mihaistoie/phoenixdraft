'use strict';
(function($l, $) {
	var l = $l.layout;
	var  _event2Id = function(event, root) {
		var t = $(event.target), id = null;
		while(t) {
			var id = t.attr("data-layout");
			if (id) 
				break;
			t = (t == root) ? null :t.parent();
		}			
		return id;
	},
	_createTopList = function($p, exclude, placeHolder) {
		var res = [];
		var childs = $p.children();
		for (var i = 0, len = childs.length; i < len; i++) {
			var c = childs[i];
			var o = $(c).offset();
			res.push({top: o.top + (o.height >> 1) , ignore: (c == exclude), placeHolder: (c == placeHolder)});
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
	},
	_appendPlaceHolder = function($parent, list, index, $placeHolder, parent, level) {
		var _beforeAppend = function(sameParent) {
			$placeHolder.remove();
			if (!sameParent) {
				if (parent.$type == "column"  && level == 1) {
					$placeHolder.addClass("col")
				} else {
					$placeHolder.removeClass("col")
				}
			}
		}
		if (!list.length) {
			_beforeAppend(false);
			$parent.append($placeHolder);
			return true;
		}	
		var phIndex = -1;
		for(var i = 0, len = list.length; i<len; i++) {
			var e = list[i];
			if (e.placeHolder) {
				phIndex = i;
				if ((i == index) || (i == (index - 1))) {
					return false;
				}
			} else if (e.ignore) {
				if ((i == index) && (i + 1 <  len) && list[i+1].placeHolder) 
					return false;
				if ((i == (index - 1)) && (i > 0) && list[i-1].placeHolder) 
					return false;
			}
		}
		if (phIndex < 0  ||  index >= list.length) {
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
		placeHolder.addClass("drop-target");
		proto.before(placeHolder);
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
	_showSelected = function($element, layout) {
		if (!$element) return;
		var $e = $('#' + layout.$idDesign);
		if (layout.selected)
			$e.addClass('selected');
		else
			$e.removeClass('selected');
	},
	_startDrag = function($element, layout) {
		if (!$element) return;
		var $e = $('#' + layout.$idDesign);
		if (layout.selected)
			$e.addClass('selected');
		else
			$e.removeClass('selected');
	},
	_acceptLayoutAsChild= function(parent, child, parentLevel) {
		if (!parent || !child) return false;
		if (parent.$type == "column") {
			if (parentLevel == "1") {
				return (parent == child)
			}
			
		}
		return true;
	},
	
	_setEvents = function($element, layout, design) {
		if (design) {
			var dragging, dragImage, startDrag, placeHolder, topList, success;
			var _cleanUp = function() {
				if (dragging) {
					dragging.removeClass("bs-none");
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
				if (layout)layout.setDragData(null);
			};
			$element.on("click", function(event){
				var id = _event2Id(event, $element);
				if (layout) layout.select(id);
				
			});
			
			$element.find('div[draggable="true"]').on("dragstart", function(event){
				success = false;
				event.stopPropagation();
				var l = layout.getLayoutById( $(this).attr('data-layout'));
				if (!l) {
					event.preventDefault();
					return false;
				} else {
					var dt = (event.originalEvent?event.originalEvent.dataTransfer:event.dataTransfer);
					dt.effectAllowed = 'move';
					dt.setData('Text', 'data');
					if (dt.setDragImage) {
						dragImage = _createDragImage(true);
						dt.setDragImage(dragImage.get(0), 0, 0);
					}
					layout.setDragData({layout: l, isLayout:true, isNew: false});
					dragging = $('#' + l.$idDesign);
					startDrag = true;
				}
			}).on("dragend", function(event){
				//end of the drag
				console.log("dragend");
				_cleanUp();
				event.preventDefault();
				event.stopPropagation();
				if (success && layout) layout.render(null, true);
				return false;
				
			});
			$element.find('.drop-layouts-zone').add($element).on("dragover dragenter drop", function(event){
				var $t = $(this);
				var e = event.originalEvent?event.originalEvent:event;
				event.stopPropagation();
				if (event.type == "drop") {
					success = true;
					event.preventDefault();
					return false;
				}
				if (!dragging) return;
				var dt = e.dataTransfer;
				var td = layout.getDragData();
				if (startDrag) {
					startDrag = false;
					if (!td.isNew) {
						console.log(placeHolder);
						placeHolder = _createPlaceHolderOnStart(dragging, placeHolder);
						console.log(placeHolder);
						dragging.addClass("bs-none");
						event.preventDefault();
						return false
					}
				}
				
				if (td.isLayout) {
					if (event.type == "dragenter") topList = null;
					if (dragging.get(0) == $t.get(0)) {
						dt.effectAllowed = 'none';
						return true;
					}
					var p = layout.getLayoutById($t.attr('data-layout'));
					var level = $t.attr('data-level');
					if (!_acceptLayoutAsChild(p, td.layout,  $t.attr('data-level'))) {
						dt.effectAllowed = 'none';
						return true;
					}
					var cp = $t.get(0) != dragging.parent().get(0);
					if (!topList)
						topList = _createTopList($t, dragging.get(0), (placeHolder ? placeHolder.get(0) : 0));
					
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
		
	}, _layout =  function(data) {
		this.$element = null;
		this.design = true;
		this.map = {}; 
		this.dragData = null;
		l.utils.check(data, this.map);
		this.data = data;
	}, _methods = {
		render: function($parent, force) {
			var that = this;
			if (force && that.$element) {
				$parent = $parent ||  that.$element.parent();
				that.$element.remove();
				that.$element = null;
			}
			if (!that.$element) {
				that.$element = $(l.toHtml(that.data, null, null, {design: that.design}));
				if ($parent) 
					$parent.append(that.$element);
				_setEvents(that.$element, that, that.design);
			}
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
		setDragData: function(data) {
			this.dragData = data;
		},
		getDragData: function(data) {
			return (this.dragData || {});
		},
		getLayoutById: function(id) {
			if (!id) return null;
			var that = this;
			return that.map[id];
		}
	};
	$.extend(_layout.prototype,_methods); 
	
	$l.ui = $l.ui || {};
	$l.ui.Layout = _layout;
	
 }(Phoenix,$));