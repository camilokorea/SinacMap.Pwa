import { Injectable } from '@angular/core';
import { ProtectedArea } from './api';
import { BadgeResult } from '../models/badge';

@Injectable({ providedIn: 'root' })
export class ProgressCardService {
  async generateCard(
    userName: string,
    areas: ProtectedArea[],
    earnedBadges: BadgeResult[],
  ): Promise<string> {
    await document.fonts.ready;

    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d')!;

    const visited = areas.filter(a => a.visitado).length;
    const total = areas.length || 161;
    const pct = total > 0 ? visited / total : 0;
    const earned = earnedBadges.filter(b => b.earned);

    this.drawBackground(ctx);
    this.drawGlow(ctx, pct);
    this.drawHeader(ctx);
    this.drawRing(ctx, 540, 385, pct, visited, total);
    this.drawUserSection(ctx, userName, earned.length > 0);
    if (earned.length > 0) {
      this.drawBadges(ctx, earned);
    } else {
      this.drawExploreHint(ctx);
    }
    this.drawFooter(ctx);

    return canvas.toDataURL('image/png');
  }

  private drawBackground(ctx: CanvasRenderingContext2D): void {
    const bg = ctx.createLinearGradient(0, 0, 1080, 1080);
    bg.addColorStop(0, '#0a2e1a');
    bg.addColorStop(0.55, '#0a3f35');
    bg.addColorStop(1, '#0c2a45');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1080, 1080);
  }

  private drawGlow(ctx: CanvasRenderingContext2D, pct: number): void {
    const alpha = 0.04 + pct * 0.07;
    const glow = ctx.createRadialGradient(540, 385, 60, 540, 385, 320);
    glow.addColorStop(0, `rgba(251,191,36,${alpha.toFixed(2)})`);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 1080, 1080);
  }

  private drawHeader(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.fillRect(0, 0, 1080, 88);

    // Leaf icon (Material eco path, viewBox 0 0 24 24)
    ctx.save();
    ctx.translate(32, 22);
    ctx.scale(1.83, 1.83);
    ctx.fillStyle = '#34d399';
    ctx.fill(
      new Path2D(
        'M6.05 8.5c.44-4.36 3.78-7.45 6.95-7.5 0 5.3-3.5 7.9-6.95 7.5z' +
          'm2.97 10.5C9 17.5 9 15 9 15c3.07 0 5.24-1.87 5.24-5H18c0 5.5-4.6 9-9 9v-1h-.02z' +
          'M3 15c1.26 0 2.37-.19 3.35-.5C4.65 9.82 5 4.45 5 4.45 2.17 5.39 0 8.4 0 12c0 1.1.23 2.14.63 3.09C1.33 15.04 2.12 15 3 15z',
      ),
    );
    ctx.restore();

    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 38px "Outfit", Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('SinacMap', 82, 44);

    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '25px "Outfit", Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Costa Rica', 1046, 44);
    ctx.textBaseline = 'alphabetic';
  }

  private drawRing(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    pct: number,
    visited: number,
    total: number,
  ): void {
    const radius = 185;
    const lw = 44;
    const startAngle = -Math.PI / 2;

    // Track
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = lw;
    ctx.lineCap = 'butt';
    ctx.stroke();

    // Progress arc
    if (pct > 0.003) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, startAngle + Math.PI * 2 * pct);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = lw;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
    ctx.restore();

    // Percentage text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 92px "Outfit", Arial, sans-serif';
    ctx.fillText(`${Math.round(pct * 100)}%`, cx, cy - 26);

    // Count text
    ctx.fillStyle = 'rgba(255,255,255,0.82)';
    ctx.font = '30px "Outfit", Arial, sans-serif';
    ctx.fillText(`${visited} de ${total} areas`, cx, cy + 44);
    ctx.textBaseline = 'alphabetic';
  }

  private drawUserSection(
    ctx: CanvasRenderingContext2D,
    userName: string,
    hasBadges: boolean,
  ): void {
    const nameY = hasBadges ? 630 : 660;
    const subtitleY = hasBadges ? 678 : 708;

    // Clamp font size for long names
    ctx.textAlign = 'center';
    ctx.font = 'bold 44px "Outfit", Arial, sans-serif';
    const maxW = 900;
    const w = ctx.measureText(userName).width;
    if (w > maxW) {
      const scaled = Math.floor(44 * (maxW / w));
      ctx.font = `bold ${scaled}px "Outfit", Arial, sans-serif`;
    }

    ctx.fillStyle = '#ffffff';
    ctx.fillText(userName, 540, nameY);

    ctx.fillStyle = 'rgba(255,255,255,0.48)';
    ctx.font = '24px "Outfit", Arial, sans-serif';
    ctx.fillText('Tu Desafio SINAC', 540, subtitleY);
  }

  private drawBadges(ctx: CanvasRenderingContext2D, badges: BadgeResult[]): void {
    const maxShow = Math.min(badges.length, 7);
    const iconSize = 30;
    const circleR = 26;
    const spacing = 76;
    const totalW = (maxShow - 1) * spacing;
    const startX = 540 - totalW / 2;
    const rowY = 855;

    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.38)';
    ctx.font = '20px "Outfit", Arial, sans-serif';
    ctx.fillText('Logros desbloqueados', 540, 800);

    for (let i = 0; i < maxShow; i++) {
      const bx = startX + i * spacing;

      ctx.beginPath();
      ctx.arc(bx, rowY, circleR, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(251,191,36,0.15)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(251,191,36,0.55)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.save();
      ctx.translate(bx - iconSize / 2, rowY - iconSize / 2);
      ctx.scale(iconSize / 24, iconSize / 24);
      ctx.fillStyle = '#fbbf24';
      ctx.fill(new Path2D(badges[i].svgPath));
      ctx.restore();
    }

    if (badges.length > 7) {
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.font = '20px "Outfit", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`+${badges.length - 7} mas`, 540, 912);
    }
  }

  private drawExploreHint(ctx: CanvasRenderingContext2D): void {
    ctx.textAlign = 'center';

    // Subtle decorative line
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(240, 770);
    ctx.lineTo(840, 770);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.font = '26px "Outfit", Arial, sans-serif';
    ctx.fillText('Sigue explorando Costa Rica', 540, 830);
  }

  private drawFooter(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.fillRect(0, 990, 1080, 90);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '22px "Outfit", Arial, sans-serif';
    ctx.fillText('sinacmap.app', 540, 1035);
    ctx.textBaseline = 'alphabetic';
  }
}
