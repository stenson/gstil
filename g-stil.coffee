# public namespace, the only thing you see
window.GStil =
  makeStyle: (title) -> new Stil title

# the stil object (whose methods you use, but don't really see)
class Stil
  # title is required by google
  constructor: (name) ->
    @name = name or Math.random().toString()
    @rules = []
  # add a rule to the rule set
  pushRule: (rule) ->
    @rules.push rule
    @last = rule
  # add the style to this map when the rules are done
  addTo: (map) ->
    @map ?= map
    setTimeout (=> # google maps code for setting
      @style = new google.maps.StyledMapType @rules,
        map: @map,
        name: @name
      # add to the map registry
      @map.mapTypes.set @name, @style
      @map.setMapTypeId @name
    ),0
    return @ # chain
  # the initial selection from the main map
  rule: (featureType, stylers) ->
    @pushRule
      featureType: featureType
      elementType: "all",
      stylers: []
    @[key](value) for key,value of stylers if stylers
    return @ # chain on
  # turn off a bunch of stuff (common task)
  turnOff: (_features...) ->
    @rule(f).visibility("off") for f in _features
    return @ # chain

# dynamically add methods for each styler
for style in ["hue","invert_lightness","saturation","lightness","gamma","visibility"]
  (->
    Stil::[style] = (_style) ->
      obj = {}; obj[style] = _style
      @last.stylers.push obj
      return @
  )()