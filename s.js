//import SunCalc from 'SunCalc';
//var SunCalc = require('suncalc.js');

function onLoad(){
    //viited vajalikkudele elementidele //references to elements we need access to
    lat_e = document.getElementById("lat");
    long_e = document.getElementById("long");
    date_e = document.getElementById("date");

    output_e = document.getElementById("tulemus"); 
}

var map;

function mapLoad(){
    map = L.map('map', {
        //maxBoundsViscosity: 0,
        //maxBounds: [[-180, -90],[180, 90]]
    }).setView([40, 0], 3);//.fitBounds([[-180, -90],[180, 90]]);

    var tiles = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        noWrap: true,
        bounds: [[-90, -180],[90, 180]]
    }).addTo(map);

    //popup = L.popup();

    function onMapClick(e) {
        lat_e.value = e.latlng.lat;
        long_e.value = e.latlng.lng;
        
        //kohe kui vajutad siis arvutab
        handleInput();
        /*
        popup
            .setLatLng(e.latlng)
            .setContent(e.latlng.lat+", "+e.latlng.lng)
            .openOn(map);
        */
    }

    map.on('click', onMapClick);

    shadow_line_points = [];
    shadow_polygon = L.polygon(shadow_line_points).addTo(map);
}

function showShadow(){
    /*if(polygon){
        polygon.remove();
    }*/
    shadow_polygon.remove();
    shadow_line_points = [];

    var deg = 0.6; //kui mitme kraadi võrra täpselt otsida
    var prev_in_shadow = isShadow(-90,-180);//kas eelmisena vaadatatud punkt oli varjus
    var in_shadow = isShadow(-90,-180);//kas vaadatav punkt on varjus

    var lat = 0;
    var lng = -180;
    ///* //ebatõhus, aga konsept töötab
    for (let lng = -180; lng < 180; lng+=deg) {
        for (let lat = -90; lat < 90; lat++) {
            prev_in_shadow = in_shadow;
            in_shadow = isShadow(lat,lng);
            if(in_shadow != prev_in_shadow){//astusime üle varjupiiri
                shadow_line_points.push([lat,lng]);
                continue;
            }
        }
    }//*/
    /* //et ei skänniks nii palju mõttetult punkte kaardil ja käiks rohkem mööda varjujoont TODO: pooleli
    while(lng < 180){
        console.log(lng);
        
        prev_in_shadow = in_shadow;
        in_shadow = isShadow(lat,lng);
        console.log(in_shadow);

        if(in_shadow != prev_in_shadow){//astusime üle varjupiiri
            shadow_line_points.push([lat,lng-(deg/2)]);
            lat+=deg;
            
        }else{
            lng+=deg;
        }
        //}
    }*/
    //L.clearShapes(map);
    
    shadow_polygon = L.polygon(shadow_line_points).addTo(map);
    //polygon.redraw();
    //console.log(shadow_line_points);
    
}

/**
 * 
 * @param {float} lat 
 * @param {float} long 
 * @returns boolean
 */
function isShadow(lat, long){
    //console.log(SunCalc.getPosition(date_e.valueAsDate, lat, long).altitude);
    return SunCalc.getPosition(date_e.valueAsDate, lat, long).altitude < 0; //võib panna -8 kraadi et oleks täitsa pime
}

function handleInput(){
    var selected_date = date_e.valueAsDate;
    //console.log(selected_date)

    //kontroll kas koordinaadid on lubatu piires
    console.log(lat_e.value +" ja "+long_e.value);
    var cant_calculate = false;
    if(lat_e.value == "" || long_e.value == ""){
        cant_calculate = true
    }
    if(lat_e.value > 90 || lat_e.value < -90){
        cant_calculate = true
    }
    if(long_e.value > 180 || long_e.value < -180){
        //output_e.innerHTML += "spetsiaalne error message";
        cant_calculate = true
    }
    if (cant_calculate){
        output_e.innerHTML = "koordinaadid pole sobivad (EPSG:4326)";
        return;
    }

    //näita kaardil kohta
    var asukoht = L.latLng(lat_e.value, long_e.value);
    var popup = L.popup();
    popup.setLatLng(asukoht)
        .setContent(asukoht.lat+", "+asukoht.lng)
        .openOn(map);

    //kasutan SunCalc'i sest see peaks üsna täpne olema
    var times = SunCalc.getTimes(selected_date, lat_e.value, long_e.value);
    //console.log(times);
    
    var t_day_start = new Date(selected_date.getTime()).setHours(0,0,0,0)
    //.getTime(); //päeva algus 00:00
    var t_day_end = new Date(selected_date.getTime()).setHours(24,0,0,0)
    //.getTime(); //päeva lõpp 00:00
    
    output_e.innerHTML = "";
    
    if(isNaN(times.nightEnd.getTime())){
        output_e.innerHTML += "pole astronoomilist koitu seal sel päeval" + "<br>";
        cant_calculate = true;
    }
    if(isNaN(times.night.getTime())){
        output_e.innerHTML += "pole astronoomilist loojangut seal sel päeval" + "<br>";
        cant_calculate = true;
    }
    if (cant_calculate) return;

    output_e.innerHTML += "astronoomiline koidik: " + time_str(times.nightEnd) + "<br>";
    output_e.innerHTML += "astronoomiline loojang: " + time_str(times.night) + "<br>";
    
    //arvutan ööaja pikkuse (astronoomilise koidiku ja loojangu järgi, võiks ka nt päiksetõusu ja -loojangu järgi)
    var t_night_start = times.night.getTime();
    var t_night_end = times.nightEnd.getTime();

    let nightime_total_millisec;
    if(t_night_start < t_night_end){
        nightime_total_millisec = t_night_end - t_night_start;
    }else{
        nightime_total_millisec = (t_night_end - t_day_start) + (t_day_end - t_night_start);
    }

    let nightime_total_minutes = Math.floor(nightime_total_millisec/1000/60);
    let nightime_total_hours = Math.floor(nightime_total_minutes/60);

    output_e.innerHTML += "Ööaeg kokku: " + nightime_total_hours + "h " + nightime_total_minutes%60 + "m";
    //output_e.innerHTML = "Ööaeg: 00:00-" + time_str(times.nightEnd) + ", "
    //    + time_str(times.night) + "-00:00";
    
}

/**
 * @param {Date} date
 * @returns {String} time
 */
function time_str(date){
    let hour_zero = "";
    let minute_zero = "";
    if(date.getHours()<10){ //et oleks alati hh:mm mitte h:mm
        hour_zero = "0";
    }
    if(date.getMinutes()<10){ //et oleks alati hh:mm mitte hh:m
        minute_zero = "0";
    }
    return  hour_zero+date.getHours() + ':' + minute_zero+date.getMinutes();
}