import { Injectable } from '@angular/core';
import { ProtectedArea } from './api';
import { BADGE_DEFINITIONS, BadgeResult } from '../models/badge';

@Injectable({ providedIn: 'root' })
export class BadgesService {
  compute(areas: ProtectedArea[]): BadgeResult[] {
    return BADGE_DEFINITIONS.map(def => {
      const { earned, progress, total } = def.check(areas);
      return { id: def.id, name: def.name, description: def.description, svgPath: def.svgPath, earned, progress, total };
    });
  }
}
