import { Component, Input, OnChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgesService } from '../services/badges.service';
import { BadgeResult } from '../models/badge';
import { ProtectedArea } from '../services/api';

@Component({
  selector: 'app-my-badges',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-badges.html',
  styleUrls: ['./my-badges.scss'],
})
export class MyBadgesComponent implements OnChanges {
  @Input() areas: ProtectedArea[] = [];

  private badgesService = inject(BadgesService);
  badges: BadgeResult[] = [];
  collapsed = false;

  get earnedCount(): number {
    return this.badges.filter(b => b.earned).length;
  }

  ngOnChanges(): void {
    this.badges = this.badgesService.compute(this.areas);
  }
}
