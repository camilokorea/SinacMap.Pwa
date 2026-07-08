import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ProtectedArea {
  codigo: string;
  nombre_ASP: string;
  categoria: string;
  estatus: string;
  siglas: string;
  nombre_area_conservacion: string;
  siglas_area_conservacion: string;
  descripcion: string;
  anio: string;
  decreto: string;
  area_ha: string;
  area_km2: string;
  visitado: boolean;
  aiDescripcion?: string;
  mustSee?: string[];
  latitud?: number;
  longitud?: number;
  geofenceRadiusKm?: number;
}

export interface VisitCoords {
  latitud: number;
  longitud: number;
}

export interface VisitError {
  error: 'location_required' | 'out_of_range' | string;
  message: string;
  distanceKm?: number;
  radiusKm?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/protected-areas`;

  getProtectedAreas(): Observable<ProtectedArea[]> {
    return this.http.get<ProtectedArea[]>(this.apiUrl);
  }

  toggleVisit(codigo: string, coords?: VisitCoords): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${codigo}/visit`, coords ?? {});
  }

  getSvgMap(): Observable<string> {
    return this.http.get('mapa.svg', { responseType: 'text' });
  }
}
