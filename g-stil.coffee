###
public namespace, the only thing you see
###

window.GStil = {
  makeStyle: (title) ->
    new Stil title
}

log = (string) ->
  console.log(string)

rules =

  featureTypes:
    administrative:
      [
        "country", "province", "locality", "neighborhood", "land_parcel"
      ]

    landscape:
      [
        "man_made", "natural"
      ]

    poi:
      [
        "attraction", "business", "government", "medical",
        "park", "place_of_worship", "school", "sports_complex",
        "road", "highway", "arterial", "local"
      ]
    
    road:
      [
        "arterial", "highway", "local"
      ]

    transit: [ "line" ]
    
    "transit.station": # ok, kinda hack
      [
        "airport", "bus", "rail"
      ]

    water: true

  elementTypes:
    [
      "all", "geometry", "labels"
    ]
    
  stylers:    
    # any type of color, or just one kind?
    hue: /#[abcdefABCDEF0123456789]{6}/
  
    # quick invert, easy boolean
    invert_lightness: [ true, false ]
  
    # all the same in terms of range from -100 to 100
    saturation: [-100..100]
    lightness: [-100..100]
    gamma: [-100..100]
    visibility: [ "on", "simplified", "off" ]

# function for avoiding redundancy in spec above
features = rules.featureTypes
_.each features, (subs,supr) ->
  _.each subs, (sub) ->
    features["#{supr}.#{sub}"] = true
  features[supr] = true

# some kind of defer-ing so the rule is only written once
# more deferring for actually calling on the map

###
the stil object (whose methods you use, but don't really see)
###

class Stil
  
  # title is required by google
  constructor: (name) ->
    @name = name
    @rules = []
    @last = null
    @map
    
  # add a rule to the rule set
  pushRule: (rule) ->
    @rules.push rule
    @last = rule
  
  # private method for building the styled map type
  _buildStyledMapType: (map) ->
    @map = map # cache this reference
    new google.maps.StyledMapType @rules,
      map: map,
      name: @name
    
  # add the style to this map when the rules are done
  addTo: (map) ->
    @map = map
    # google maps code on setting
    that = @
    _.defer =>
      style = @._buildStyledMapType map
      # add to the map registry
      map.mapTypes.set @name, style
      map.setMapTypeId @name
      @style = style
    return @ # chain
  
  # create the style without explicitly adding it to the map
  # should be called after your rules are set up
  registerWith: (map) ->
    @.style = @._buildStyledMapType map
    return @
  
  update: ->
    @addTo @map # re-trigger the bind
    
  # the initial selection from the main map
  rule: (featureType, stylers) ->
    features = rules.featureTypes
    rule = null
    # test to see if the rule specified is a real rule
    if features.hasOwnProperty featureType
      rule = makeRule featureType
    else # maybe, if we consider the context, this is just a suffix
      prefix = @last.featureType.split(".")[0]
      suffix = featureType
      compoundType = "#{prefix}.#{suffix}"
      if features.hasOwnProperty compoundType
        rule = makeRule compoundType
    # if there's a rule, push it
    if rule != null
      @pushRule rule
      if stylers
        that = @
        _.each stylers, (value, key) ->
          that[key](value) # set with native method
    else
      log "That's not a real feature type."
    return @ # chain on!
  
  ruleIf: (cond, featureType, stylers) ->
    if cond
      this.rule featureType, stylers
    return @ # never break the chain!
  # refine the last featureType by elementType
  just: (elementType) ->
    # first make sure it's legit
    @last.elementType = elementType
    return @ # don't break the chain!
  
  # turn off a bunch of stuff (common task)
  turnOff: (features...) ->
    that = @
    _.each features, (feature) ->
      that.rule(feature).visibility("off")
    return @ # chain on!
  
  # simple print, for console
  print: ->
    @rules

# now dynamically add methods for each styler
_.each rules.stylers, (type,name) ->
  Stil::[name] = (style) ->
    # add type checking here
    obj = {}
    obj[name] = style
    @last.stylers.push obj 
    return @

###
the rule object (which you don't see)
###

makeRule = (featureType) ->
  featureType: featureType,
  elementType: "all", # default
  stylers: []