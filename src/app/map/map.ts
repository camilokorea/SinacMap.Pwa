import { Component, ElementRef, OnInit, ViewChild, inject, ViewEncapsulation, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ApiService, ProtectedArea } from '../services/api';
import { AuthService } from '../services/auth';
import { MyBadgesComponent } from '../my-badges/my-badges';
import { User } from '@angular/fire/auth';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import panzoom, { PanZoom } from 'panzoom';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, DecimalPipe, FormsModule, MyBadgesComponent],
  templateUrl: './map.html',
  styleUrls: ['./map.scss'],
  encapsulation: ViewEncapsulation.None
})
export class Map implements OnInit {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;
  
  private apiService = inject(ApiService);
  private sanitizer = inject(DomSanitizer);
  private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService);

  mapHtml: SafeHtml = '';
  protectedAreas: ProtectedArea[] = [];
  selectedArea: ProtectedArea | null = null;
  private pzInstance: PanZoom | null = null;

  user$: Observable<User | null> = this.authService.user$;

  // Search state
  searchQuery: string = '';
  searchResults: ProtectedArea[] = [];
  showResults: boolean = false;

  // UI state
  isDarkTheme: boolean = false;
  filtersOpen: boolean = false;
  offlineBanner: string | null = null;
  onlineBanner: boolean = false;
  private onlineTimer: ReturnType<typeof setTimeout> | null = null;

  @HostListener('window:offline')
  onOffline() {
    if (this.onlineTimer) { clearTimeout(this.onlineTimer); this.onlineTimer = null; }
    this.onlineBanner = false;
    this.offlineBanner = 'Sin conexión';
  }

  @HostListener('window:online')
  onOnline() {
    this.offlineBanner = null;
    this.onlineBanner = true;
    this.onlineTimer = setTimeout(() => {
      this.onlineBanner = false;
      this.onlineTimer = null;
      this.cdr.detectChanges();
    }, 3000);
  }

  // Filter state
  categories: string[] = [];
  selectedCategories: Set<string> = new Set<string>();
  categoriesCollapsed = false;

  get selectedRegionFacebookUrl(): string {
    if (!this.selectedArea) return 'https://www.facebook.com/cr.sinac';
    const query = `${this.selectedArea.categoria} ${this.selectedArea.nombre_ASP}`;
    return `https://www.facebook.com/search/top?q=${encodeURIComponent(query)}`;
  }

  get visitedCount(): number {
    return this.protectedAreas.filter(a => a.visitado).length;
  }

  get progressPercentage(): number {
    if (this.protectedAreas.length === 0) return 0;
    return (this.visitedCount / this.protectedAreas.length) * 100;
  }

  ngOnInit() {
    const savedTheme = localStorage.getItem('theme');
    this.isDarkTheme = savedTheme === 'dark';

    if (!navigator.onLine) {
      this.offlineBanner = 'Sin conexión';
    }

    this.user$.subscribe(() => {
      this.loadProtectedAreas();
    });

    this.apiService.getSvgMap().pipe(
      catchError(() => {
        this.offlineBanner = 'No se pudo cargar el mapa — sin conexión';
        return of('');
      })
    ).subscribe(svgContent => {
      if (!svgContent) return;
      this.mapHtml = this.sanitizer.bypassSecurityTrustHtml(svgContent);
      this.cdr.detectChanges();
      const svgElement = this.mapContainer.nativeElement.querySelector('svg');
      if (svgElement) {
        this.pzInstance = panzoom(svgElement, {
          maxZoom: 10,
          minZoom: 0.1,
          bounds: true,
          boundsPadding: 0.1
        });

        // Center the map after a short delay to ensure rendering is complete
        setTimeout(() => this.centerMap(), 100);

        this.applyFiltersAndColors();
      }
    });
  }

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }

  loadProtectedAreas() {
    this.apiService.getProtectedAreas().pipe(
      catchError(() => {
        this.offlineBanner = 'Sin conexión — mostrando datos en caché';
        return of([] as ProtectedArea[]);
      })
    ).subscribe(data => {
      if (data.length > 0) this.offlineBanner = null;
      this.protectedAreas = data;
      this.categories = [...new Set(data.map(a => a.categoria))].filter(c => c).sort();
      this.applyFiltersAndColors();
    });
  }

  login() {
    this.authService.loginWithGoogle().subscribe();
  }

  logout() {
    this.authService.logout().subscribe();
  }

  centerMap() {
    if (!this.pzInstance) return;
    
    const container = this.mapContainer.nativeElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Exact dimensions from the SVG file
    const svgWidth = 732.965; 
    const svgHeight = 656.052; 

    // Target about 85% of the screen
    const initialZoom = Math.min(
      (containerWidth * 0.85) / svgWidth,
      (containerHeight * 0.85) / svgHeight
    );

    const x = (containerWidth - svgWidth * initialZoom) / 2;
    const y = (containerHeight - svgHeight * initialZoom) / 2;

    this.pzInstance.zoomAbs(0, 0, initialZoom);
    this.pzInstance.moveTo(x, y);
  }

  onSearch() {
    if (!this.searchQuery || this.searchQuery.length < 2) {
      this.searchResults = [];
      return;
    }
    
    const query = this.searchQuery.toLowerCase();
    this.searchResults = this.protectedAreas
      .filter(a => a.nombre_ASP.toLowerCase().includes(query) || 
                   a.codigo.toLowerCase().includes(query))
      .slice(0, 10); // Limit to top 10
  }

  selectFromSearch(area: ProtectedArea) {
    this.selectedArea = area;
    this.showResults = false;
    this.searchQuery = '';
    this.searchResults = [];
    
    // Haptic Feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(15);
    }

    // Auto-select category if not selected
    if (this.selectedCategories.size > 0 && !this.selectedCategories.has(area.categoria)) {
      this.selectedCategories.add(area.categoria);
    }
    
    this.applyFiltersAndColors();
  }

  toggleVisit(area: ProtectedArea) {
    const wasVisited = area.visitado;
    area.visitado = !area.visitado;
    this.applyFiltersAndColors();
    this.cdr.detectChanges();

    this.apiService.toggleVisit(area.codigo).pipe(
      catchError(() => {
        area.visitado = wasVisited;
        this.offlineBanner = 'No se pudo guardar — sin conexión';
        this.applyFiltersAndColors();
        this.cdr.detectChanges();
        return of(null);
      })
    ).subscribe(result => {
      if (result === null) return;
      if ('vibrate' in navigator) {
        navigator.vibrate(area.visitado ? [30, 20, 30] : 20);
      }
    });
  }

  toggleCategory(category: string) {
    if (this.selectedCategories.has(category)) {
      this.selectedCategories.delete(category);
    } else {
      this.selectedCategories.add(category);
    }
    this.applyFiltersAndColors();
  }

  applyFiltersAndColors() {
    const svgElement = this.mapContainer.nativeElement.querySelector('svg');
    if (!svgElement) return;

    const paths = svgElement.querySelectorAll('path[data-sinac]');
    paths.forEach((path: any) => {
      const sinacValue = path.getAttribute('data-sinac');
      if (!sinacValue) return;

      // Store original colors to restore them later
      if (!path.dataset['originalFill']) {
        path.dataset['originalFill'] = path.style.fill || '';
        path.dataset['originalStroke'] = path.style.stroke || '';
        path.dataset['originalStrokeWidth'] = path.style.strokeWidth || '';
      }

      const codigo = sinacValue.split('-')[0];
      const area = this.protectedAreas.find(a => a.codigo === codigo);
      if (area) {
        // 1. Visibility based on category
        const isVisible = this.selectedCategories.size === 0 || this.selectedCategories.has(area.categoria);
        path.style.display = isVisible ? '' : 'none';

        if (isVisible) {
          const isSelected = this.selectedArea?.codigo === area.codigo;
          const isVisited = area.visitado;

          // 2. Set Fill Color
          if (isVisited) {
            path.style.fill = '#fbbf24'; // Always gold if visited
          } else {
            path.style.fill = path.dataset['originalFill']; // Original color if not visited
          }

          // 3. Set Stroke & Highlight
          if (isSelected && !isVisited) {
            // Focus highlight for unvisited areas only
            path.style.stroke = '#ffffff';
            path.style.strokeWidth = '3.5';
            path.style.filter = 'drop-shadow(0 0 10px rgba(255,255,255,0.9))';
            path.parentNode.appendChild(path); // Bring to front
          } else if (isVisited) {
            // "Mission Accomplished" styling
            path.style.stroke = isSelected ? '#ffffff' : '#92400e'; // Subtle white border if selected but visited
            path.style.strokeWidth = isSelected ? '2' : '1.5';
            path.style.filter = '';
          } else {
            path.style.stroke = path.dataset['originalStroke'];
            path.style.strokeWidth = path.dataset['originalStrokeWidth'];
            path.style.filter = '';
          }
        }
      }
    });
  }

  handleMapClick(event: MouseEvent) {
    const target = event.target as SVGElement;
    const areaNode = target.closest('[data-sinac]') as SVGElement;
    
    if (areaNode) {
      const sinacValue = areaNode.getAttribute('data-sinac');
      if (sinacValue) {
        const codigo = sinacValue.split('-')[0];
        const area = this.protectedAreas.find(a => a.codigo === codigo);
        if (area) {
          this.selectedArea = area;
        }
      }
    }
  }

  closeDetails() {
    this.selectedArea = null;
  }

  zoomIn() {
    if (this.pzInstance) {
      const container = this.mapContainer.nativeElement;
      const cx = container.clientWidth / 2;
      const cy = container.clientHeight / 2;
      const currentScale = this.pzInstance.getTransform().scale;
      this.pzInstance.zoomAbs(cx, cy, currentScale * 1.5);
    }
  }

  zoomOut() {
    if (this.pzInstance) {
      const container = this.mapContainer.nativeElement;
      const cx = container.clientWidth / 2;
      const cy = container.clientHeight / 2;
      const currentScale = this.pzInstance.getTransform().scale;
      this.pzInstance.zoomAbs(cx, cy, currentScale * 0.66);
    }
  }

  resetZoom() {
    if (this.pzInstance) {
      const svgElement = this.mapContainer.nativeElement.querySelector('svg');
      if (svgElement) {
        const container = this.mapContainer.nativeElement;
        
        // Use zoomAbs at the top-left to reset the scale to 1
        this.pzInstance.zoomAbs(0, 0, 1);
        
        // Recalculate center offset
        const newRect = svgElement.getBoundingClientRect();
        const dx = (container.clientWidth - newRect.width) / 2;
        const dy = (container.clientHeight - newRect.height) / 2;
        this.pzInstance.moveTo(dx, dy);
      }
    }
  }
}
