var server = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: ':7070') + '/';

function getJsonFromUrl() {
  var query = location.search.substr(1);
  var result = {};
  query.split("&").forEach(function(part) {
    var item = part.split("=");
    result[item[0]] = decodeURIComponent(item[1]);
  });
  return result;
}

var urlParameters = getJsonFromUrl();

var getLayer = function(url,attrib) {
  return L.tileLayer(url, { maxZoom: 19, attribution: attrib });
};

var Layers = {
  stamen: {
    toner:  'http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png',
    terrain: 'http://{s}.tile.stamen.com/terrain/{z}/{x}/{y}.png',
    watercolor: 'http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.png',
    attrib: 'Map data &copy;2013 OpenStreetMap contributors, Tiles &copy;2013 Stamen Design'
  },
  mapBox: {
    azavea:     'http://{s}.tiles.mapbox.com/v3/azavea.map-zbompf85/{z}/{x}/{y}.png',
    worldLight: 'http://c.tiles.mapbox.com/v3/mapbox.world-light/{z}/{x}/{y}.png',
    attrib: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery &copy; <a href="http://mapbox.com">MapBox</a>'
  }
};

var map = (function() {
  var selected = getLayer(Layers.mapBox.azavea,Layers.mapBox.attrib);
  var baseLayers = {
    "Default" : selected,
    "World Light" : getLayer(Layers.mapBox.worldLight,Layers.mapBox.attrib),
    "Terrain" : getLayer(Layers.stamen.terrain,Layers.stamen.attrib),
    "Watercolor" : getLayer(Layers.stamen.watercolor,Layers.stamen.attrib),
    "Toner" : getLayer(Layers.stamen.toner,Layers.stamen.attrib),
  };

  var m = L.map('map');

  // m.setView([39.98786411111919,-105.6384462400773], 10);
  // m.setView([40.01528977696344, -105.3046817899056], 10);
  m.setView([-21.76297918421384, 147.97245025634766], 10);

  selected.addTo(m);

  m.lc = L.control.layers(baseLayers).addTo(m);
  return m;
})();

var weightedOverlay = (function() {
  var layers = [];

  var layersToWeights = {};

  var breaks = null;
  var WOLayer = null;
  var opacity = 0.5;
  var colorRamp = "blue-to-red";
  var numBreaks = 10;

  getLayers   = function() {
    var notZeros = _.filter(layers, function(l) { return l.weight != 0 });
    return _.map(notZeros, function(l) { return l.name; }).join(",");
  };

  getWeights   = function() {
    var notZeros = _.filter(layers, function(l) { return l.weight != 0 });
    return _.map(notZeros, function(l) { return l.weight; }).join(",");
  };

  update = function() {
    if (getLayers().length == 0) {
      if (WOLayer) {
        map.lc.removeLayer(WOLayer);
        map.removeLayer(WOLayer);
        WOLayer = null;
      }
      return;
    }

    /*$.ajax({
     url: server + 'gt/breaks',
     data: { 'layers' : getLayers(),
     'weights' : getWeights(),
     'numBreaks': numBreaks },
     dataType: "json",
     complete: function(r) {*/
    // breaks = r.classBreaks;

    if (WOLayer) {
      map.lc.removeLayer(WOLayer);
      map.removeLayer(WOLayer);
    }

    var layerNames = getLayers();
    if (layerNames == "") return;

    var geoJson = "";

    if(urlParameters['breaks'] != undefined) {
      WOLayer = new L.tileLayer(server +
          'diff2-tms/png/elevation/elevation1/elevation2/elevation3/{z}/{x}/{y}?colorRamp={colorRamp}&breaks={breaks}', {
        format: 'image/png',
        transparent: true,
        layer: "elevation3",
        breaks: urlParameters['breaks'],
        colorRamp: colorRamp,
        attribution: 'Azavea'
      });
    } else {
      WOLayer = new L.tileLayer(server +
          'diff2-tms/png/elevation/elevation1/elevation2/elevation3/{z}/{x}/{y}?colorRamp={colorRamp}', {
        format: 'image/png',
        transparent: true,
        layer: "elevation3",
        colorRamp: colorRamp,
        attribution: 'Azavea'
      });
    }

    WOLayer.setOpacity(opacity);
    WOLayer.addTo(map);
    map.lc.addOverlay(WOLayer, "Weighted Overlay");
    /*}
     });*/
  };

  // Sliders
  var makeSlider = function(div,layer) {
    div.find( ".slider" ).slider({
      value:layer.weight,
      min: -5,
      max: 5,
      step: 1,
      change: function( event, ui ) {
        var pn = ui.value > 0 ? "+" : "";
        $( this ).prev('.weight').text( pn + ui.value );
        layer.weight = ui.value;
        update();
        summary.setLayerWeight(layer.name,layer.weight);
        summary.update(false);
      }
    });
    div.find( '.weight' ).text( (layer.weight > 0 ? "+" : "") + layer.weight );
  };

  var bindSliders = function() {
    var pList = $("#parameters");
    pList.empty();

    _.map(layers, function(l) {
      var p = $("#parameterSlider").clone();
      p.find(".slider-label").text(l.display);
      p.show();
      pList.append(p);
      makeSlider(p,l);
    });

    update();
  };

  // Opacity
  var opacitySlider = $("#opacity-slider").slider({
    value: opacity,
    min: 0,
    max: 1,
    step: .02,
    slide: function( event, ui ) {
      opacity = ui.value;
      WOLayer.setOpacity(opacity);
    }
  });

  return {
    activeLayers: getLayers,
    activeWeights: getWeights,

    bindSliders : bindSliders,

    setLayers: function(ls) {
      layers = ls;
      bindSliders();
      update();
    },
    setNumBreaks: function(nb) {
      numBreaks = nb;
      update();
    },
    setOpacity: function(o) {
      opacity = o;
      opacitySlider.slider('value', o);
    },
    setColorRamp: function(key) {
      colorRamp = key;
      update();
    },
    getColorRamp: function() { return colorRamp; },

    update: update,

    getMapLayer: function() { return WOLayer; }
  };

})();


var colorRamps = (function() {
  var makeColorRamp = function(colorDef) {
    var ramps = $("#color-ramp-menu");
    var p = $("#colorRampTemplate").clone();
    p.find('img').attr("src",colorDef.image);
    p.click(function() {
      $("#activeRamp").attr("src",colorDef.image);
      weightedOverlay.setColorRamp(colorDef.key);
    });
    if(colorDef.key == weightedOverlay.getColorRamp()) {
      $("#activeRamp").attr("src",colorDef.image);
    }
    p.show();
    ramps.append(p);
  };

  return {
    bindColorRamps: function() {
      $.ajax({
        url: server + 'gt/colors',
        dataType: 'json',
        success: function(data) {
          _.map(data.colors, makeColorRamp)
        }
      });
    }
  }
})();

// Set up from config
$.getJSON('config.json', function(data) {
  weightedOverlay.setLayers(data.weightedOverlay.layers);
  weightedOverlay.setNumBreaks(data.weightedOverlay.numBreaks);
  weightedOverlay.setOpacity(data.weightedOverlay.opacity);
  weightedOverlay.setColorRamp(data.weightedOverlay.ramp);
});

var setupSize = function() {
  var bottomPadding = 10;

  var resize = function(){
    var pane = $('#main');
    var height = $(window).height() - pane.offset().top - bottomPadding;
    pane.css({'height': height +'px'});

    var sidebar = $('#tabBody');
    var height = $(window).height() - sidebar.offset().top - bottomPadding;
    sidebar.css({'height': height +'px'});

    var mapDiv = $('#map');
    var wrapDiv = $('#wrap');
    var height = $(window).height() - mapDiv.offset().top - bottomPadding - wrapDiv.height();
    mapDiv.css({'height': height +'px'});
    map.invalidateSize();
  };
  resize();
  $(window).resize(resize);
};

// On page load
$(document).ready(function() {
  // Set heights

  weightedOverlay.bindSliders();
  colorRamps.bindColorRamps();

  $('#clearButton').click( function() {
    return false;
  });
  setupSize();
});
