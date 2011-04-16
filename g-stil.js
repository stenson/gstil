(function() {
  var Stil, addStyle, makeRule, name, rules, type, _ref;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __slice = Array.prototype.slice;
  window.GStil = {
    makeStyle: function(title) {
      return new Stil(title);
    }
  };
  rules = (function() {
    var features, sub, subs, supr, _i, _len, _rules;
    _rules = {
      featureTypes: {
        administrative: ["country", "province", "locality", "neighborhood", "land_parcel"],
        landscape: ["man_made", "natural"],
        poi: ["attraction", "business", "government", "medical", "park", "place_of_worship", "school", "sports_complex", "road", "highway", "arterial", "local"],
        road: ["arterial", "highway", "local"],
        transit: ["line"],
        "transit.station": ["airport", "bus", "rail"],
        water: true
      },
      elementTypes: ["all", "geometry", "labels"],
      stylers: {
        hue: /#[abcdefABCDEF0123456789]{6}/,
        invert_lightness: [true, false],
        saturation: "-100..100",
        lightness: "-100..100",
        gamma: "-100..100",
        visibility: ["on", "simplified", "off"]
      }
    };
    features = _rules.featureTypes;
    for (supr in features) {
      subs = features[supr];
      for (_i = 0, _len = subs.length; _i < _len; _i++) {
        sub = subs[_i];
        features["" + supr + "." + sub] = true;
      }
      features[supr] = true;
    }
    return _rules;
  })();
  Stil = (function() {
    function Stil(name) {
      this.name = name || Math.random().toString();
      this.rules = [];
      this.last = null;
      return this.map;
    }
    Stil.prototype.pushRule = function(rule) {
      this.rules.push(rule);
      return this.last = rule;
    };
    Stil.prototype._buildStyledMapType = function(map) {
      this.map = map;
      return new google.maps.StyledMapType(this.rules, {
        map: map,
        name: this.name
      });
    };
    Stil.prototype.addTo = function(map) {
      this.map = map;
      setTimeout((__bind(function() {
        var style;
        style = this._buildStyledMapType(map);
        map.mapTypes.set(this.name, style);
        map.setMapTypeId(this.name);
        return this.style = style;
      }, this)), 0);
      return this;
    };
    Stil.prototype.registerWith = function(map) {
      this.style = this._buildStyledMapType(map);
      return this;
    };
    Stil.prototype.update = function() {
      return this.addTo(this.map);
    };
    Stil.prototype.rule = function(featureType, stylers) {
      var compoundType, key, prefix, rule, suffix, value, _features;
      _features = rules.featureTypes;
      rule = null;
      if (_features.hasOwnProperty(featureType)) {
        rule = makeRule(featureType);
      } else {
        prefix = this.last.featureType.split(".")[0];
        suffix = featureType;
        compoundType = "" + prefix + "." + suffix;
        if (_features.hasOwnProperty(compoundType)) {
          rule = makeRule(compoundType);
        }
      }
      if (rule !== null) {
        this.pushRule(rule);
        if (stylers) {
          for (key in stylers) {
            value = stylers[key];
            this[key](value);
          }
        }
      } else {
        throw "That's not a real feature type.";
      }
      return this;
    };
    Stil.prototype.just = function(elementType) {
      this.last.elementType = elementType;
      return this;
    };
    Stil.prototype.turnOff = function() {
      var feature, _features, _i, _len;
      _features = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      for (_i = 0, _len = _features.length; _i < _len; _i++) {
        feature = _features[_i];
        this.rule(feature).visibility("off");
      }
      return this;
    };
    return Stil;
  })();
  addStyle = function(name, type) {
    return Stil.prototype[name] = function(style) {
      var obj;
      obj = {};
      obj[name] = style;
      this.last.stylers.push(obj);
      return this;
    };
  };
  _ref = rules.stylers;
  for (name in _ref) {
    type = _ref[name];
    addStyle(name, type);
  }
  makeRule = function(featureType) {
    return {
      featureType: featureType,
      elementType: "all",
      stylers: []
    };
  };
}).call(this);
