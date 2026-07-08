import { Component, EventEmitter, Output, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, LeaderboardEntry } from '../services/api';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leaderboard.html',
  styleUrls: ['./leaderboard.scss'],
})
export class LeaderboardComponent implements OnInit {
  @Output() closed = new EventEmitter<void>();

  private apiService = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  entries: LeaderboardEntry[] = [];
  loading = true;
  error = false;

  ngOnInit(): void {
    this.apiService.getLeaderboard().pipe(
      catchError(() => {
        this.error = true;
        return of([] as LeaderboardEntry[]);
      })
    ).subscribe(entries => {
      this.entries = entries;
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  medal(rank: number): string {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
    }
  }

  close(): void {
    this.closed.emit();
  }
}
