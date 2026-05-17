import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  // Using the HTTP profile port to avoid local HTTPS certificate issues
  private apiUrl = 'http://localhost:5036/api/protected-areas'; 

  getProtectedAreas(): Observable<ProtectedArea[]> {
    return this.http.get<ProtectedArea[]>(this.apiUrl);
  }

  toggleVisit(codigo: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${codigo}/visit`, {});
  }

  getSvgMap(): Observable<string> {
    return this.http.get('mapa.svg', { responseType: 'text' });
  }
}
