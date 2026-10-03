import { Component, signal, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarService } from '../../core/services/calendar.service';
import { AuthService } from '../../core/services/auth.service';
import { AiService } from '../../core/services/ai.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="header-container">
      <!-- TOP ROW: Search, Scope Chips & Quick Actions -->
      <div class="top-row">
        <!-- Search bar with Scope filter chips (from Image 2) -->
        <div class="search-bar-wrapper">
          <div class="search-input-box">
            <span class="search-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
            <input 
              type="text" 
              placeholder="Buscar..." 
              [(ngModel)]="searchQuery"
              class="search-input" />
          </div>

          <div class="scope-chips">
            <span class="scope-prefix">En:</span>
            @for (scope of availableScopes; track scope.id) {
              <button 
                class="scope-chip" 
                [class.active]="activeScope() === scope.id"
                (click)="setScope(scope.id)">
                {{ scope.label }}
              </button>
            }
          </div>
        </div>

        <!-- Top Right System Actions -->
        <div class="system-actions">
          <button class="icon-circle-btn" (click)="toggleAi()" title="Asistente de IA">
            <span class="ai-sparkle">✨</span>
          </button>

          <button class="icon-circle-btn" title="Notificaciones">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span class="badge-dot"></span>
          </button>

          <button class="icon-circle-btn" title="Ajustes rápidos">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- MAIN ROW: Greeting, Date Navigation & Action Buttons -->
      <div class="main-row">
        <!-- Left: Stay up to date, Alfonso -->
        <div class="greeting-block">
          <h1 class="greeting-title">Organiza tu día, {{ firstName() }}</h1>
          
          <!-- Date Pill Navigator -->
          <div class="date-navigator">
            <button class="nav-arrow" (click)="calendar.prevWeek()" title="Semana anterior">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>

            <div class="current-date-pill">
              <span>{{ calendar.weekRangeText() }}</span>
            </div>

            <button class="nav-arrow" (click)="calendar.nextWeek()" title="Semana siguiente">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Right: Primary Actions & View Switcher -->
        <div class="actions-block">
          <!-- Add Event Neo-Button -->
          <button class="neo-btn neo-btn-primary" (click)="openAddEventModal.emit()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>Crear evento</span>
          </button>

          <!-- Refresh Data Button -->
          <button class="icon-pill-btn" (click)="calendar.loadData()" title="Sincronizar">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
          </button>

          <!-- View Switcher Tabs: Today | Week | Month -->
          <div class="neo-tabs-container">
            <button 
              class="neo-tab-item" 
              [class.active]="calendar.viewMode() === 'today'"
              (click)="calendar.viewMode.set('today'); calendar.goToToday()">
              Hoy
            </button>
            <button 
              class="neo-tab-item" 
              [class.active]="calendar.viewMode() === 'week'"
              (click)="calendar.viewMode.set('week')">
              Semana
            </button>
            <button 
              class="neo-tab-item" 
              [class.active]="calendar.viewMode() === 'month'"
              (click)="calendar.viewMode.set('month')">
              Mes
            </button>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 18px 24px 8px 24px;
    }

    /* TOP ROW */
    .top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .search-bar-wrapper {
      display: flex;
      align-items: center;
      background-color: var(--bg-surface);
      border: 1.5px solid var(--border-dark);
      border-radius: var(--radius-pill);
      padding: 4px 14px;
      gap: 14px;
      box-shadow: var(--shadow-level-1);
      width: 100%;
      max-width: 620px;
    }

    .search-input-box {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
    }

    .search-icon {
      color: var(--ink-secondary);
      display: flex;
      align-items: center;
    }

    .search-input {
      border: none;
      background: transparent;
      outline: none;
      font-size: 13.5px;
      font-family: var(--font-sans);
      color: var(--ink-primary);
      width: 100%;
    }

    .scope-chips {
      display: flex;
      align-items: center;
      gap: 5px;
      border-left: 1px solid var(--border-subtle);
      padding-left: 10px;
    }

    .scope-prefix {
      font-size: 11px;
      color: var(--ink-muted);
      font-weight: 600;
    }

    .scope-chip {
      background: transparent;
      border: 1px dashed var(--border-subtle);
      border-radius: var(--radius-pill);
      font-size: 11px;
      font-weight: 500;
      color: var(--ink-secondary);
      padding: 2px 8px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .scope-chip:hover {
      background: var(--bg-inset);
      border-color: var(--border-dark);
    }

    .scope-chip.active {
      background: var(--border-dark);
      color: #FFFFFF;
      border-style: solid;
      border-color: var(--border-dark);
    }

    .system-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .icon-circle-btn {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: var(--bg-surface);
      border: 1.5px solid var(--border-dark);
      box-shadow: var(--shadow-level-1);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      color: var(--ink-primary);
      transition: all 0.12s ease;
    }

    .icon-circle-btn:active {
      transform: translateY(2px);
      box-shadow: none;
    }

    .ai-sparkle {
      font-size: 15px;
    }

    .badge-dot {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 6px;
      height: 6px;
      background-color: #EC4899;
      border-radius: 50%;
    }

    /* MAIN ROW */
    .main-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }

    .greeting-block {
      display: flex;
      align-items: center;
      gap: 18px;
    }

    .greeting-title {
      font-family: var(--font-display);
      font-size: 26px;
      font-weight: 700;
      letter-spacing: -0.03em;
      color: var(--ink-primary);
    }

    .date-navigator {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .nav-arrow {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--bg-surface);
      border: 1.5px solid var(--border-dark);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 0 var(--border-dark);
      transition: all 0.1s ease;
    }

    .nav-arrow:active {
      transform: translateY(1px);
      box-shadow: none;
    }

    .current-date-pill {
      background-color: var(--border-dark);
      color: var(--ink-inverse);
      padding: 6px 14px;
      border-radius: var(--radius-pill);
      font-size: 12.5px;
      font-weight: 700;
      font-family: var(--font-mono);
      letter-spacing: -0.02em;
      box-shadow: 0 2px 0 rgba(0, 0, 0, 0.25);
    }

    .actions-block {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .icon-pill-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--bg-surface);
      border: 1.5px solid var(--border-dark);
      box-shadow: var(--shadow-level-1);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--ink-primary);
      transition: all 0.1s ease;
    }

    .icon-pill-btn:active {
      transform: translateY(2px);
      box-shadow: none;
    }
  `]
})
export class HeaderComponent {
  public readonly calendar = inject(CalendarService);
  public readonly auth = inject(AuthService);
  public readonly ai = inject(AiService);

  public readonly openAddEventModal = output<void>();

  public searchQuery = '';
  public readonly activeScope = signal<string>('all');

  public readonly availableScopes = [
    { id: 'all', label: 'Todo' },
    { id: 'classes', label: 'Clases' },
    { id: 'tasks', label: 'Tareas' },
    { id: 'notes', label: 'Apuntes' },
    { id: 'projects', label: 'Proyectos' }
  ];

  public setScope(scopeId: string): void {
    this.activeScope.set(scopeId);
  }

  public firstName(): string {
    const full = this.auth.currentUser()?.name || 'Alfonso';
    return full.split(' ')[0];
  }

  public toggleAi(): void {
    this.ai.toggleDrawer();
  }
}
