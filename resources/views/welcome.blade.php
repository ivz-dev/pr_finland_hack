<!doctype html>
<html lang="{{ app()->getLocale() }}">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="css/app.css">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">

    <title>Laravel</title>


</head>
<body>
<div id="map"></div>
<div class="overlay"></div>
<div class="sidebar left">
    <div class="line-top"></div>
    <div class="line-bottom"></div>
    <ul class="stations">
        @foreach ($stopsArray as $key=>$stop)
            @if($key==9)
                <li class="station active">{{$stop['Geometry']['name']}}</li>
            @else
                <li class="station">{{$stop['Geometry']['name']}}</li>
            @endif
        @endforeach
    </ul>


</div>
<div class="sidebar right">
    <div class="bus_number">
        №  <span class="number">68</span>
    </div>

    <div class="sensor-data">
        <div class="sensor_item">
            <div class="caption time-current" style="width: 100%; text-align: center; font-size: 56px">07:32</div>
        </div>

        <div class="sensor_item">
            <div class="caption">Temperature:</div>
            <div class="value temp">25 C</div>
        </div>

        <div class="sensor_item">
            <div class="caption">Humidity:</div>
            <div class="value humid">25 C</div>
        </div>

        <div class="sensor_item">
            <div class="caption">Pressure:</div>
            <div class="value preasure">25 C</div>
        </div>

        <div class="sensor_item">
            <div class="caption">Speed:</div>
            <div class="value speed">25 C</div>
        </div>
    </div>

</div>


</body>

<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js"></script>
<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyC369DQ5z_MzR-NFzHFNjf3FHL-P4sJWOY"></script>


<script>
    var stops = {!! $stops !!};
</script>

<script src="js/mqtt_lib.js"></script>
<script src="js/app.js"></script>
</html>
