import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { CalendarService } from '../../core/services/calendar.service';
import { AiService } from '../../core/services/ai.service';
import { DashboardData } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <!-- SUMMARY METRIC CARDS (Image 1 Neo-Skeuo Surfaces) -->
      <div class="metrics-grid">
        <div class="metric-card neo-raised">
          <div class="metric-icon cat-urgent">📌</div>
          <div class="metric-info">
            <span class="metric-count">{{ data()?.counters?.pending_tasks ?? 4 }}</span>
            <span class="metric-label">Tareas pendientes</span>
          </div>
          <span class="metric-sublabel">2 para hoy</span>
        </div>

        <div class="metric-card neo-raised">
          <div class="metric-icon cat-university">📚</div>
          <div class="metric-info">
            <span class="metric-count">{{ data()?.counters?.classes_today ?? 2 }}</span>
            <span class="metric-label">Clases hoy</span>
          </div>
          <span class="metric-sublabel">Lab 302 y Aula 404</span>
        </div>

        <div class="metric-card neo-raised">
          <div class="metric-icon cat-planning">🎯</div>
          <div class="metric-info">
            <span class="metric-count">{{ data()?.counters?.active_projects ?? 3 }}</span>
            <span class="metric-label">Proyectos activos</span>
          </div>
          <span class="metric-sublabel">Kronos, Tesis, Vida</span>
        </div>

        <div class="metric-card neo-raised ai-metric-card" (click)="ai.toggleDrawer(true)">
          <div class="metric-icon cat-ai">✨</div>
          <div class="metric-info">
            <span class="metric-count">Kronos AI</span>
            <span class="metric-label">Asistente Activo</span>
          </div>
          <button class="ai-ask-btn">Abrir Chat →</button>
        </div>
      </div>

      <!-- MAIN CONTENT: URGENT DEADLINES & UPCOMING CLASSES -->
      <div class="dashboard-columns">
        <!-- LEFT: TAREAS URGENTES Y ENTREGAS -->
        <div class="column-card neo-surface">
          <div class="card-header">
            <div class="header-title-group">
              <span class="badge-dot dot-rose"></span>
              <h3>Entregas & Tareas Críticas</h3>
            </div>
            <a routerLink="/tasks" class="view-all-link">Ver todas →</a>
          </div>

          <div class="tasks-list">
            @for (task of (data()?.urgent_tasks || fallbackTasks); track task.id) {
              <div class="task-row neo-raised-sm" [class.urgent]="task.priority === 'urgent'">
                <button 
                  class="task-check" 
                  [class.checked]="task.status === 'completed'"
                  (click)="toggleTask(task)">
                  @if (task.status === 'completed') { ✓ }
                </button>
                <div class="task-details">
                  <h4 class="task-name" [class.done]="task.status === 'completed'">{{ task.title }}</h4>
                  <div class="task-tags">
                    <span class="tag-pill" [ngClass]="'tag-' + task.category">
                      {{ task.category === 'university' ? 'Universidad' : task.category === 'work' ? 'Trabajo' : 'Personal' }}
                    </span>
                    @if (task.dueDate) {
                      <span class="due-pill">📅 {{ formatDue(task.dueDate) }}</span>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- RIGHT: PROYECTOS & ENFOQUE SEMANAL -->
        <div class="column-card neo-surface">
          <div class="card-header">
            <div class="header-title-group">
              <span class="badge-dot dot-blue"></span>
              <h3>Proyectos & Ejes de Vida</h3>
            </div>
            <a routerLink="/schedule" class="view-all-link">Ver horario →</a>
          </div>

          <div class="projects-list">
            <div class="project-box neo-raised-sm" style="border-left: 6px solid #6366F1;">
              <div class="project-header">
                <h4>Kronos App</h4>
                <span class="status-pill active">Activo</span>
              </div>
              <p>Plataforma integral de gestión de tiempo, estudios, vida y trabajo.</p>
              <div class="project-footer">
                <span>1 tarea pendiente</span>
                <span>Deadline: Dic 2026</span>
              </div>
            </div>

            <div class="project-box neo-raised-sm" style="border-left: 6px solid #EC4899;">
              <div class="project-header">
                <h4>Tesis de Grado</h4>
                <span class="status-pill active">En curso</span>
              </div>
              <p>Investigación sobre optimización de sistemas distribuidos y LLMs.</p>
              <div class="project-footer">
                <span>1 tarea pendiente</span>
                <span>Deadline: Ene 2027</span>
              </div>
            </div>

            <div class="project-box neo-raised-sm" style="border-left: 6px solid #10B981;">
              <div class="project-header">
                <h4>Vida Personal & Finanzas</h4>
                <span class="status-pill active">Constante</span>
              </div>
              <p>Hábitos saludables, gimnasio, metas de ahorro y organización personal.</p>
              <div class="project-footer">
                <span>1 tarea pendiente</span>
                <span>Prioridad diaria</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      flex: 1;
      padding: 10px 24px 24px 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      overflow-y: auto;
    }

    /* METRIC CARDS */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }

    .metric-card {
      padding: 18px 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 12px;
      background: var(--bg-surface);
      cursor: default;
    }

    .metric-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      border: 1.5px solid var(--border-dark);
      box-shadow: 0 2px 0 var(--border-dark);
    }

    .cat-urgent { background-color: var(--cat-urgent-bg); }
    .cat-university { background-color: var(--cat-university-bg); }
    .cat-planning { background-color: var(--cat-planning-bg); }
    .cat-ai { background-color: var(--cat-ai-bg); }

    .metric-info {
      display: flex;
      flex-direction: column;
    }

    .metric-count {
      font-family: var(--font-display);
      font-size: 28px;
      font-weight: 800;
      line-height: 1;
      color: var(--ink-primary);
    }

    .metric-label {
      font-size: 13px;
      font-weight: 600;
      color: var(--ink-secondary);
      margin-top: 4px;
    }

    .metric-sublabel {
      font-size: 11px;
      color: var(--ink-muted);
      font-weight: 600;
    }

    .ai-metric-card {
      background: linear-gradient(135deg, #FAF5FF 0%, #F5F3FF 100%);
      cursor: pointer;
      transition: transform 0.15s ease;
    }

    .ai-metric-card:hover {
      transform: translateY(-2px);
    }

    .ai-ask-btn {
      background-color: var(--border-dark);
      color: #FFFFFF;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: var(--radius-pill);
      border: none;
      cursor: pointer;
      width: fit-content;
    }

    /* COLUMNS */
    .dashboard-columns {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 20px;
    }

    .column-card {
      background: var(--bg-surface);
      border-radius: 24px;
      padding: 20px 22px;
      box-shadow: var(--shadow-level-2);
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: 12px;
    }

    .header-title-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .header-title-group h3 {
      font-family: var(--font-display);
      font-size: 17px;
      font-weight: 700;
    }

    .badge-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    .dot-rose { background-color: #EC4899; }
    .dot-blue { background-color: #3B82F6; }

    .view-all-link {
      font-size: 12.5px;
      font-weight: 700;
      color: var(--ink-secondary);
      text-decoration: none;
    }

    .view-all-link:hover {
      color: var(--ink-primary);
    }

    .tasks-list, .projects-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .task-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 14px;
      background: var(--bg-surface-warm);
    }

    .task-row.urgent {
      border-color: #F43F5E;
    }

    .task-check {
      width: 22px;
      height: 22px;
      border-radius: 6px;
      border: 1.5px solid var(--border-dark);
      background: var(--bg-surface);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 800;
      cursor: pointer;
      color: #10B981;
      box-shadow: 0 1.5px 0 var(--border-dark);
      flex-shrink: 0;
    }

    .task-check.checked {
      background-color: #D1FAE5;
    }

    .task-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .task-name {
      font-size: 13.5px;
      font-weight: 700;
    }

    .task-name.done {
      text-decoration: line-through;
      opacity: 0.6;
    }

    .task-tags {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .tag-pill {
      font-size: 10px;
      font-weight: 700;
      padding: 1px 7px;
      border-radius: var(--radius-pill);
      border: 1px solid var(--border-dark);
    }

    .tag-university { background: var(--cat-university-bg); color: var(--cat-university-text); }
    .tag-work { background: var(--cat-planning-bg); color: var(--cat-planning-text); }
    .tag-personal { background: var(--cat-personal-bg); color: var(--cat-personal-text); }

    .due-pill {
      font-size: 10.5px;
      font-family: var(--font-mono);
      color: var(--ink-secondary);
    }

    .project-box {
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      background: var(--bg-surface-warm);
    }

    .project-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .project-header h4 {
      font-family: var(--font-display);
      font-size: 14.5px;
      font-weight: 700;
    }

    .status-pill {
      font-size: 9.5px;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: var(--radius-pill);
      background: #E2E8F0;
      color: #334155;
    }

    .status-pill.active {
      background: #D1FAE5;
      color: #065F46;
    }

    .project-box p {
      font-size: 12px;
      color: var(--ink-secondary);
      line-height: 1.4;
    }

    .project-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 11px;
      font-weight: 600;
      color: var(--ink-muted);
      margin-top: 4px;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private readonly api = inject(ApiService);
  public readonly calendar = inject(CalendarService);
  public readonly ai = inject(AiService);

  public readonly data = signal<DashboardData | null>(null);

  public readonly fallbackTasks = [
    {
      id: '1',
      title: 'Entregar informe de arquitectura modular',
      priority: 'urgent',
      status: 'pending',
      category: 'university',
      dueDate: '2026-10-04T23:59:00Z'
    },
    {
      id: '2',
      title: 'Implementar endpoints de Dashboard y estadísticas',
      priority: 'high',
      status: 'in_progress',
      category: 'work',
      dueDate: '2026-10-05T18:00:00Z'
    },
    {
      id: '3',
      title: 'Pagar suscripciones y servicios del mes',
      priority: 'medium',
      status: 'pending',
      category: 'personal',
      dueDate: '2026-10-06T12:00:00Z'
    }
  ];

  ngOnInit(): void {
    this.loadDashboard();
  }

  public loadDashboard(): void {
    this.api.get<{ success: boolean; data: DashboardData }>('dashboard').subscribe({
      next: res => {
        if (res?.data) {
          this.data.set(res.data);
        }
      }
    });
  }

  public formatDue(dateStr: string): string {
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  public toggleTask(task: any): void {
    this.calendar.toggleTaskStatus(task.id, task.status).subscribe(() => {
      this.loadDashboard();
    });
  }
}
