import { Injectable } from '@angular/core';

export interface GeoCoords {
  latitud: number;
  longitud: number;
}

/**
 * State of the browser's geolocation permission.
 * `'unsupported'` means the Permissions API itself is unavailable, so the
 * real state can't be determined up front.
 */
export type GeoPermissionState = PermissionState | 'unsupported';

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

  /**
   * Reports the current geolocation permission via the Permissions API.
   * Used to tell apart a blocked permission (`'denied'` — cannot be
   * re-prompted programmatically) from one that can still show the browser
   * prompt (`'prompt'`). Returns `'unsupported'` when the API is missing or
   * throws, so callers fall back to simply offering a retry.
   */
  async getPermissionState(): Promise<GeoPermissionState> {
    if (!('permissions' in navigator) || !navigator.permissions?.query) {
      return 'unsupported';
    }
    try {
      const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      return status.state;
    } catch {
      return 'unsupported';
    }
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
