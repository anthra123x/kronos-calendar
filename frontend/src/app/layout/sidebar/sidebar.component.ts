import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AiService } from '../../core/services/ai.service';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  badge?: string;
  action?: () => void;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar-container" [class.collapsed]="isCollapsed()">
      <!-- Brand & Collapse Toggle -->
      <div class="sidebar-header">
        <div class="brand">
          <div class="brand-logo">
            <span class="logo-dot"></span>
          </div>
          @if (!isCollapsed()) {
            <span class="brand-name">kronos</span>
          }
        </div>
        <button class="collapse-btn" (click)="toggleCollapse()" title="Colapsar menú">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" [class.rotated]="isCollapsed()">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
      </div>

      <!-- Navigation Scrollable Area -->
      <div class="sidebar-nav">
        <!-- GENERAL SECTION -->
        <div class="nav-section">
          @if (!isCollapsed()) {
            <span class="section-title">General</span>
          }
          <div class="nav-list">
            @for (item of generalNav; track item.id) {
              <a 
                [routerLink]="item.route" 
                routerLinkActive="active" 
                [routerLinkActiveOptions]="{ exact: item.route === '/' }"
                class="nav-link"
                [title]="item.label">
                <span class="nav-icon" [innerHTML]="item.icon"></span>
                @if (!isCollapsed()) {
                  <span class="nav-label">{{ item.label }}</span>
                  @if (item.badge) {
                    <span class="nav-badge">{{ item.badge }}</span>
                  }
                }
              </a>
            }
          </div>
        </div>

        <!-- TOOLS SECTION -->
        <div class="nav-section">
          @if (!isCollapsed()) {
            <span class="section-title">Herramientas</span>
          }
          <div class="nav-list">
            <!-- AI Copilot Button -->
            <button class="nav-link ai-link" (click)="openAiChat()" title="Kronos AI Assistant">
              <span class="nav-icon ai-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
              </span>
              @if (!isCollapsed()) {
                <span class="nav-label">Chat & IA</span>
                <span class="ai-pill">GPT-4o</span>
              }
            </button>

            @for (item of toolsNav; track item.id) {
              <a 
                [routerLink]="item.route" 
                routerLinkActive="active" 
                class="nav-link"
                [title]="item.label">
                <span class="nav-icon" [innerHTML]="item.icon"></span>
                @if (!isCollapsed()) {
                  <span class="nav-label">{{ item.label }}</span>
                }
              </a>
            }
          </div>
        </div>
      </div>

      <!-- Footer User Profile -->
      <div class="sidebar-footer">
        <button class="user-profile" (click)="toggleLogout()" title="Perfil y Sesión">
          <div class="user-avatar">
            <span>{{ userInitials() }}</span>
          </div>
          @if (!isCollapsed()) {
            <div class="user-info">
              <span class="user-name">{{ userName() }}</span>
              <span class="user-role">Estudiante U</span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          }
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar-container {
      width: 240px;
      height: calc(100vh - 28px);
      margin: 14px 0 14px 14px;
      background-color: var(--bg-sidebar);
      border-radius: 28px;
      display: flex;
      flex-direction: column;
      color: var(--ink-inverse);
      padding: 20px 14px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
      border: 1.5px solid var(--border-sidebar);
      transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      flex-shrink: 0;
      z-index: 40;
    }

    .sidebar-container.collapsed {
      width: 76px;
      padding: 20px 10px;
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 6px 18px 6px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .brand-logo {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #2D3039 0%, #1A1B20 100%);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(255, 255, 255, 0.15);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }

    .logo-dot {
      width: 10px;
      height: 10px;
      background-color: #EC4899;
      border-radius: 50%;
      box-shadow: 0 0 10px rgba(236, 72, 153, 0.7);
    }

    .brand-name {
      font-family: var(--font-display);
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: #FFFFFF;
    }

    .collapse-btn {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: var(--ink-inverse-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .collapse-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      color: #FFFFFF;
    }

    .collapse-btn svg.rotated {
      transform: rotate(180deg);
    }

    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      margin: 16px 0;
      display: flex;
      flex-direction: column;
      gap: 22px;
    }

    .nav-section {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .section-title {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: rgba(255, 255, 255, 0.4);
      padding: 0 12px;
      margin-bottom: 4px;
    }

    .nav-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: var(--radius-pill);
      color: rgba(255, 255, 255, 0.65);
      text-decoration: none;
      font-size: 13.5px;
      font-weight: 500;
      transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid transparent;
      background: transparent;
      width: 100%;
      cursor: pointer;
      text-align: left;
    }

    .nav-link:hover {
      background-color: var(--bg-sidebar-hover);
      color: #FFFFFF;
    }

    .nav-link.active {
      background-color: var(--bg-sidebar-active);
      color: #FFFFFF;
      font-weight: 600;
      border-color: rgba(255, 255, 255, 0.12);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    }

    .nav-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .ai-link {
      background: linear-gradient(90deg, rgba(236, 72, 153, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
      border: 1px solid rgba(236, 72, 153, 0.3);
      color: #F472B6;
    }

    .ai-link:hover {
      background: linear-gradient(90deg, rgba(236, 72, 153, 0.25) 0%, rgba(139, 92, 246, 0.25) 100%);
      color: #FFFFFF;
    }

    .ai-pill {
      font-size: 10px;
      font-weight: 700;
      background-color: #EC4899;
      color: #FFFFFF;
      padding: 2px 6px;
      border-radius: var(--radius-pill);
      margin-left: auto;
    }

    .nav-badge {
      font-size: 11px;
      font-weight: 700;
      background-color: rgba(255, 255, 255, 0.15);
      color: #FFFFFF;
      padding: 2px 7px;
      border-radius: var(--radius-pill);
      margin-left: auto;
    }

    .sidebar-footer {
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 12px;
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      background: transparent;
      border: none;
      padding: 6px;
      border-radius: 16px;
      cursor: pointer;
      color: var(--ink-inverse);
      transition: background 0.15s ease;
      text-align: left;
    }

    .user-profile:hover {
      background: var(--bg-sidebar-hover);
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
      color: #FFFFFF;
      border: 1.5px solid rgba(255, 255, 255, 0.2);
      flex-shrink: 0;
    }

    .user-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .user-name {
      font-size: 13px;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.4);
    }
  `]
})
export class SidebarComponent {
  private readonly auth = inject(AuthService);
  private readonly ai = inject(AiService);

  public readonly isCollapsed = signal<boolean>(false);

  public readonly generalNav: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      route: '/',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>`
    },
    {
      id: 'schedule',
      label: 'Horario & Calendario',
      route: '/schedule',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`
    },
    {
      id: 'academics',
      label: 'Clases de la U',
      route: '/academics',
      badge: '4',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`
    },
    {
      id: 'tasks',
      label: 'Tareas & Vida',
      route: '/tasks',
      badge: '5',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`
    },
    {
      id: 'notes',
      label: 'Apuntes',
      route: '/notes',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`
    }
  ];

  public readonly toolsNav: NavItem[] = [
    {
      id: 'focus',
      label: 'Focus Pomodoro',
      route: '/focus',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
    },
    {
      id: 'reports',
      label: 'Estadísticas & U',
      route: '/reports',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`
    },
    {
      id: 'settings',
      label: 'Configuración',
      route: '/settings',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`
    }
  ];

  public toggleCollapse(): void {
    this.isCollapsed.update(v => !v);
  }

  public openAiChat(): void {
    this.ai.toggleDrawer(true);
  }

  public userName(): string {
    return this.auth.currentUser()?.name || 'Alfonso';
  }

  public userInitials(): string {
    const name = this.userName();
    return name.substring(0, 2).toUpperCase();
  }

  public toggleLogout(): void {
    // fast toggle / profile
  }
}
