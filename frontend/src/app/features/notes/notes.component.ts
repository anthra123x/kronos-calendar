import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Note } from '../../core/models';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="notes-container">
      <div class="notes-header">
        <div>
          <h2>Apuntes & Notas Rápidas</h2>
          <p>Organiza tus apuntes de clase, resúmenes y reflexiones personales</p>
        </div>
        <button class="neo-btn neo-btn-primary" (click)="showNewNote = !showNewNote">
          + Nuevo Apunte
        </button>
      </div>

      <!-- Quick note editor -->
      @if (showNewNote) {
        <div class="new-note-card neo-surface">
          <input 
            type="text" 
            placeholder="Título del apunte..." 
            [(ngModel)]="newTitle" 
            class="neo-input note-title-input" />
          
          <textarea 
            rows="4" 
            placeholder="Escribe el contenido de tu apunte..." 
            [(ngModel)]="newContent"
            class="neo-input"></textarea>

          <div class="new-note-actions">
            <select [(ngModel)]="newCategory" class="neo-input select-cat">
              <option value="university">Universidad</option>
              <option value="work">Trabajo</option>
              <option value="personal">Personal</option>
            </select>
            <button class="neo-btn neo-btn-secondary" (click)="showNewNote = false">Cancelar</button>
            <button class="neo-btn neo-btn-primary" (click)="saveNote()" [disabled]="!newTitle.trim()">
              Guardar
            </button>
          </div>
        </div>
      }

      <!-- NOTES GRID -->
      <div class="notes-grid">
        @for (note of (notes() || fallbackNotes); track note.id) {
          <div class="note-card neo-raised" [class.pinned]="note.isPinned">
            <div class="note-card-top">
              <span class="note-tag" [ngClass]="'tag-' + note.category">{{ note.category }}</span>
              <button class="pin-btn" (click)="togglePin(note)">
                {{ note.isPinned ? '📌' : '📍' }}
              </button>
            </div>

            <h3 class="note-card-title">{{ note.title }}</h3>
            <p class="note-card-text">{{ note.content }}</p>

            <div class="note-card-footer">
              <span class="note-date">{{ note.updatedAt ? (note.updatedAt.substring(0, 10)) : 'Hoy' }}</span>
              <button class="delete-note-btn" (click)="deleteNote(note.id)">✕</button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .notes-container {
      flex: 1;
      padding: 10px 24px 24px 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      overflow-y: auto;
    }

    .notes-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }

    .notes-header h2 {
      font-family: var(--font-display);
      font-size: 24px;
      font-weight: 700;
    }

    .notes-header p {
      font-size: 13.5px;
      color: var(--ink-secondary);
    }

    .new-note-card {
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: var(--bg-surface);
      border-radius: 20px;
      box-shadow: var(--shadow-level-2);
    }

    .note-title-input {
      font-weight: 700;
      font-size: 16px;
    }

    .new-note-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
    }

    .select-cat {
      width: auto;
      padding: 6px 12px;
      font-size: 12px;
    }

    .notes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 18px;
    }

    .note-card {
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: var(--bg-surface);
      border-radius: 20px;
      min-height: 180px;
    }

    .note-card.pinned {
      background: #FEF9C3;
      border-color: #CA8A04;
    }

    .note-card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .note-tag {
      font-size: 10.5px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 2px 8px;
      border-radius: var(--radius-pill);
      border: 1px solid var(--border-dark);
    }

    .tag-university { background: var(--cat-university-bg); color: var(--cat-university-text); }
    .tag-work { background: var(--cat-planning-bg); color: var(--cat-planning-text); }
    .tag-personal { background: var(--cat-personal-bg); color: var(--cat-personal-text); }

    .pin-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 14px;
    }

    .note-card-title {
      font-family: var(--font-display);
      font-size: 16px;
      font-weight: 700;
    }

    .note-card-text {
      font-size: 13px;
      color: var(--ink-secondary);
      line-height: 1.5;
      flex: 1;
      white-space: pre-wrap;
    }

    .note-card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--border-subtle);
      padding-top: 8px;
    }

    .note-date {
      font-family: var(--font-mono);
      font-size: 10.5px;
      color: var(--ink-muted);
    }

    .delete-note-btn {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 1px solid var(--border-subtle);
      background: transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
    }
  `]
})
export class NotesComponent implements OnInit {
  private readonly api = inject(ApiService);

  public readonly notes = signal<Note[]>([]);
  public showNewNote = false;
  public newTitle = '';
  public newContent = '';
  public newCategory: 'university' | 'work' | 'personal' = 'university';

  public readonly fallbackNotes: Note[] = [
    {
      id: '1',
      title: 'Resumen parcial de Inteligencia Artificial',
      content: 'Temas clave: Modelos de difusión, atención en Transformers (Q, K, V), y ajuste fino eficiente con LoRA.',
      category: 'university',
      isPinned: true
    },
    {
      id: '2',
      title: 'Decisiones de Arquitectura Kronos',
      content: 'Arquitectura monolito modular con nwidart/modules en Laravel 12. Frontend en Angular con UI Neo-Skeuo.',
      category: 'work',
      isPinned: false
    },
    {
      id: '3',
      title: 'Objetivos del mes',
      content: '1. Mantener promedio sobre 4.5\n2. Ir al gimnasio 4 veces por semana\n3. Finalizar el sprint de Kronos.',
      category: 'personal',
      isPinned: false
    }
  ];

  ngOnInit(): void {
    this.loadNotes();
  }

  public loadNotes(): void {
    this.api.get<{ success: boolean; data: any[] }>('notes').subscribe({
      next: res => {
        if (res?.data && res.data.length > 0) {
          this.notes.set(res.data.map((n: any) => ({
            id: n.id,
            title: n.title,
            content: n.content,
            category: n.category || 'university',
            isPinned: n.is_pinned ?? false,
            updatedAt: n.updated_at
          })));
        }
      }
    });
  }

  public saveNote(): void {
    if (!this.newTitle.trim()) return;
    this.api.post<{ success: boolean; data: Note }>('notes', {
      title: this.newTitle,
      content: this.newContent,
      category: this.newCategory,
      is_pinned: false
    }).subscribe({
      next: () => {
        this.newTitle = '';
        this.newContent = '';
        this.showNewNote = false;
        this.loadNotes();
      }
    });
  }

  public togglePin(note: Note): void {
    this.api.put(`notes/${note.id}`, { is_pinned: !note.isPinned }).subscribe({
      next: () => this.loadNotes()
    });
  }

  public deleteNote(noteId: string): void {
    this.api.delete(`notes/${noteId}`).subscribe({
      next: () => this.loadNotes()
    });
  }
}
