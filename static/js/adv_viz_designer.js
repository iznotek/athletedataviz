// API tokens 
mapboxgl.accessToken = mapboxgl_accessToken;

/////////////  Global variables  ////////////
var draw_canvas;
//var heatpoint_data;
//var stravaLineGeoJson;
var linestring_src;
var heatpoint_src;
var segment_src;
var VizType = 'heat-point';
var map_style = 'dark-nolabel';
var curStyle;
var map;
//Heat Point gradients

var color_list = [
    ['blue', 'cyan', 'lime', 'yellow', 'red'],
    ['purple', 'pink', 'blue', 'yellow', 'orange'],
    ['green', 'aquamarine', 'blanchedalmond', 'coral', 'red']
]

var line_color_list = [
    ['#00FFFF', '#33FF00', '#FFFF00', "#FF0099", "Red"],
    //['#ff0000', '#ff751a', '#6699ff', '#ff66ff', '#ffff66'],
    ['#01970B', '#07A991', '#1911C6', '#E21EB4', '#F52D29'],
    //['#ffff00', '#808000', '#ffff99', '#808000', '#ffffe6'],
    ['#DDD39B', '#E3D88D', '#EEE175', '#F8EB5A', '#FFF447'],
    //['#00ff00', '#008000', '#80ff80', '#00cc66', '#339933']
    ['#ABDD9B', '#9EE38D', '#86EE75', '#67F85A', '#50FF47']
]

var lineHeatStyle = {
    "id": "linestring",
    "type": "line",
    "source": "linestring",
    "layout": {
        "line-join": "round"
    },
    "paint": {
        "line-opacity": parseFloat(document.getElementById("line_opacity").value),
        "line-width": parseFloat(document.getElementById("line_width").value),
        "line-color": parseFloat(document.getElementById("line_color").value),
        "line-gap-width": 0
    }
};

var heatpoint_style = {
    "id": "heatpoints",
    "type": "circle",
    "source": 'heatpoint',
    "layout": {},
    "paint": {
        "circle-color": document.getElementById("heat_color").value,
        "circle-opacity": 0.8,
        "circle-radius": 2,
        "circle-blur": 0.5
    }
};

var seg_style = {
    "id": "segment",
    "type": "line",
    "source": 'segment',
    "layout": {
        "line-join": "round"
    },
    "paint": {
        "line-opacity": parseFloat(document.getElementById("line_opacity").value),
        "line-width": parseFloat(document.getElementById("line_width").value),
        "line-color": parseFloat(document.getElementById("line_color").value),
        "line-gap-width": 0
    }
};

//Global variables for heat-lines
var lineBreaks = ['Ride', 'Run', 'NordicSki', 'Hike', 'Other'];
var lineColors = line_color_list[0];
var lineFilters = [];
var lineLayers = [];
var linelayernames=[];
var linepopup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
});
//Global variables for heat-points
var breaks = [3, 6, 9, 12, 16];
var colors = color_list[0];
var layers = [];
var filters = [];
var layernames=[];
var heatpopup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
});
//Global variables for segments
var seg_breaks = [3, 6, 9, 12, 16];
var seg_layers = [];
var seg_filters = [];
var seg_layernames=[];
var segpopup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
});

/////  Main Function  ///////
function initVizMap() {
    if (!mapboxgl.supported()) {
        //stop and alert user map is not supported
        alert('Your browser does not support Mapbox GL.  Please try Chrome or Firefox.');
    } else {
        try {
            $('#legend-lines').hide();
            map = new mapboxgl.Map({
                container: 'map',
                style: 'mapbox://styles/rsbaumann/ciiia74pe00298ulxsin2emmn',
                center: mapboxgl.LngLat.convert(center_point),
                zoom: 4,
                minZoom: 4,
                maxZoom: 20,
                attributionControl: true
            });
        } catch (err) {
            //Note that the user did not have any data to load
            console.log(err);
            $("#loading").hide();
            $('#DownloadModal').modal("show");
        }
    }

    map.once('style.load', function() {
        addLayerHeat(map);
        addLayerLinestring(map);
        render();
        map.addControl(new mapboxgl.Navigation({
            position: 'top-left'
        }));
        map.addControl(new mapboxgl.Geocoder({
            position: 'bottom-left'
        }));
    });

    map.once('load', function() {
        $("#loading").hide();
    });
}

///////  HELPER FUNCTIONS    /////

function updateHeatLegend() {
    document.getElementById('legend-points-param').textContent = $("#heattype option:selected").text();
}

function updateSegLegend() {
    document.getElementById('legend-seg-param').textContent = $("#segParam option:selected").text();
}

function calcLegends(p, id) {
    // Build out legends
    var item = document.createElement('div');
    var key = document.createElement('span');
    key.className = 'legend-key';
    var value = document.createElement('span');

    if (id == "heat-point") {
        if ($('#legend-points-value-' + p).length > 0) {
            document.getElementById('legend-points-value-' + p).textContent = breaks[p];
            document.getElementById('legend-points-id-' + p).style.backgroundColor = colors[p];
        }
        else {
            legend = document.getElementById('legend-points');      
            key.id = 'legend-points-id-' + p;
            key.style.backgroundColor = colors[p];
            value.id = 'legend-points-value-' + p;
            item.appendChild(key);
            item.appendChild(value);
            legend.appendChild(item);
            data = document.getElementById('legend-points-value-' + p)
            data.textContent = breaks[p];
        }
    }
    else if (id == "heat-line") {
        if ($('#legend-lines-value-' + p).length > 0) {
            document.getElementById('legend-lines-value-' + p).textContent = lineBreaks[p];
            document.getElementById('legend-lines-id-' + p).style.backgroundColor = lineColors[p];
        }
        else {
            legend = document.getElementById('legend-lines');
            key.id = 'legend-lines-id-' + p;
            key.style.backgroundColor = lineColors[p];
            value.id = 'legend-lines-value-' + p;
            item.appendChild(key);
            item.appendChild(value);
            legend.appendChild(item);
            data = document.getElementById('legend-lines-value-' + p)
            data.textContent = lineBreaks[p];
        }
    }
    else if (id == "segment") {
        if ($('#legend-seg-value-' + p).length > 0) {
            document.getElementById('legend-seg-value-' + p).textContent = seg_breaks[p];
            document.getElementById('legend-seg-id-' + p).style.backgroundColor = lineColors[p];
        }
        else {
            legend = document.getElementById('legend-seg');
            key.id = 'legend-seg-id-' + p;
            key.style.backgroundColor = lineColors[p];
            value.id = 'legend-seg-value-' + p;
            item.appendChild(key);
            item.appendChild(value);
            legend.appendChild(item);
            data = document.getElementById('legend-seg-value-' + p)
            data.textContent = seg_breaks[p];
        }
    }
}

function calcLineFilters(breaks, param) {
    //calculate line filters to apply
    lineFilters = [];
    for (var p = 0; p < lineBreaks.length - 1; p++) {
        lineFilters.push(['==', param, lineBreaks[p]])
    }
}

function calcLineLayers() {
    //calculate line layers to create
    lineLayers = [];
    linelayernames = [];
    for (var p = 0; p < lineFilters.length; p++) {
        lineLayers.push({
            id: 'linestring-' + p,
            type: 'line',
            source: 'linestring',
            paint: {
                "line-opacity": parseFloat(document.getElementById("line_opacity").value),
                "line-width": parseFloat(document.getElementById("line_width").value),
                "line-color": lineColors[p],
                "line-gap-width": 0
            },
            filter: lineFilters[p]
        });
        linelayernames.push('linestring-' + p);
    }
}

function calcSegBreaks(maxval, numbins) {
    //calculate breaks based on a selected bin size and number of bins
    seg_breaks = [];  //empty the segment breaks array
    var binSize = maxval / numbins;
    for (p = 1; p <= numbins; p++) {
        seg_breaks.push(binSize * p);
    }
    updateSegLegend();
    for (p = 0; p < seg_layers.length; p++) {
        calcLegends(p, 'segment');
    }
}

function calcSegFilters(breaks, param) {
    //calculate line filters to apply
    seg_filters = [];
    for (var p = 0; p < seg_breaks.length; p++) {
        if (p <= 0) {
            seg_filters.push(['all', ['<', param, seg_breaks[p + 1]]])
        } else if (p < seg_breaks.length - 1) {
            seg_filters.push(['all', ['>=', param, seg_breaks[p]],
                ['<', param, breaks[p + 1]]
            ])
        } else {
            seg_filters.push(['all', ['>=', param, seg_breaks[p]]])
        }
    }
}

function calcSegLayers() {
    //calculate line layers to create
    seg_layers = [];
    seg_layernames = [];
    for (var p = 0; p < seg_filters.length; p++) {
        seg_layers.push({
            id: 'segment-' + p,
            type: 'line',
            source: 'segment',
            paint: {
                "line-opacity": parseFloat(document.getElementById("line_opacity").value),
                "line-width": parseFloat(document.getElementById("line_width").value),
                "line-color": lineColors[p],
                "line-gap-width": 0
            },
            filter: seg_filters[p]
        });
        seg_layernames.push('segment-' + p);
    }
}

function calcBreaks(maxval, numbins) {
    //calculate breaks based on a selected bin size and number of bins
    breaks = [];  //empty the breaks array
    var binSize = maxval / numbins;
    for (p = 1; p <= numbins; p++) {
        breaks.push(binSize * p);
    }
    updateHeatLegend();
    for (p = 0; p < layers.length; p++) {
        calcLegends(p, 'heat-point');
    }
}

function calcHeatFilters(breaks, param) {
    //calculate filters to apply to sheet (first run only)
    filters = [];
    for (var p = 0; p < breaks.length; p++) {
        if (p <= 0) {
            filters.push(['all', ['<', param, breaks[p + 1]]])
        } else if (p < breaks.length - 1) {
            filters.push(['all', ['>=', param, breaks[p]],
                ['<', param, breaks[p + 1]]
            ])
        } else {
            filters.push(['all', ['>=', param, breaks[p]]])
        }
    }
}

function calcHeatLayers(filters, colors) {
    //create layers with filters
    layers = [];
    layernames=[];
    for (var p = 0; p < breaks.length; p++) {
        layers.push({
            id: 'heatpoints-' + p,
            type: 'circle',
            source: 'heatpoint',
            paint: {
                "circle-color": colors[p],
                "circle-opacity": 0.8,
                "circle-radius": 2,
                "circle-blur": 0.5
            },
            filter: filters[p]
        });
        layernames.push('heatpoints-' + p);
    }
}

//Query URL Args parsing for segments layers
function EncodeQueryData(data) {
    var ret = [];
    for (var d in data)
        ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
    return ret.join("&");
}

function getURL(mapid, newSegs) {
    var bounds = mapid.getBounds();
    var east = bounds.getEast();
    var south = bounds.getSouth();
    var west = bounds.getWest();
    var north = bounds.getNorth();
    var acttype = document.getElementById("segType").value;
    var start_dist = parseFloat($('#dist_filter').slider('getValue')[0])*1609.34;
    var end_dist = parseFloat($('#dist_filter').slider('getValue')[1])*1609.34;
    var params = {
        'startLat': south,
        'startLong': west,
        'endLat': north,
        'endLong': east,
        'act_type': acttype,
        'start_dist': start_dist,
        'end_dist': end_dist,
        'newSegs' : newSegs
    };
    var queryString = EncodeQueryData(params);
    var targetURL = seg_base_url + queryString;
    return targetURL;
};

//Add heat points function
function addLayerHeat(mapid) {
    // Mapbox JS Api - import heatmap layer
    heatpoint_src = new mapboxgl.GeoJSONSource({
        data: heatpoint_url,
        maxzoom: 18,
        buffer: 1,
        tolerance: 1
    });
    try {
        mapid.addSource('heatpoint', heatpoint_src);
    } catch (err) {
        console.log(err);
    }
    try {
        calcHeatFilters(breaks, 's');
        calcHeatLayers(filters, colors);
        mapid.batch(function(batch) {
            for (var p = 0; p < layers.length; p++) {
                batch.addLayer(layers[p]);
                calcLegends(p, 'heat-point');
                }
        });
        addPopup(map, layernames, linepopup);
        //fit(mapid, map.getSource('heatpoint'))
    } catch (err) {
        console.log(err);
    }
};

//Add linestring function
function addLayerLinestring(mapid) {
    //Create source for linestring data source
    linestring_src = new mapboxgl.GeoJSONSource({
        data: heatline_url,
        maxzoom: 18,
        buffer: 1,
        tolerance: 1
    });
    try {
        mapid.addSource('linestring', linestring_src);
    } catch (err) {
        console.log(err);
    }
    try {
        calcLineFilters(lineBreaks, 'ty');
        calcLineLayers();
        mapid.batch(function(batch) {
            for (var p = 0; p < lineLayers.length; p++) {
                batch.addLayer(lineLayers[p]);
                calcLegends(p, 'heat-lines');
            }
        });
        addPopup(map, linelayernames, heatpopup);
    } catch (err) {
        console.log(err);
    }
};

function addSegLayer(mapid, seg_url) {
    // Mapbox GL JS Api - import segment
    try {
        if (mapid.getSource('segment')) {
            segment_src.setData(seg_url)
            render();
        }
        else {
            segment_src = new mapboxgl.GeoJSONSource({
                data: seg_url,
                maxzoom: 18,
                buffer: 1,
                tolerance: 1
            });
            mapid.addSource('segment', segment_src);
            calcSegFilters(seg_breaks, 'dist');
            calcSegLayers(seg_filters, lineColors);
            mapid.batch(function(batch) {
                for (var p = 0; p < seg_layers.length; p++) {
                    batch.addLayer(seg_layers[p]);
                    calcLegends(p, 'segment');
                }
            });
            addPopup(mapid, seg_layernames, segpopup);
            render();   
        }
    } catch (err) {
        console.log(err);
    }
};

function switchLayer() {
    layer = document.getElementById("mapStyle").value;
    $("#loading").show();
    if (layer != 'dark-nolabel') {
        map.setStyle('mapbox://styles/mapbox/' + layer + '-v8');
    } else {
        map.setStyle('mapbox://styles/rsbaumann/ciiia74pe00298ulxsin2emmn');
    }
    map.once('style.load', function() {
        addLayerHeat(map);
        addLayerLinestring(map);
        addSegLayer(map, getURL(map, 'False'));
        render();
        $("#loading").hide();
    });
}

function set_visibility(mapid, id, onoff) {
    if (id == 'heatpoints') {
        mapid.batch(function(batch) {
            for (var p = 0; p < layers.length; p++) {
                if (onoff == 'off') {
                    batch.setLayoutProperty("heatpoints" + "-" + p, 'visibility', 'none');
                } else if (onoff == 'on') {
                    batch.setLayoutProperty("heatpoints" + "-" + p, 'visibility', 'visible');
                    mouseOver(mapid, layernames);
                }
            }
        });
    } else if (id == 'linestring') {
        mapid.batch(function(batch) {
            for (var p = 0; p < lineLayers.length; p++) {
                if (onoff == 'off') {
                    batch.setLayoutProperty("linestring" + "-" + p, 'visibility', 'none');
                } else if (onoff == 'on') {
                    batch.setLayoutProperty("linestring" + "-" + p, 'visibility', 'visible');
                    mouseOver(mapid, linelayernames);
                }
            }
        });
    } else if (id == 'segment') {
        mapid.batch(function(batch) {
            for (var p = 0; p < seg_layers.length; p++) {
                if (onoff == 'off') {
                    mapid.setLayoutProperty('segment' + "-" + p, 'visibility', 'none');
                } else if (onoff == 'on') {
                    mapid.setLayoutProperty('segment' + "-" + p, 'visibility', 'visible');
                    mouseOver(mapid, seg_layernames);
                }
            }
        });
    }
};

function paintLayer(mapid, color, width, opacity, pitch, layer) {
    lineColors = line_color_list[parseFloat(document.getElementById("line_color").value)]
    mapid.setPitch(pitch);
    mapid.batch(function(batch) {
        for (var p = 0; p < lineLayers.length; p++) {
            calcLegends(p, 'heat-line');
            batch.setPaintProperty(layer + '-' + p, 'line-color', lineColors[p]);
            batch.setPaintProperty(layer + '-' + p, 'line-width', width);
            batch.setPaintProperty(layer + '-' + p, 'line-opacity', opacity);
            batch.setPaintProperty(layer + '-' + p, 'line-gap-width', 
                parseFloat(document.getElementById("line_offset").value));
        }
    });
}

function paintSegLayer(mapid, layer, color, width, opacity, pitch) {
    lineColors = line_color_list[parseFloat(document.getElementById("line_color").value)]
    mapid.setPitch(pitch);
    calcSegBreaks(parseFloat($('#segScale').slider('getValue')), lineColors.length);
    calcSegFilters(seg_breaks, document.getElementById('segParam').value);
    mapid.batch(function(batch) {
        for (var p = 0; p < seg_layers.length; p++) {
            batch.setFilter(layer + '-' + p, seg_filters[p]);
            batch.setPaintProperty(layer + '-' + p, 'line-color', lineColors[p]);
            batch.setPaintProperty(layer + '-' + p, 'line-width', width);
            batch.setPaintProperty(layer + '-' + p, 'line-opacity', opacity);
            batch.setPaintProperty(layer + '-' + p, 'line-gap-width', 
                parseFloat(document.getElementById("line_offset").value));
        }
    });
}


//Update heatpoints properties
function paintCircleLayer(mapid, layer, opacity, radius, blur, pitch) {
    //Update the break and filter settings
    mapid.setPitch(pitch);
    colors = color_list[parseFloat(document.getElementById('heat_color').value)];
    calcBreaks(parseFloat($('#scale').slider('getValue')), colors.length);
    calcHeatFilters(breaks, document.getElementById('heattype').value);
    //apply settings to each layer
    mapid.batch(function(batch) {
        for (var p = 0; p < layers.length; p++) {
            batch.setFilter(layer + '-' + p, filters[p]);
            batch.setPaintProperty(layer + '-' + p, 'circle-opacity', opacity);
            batch.setPaintProperty(layer + '-' + p, 'circle-radius', radius);
            batch.setPaintProperty(layer + '-' + p, 'circle-blur', blur);
            batch.setPaintProperty(layer + '-' + p, 'circle-color', colors[p]);
        }
    });
}

function render() {
    if (document.getElementById("VizType").value == "heat-point") {
        try {
            set_visibility(map, 'linestring', 'off');
            if (map.getSource('segment')) {
                set_visibility(map, 'segment', 'off');
            }
            $('#legend-lines').hide();
            $('#legend-seg').hide();
            map.off('dragend')
               .off('zoomend');
        } catch (err) {
            console.log(err);
        }
        try {
            set_visibility(map, 'heatpoints', 'on');
            paintCircleLayer(map, 'heatpoints',
                parseFloat($('#minOpacity').slider('getValue')),
                parseFloat($('#radius').slider('getValue')),
                parseFloat($('#blur').slider('getValue')),
                parseFloat($('#pitch').slider('getValue')));
            $('#legend-points').show();
        } catch (err) {
            console.log(err);
        }
    } else if (document.getElementById("VizType").value == "heat-line") {
        try {
            set_visibility(map, 'heatpoints', 'off');
            if (map.getSource('segment')) {
                set_visibility(map, 'segment', 'off');
            }
            $('#legend-points').hide();
            $('#legend-seg').hide();
            map.off('dragend')
               .off('zoomend');
        } catch (err) {
            console.log(err);
        }
        try {
            set_visibility(map, 'linestring', 'on');
            paintLayer(map,
                document.getElementById("line_color").value,
                parseFloat($('#line_width').slider('getValue')),
                parseFloat($('#line_opacity').slider('getValue')),
                parseFloat($('#pitch').slider('getValue')),
                'linestring');
            $('#legend-lines').show();
        } catch (err) {
            console.log(err);
        }
    } else if (document.getElementById("VizType").value == "segment") {
        try {
            set_visibility(map, 'heatpoints', 'off');
            set_visibility(map, 'linestring', 'off');
            $('#legend-points').hide();
            $('#legend-lines').hide();
        } catch (err) {
            console.log(err);
        }
        try {
            if (map.getSource('segment')) {
                set_visibility(map, 'segment', 'on');
                paintSegLayer(map, 'segment',
                    document.getElementById("line_color").value,
                    parseFloat($('#line_width').slider('getValue')),
                    parseFloat($('#line_opacity').slider('getValue')),
                    parseFloat($('#pitch').slider('getValue')));
                $('#legend-seg').show();
            }
            else {
                addSegLayer(map, getURL(map, 'False'));
                map.on('dragend', function() {
                    addSegLayer(map, getURL(map, 'False'));
                })
                .on('zoomend', function() {
                    addSegLayer(map, getURL(map, 'False'));
                });
            }
        } catch (err) {
            console.log(err);
        }
    }
}

function mouseOver(mapid, layer_list) {
    mapid.off('mousemove'); //Remove any previous mouseover event binds to the map
    mapid.on('mousemove', function(e) {
        minpoint = new Array(e.point['x']-10, e.point['y']-10)
        maxpoint = new Array(e.point['x']+10, e.point['y']+10)
        var features = mapid.queryRenderedFeatures([minpoint, maxpoint], { layers : layer_list});
        // Change the cursor style as a UI indicator.
         mapid.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
    });
}

function addPopup(mapid, layer_list, popup) {
    mapid.on('click', function(e) {
        minpoint = new Array(e.point['x']-10, e.point['y']-10)
        maxpoint = new Array(e.point['x']+10, e.point['y']+10)
        var features = mapid.queryRenderedFeatures([minpoint, maxpoint], { layers : layer_list});
        // Remove the popup if there are no features to display
        if (!features.length) {
            popup.remove();
            return;
        }
        var feature = features[0];
        if (document.getElementById("VizType").value == "heat-point") {
            popup.setLngLat(e.lngLat)
                .setHTML('<div id="popup" class="popup"> <h5> Detail: </h5>' +
                    '<ul class="list-group">' +
                    '<li class="list-group-item"> Freq: ' + Math.round(feature.properties.d *10)/10 + " visits </li>" +
                    '<li class="list-group-item"> Speed: ' + Math.round(feature.properties.s*10)/10 + " mph </li>" +
                    '<li class="list-group-item"> Grade: ' + Math.round(feature.properties.g*10)/10 + " % </li>" +
                    '</ul> </div>')
            .addTo(mapid);
        }
        else if (document.getElementById("VizType").value == "heat-line") {
            popup.setLngLat(e.lngLat)
                .setHTML('<div id="popup" class="popup"> <h5> Detail: </h5>' +
                    '<ul class="list-group">' +
                    '<li class="list-group-item"> Name: ' + feature.properties.na + " </li>" +
                    '<li class="list-group-item"> Type: ' + feature.properties.ty + " </li>" +
                    '<li class="list-group-item"> ID: ' + feature.properties.id + " </li>" +
                    '</ul> </div>')
            .addTo(mapid);
        }
        else if (document.getElementById("VizType").value == "segment") {
            popup.setLngLat(e.lngLat)
                .setHTML('<div id="popup" class="popup"> <h5> Detail: </h5>' +
                    '<ul class="list-group">' +
                    '<li class="list-group-item"> Name: ' + feature.properties.name + " </li>" +
                    '<li class="list-group-item"> Type: ' + feature.properties.type + " </li>" +
                    '<li class="list-group-item"> Dist: ' + Math.round(feature.properties.dist*10)/10 + " (mi) </li>" +
                    '<li class="list-group-item"> Elev: ' + Math.round(feature.properties.elev*10)/10 + " (ft) </li>" +
                    '</ul> </div>')
            .addTo(mapid);
        }
    });
}


//////////////// SLIDERS AND BUTTON ACTIONS ////////////

//on change of VizType, show only menu options linked to selected viztype
$('#VizType').change(function() {
    var selector = '#VizType_hide_' + $(this).val();
    if (document.getElementById("VizType").value == "segment"){
        $('#VizType_hide_heat-line').collapse('show');
        $(selector).collapse('show');
        $('#VizType_hide_heat-point').collapse('hide');
    }
    else if (document.getElementById("VizType").value == "heat-line"){
        $(selector).collapse('show');
        $('#VizType_hide_heat-point').collapse('hide');
        $('#VizType_hide_segment').collapse('hide');
    }
    else {
        $(selector).collapse('show');
        $('#VizType_hide_heat-line').collapse('hide');
        $('#VizType_hide_segment').collapse('hide');
    }
});

$('#updateSeg').on('click touch tap', function(event) {
    addSegLayer(map, getURL(map, 'True'));
    render();
});

$('#segType').change(function(event) {
    addSegLayer(map, getURL(map, 'False'));
    render();
});

$('#pitch').slider({
    formatter: function(value) {
        return 'Value: ' + value;
    }
});
$('#pitch').slider().on('slide', function(ev) {
    $('#pitch').slider('setValue', ev.value);
    render();
});
$('#dist_filter').slider({
    formatter: function(value) {
        return 'Value: ' + value;
    }
});
$('#dist_filter').slider().on('slideStop', function(ev) {
    $('#dist_filter').slider('setValue', ev.value);
    addSegLayer(map, getURL(map, 'False'));
    render();
});
$('#line_width').slider({
    formatter: function(value) {
        return 'Value: ' + value;
    }
});
$('#line_width').slider().on('slide', function(ev) {
    $('#line_width').slider('setValue', ev.value);
    render();
});
$('#line_opacity').slider({
    formatter: function(value) {
        return 'Value: ' + value;
    }
});
$('#line_opacity').slider().on('slide', function(ev) {
    $('#line_opacity').slider('setValue', ev.value);
    render();
});
$('#line_offset').slider({
    formatter: function(value) {
        return 'Value: ' + value;
    }
});
$('#line_offset').slider().on('slide', function(ev) {
    $('#line_offset').slider('setValue', ev.value);
    render();
});
$('#blur').slider({
    formatter: function(value) {
        return 'Value: ' + value;
    }
});
$('#blur').slider().on('slide', function(ev) {
    $('#blur').slider('setValue', ev.value);
    render();
});
$('#radius').slider({
    formatter: function(value) {
        return 'Value: ' + value;
    }
});
$('#radius').slider().on('slide', function(ev) {
    $('#radius').slider('setValue', ev.value);
    render();
});
$('#segScale').slider({
    formatter: function(value) {
        return 'Value: ' + value;
    }
});
$('#segScale').slider().on('slideStop', function(ev) {
    $('#segScale').slider('setValue', ev.value);
    render();
});
$('#scale').slider({
    formatter: function(value) {
        return 'Value: ' + value;
    }
});
$('#scale').slider().on('slideStop', function(ev) {
    $('#scale').slider('setValue', ev.value);
    render();
});
$('#minOpacity').slider({
    formatter: function(value) {
        return 'Value: ' + value;
    }
});
$('#minOpacity').slider().on('slide', function(ev) {
    $('#minOpacity').slider('setValue', ev.value);
    render();
});


$('#heat_color').change(render);
$('#VizType').change(render);
$('#mapStyle').change(switchLayer);
$('#heattype').change(render);
$('#segParam').change(render);
$('#heat_color').change(render);
$('#line_color').change(render);
$('#snap').on('click touch tap', generateMap);

function isMapLoaded(mapid, interval) {
    //check if map is loaded every retry_interval seconds and display or hide loading bar
    var stop = 0
    var timer = setInterval(function() {
        console.log(mapid.loaded())
        if (mapid.loaded() === false) {
            console.log('map not yet loaded')
            $("#loading").show();
        }
        else {
            console.log('map loaded')
            $("#loading").hide();
            stop = 1
        }
    }, interval);
    if (stop==1) {
        clearInterval(interval);
    }
}

function fit(mapid, geojson_object) {
    //fit gl map to a geojson file bounds - depricated for now!
    console.log(geojson_object)
    try {
        mapid.fitBounds(geojsonExtent(geojson_object));
    } catch (err) {
        //Note that the user did not have any data to load
        console.log(err);
        $("#loading").hide();
        $('#DownloadModal').modal("show");
    }
}

function getDataLinestring(callback) {
    $.getJSON( heatpoint_url , function(data) {
        stravaHeatGeoJson = JSON.parse(data); 
        r.resolve();
    }),
    callback(stravaHeatGeoJson);
};
