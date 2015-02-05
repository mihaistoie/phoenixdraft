'use strict';
(function($l) {
    //Toolbar element 
    // {$type: "layout", $stype: "block/html/row/panel/accordion", $title:[]}
    var _checkItem = function(item, parent, map, utils) {
            item.$id = utils.allocID();
            if (parent) item.$parentId = parent.$id;
            if (item.$items) item.$contentId = utils.allocUuid();
            if (map) map[item.$id] = item;
        },

        _beforeGroups = function(html, item, parent) {
            html.push('<div class="panel-group" id="' + item.$id + '">');
        },
        _afterGroups = function(html, item, parent) {
            html.push('</div>');
        },
        _beforeGroup = function(html, item, parent) {
            html.push('<div class="panel panel-default" id="' + item.$id + '">');
            html.push('<div class="panel-heading">');
            html.push('<h3 class="panel-title">');
            html.push('<a data-toggle="collapse" draggable="false" data-parent="#' + parent.$id + '" href="#' + parent.$contentId + '"><span class="glyphicon glyphicon-folder-close bs-icon-space">');
            html.push('</span>');
            html.push(item.$title);
            html.push('</a></h3></div>');
            html.push('<div id="' + parent.$contentId + '" class="panel-collapse collapse in">');
            html.push(' <ul class="list-group">');
        },
        _afterGroup = function(html, item) {
            html.push('</ul></div></div>');
        },

        _beforeItem = function(html, item, parent) {
            html.push('<li draggable="true" class="list-group-item bs-cursor-p" data-toolbox="' + item.$id + '" id="' + item.$id + '">');
            html.push('<span class="glyphicon glyphicon-flash text-success bs-icon-space"></span>');
            html.push(item.$title);
            html.push('</li>');
        },
        _afterItem = function(html, item) {},
        _enumItems = function(item, parent, onItem) {
            var onlyFields = false;
            if (item) {
                onItem(item, parent, true);
                if (item.$items)
                    item.$items.forEach(function(ci) {
                        _enumItems(ci, item, onItem)
                    });
                onItem(item, parent, false);
            }
        },
        _renderToolBox = function(data, dataParent, html, utils, locale) {
            _enumItems(data, dataParent, function(item, parent, before) {
                var rb = _beforeItem;
                var ra = _afterItem;
                switch (item.$type) {
                    case "groups":
                        rb = _beforeGroups;
                        ra = _afterGroups;
                        break;
                    case "group":
                        rb = _beforeGroup;
                        ra = _afterGroup;
                        break;
                    default:
                        rb = _beforeItem;
                        ra = _afterItem;
                        break;
                }
                if (before) {
                    rb(html, item, parent);
                } else {
                    ra(html, item, parent);
                }
            });


        };
    $l.toolBox = $l.toolBox || {};
    var _l = $l.toolBox;
    _l.utils = _l.utils || {};
    _l.utils.check = function(data, map) {
        _enumItems(data, null, function(item, parent, before) {
            if (before) {
                _checkItem(item, parent, map, $l.utils);
            }
        });
    };

    _l.toHtml = function(data, parent) {
        var html = [];
        _renderToolBox(data, parent, html, $l.locale, $l.utils);
        return html.join('');
    }
    return $l;
}(Phoenix));
