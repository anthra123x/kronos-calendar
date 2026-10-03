import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { HeaderComponent } from './layout/header/header.component';
import { AiDrawerComponent } from './features/ai-drawer/ai-drawer.component';
import { EventModalComponent } from './features/event-modal/event-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    HeaderComponent,
    AiDrawerComponent,
    EventModalComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  public readonly showAddEventModal = signal<boolean>(false);

  public openModal(): void {
    this.showAddEventModal.set(true);
  }

  public closeModal(): void {
    this.showAddEventModal.set(false);
  }
}
