import { Component, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarService } from '../../core/services/calendar.service';

@Component({
  selector: 'app-event-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop" (click)="close.emit()">
      <div class="modal-card neo-surface" (click)="$event.stopPropagation()">
        <!-- Modal Header -->
        <div class="modal-header">
          <div class="header-tag">
            <span class="tag-icon">📅</span>
            <h3>Nuevo Evento o Tarea</h3>
          </div>
          <button class="modal-close-btn" (click)="close.emit()" title="Cerrar">✕</button>
        </div>

        <!-- Form Body -->
        <form class="modal-body" (ngSubmit)="submit()">
          <div class="neo-input-group">
            <label>Título del Evento o Entrega</label>
            <input 
              type="text" 
              class="neo-input" 
              placeholder="Ej. Parcial de Inteligencia Artificial" 
              [(ngModel)]="title" 
              name="title" 
              required />
          </div>

          <div class="grid-2-cols">
            <div class="neo-input-group">
              <label>Categoría</label>
              <select class="neo-input" [(ngModel)]="category" name="category">
                <option value="university">Universidad & Clases</option>
                <option value="work">Trabajo & Proyectos</option>
                <option value="personal">Vida Personal & Salud</option>
              </select>
            </div>

            <div class="neo-input-group">
              <label>Lugar / Sala / Enlace</label>
              <input 
                type="text" 
                class="neo-input" 
                placeholder="Ej. Lab 302 o Google Meet" 
                [(ngModel)]="location" 
                name="location" />
            </div>
          </div>

          <div class="grid-2-cols">
            <div class="neo-input-group">
              <label>Hora Inicio</label>
              <input 
                type="datetime-local" 
                class="neo-input" 
                [(ngModel)]="startsAt" 
                name="startsAt" 
                required />
            </div>

            <div class="neo-input-group">
              <label>Hora Fin</label>
              <input 
                type="datetime-local" 
                class="neo-input" 
                [(ngModel)]="endsAt" 
                name="endsAt" 
                required />
            </div>
          </div>

          <div class="neo-input-group">
            <label>Descripción / Notas</label>
            <textarea 
              class="neo-input textarea" 
              rows="3" 
              placeholder="Detalles, temas a estudiar o enlaces relevantes..."
              [(ngModel)]="description" 
              name="description"></textarea>
          </div>

          <!-- Modal Footer Controls -->
          <div class="modal-footer">
            <button type="button" class="neo-btn neo-btn-secondary" (click)="close.emit()">
              Cancelar
            </button>
            <button type="submit" class="neo-btn neo-btn-primary" [disabled]="!title || isSaving">
              @if (isSaving) {
                <span>Guardando...</span>
              } @else {
                <span>Guardar Evento</span>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(18, 19, 22, 0.45);
      backdrop-filter: blur(4px);
      z-index: 70;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      animation: fadeIn 0.15s ease;
    }

    .modal-card {
      width: 100%;
      max-width: 520px;
      background: var(--bg-surface);
      border-radius: 24px;
      box-shadow: var(--shadow-level-3);
      border: 2px solid var(--border-dark);
      overflow: hidden;
      animation: popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes popIn {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    .modal-header {
      padding: 18px 24px;
      border-bottom: 1.5px solid var(--border-dark);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--bg-surface-warm);
    }

    .header-tag {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .header-tag h3 {
      font-family: var(--font-display);
      font-size: 17px;
      font-weight: 700;
    }

    .modal-close-btn {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 1.5px solid var(--border-dark);
      background: var(--bg-surface);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 2px 0 var(--border-dark);
      transition: all 0.1s ease;
    }

    .modal-close-btn:active {
      transform: translateY(1px);
      box-shadow: none;
    }

    .modal-body {
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .grid-2-cols {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }

    .textarea {
      resize: vertical;
      min-height: 70px;
    }

    .modal-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
      padding-top: 10px;
      border-top: 1px solid var(--border-subtle);
    }
  `]
})
export class EventModalComponent {
  private readonly calendar = inject(CalendarService);

  public readonly close = output<void>();

  public title = '';
  public category: 'university' | 'work' | 'personal' = 'university';
  public location = '';
  public startsAt = '';
  public endsAt = '';
  public description = '';
  public isSaving = false;

  constructor() {
    const now = new Date();
    const plusHour = new Date(now.getTime() + 60 * 60 * 1000);
    this.startsAt = this.formatDatetimeLocal(now);
    this.endsAt = this.formatDatetimeLocal(plusHour);
  }

  private formatDatetimeLocal(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${mins}`;
  }

  public submit(): void {
    if (!this.title) return;
    this.isSaving = true;

    this.calendar.createEvent({
      title: this.title,
      category: this.category,
      location: this.location,
      starts_at: new Date(this.startsAt).toISOString(),
      ends_at: new Date(this.endsAt).toISOString(),
      description: this.description,
      is_all_day: false
    }).subscribe({
      next: () => {
        this.isSaving = false;
        this.close.emit();
      },
      error: () => {
        this.isSaving = false;
        this.close.emit();
      }
    });
  }
}
