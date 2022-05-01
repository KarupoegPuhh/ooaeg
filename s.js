//import SunCalc from 'SunCalc';
//var SunCalc = require('suncalc.js');

function onLoad(){
    //viited vajalikkudele elementidele //references to elements we need access to
    lat_e = document.getElementById("lat");
    long_e = document.getElementById("long");
    date_e = document.getElementById("date");

    output_e = document.getElementById("tulemus");
}

function handleInput(){
    selected_date = date_e.valueAsDate;
    //console.log(selected_date)
    times = SunCalc.getTimes(selected_date, lat_e.value, long_e.value);
    console.log(times);
    
    t_day_start = new Date(selected_date.getTime()).setHours(0,0,0,0)
    //.getTime();//päeva algus 00:00
    t_day_end = new Date(selected_date.getTime()).setHours(24,0,0,0)
    //.getTime(); //päeva lõpp 00:00
    //console.log(day_beginning)
    //console.log(day_end)
    
    output_e.innerHTML = "";
    
    if(isNaN(times.nightEnd.getTime())){
        output_e.innerHTML += "pole koitu";
    }else if(isNaN(times.night.getTime())){
        output_e.innerHTML += "pole loojangut";
    }else{
        output_e.innerHTML += "astronoomiline koidik: " + time_str(times.nightEnd) + "<br>";
        output_e.innerHTML += "astronoomiline loojang: " + time_str(times.night) + "<br>";
        
        //arvutan ööaja pikkuse
        var t_night_start = times.night.getTime();
        var t_night_end = times.nightEnd.getTime();

        if(t_night_start < t_night_end){
            nightime_total_millisec = t_night_end - t_night_start;
        }else{
            nightime_total_millisec = (t_night_end - t_day_start) + (t_day_end - t_night_start);
        }

        nightime_total_minutes = Math.floor(nightime_total_millisec/1000/60);
        nightime_total_hours = Math.floor(nightime_total_minutes/60);

        output_e.innerHTML += "Ööaeg kokku: " + nightime_total_hours + "h " + nightime_total_minutes%60 + "m";
        //output_e.innerHTML = "Ööaeg: 00:00-" + time_str(times.nightEnd) + ", "
        //    + time_str(times.night) + "-00:00";
    }
    
}

/**
 * @param {Date} date
 * @returns {String} time
 */
function time_str(date){
    hour_zero = "";
    minute_zero = "";
    if(date.getHours()<10){ //et oleks alati hh:mm mitte h:mm
        hour_zero = "0";
    }
    if(date.getMinutes()<10){ //et oleks alati hh:mm mitte hh:m
        minute_zero = "0";
    }
    return  hour_zero+date.getHours() + ':' + minute_zero+date.getMinutes();
}