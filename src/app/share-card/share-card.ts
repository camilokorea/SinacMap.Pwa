import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '@angular/fire/auth';
import { ProtectedArea } from '../services/api';
import { BadgesService } from '../services/badges.service';
import { ProgressCardService } from '../services/progress-card.service';

@Component({
  selector: 'app-share-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './share-card.html',
  styleUrls: ['./share-card.scss'],
})
export class ShareCardComponent implements OnInit {
  @Input() user!: User;
  @Input() areas: ProtectedArea[] = [];
  @Output() closed = new EventEmitter<void>();

  cardDataUrl = '';
  isGenerating = true;
  canNativeShare = false;

  private cdr = inject(ChangeDetectorRef);
  private badgesService = inject(BadgesService);
  private progressCardService = inject(ProgressCardService);

  ngOnInit(): void {
    this.canNativeShare = 'share' in navigator;
    this.generate();
  }

  private async generate(): Promise<void> {
    const badges = this.badgesService.compute(this.areas);
    const name = this.user.displayName || 'Explorador';
    this.cardDataUrl = await this.progressCardService.generateCard(name, this.areas, badges);
    this.isGenerating = false;
    this.cdr.detectChanges();
  }

  download(): void {
    const a = document.createElement('a');
    a.href = this.cardDataUrl;
    a.download = 'mi-progreso-sinac.png';
    a.click();
  }

  async nativeShare(): Promise<void> {
    try {
      const blob = await (await fetch(this.cardDataUrl)).blob();
      const file = new File([blob], 'mi-progreso-sinac.png', { type: 'image/png' });
      const visited = this.areas.filter(a => a.visitado).length;
      await navigator.share({
        title: 'Mi Desafio SINAC',
        text: `¡Ya visite ${visited} de ${this.areas.length} areas protegidas de Costa Rica!`,
        files: [file],
      });
    } catch {
      // User cancelled or share not supported with files — fall back to download
      this.download();
    }
  }

  close(): void {
    this.closed.emit();
  }
}
