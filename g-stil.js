(function() {
  var Stil, _i, _len, _ref;
  var __bind = function(func, context) {
    return function(){ return func.apply(context, arguments); };
  }, __hasProp = Object.prototype.hasOwnProperty, __slice = Array.prototype.slice;
  window.GStil = {
    makeStyle: function(title) {
      return new Stil(title);
    }
  };
  Stil = function(name) {
    this.name = name || Math.random().toString();
    this.rules = [];
    return this;
  };
  Stil.prototype.pushRule = function(rule) {
    this.rules.push(rule);
    return (this.last = rule);
  };
  Stil.prototype.addTo = function(map) {
    this.map = (typeof this.map !== "undefined" && this.map !== null) ? this.map : map;
    setTimeout(__bind(function() {
      this.style = new google.maps.StyledMapType(this.rules, {
        map: this.map,
        name: this.name
      });
      this.map.mapTypes.set(this.name, this.style);
      return this.map.setMapTypeId(this.name);
    }, this), 0);
    return this;
  };
  Stil.prototype.rule = function(featureType, stylers) {
    var _ref, key, value;
    this.pushRule({
      featureType: featureType,
      elementType: "all",
      stylers: []
    });
    if (stylers) {
      _ref = stylers;
      for (key in _ref) {
        if (!__hasProp.call(_ref, key)) continue;
        value = _ref[key];
        this[key](value);
      }
    }
    return this;
  };
  Stil.prototype.turnOff = function() {
    var _features, _i, _len, _ref, f;
    _features = __slice.call(arguments, 0);
    _ref = _features;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      f = _ref[_i];
      this.rule(f).visibility("off");
    }
    return this;
  };
  _ref = ["hue", "invert_lightness", "saturation", "lightness", "gamma", "visibility"];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    (function() {
      var style = _ref[_i];
      return (function() {
        return (Stil.prototype[style] = function(_style) {
          var obj;
          obj = {};
          obj[style] = _style;
          this.last.stylers.push(obj);
          return this;
        });
      })();
    })();
  }
}).call(this);
