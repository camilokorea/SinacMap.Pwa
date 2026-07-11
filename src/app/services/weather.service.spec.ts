import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { WeatherService } from './weather.service';

describe('WeatherService', () => {
  let service: WeatherService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(WeatherService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('requests Open-Meteo with the given coordinates and maps the response', () => {
    let result: any;
    service.getCurrentWeather(9.75, -83.75).subscribe(w => (result = w));

    const req = httpMock.expectOne(r => r.url === 'https://api.open-meteo.com/v1/forecast');
    expect(req.request.params.get('latitude')).toBe('9.75');
    expect(req.request.params.get('longitude')).toBe('-83.75');
    expect(req.request.params.get('current')).toContain('temperature_2m');

    req.flush({
      current: {
        temperature_2m: 24.6,
        apparent_temperature: 26.1,
        relative_humidity_2m: 78,
        wind_speed_10m: 12.4,
        weather_code: 2,
        is_day: 1
      }
    });

    expect(result.temperature).toBe(25);
    expect(result.apparentTemperature).toBe(26);
    expect(result.humidity).toBe(78);
    expect(result.windSpeed).toBe(12);
    expect(result.isDay).toBe(true);
    expect(result.description).toBe('Parcialmente nublado');
    expect(result.icon).toBe('⛅');
  });

  it('maps clear-sky code to a sun by day and a moon by night', () => {
    expect(WeatherService.describeCode(0, true)).toEqual({ description: 'Despejado', icon: '☀️' });
    expect(WeatherService.describeCode(0, false)).toEqual({ description: 'Despejado', icon: '🌙' });
  });

  it('falls back to a generic label for unknown weather codes', () => {
    const result = WeatherService.describeCode(999, true);
    expect(result.description).toBe('Condiciones variables');
  });
});
