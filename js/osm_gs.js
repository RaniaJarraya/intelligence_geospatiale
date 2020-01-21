/**
 * Created by Rania on 04/12/2019.
 */
//URL Geoserver
var url_geoserver =  "http://localhost:8080/geoserver/wms";

//url des couches
var access_layer_adm1 = "formation_gs:tun_gouvernorats_utm";
var access_layer_adm2 = "formation_gs:roads_utm";
var access_layer_adm3 = "formation_gs:clients_utm";
var access_layer_adm4 = "formation_gs:pdv_utm";
//déclaration des couches openlayers
var lyr_adm1 = new ol.layer.Tile({
    source: new ol.source.TileWMS(({
        url: url_geoserver,
        params:
        {"LAYERS": access_layer_adm1, "TILED": "true"}})),
    title: "Gouvernorats" });

lyr_adm1.setVisible(true);


var lyr_adm2 = new ol.layer.Tile({
    source: new ol.source.TileWMS(({
        url: url_geoserver,
        params:
        {"LAYERS": access_layer_adm2, "TILED": "true"}})),
    title: "roads" });

lyr_adm2.setVisible(true);

var lyr_adm3 = new ol.layer.Tile({
    source: new ol.source.TileWMS(({
        url: url_geoserver,
        params:
        {"LAYERS": access_layer_adm3, "TILED": "true"}})),
    title: "clients" });

lyr_adm3.setVisible(true);

var lyr_adm4 = new ol.layer.Tile({
    source: new ol.source.TileWMS(({
        url: url_geoserver,
        params:
        {"LAYERS": access_layer_adm4, "TILED": "true"}})),
    title: "pdv" });

lyr_adm4.setVisible(true);

//déclaration de la liste des couches à afficher
var layersList = [lyr_adm1, lyr_adm2 ,lyr_adm3 , lyr_adm4];
//Definition des popups pour affichage des infos
var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');

//closer pour le popup
closer.onclick = function() {
    container.style.display = 'none';
    closer.blur();
    return false;
};


// Define Geometries
var point = new ol.geom.Point(
    ol.proj.transform([9.378840, 34.240721], 'EPSG:4326', 'EPSG:3857')
);
var circle = new ol.geom.Circle(
    ol.proj.transform([9.378840, 34.240721], 'EPSG:4326', 'EPSG:3857'),
    600000
);
// Features
var pointFeature = new ol.Feature(point);
var circleFeature = new ol.Feature(circle);

// Source
var vectorSource = new ol.source.Vector({
    projection: 'EPSG:4326'
});
vectorSource.addFeatures([pointFeature, circleFeature]);

var style = new ol.style.Style({
    fill: new ol.style.Fill({
        color: 'rgba(255, 100, 50, 0.3)'
    }),
    stroke: new ol.style.Stroke({
        width: 2,
        color: 'rgba(255, 100, 50, 0.8)'
    }),
    image: new ol.style.Circle({
        fill: new ol.style.Fill({
            color: 'rgba(55, 200, 150, 0.5)'
        }),
        stroke: new ol.style.Stroke({
            width: 1,
            color: 'rgba(55, 200, 150, 0.8)'
        }),
        radius: 7
    })
});

// vector layer with the style
var vectorLayer = new ol.layer.Vector({
    source: vectorSource,
    style: style
});



//parse data

function parseResponse(data) {
    var poifound = 0;
    var vectorSource = new ol.source.Vector({
        features: (new ol.format.GeoJSON()).readFeatures(data)
    });
    console.log((new ol.format.GeoJSON()).readFeatures(data));
    var features = vectorSource.getFeatures();
    //si on veut les coordonnées dans la projection 3857 on doit seulement ecrire clickedcoord
    var str=ol.proj.transform(clicked_coord, 'EPSG:3857', 'EPSG:4326');

    for(x in features) {
        var id = features[x].getId();
        var props = features[x].getProperties();
        if((id.indexOf("clients")>-1) && (poifound==0))
        { str = str + '<br/>' + props["CATEGORIE"] + '<br/>' + props["CA"];
            poifound=1;
        }
        if(id.indexOf("gouvernorats")>-1)
        { str = str + '<br/>' + props["NOMG"];
            // poifound=1;
            break;
        }
    }
    if(str) {
        var str1 = "<meta http-equiv="+"'Content-Type'"+"content="+"'text/html;charset=UTF-8'"+" />"
        str = '<p>' + str + '</p>';
        overlayPopup.setPosition(clicked_coord);
        content.innerHTML = str; //JSON.stringify(
        container.style.display = 'block';
        clicked_pois = 1;
    }
    else{
        container.style.display = 'none';
        closer.blur();
        clicked_pois = 0;
    }
}


//methode on single click
var clicked_coord;
var onSingleClick = function(evt) {
    //var coord = evt.coordinate;
    var coord3857 = evt.coordinate;
    var coord = ol.proj.transform(coord3857, 'EPSG:3857', 'EPSG:4326');
    console.log(coord);
    var str = coord;
    var source1 = access_layer_adm2;
    var source2 = access_layer_adm1;
    var layers_list = source2 + ',' + source1;
    var view = map.getView();
    var viewResolution = view.getResolution();
    url=lyr_adm1.getSource().getGetFeatureInfoUrl(
        evt.coordinate, viewResolution, view.getProjection(),
        { 'INFO_FORMAT': 'text/javascript',
            'FEATURE_COUNT': 20,
            'LAYERS': layers_list,
            'QUERY_LAYERS': layers_list
        });
    console.log(url);
    if (url) { //call parseResponse(data)
        clicked_coord = coord3857;
        $.ajax(url,
            {dataType: 'jsonp'}
        ).done(function parseResponse(data) {
            });
    }
    /*if(str) {
        str = '<p>' + str + '</p>';
        overlayPopup.setPosition(coord3857);
        content.innerHTML = str;
        container.style.display = 'block';
    }
    else{
        container.style.display = 'none';
        closer.blur();
    }*/
}





//definir les boutons
var button = $('#pan').button('toggle');
var interaction;
$('div.btn-group button').on('click', function(event) {
    var id = event.target.id;
    // Toggle buttons
    button.button('toggle');
    button = $('#'+id).button('toggle');
    // Remove previous interaction
    map.removeInteraction(interaction);
    // Update active interaction
    switch(event.target.id) {
        case "select":
            interaction = new ol.interaction.Select();
            map.addInteraction(interaction);
            break;
        case "point":
            interaction = new ol.interaction.Draw({
                type: 'Point',
                source: vectorLayer.getSource()
            });
            map.addInteraction(interaction);
            break;
        case "line":
            interaction = new ol.interaction.Draw({
                type: 'LineString',
                source: vectorLayer.getSource()
            });
            map.addInteraction(interaction);
            break;
        case "polygon":
            interaction = new ol.interaction.Draw({
                type: 'Polygon',
                source: vectorLayer.getSource()
            });
            map.addInteraction(interaction);
            break;
        case "modify":
            interaction = new ol.interaction.Modify({
                features: new ol.Collection(vectorLayer.getSource().getFeatures())
            });
            map.addInteraction(interaction);
            break;
        default:
            break;
    }
});

$('#getlocation').on('click', function() {
    map.getView().setCenter(geolocation.getPosition());
    map.getView().setZoom(15);
})

$('#vueGlobal').on('click', function() {
    map.getView().setZoom(6);
    })



//popup
var overlayPopup = new ol.Overlay({
    element: container
});

var map = new ol.Map({
    controls: ol.control.defaults().extend([

        new ol.control.LayerSwitcher({tipLabel: "Layers"}),
        new ol.control.MousePosition({
            coordinateFormat: ol.coordinate.createStringXY(4),
            projection: 'EPSG:3857'  }),
        new ol.control.LayerSwitcher({tipLabel: "Layers"})
    ]),
    target: 'map',
    overlays: [overlayPopup],
    layers: layersList,
    view: new ol.View({
        projection: 'EPSG:3857',
        center:[1000384.6875, 4003340.2050],
        zoom: 6
    })
});
//pointer move
map.on('pointermove', function(event) {
    var coord3857 = event.coordinate;
    //console.log(coord3857)
    var coord4326 = ol.proj.transform(coord3857, 'EPSG:3857', 'EPSG:4326');
    $('#mouse3857').text(ol.coordinate.toStringXY(coord3857, 2));
    $('#mouse4326').text(ol.coordinate.toStringXY(coord4326, 5));
});

//single click
map.on('singleclick', function(evt) {
    onSingleClick(evt);
});

//add layer to the map
map.addLayer(vectorLayer);

//sites2g
// Vector layer
var layerVectorPoint = new ol.layer.Heatmap({
    source: new ol.source.GeoJSON({
        url: 'data/sites2g_New.geojson',
        projection: 'EPSG:3857'
    })
});
console.log(layerVectorPoint.getSource().getFeatures().length);
map.addLayer(layerVectorPoint);

var features;
var layerVectorPoint;
var list=[]
$.getJSON("data/sites2g_New.geojson", function(data) {
    features = new ol.format.GeoJSON().readFeatures( data, {
        featureProjection: 'EPSG:3857'
    } );
    for(x in features) {
        var props = features[x].getProperties();
        var id = props["SI"]
        features[x].setId(id);
        list[x]={label:props["SITE_NAME"] + "-" + props["N_SEC"] ,value:props["SI"]}
    }
    console.log(list)
    var source = new ol.source.Vector({
        features: features
    });
    layerVectorPoint = new ol.layer.Heatmap({
        source:source
    });

    console.log(layerVectorPoint.getSource().getFeatures().length);
    map.addLayer(layerVectorPoint);
});

var info_site='?';
var pixel = map.getPixelFromCoordinate(clicked_coord)
map.forEachFeatureAtPixel(pixel, function(feature) {
    if(info_site=='?')
        info_site = '<br/>' + feature.get('SITE_NAME') + '<br>';
    //console.log(".....");
});
if(info_site!='?') str = str+info_site;

//Geolocation
var geolocation = new ol.Geolocation({
    projection: map.getView().getProjection(),
    tracking: true
});
geolocation.bindTo('projection', map.getView());

// add a marker to display the current location
var marker = new ol.Overlay({
    element: document.getElementById('location'),
    positioning: 'center-center'
});
map.addOverlay(marker);
// and bind it to the geolocation's position updates
marker.bindTo('position', geolocation);




var input = document.getElementById("capitals");
var awesomplete = new Awesomplete(input, {
    minChars: 1,
    maxItems: 20,
    autoFirst: true
});
$('#capitals').autocomplete({
    source : list
});

this.awesomplete.List=list;
function goToSite(){
    var input = document.getElementById ("capitals");
    var siteID = input.value;
    console.log(siteID)
    console.log(layerVectorPoint.getSource().getFeatureById(siteID).getGeometry().getExtent())
    var loc1 =layerVectorPoint.getSource().getFeatureById(siteID).getGeometry().getExtent()[0]
    var loc2=layerVectorPoint.getSource().getFeatureById(siteID).getGeometry().getExtent()[1]
    map.getView().setCenter([loc1,loc2])
    map.getView().setZoom(14);




}