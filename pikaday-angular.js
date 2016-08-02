(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['angular', 'pikaday'], factory);
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('angular'), require('pikaday'));
  } else {
    // Browser globals (root is window)
    root.returnExports = factory(root.angular, root.Pikaday);
  }
}(this, function (angular, Pikaday) {

  angular.module('pikaday', [])
    .provider('pikadayConfig', function pikadayProviderFn() {

      // Create provider with getter and setter methods, allows setting of global configs

      var config = {};

      this.$get = function() {
        return config;
      };

      this.setConfig = function setConfig(configs) {
        config = configs;
      };
    })
    .directive('pikaday', ['pikadayConfig', '$compile', pikadayDirectiveFn]);

  function pikadayDirectiveFn(pikadayConfig, $compile) {

    function loadPikaday(scope, elem, attrs){
      // Init config Object

      var config = { field: elem[0], onSelect: function () {
        setTimeout(function(){
          scope.$apply();
        });
      }};

      // Decorate config with globals

      angular.forEach(pikadayConfig, function (value, key) {
        config[key] = value;
      });

      // Decorate/Overide config with inline attributes

      angular.forEach(attrs.$attr, function (dashAttr) {
        var attr = attrs.$normalize(dashAttr); // normalize = ToCamelCase()
        applyConfig(attr, attrs[attr]);
      });

      function applyConfig (attr, value) {
        switch (attr) {

          // Booleans, Integers & Arrays

          case "setDefaultDate":
          case "bound":
          case "reposition":
          case "disableWeekends":
          case "showWeekNumber":
          case "isRTL":
          case "showMonthAfterYear":
          case "firstDay":
          case "yearRange":
          case "numberOfMonths":
          case "mainCalendar":
          case "showTime":
          case "showSeconds":
          case "use24Hour":
          case "showDays":

            config[attr] = scope.$eval(value);
            break;

          // Functions

          case "onSelect":
          case "onOpen":
          case "onClose":
          case "onDraw":
          case "disableDayFn":

            config[attr] = function (date) {
              setTimeout(function(){
                scope.$apply();
              });
              return scope[attr]({ pikaday: this, date: date });
            };
            break;

          // Strings

          case "format":
          case "position":
          case "theme":
          case "yearSuffix":
          case "required":

            config[attr] = value;
            break;

          // Dates

          case "minDate":
          case "maxDate":
          case "defaultDate":

            config[attr] = new Date(parseInt(value));
            break;

          // Elements

          case "trigger":
          case "container":

            config[attr] = document.getElementById(value);
            break;

          // Translations

          case "i18n":

            config[attr] = pikadayConfig.locales[value];

        }
      }

      // instantiate pikaday with config, bind to scope, add destroy event callback

      var picker = new Pikaday(config);
      scope.pikaday = picker;
      //if it is a mobile show different component
      if($(document).width() <= 768){
        picker.destroy();
        scope.pikaday.mobile(config, scope, elem, attrs, $compile);//it shows the mobile component
      }scope.$on('$destroy', function () {
        picker.destroy();
      });
    }

    return {

      restrict: 'A',
      scope: {
        pikaday: '=',
        onSelect: '&',
        onOpen: '&',
        onClose: '&',
        onDraw: '&',
        disableDayFn: '&',
        ngModel: '=',
        'minDate':'=',
        'maxDate':'='
      },
      link: function (scope, elem, attrs) {

        // var isPhonegap = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1 && document.URL.indexOf( 'localhost' ) === -1;
        // if(isPhonegap){//if phonegap
        //
        // } else{ //if any other
        //   loadPikaday(scope, elem, attrs);
        // }

        scope.$watch('minDate', function(data){
          if(data){
            if($(document).width() <= 768){
              scope.pikaday.clearMobile(elem);
              attrs.minDate = new Date(data);
              loadPikaday(scope, elem, attrs);
            }else{
              scope.pikaday._o.minDate = new Date(data);
              scope.pikaday._o.minMonth = new Date(data).getMonth();
              scope.pikaday._o.minYear = new Date(data).getYear();
            }

          }
        });

        scope.$watch('maxDate', function(data){
          if(data){
            if($(document).width() <= 768){
              scope.pikaday.clearMobile(elem);
              attrs.maxDate = new Date(data);
              loadPikaday(scope, elem, attrs);
            }else{
              scope.pikaday._o.maxDate = new Date(data);
              scope.pikaday._o.maxMonth = new Date(data).getMonth();
              scope.pikaday._o.maxYear = new Date(data).getYear();
            }
          }
        });

        loadPikaday(scope, elem, attrs);

      }
    };
  }

}));
