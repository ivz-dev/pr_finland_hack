<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use GuzzleHttp\Client;

class Main extends Controller
{
    public function show()
    {
        $client = new Client();

        $json['query'] = '{
            pattern(id:"HSL:1058:1:01") {
              name
              stops{
                name
                lat
                lon
              }
            }
        }';

        $resp = $client->post('https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql', [
            'json' => $json
        ]);

        $responseBody = $resp->getBody()->getContents();

        $data = json_decode($responseBody, true);

        foreach ($data['data']['pattern']['stops'] as $stop) {
            $currentStop['Geometry'] = [
                  "Latitude" => $stop['lat'],
                  "Longitude" => $stop['lon'],
                  "name" => $stop['name']
            ];

            $stops[] = $currentStop;
        }

        return view('welcome', ['stops' => \GuzzleHttp\json_encode($stops), 'stopsArray' => $stops]);
    }
}
