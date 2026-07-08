import { Injectable } from '@angular/core';

export interface GeoCoords {
  latitud: number;
  longitud: number;
}

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  getCurrentPosition(): Promise<GeoCoords> {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        reject(new Error('unsupported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        position => resolve({
          latitud: position.coords.latitude,
          longitud: position.coords.longitude
        }),
        error => reject(error),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    });
  }

  distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const earthRadiusKm = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
  }
}
