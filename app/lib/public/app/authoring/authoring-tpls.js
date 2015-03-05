angular.module('phoenix.authoring').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('./authoring/authoring.html',
    "<div class=\"container-fluid\"><div class=\"row\"><div class=\"col-xs-12\"><authoring-toolbar authoring=\"true\"></authoring-toolbar></div></div><div class=\"row design-table\"><div style=\"width:100%\"><layout model=\"model\" save=\"save(model)\" authoring=\"true\"></layout></div><div style=\"width:300px\"><authoring-toolbox config=\"toolbox\" authoring=\"true\"></authoring-toolbox></div></div><div class=\"row\"><div class=\"col-xs-12\"><property-editor></property-editor></div></div></div>"
  );

}]);
