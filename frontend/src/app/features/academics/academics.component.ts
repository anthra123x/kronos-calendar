import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { AcademicSubject } from '../../core/models';

@Component({
  selector: 'app-academics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="academics-container">
      <!-- HEADER -->
      <div class="academics-header">
        <div>
          <h2>Materias & Semestre Universitario</h2>
          <p>Gestiona tus horarios de clase, profesores, aulas y calificaciones</p>
        </div>
        <div class="stats-pills">
          <span class="stat-badge neo-raised-sm">Semestre 2026-2</span>
          <span class="stat-badge neo-raised-sm">Promedio: 4.6 / 5.0</span>
        </div>
      </div>

      <!-- SUBJECTS GRID -->
      <div class="subjects-grid">
        @for (subject of (subjects() || fallbackSubjects); track subject.id) {
          <div class="subject-card neo-raised" [style.border-top]="'6px solid ' + (subject.color || '#3B82F6')">
            <div class="subject-top">
              <span class="code-pill">{{ subject.code }}</span>
              <span class="credits-pill">{{ subject.credits || 3 }} Créditos</span>
            </div>

            <h3 class="subject-name">{{ subject.name }}</h3>
            <p class="professor-name">Prof. {{ subject.professorName || 'Docente Principal' }}</p>

            <div class="classroom-box neo-inset">
              <span>📍 Aula: {{ subject.classroom || 'Lab 302' }}</span>
            </div>

            <!-- Grade Progress Bar (Image 1 Linear Progress) -->
            <div class="grade-section">
              <div class="grade-labels">
                <span>Nota actual</span>
                <span class="grade-number">{{ subject.currentGrade || 4.5 }} / 5.0</span>
              </div>
              <div class="progress-track neo-inset">
                <div 
                  class="progress-fill" 
                  [style.width.%]="((subject.currentGrade || 4.5) / 5.0) * 100"
                  [style.background]="subject.color || '#3B82F6'">
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .academics-container {
      flex: 1;
      padding: 10px 24px 24px 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      overflow-y: auto;
    }

    .academics-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }

    .academics-header h2 {
      font-family: var(--font-display);
      font-size: 24px;
      font-weight: 700;
    }

    .academics-header p {
      font-size: 13.5px;
      color: var(--ink-secondary);
    }

    .stats-pills {
      display: flex;
      gap: 10px;
    }

    .stat-badge {
      padding: 6px 14px;
      font-size: 12.5px;
      font-weight: 700;
      background: var(--bg-surface);
      border-radius: var(--radius-pill);
    }

    .subjects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 18px;
    }

    .subject-card {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: var(--bg-surface);
      border-radius: 20px;
    }

    .subject-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .code-pill {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 700;
      background: var(--bg-inset);
      padding: 2px 8px;
      border-radius: 6px;
      border: 1px solid var(--border-subtle);
    }

    .credits-pill {
      font-size: 11px;
      font-weight: 600;
      color: var(--ink-muted);
    }

    .subject-name {
      font-family: var(--font-display);
      font-size: 18px;
      font-weight: 700;
      color: var(--ink-primary);
      margin-top: 4px;
    }

    .professor-name {
      font-size: 13px;
      color: var(--ink-secondary);
    }

    .classroom-box {
      padding: 8px 12px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 600;
      color: var(--ink-secondary);
      margin: 4px 0;
    }

    .grade-section {
      margin-top: auto;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .grade-labels {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      font-weight: 700;
    }

    .grade-number {
      font-family: var(--font-mono);
      color: var(--ink-primary);
    }

    .progress-track {
      height: 10px;
      border-radius: var(--radius-pill);
      overflow: hidden;
      position: relative;
    }

    .progress-fill {
      height: 100%;
      border-radius: var(--radius-pill);
      transition: width 0.4s ease;
    }
  `]
})
export class AcademicsComponent implements OnInit {
  private readonly api = inject(ApiService);

  public readonly subjects = signal<AcademicSubject[]>([]);

  public readonly fallbackSubjects: AcademicSubject[] = [
    {
      id: '1',
      name: 'Inteligencia Artificial',
      code: 'ING-701',
      color: '#8B5CF6',
      credits: 4,
      classroom: 'Lab 302',
      professorName: 'Dr. Roberto Mendoza',
      currentGrade: 4.8
    },
    {
      id: '2',
      name: 'Arquitectura de Software',
      code: 'ING-702',
      color: '#3B82F6',
      credits: 3,
      classroom: 'Aula 204',
      professorName: 'Ing. Sandra Restrepo',
      currentGrade: 4.5
    },
    {
      id: '3',
      name: 'Sistemas Distribuidos',
      code: 'ING-703',
      color: '#EC4899',
      credits: 4,
      classroom: 'Lab Redes',
      professorName: 'MSc. Carlos Valderrama',
      currentGrade: 4.3
    },
    {
      id: '4',
      name: 'Metodología de Investigación',
      code: 'ING-704',
      color: '#10B981',
      credits: 2,
      classroom: 'Seminario 1',
      professorName: 'Dra. Elena Gómez',
      currentGrade: 4.9
    }
  ];

  ngOnInit(): void {
    this.api.get<{ success: boolean; data: any[] }>('academics/subjects').subscribe({
      next: res => {
        if (res?.data && res.data.length > 0) {
          this.subjects.set(res.data.map((s: any) => ({
            id: s.id,
            name: s.name,
            code: s.code,
            color: s.color || '#3B82F6',
            credits: s.credits,
            classroom: s.classroom,
            professorName: s.professor_name || s.professorName,
            currentGrade: s.current_grade ? parseFloat(s.current_grade) : 4.5
          })));
        }
      }
    });
  }
}
