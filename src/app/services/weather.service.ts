import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/** Current weather conditions for a location, normalized for the UI. */
export interface Weather {
  temperature: number;      // °C
  apparentTemperature: number; // °C ("feels like")
  humidity: number;         // %
  windSpeed: number;        // km/h
  weatherCode: number;      // WMO weather interpretation code
  isDay: boolean;
  description: string;      // Spanish label for the weather code
  icon: string;            // emoji representing the condition
}

/** Raw shape of the Open-Meteo `current` payload we consume. */
interface OpenMeteoResponse {
  current?: {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
    is_day: number;
  };
}

/**
 * Fetches current weather from Open-Meteo (https://open-meteo.com).
 * Open-Meteo is free for non-commercial use, requires no API key, and
 * serves CORS headers, so it can be called directly from the browser.
 */
@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'https://api.open-meteo.com/v1/forecast';

  getCurrentWeather(latitude: number, longitude: number): Observable<Weather> {
    const params = {
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      current: 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day',
      timezone: 'auto'
    };

    return this.http.get<OpenMeteoResponse>(this.apiUrl, { params }).pipe(
      map(response => this.toWeather(response))
    );
  }

  private toWeather(response: OpenMeteoResponse): Weather {
    const current = response.current;
    if (!current) {
      throw new Error('Open-Meteo response missing current weather');
    }

    const isDay = current.is_day === 1;
    const condition = WeatherService.describeCode(current.weather_code, isDay);

    return {
      temperature: Math.round(current.temperature_2m),
      apparentTemperature: Math.round(current.apparent_temperature),
      humidity: Math.round(current.relative_humidity_2m),
      windSpeed: Math.round(current.wind_speed_10m),
      weatherCode: current.weather_code,
      isDay,
      description: condition.description,
      icon: condition.icon
    };
  }

  /**
   * Maps a WMO weather interpretation code to a Spanish label and emoji.
   * Reference: https://open-meteo.com/en/docs (WMO Weather interpretation codes).
   */
  static describeCode(code: number, isDay: boolean): { description: string; icon: string } {
    const clear = isDay ? '☀️' : '🌙';
    switch (code) {
      case 0:
        return { description: 'Despejado', icon: clear };
      case 1:
        return { description: 'Mayormente despejado', icon: isDay ? '🌤️' : '🌙' };
      case 2:
        return { description: 'Parcialmente nublado', icon: '⛅' };
      case 3:
        return { description: 'Nublado', icon: '☁️' };
      case 45:
      case 48:
        return { description: 'Niebla', icon: '🌫️' };
      case 51:
      case 53:
      case 55:
        return { description: 'Llovizna', icon: '🌦️' };
      case 56:
      case 57:
        return { description: 'Llovizna helada', icon: '🌧️' };
      case 61:
      case 63:
        return { description: 'Lluvia', icon: '🌧️' };
      case 65:
        return { description: 'Lluvia fuerte', icon: '🌧️' };
      case 66:
      case 67:
        return { description: 'Lluvia helada', icon: '🌧️' };
      case 71:
      case 73:
      case 75:
      case 77:
        return { description: 'Nieve', icon: '🌨️' };
      case 80:
      case 81:
        return { description: 'Chubascos', icon: '🌦️' };
      case 82:
        return { description: 'Chubascos fuertes', icon: '⛈️' };
      case 85:
      case 86:
        return { description: 'Chubascos de nieve', icon: '🌨️' };
      case 95:
        return { description: 'Tormenta', icon: '⛈️' };
      case 96:
      case 99:
        return { description: 'Tormenta con granizo', icon: '⛈️' };
      default:
        return { description: 'Condiciones variables', icon: '🌡️' };
    }
  }
}
