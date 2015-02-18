'use strict';
(function($l) {

    var ll = {
        AuthoringMode: 'Authoring Mode',
        PanelTitle: 'Panel title',
        Html: '<p class="text-primary text-center">Block Html</p>'
    }
    $l.locale = $l.locale || {};
    $l.locale.layouts = $l.locale.layouts || ll;

    return $l;
}(Phoenix));
