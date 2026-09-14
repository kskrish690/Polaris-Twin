import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface WeatherData {
  latitude: number;
  longitude: number;

  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    precipitation: number;
    rain: number;
    snowfall: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    surface_pressure: number;
    cloud_cover: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  private readonly apiUrl =
    'https://api.open-meteo.com/v1/forecast';

  constructor(
    private http: HttpClient
  ) {}

  getWeather(
    latitude: number,
    longitude: number
  ): Observable<WeatherData> {

    const params = new HttpParams()
      .set('latitude', latitude.toString())
      .set('longitude', longitude.toString())
      .set(
        'current',
        'temperature_2m,' +
        'relative_humidity_2m,' +
        'apparent_temperature,' +
        'precipitation,' +
        'rain,' +
        'snowfall,' +
        'weather_code,' +
        'wind_speed_10m,' +
        'wind_direction_10m,' +
        'surface_pressure,' +
        'cloud_cover'
      )
      .set('timezone', 'UTC');

    console.log(
      'Requesting weather:',
      `${this.apiUrl}?${params.toString()}`
    );

    return this.http.get<WeatherData>(
      this.apiUrl,
      {
        params
      }
    );
  }
}