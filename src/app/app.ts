import { Component, signal } from '@angular/core';
import { Map } from './map/map';

@Component({
  selector: 'app-root',
  imports: [Map],
  template: '<app-map></app-map>',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('sinac-map-pwa');
}
