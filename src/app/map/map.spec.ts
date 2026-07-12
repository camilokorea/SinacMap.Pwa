import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Map } from './map';
import { ApiService, ProtectedArea } from '../services/api';
import { AuthService } from '../services/auth';
import { GeolocationService } from '../services/geolocation';
import { WeatherService } from '../services/weather.service';

describe('Map', () => {
  let component: Map;
  let fixture: ComponentFixture<Map>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Map],
      providers: [
        // Stub the services that reach out to Firebase / HTTP so the standalone
        // component can be instantiated without a live backend.
        { provide: AuthService, useValue: { user$: of(null), loginWithGoogle: () => of(null), logout: () => of(null) } },
        { provide: ApiService, useValue: { getSvgMap: () => of(''), getProtectedAreas: () => of([]), toggleVisit: () => of(null) } },
        { provide: GeolocationService, useValue: { getCurrentPosition: () => Promise.resolve({ latitud: 0, longitud: 0 }), distanceKm: () => 0 } },
        { provide: WeatherService, useValue: { getCurrentWeather: () => of(null) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Map);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Waze navigation link', () => {
    it('builds a Waze deep link from the selected area coordinates', () => {
      component.selectedArea = {
        codigo: 'P01', nombre_ASP: 'Test', categoria: 'Parque', visitado: false,
        latitud: 10.5, longitud: -85.6,
      } as ProtectedArea;
      expect(component.selectedAreaHasCoords).toBe(true);
      expect(component.selectedRegionWazeUrl).toBe('https://waze.com/ul?ll=10.5,-85.6&navigate=yes');
    });

    it('returns null when the selected area has no coordinates', () => {
      component.selectedArea = { codigo: 'P02', nombre_ASP: 'NoCoords', categoria: 'Parque', visitado: false } as ProtectedArea;
      expect(component.selectedAreaHasCoords).toBe(false);
      expect(component.selectedRegionWazeUrl).toBeNull();
    });

    it('returns null when no area is selected', () => {
      component.selectedArea = null;
      expect(component.selectedRegionWazeUrl).toBeNull();
    });
  });

  describe('touch/pointer selection', () => {
    let area: ProtectedArea;
    let path: SVGPathElement;

    beforeEach(() => {
      area = { codigo: 'P01', nombre_ASP: 'Test', categoria: 'Parque', visitado: false } as ProtectedArea;
      component.protectedAreas = [area];
      // Silence the DOM-touching side effects triggered by a selection.
      (component as any).loadWeather = () => {};
      (component as any).applyFiltersAndColors = () => {};

      path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('data-sinac', 'P01-1');
    });

    it('selects the area on a tap (pointer barely moves)', () => {
      component.onMapPointerDown({ clientX: 100, clientY: 100 } as PointerEvent);
      component.onMapPointerUp({ clientX: 103, clientY: 101, target: path } as unknown as PointerEvent);
      expect(component.selectedArea).toBe(area);
    });

    it('does not select when the pointer pans past the tap threshold', () => {
      component.onMapPointerDown({ clientX: 100, clientY: 100 } as PointerEvent);
      component.onMapPointerUp({ clientX: 100, clientY: 140, target: path } as unknown as PointerEvent);
      expect(component.selectedArea).toBeNull();
    });

    it('ignores a pointerup with no preceding pointerdown', () => {
      component.onMapPointerUp({ clientX: 100, clientY: 100, target: path } as unknown as PointerEvent);
      expect(component.selectedArea).toBeNull();
    });

    it('clears tracking on pointercancel so a following pointerup does nothing', () => {
      component.onMapPointerDown({ clientX: 100, clientY: 100 } as PointerEvent);
      component.onMapPointerCancel();
      component.onMapPointerUp({ clientX: 100, clientY: 100, target: path } as unknown as PointerEvent);
      expect(component.selectedArea).toBeNull();
    });
  });
});
