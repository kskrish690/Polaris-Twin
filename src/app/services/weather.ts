import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';


// ============================================================
// OPEN-METEO RESPONSE
// ============================================================

export interface WeatherData {

  latitude: number;

  longitude: number;

  elevation?: number;

  timezone?: string;

  timezone_abbreviation?: string;

  utc_offset_seconds?: number;

  current: {

    time: string;

    interval?: number;

    temperature_2m: number | null;

    apparent_temperature: number | null;

    relative_humidity_2m: number | null;

    wind_speed_10m: number | null;

    wind_direction_10m: number | null;

    precipitation: number | null;

    snowfall: number | null;

    visibility: number | null;

    cloud_cover: number | null;

    surface_pressure: number | null;

    weather_code: number | null;

  };

}


// ============================================================
// SERVICE
// ============================================================

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  private readonly apiUrl =
    'https://api.open-meteo.com/v1/forecast';


  constructor(
    private http: HttpClient
  ) {}


  // ==========================================================
  // GET CURRENT WEATHER
  // ==========================================================

  getWeather(
    latitude: number,
    longitude: number
  ): Observable<WeatherData> {

    const params = new HttpParams()

      .set(
        'latitude',
        latitude.toString()
      )

      .set(
        'longitude',
        longitude.toString()
      )

      .set(
        'current',
        [
          'temperature_2m',
          'apparent_temperature',
          'relative_humidity_2m',
          'wind_speed_10m',
          'wind_direction_10m',
          'precipitation',
          'snowfall',
          'visibility',
          'cloud_cover',
          'surface_pressure',
          'weather_code'
        ].join(',')
      )

      .set(
        'timezone',
        'UTC'
      );


    return this.http
      .get<WeatherData>(
        this.apiUrl,
        {
          params
        }
      )

      .pipe(

        map(
          response => {

            if (
              !response ||
              !response.current
            ) {

              throw new Error(
                'Invalid weather response from Open-Meteo.'
              );

            }

            return response;

          }
        ),

        catchError(
          error => {

            console.error(
              'Open-Meteo API error:',
              error
            );

            return throwError(
              () => error
            );

          }
        )

      );

  }

}