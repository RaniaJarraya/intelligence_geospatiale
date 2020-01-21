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
        {"LAYERS": access_layer_adm1, "TILED": "true"},})),
    title: "Gouvernorats" });

lyr_adm1.setVisible(true);


var lyr_adm2 = new ol.layer.Tile({
    source: new ol.source.TileWMS(({
        url: url_geoserver,
        params:
        {"LAYERS": access_layer_adm2, "TILED": "true"},})),
    title: "roads" });

lyr_adm2.setVisible(true);

var lyr_adm3 = new ol.layer.Tile({
    source: new ol.source.TileWMS(({
        url: url_geoserver,
        params:
        {"LAYERS": access_layer_adm3, "TILED": "true"},})),
    title: "clients" });

lyr_adm3.setVisible(true);

var lyr_adm4 = new ol.layer.Tile({
    source: new ol.source.TileWMS(({
        url: url_geoserver,
        params:
        {"LAYERS": access_layer_adm4, "TILED": "true"},})),
    title: "pdv" });

lyr_adm4.setVisible(true);

//déclaration de la liste des couches à afficher
var layersList = [lyr_adm1, lyr_adm2 ,lyr_adm3 , lyr_adm4];


var map = new ol.Map({
    controls: ol.control.defaults().extend([

        new ol.control.LayerSwitcher({tipLabel: "Layers"}),
        new ol.control.MousePosition({
            coordinateFormat: ol.coordinate.createStringXY(4),
            projection: 'EPSG:4326'  })
    ]),
    target: 'map',
    layers: layersList,
    view: new ol.View({
        projection: 'EPSG:4326',
        center:[9.378840, 34.240721],
        zoom: 7
    })
});