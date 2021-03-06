//Global variables for segments
var seg_breaks = [3, 6, 9, 12, 16];
var seg_layer = {};
var seg_layernames = ['segment-0'];
var segpopup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
});

var seg_params = {
    'SEG_ID': 'number',
    'ELEV_GAIN': 'number',
    'ACT_TYPE': 'string',
    'ELEV_HIGH': 'number',
    'AVG_GRADE': 'number',
    'NAME': 'string',
    'ELEV_LOW': 'number',
    'TOTAL_ELEV': 'number',
    'DISTANCE': 'number',
    'EFFORT_CNT': 'number',
    'CAT': 'number',
    'DATE_CREAT': 'string',
    'MAX_GRADE': 'number',
    'ATH_CNT': 'number'
}

function updateSegLegend() {
    document.getElementById('legend-seg-param').textContent = $("#segParam option:selected").text();
}

function calcSegBreaks(maxval, numbins) {
    //calculate breaks based on a selected bin size and number of bins
    seg_breaks = []; //empty the segment breaks array
    var binSize = maxval / numbins;
    for (p = 1; p <= numbins; p++) {
        seg_breaks.push(Math.round(binSize * p * 10) / 10);
    }
    updateSegLegend();
    for (p = 0; p <= seg_breaks.length; p++) {
        calcLegends(p, 'segment');
    }
}

function calcSegLayers() {
    //calculate line layers to create
    seg_layernames = [];
    seg_layer = {
        "id": 'segment-0',
        "type": 'line',
        "source": 'all_segments',
        "source-layer": "adv_all_segments",
        "paint": {
            "line-opacity": parseFloat(document.getElementById("line_opacity").value),
            "line-width": parseFloat(document.getElementById("line_width").value),
            "line-color": {
                "property": 'dist',
                "type": 'interval',
                "stops": calc_stops(seg_breaks, lineColors)
            },
            "line-gap-width": 0
        }
    };
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
    var sw = bounds.getSouthWest().wrap().toArray();
    var ne = bounds.getNorthEast().wrap().toArray();
    var east = ne[0]
    var south = sw[1]
    var west = sw[0]
    var north = ne[1]
    var acttype = document.getElementById("segType").value;
    var start_dist = parseFloat($('#dist_filter').slider('getValue')[0]) * 1609.34;
    var end_dist = parseFloat($('#dist_filter').slider('getValue')[1]) * 1609.34;
    var params = {
        'startLat': south,
        'startLong': west,
        'endLat': north,
        'endLong': east,
        'act_type': acttype,
        'start_dist': start_dist,
        'end_dist': end_dist,
        'newSegs': newSegs
    };
    var queryString = EncodeQueryData(params);
    var targetURL = seg_base_url + queryString;
    return targetURL;
};

function paintSegLayer(mapid, layer, color, width, opacity, pitch) {
    lineColors = line_color_list[parseFloat(document.getElementById("line_color").value)]
    mapid.setPitch(pitch);
    let filter_param =
        calcSegBreaks(parseFloat($('#segScale').slider('getValue')), lineColors.length);
    for (p = 0; p <= seg_breaks; p++) {
        calcLegends(p, 'segment');
    }
    let color_stops = calc_stops(seg_breaks, lineColors);
    let color_style = {
        property: document.getElementById('segParam').value,
        type: 'interval',
        stops: color_stops
    };
    console.log(color_style)
    mapid.setPaintProperty(layer, 'line-color', color_style);
    mapid.setPaintProperty(layer, 'line-width', width);
    mapid.setPaintProperty(layer, 'line-opacity', opacity);
    mapid.setPaintProperty(layer, 'line-gap-width',
        parseFloat(document.getElementById("line_offset").value));

}
