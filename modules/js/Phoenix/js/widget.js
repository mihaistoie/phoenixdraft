'use strict';
(function($l) {
    //Widget data
    // {$config: {$title, $titleIsHidden, $border, $style, $height, data}}
    var _widgetClass = function(data, options) {
            var cfg = data.$config;
            var css = ["bs-island bs-widget"];
            $l.styles.parse(cfg.$style, css);
            if (cfg.$border) css.push("border");
            if (options.design) css.push("design");
            if (data.$selected) css.push("selected");
            return css.join(' ');
        },
        _beforeWidget = function(html, data, options) {
            html.push('<div class="');
            html.push(_widgetClass(data, options));
            html.push('"');
            if (options.design) html.push(' draggable="true"')
            html.push(' data-render="' + data.$id + '"');
            html.push(' id="' + data.$id + '"');
            html.push('>');
            _addTitle(html, data.$id, data.$config, options);
            var contentRender = $l.render.get(options.context, "widget.content");
            if (contentRender) {
                contentRender(html, data.$config, options);
            }

        },
        _addTitle = function(html, id, data, options) {
            html.push('<h4 class="bs-widget-title" id="' + id + '_title">');
            html.push($l.utils.escapeHtml(data.$title));
            html.push('</h4>');
        },
        _afterWidget = function(html) {
            html.push('</div>');
        },
        _renderWiget = function(html, data, parent, model, options) {
            _beforeWidget(html, data, options);
            _afterWidget(html);
        };
    $l.widget = {
        toHtml: function(data, options, parent, model) {
            var html = [];
            _renderWiget(html, data, parent, model, options);
            return html.join('');
        }
    }
    return $l;
}(Phoenix));
