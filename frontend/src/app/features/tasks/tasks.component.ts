import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Task } from '../../core/models';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tasks-page-container">
      <!-- HEADER -->
      <div class="tasks-page-header">
        <div>
          <h2>Gestión de Tareas & Entregas</h2>
          <p>Organiza tus actividades universitarias, proyectos de trabajo y vida personal</p>
        </div>

        <!-- Category Tabs Filter -->
        <div class="neo-tabs-container">
          <button 
            class="neo-tab-item" 
            [class.active]="filterCategory() === 'all'"
            (click)="filterCategory.set('all')">
            Todas
          </button>
          <button 
            class="neo-tab-item" 
            [class.active]="filterCategory() === 'university'"
            (click)="filterCategory.set('university')">
            Universidad
          </button>
          <button 
            class="neo-tab-item" 
            [class.active]="filterCategory() === 'work'"
            (click)="filterCategory.set('work')">
            Trabajo
          </button>
          <button 
            class="neo-tab-item" 
            [class.active]="filterCategory() === 'personal'"
            (click)="filterCategory.set('personal')">
            Personal
          </button>
        </div>
      </div>

      <!-- QUICK TASK CREATION BAR -->
      <form class="quick-add-bar neo-raised" (ngSubmit)="createTask()">
        <input 
          type="text" 
          placeholder="Escribe una nueva tarea o entrega y presiona Enter..." 
          [(ngModel)]="newTaskTitle" 
          name="newTitle"
          class="quick-input" />
        
        <select [(ngModel)]="newTaskCategory" name="newCategory" class="cat-select neo-inset">
          <option value="university">Universidad</option>
          <option value="work">Trabajo</option>
          <option value="personal">Personal</option>
        </select>

        <select [(ngModel)]="newTaskPriority" name="newPriority" class="cat-select neo-inset">
          <option value="urgent">Urgente</option>
          <option value="high">Alta</option>
          <option value="medium">Media</option>
          <option value="low">Baja</option>
        </select>

        <button type="submit" class="neo-btn neo-btn-primary" [disabled]="!newTaskTitle.trim()">
          + Agregar Tarea
        </button>
      </form>

      <!-- TASKS LIST -->
      <div class="tasks-list-container">
        @for (task of filteredTasks(); track task.id) {
          <div class="task-card neo-raised-sm" [class.completed]="task.status === 'completed'">
            <button 
              class="task-checkbox" 
              [class.checked]="task.status === 'completed'"
              (click)="toggleTask(task)">
              @if (task.status === 'completed') { ✓ }
            </button>

            <div class="task-content">
              <span class="task-title" [class.line-through]="task.status === 'completed'">
                {{ task.title }}
              </span>
              @if (task.description) {
                <p class="task-desc">{{ task.description }}</p>
              }
              <div class="task-meta">
                <span class="badge-pill" [ngClass]="'badge-' + task.priority">
                  {{ task.priority }}
                </span>
                <span class="category-pill">
                  {{ task.category }}
                </span>
                @if (task.dueDate) {
                  <span class="due-text">📅 {{ task.dueDate.substring(0, 10) }}</span>
                }
              </div>
            </div>

            <button class="delete-btn" (click)="deleteTask(task.id)" title="Eliminar">✕</button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .tasks-page-container {
      flex: 1;
      padding: 10px 24px 24px 24px;
      display: flex;
      flex-direction: column;
      gap: 18px;
      overflow-y: auto;
    }

    .tasks-page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }

    .tasks-page-header h2 {
      font-family: var(--font-display);
      font-size: 24px;
      font-weight: 700;
    }

    .tasks-page-header p {
      font-size: 13.5px;
      color: var(--ink-secondary);
    }

    .quick-add-bar {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 12px;
      background: var(--bg-surface);
      border-radius: var(--radius-pill);
    }

    .quick-input {
      flex: 1;
      border: none;
      background: transparent;
      outline: none;
      font-size: 14px;
      font-family: var(--font-sans);
      padding: 0 8px;
    }

    .cat-select {
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-pill);
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 600;
      color: var(--ink-secondary);
      outline: none;
    }

    .tasks-list-container {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .task-card {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 18px;
      background: var(--bg-surface);
      border-radius: 16px;
      transition: all 0.15s ease;
    }

    .task-card.completed {
      opacity: 0.6;
      background: var(--bg-surface-warm);
    }

    .task-checkbox {
      width: 24px;
      height: 24px;
      border-radius: 7px;
      border: 1.5px solid var(--border-dark);
      background: var(--bg-surface);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 800;
      color: #10B981;
      cursor: pointer;
      box-shadow: 0 1.5px 0 var(--border-dark);
      flex-shrink: 0;
    }

    .task-checkbox.checked {
      background: #D1FAE5;
    }

    .task-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .task-title {
      font-size: 14.5px;
      font-weight: 700;
      color: var(--ink-primary);
    }

    .task-title.line-through {
      text-decoration: line-through;
    }

    .task-desc {
      font-size: 12px;
      color: var(--ink-secondary);
    }

    .task-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 2px;
    }

    .badge-pill {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      padding: 1px 7px;
      border-radius: var(--radius-pill);
      border: 1px solid var(--border-dark);
    }

    .badge-urgent { background: #FECDD3; color: #9F1239; }
    .badge-high { background: #FEF08A; color: #854D0E; }
    .badge-medium { background: #E0E7FF; color: #3730A3; }
    .badge-low { background: #F1F5F9; color: #475569; }

    .category-pill {
      font-size: 10.5px;
      color: var(--ink-muted);
      font-weight: 600;
      text-transform: capitalize;
    }

    .due-text {
      font-size: 11px;
      font-family: var(--font-mono);
      color: var(--ink-secondary);
    }

    .delete-btn {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 1px solid var(--border-subtle);
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--ink-muted);
      transition: all 0.1s ease;
    }

    .delete-btn:hover {
      background: #FEE2E2;
      color: #EF4444;
      border-color: #EF4444;
    }
  `]
})
export class TasksComponent implements OnInit {
  private readonly api = inject(ApiService);

  public readonly tasks = signal<Task[]>([]);
  public readonly filterCategory = signal<string>('all');

  public newTaskTitle = '';
  public newTaskCategory: 'university' | 'work' | 'personal' = 'university';
  public newTaskPriority: 'urgent' | 'high' | 'medium' | 'low' = 'medium';

  ngOnInit(): void {
    this.loadTasks();
  }

  public loadTasks(): void {
    this.api.get<{ success: boolean; data: any[] }>('tasks').subscribe({
      next: res => {
        if (res?.data) {
          this.tasks.set(res.data.map((t: any) => ({
            id: t.id,
            title: t.title,
            description: t.description,
            priority: t.priority,
            status: t.status,
            category: t.category,
            dueDate: t.due_date || t.dueDate
          })));
        }
      }
    });
  }

  public filteredTasks(): Task[] {
    const cat = this.filterCategory();
    if (cat === 'all') return this.tasks();
    return this.tasks().filter(t => t.category === cat);
  }

  public createTask(): void {
    if (!this.newTaskTitle.trim()) return;

    this.api.post<{ success: boolean; data: Task }>('tasks', {
      title: this.newTaskTitle,
      category: this.newTaskCategory,
      priority: this.newTaskPriority,
      status: 'pending'
    }).subscribe({
      next: () => {
        this.newTaskTitle = '';
        this.loadTasks();
      }
    });
  }

  public toggleTask(task: Task): void {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    this.api.put(`tasks/${task.id}`, { status: nextStatus }).subscribe({
      next: () => this.loadTasks()
    });
  }

  public deleteTask(taskId: string): void {
    this.api.delete(`tasks/${taskId}`).subscribe({
      next: () => this.loadTasks()
    });
  }
}
