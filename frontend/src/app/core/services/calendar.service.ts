import { Injectable, signal, computed, inject } from '@angular/core';
import { ApiService } from './api.service';
import { CalendarEvent, AcademicSchedule, Task } from '../models';
import { tap, catchError, of } from 'rxjs';

export interface DayColumn {
  date: Date;
  isoDate: string;
  dayName: string;
  dayNumber: string;
  isToday: boolean;
  events: ScheduleBlock[];
}

export interface ScheduleBlock {
  id: string;
  title: string;
  type: 'event' | 'class' | 'task';
  category: 'university' | 'work' | 'personal' | 'urgent' | 'health';
  startMinutes: number; // e.g. 7 * 60 = 420
  durationMinutes: number;
  topPercent: number;
  heightPercent: number;
  formattedTime: string;
  location?: string;
  actionText?: string;
  attachments?: string[];
  participants?: string[];
  status?: string;
  completed?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private readonly api = inject(ApiService);

  public readonly currentBaseDate = signal<Date>(new Date());
  public readonly viewMode = signal<'today' | 'week' | 'month'>('week');
  public readonly isLoading = signal<boolean>(false);

  public readonly events = signal<CalendarEvent[]>([]);
  public readonly classes = signal<AcademicSchedule[]>([]);
  public readonly tasks = signal<Task[]>([]);

  // Time range displayed: 07:00 to 20:00 (13 hours total = 780 minutes)
  public readonly startHour = 7;
  public readonly endHour = 20;
  public readonly totalMinutes = (this.endHour - this.startHour) * 60; // 780 mins

  // Computed current time indicator
  public readonly currentTimeMinutes = signal<number>(this.calculateCurrentMinutes());

  constructor() {
    this.refreshCurrentTime();
    setInterval(() => this.refreshCurrentTime(), 60000);
    this.loadData();
  }

  private calculateCurrentMinutes(): number {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }

  private refreshCurrentTime(): void {
    this.currentTimeMinutes.set(this.calculateCurrentMinutes());
  }

  public readonly currentTimePositionPercent = computed(() => {
    const currentMins = this.currentTimeMinutes();
    const startMins = this.startHour * 60;
    const endMins = this.endHour * 60;

    if (currentMins < startMins) return 0;
    if (currentMins > endMins) return 100;

    return ((currentMins - startMins) / this.totalMinutes) * 100;
  });

  public readonly currentTimeFormatted = computed(() => {
    const now = new Date();
    return now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false });
  });

  // Calculate the 7 days of the currently selected week (Monday to Sunday)
  public readonly weekDays = computed<DayColumn[]>(() => {
    const base = new Date(this.currentBaseDate());
    const day = base.getDay(); // 0 is Sunday, 1 is Monday...
    const diff = base.getDate() - day + (day === 0 ? -6 : 1); // Adjust when Sunday
    const monday = new Date(base.setDate(diff));

    const days: DayColumn[] = [];
    const todayStr = new Date().toISOString().split('T')[0];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayNames = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
      
      const dayNum = d.getDay();
      const colName = dayNames[dayNum];
      const dayFormatted = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;

      // Blocks for this day
      const blocks = this.getBlocksForDay(d, iso, dayNum === 0 ? 7 : dayNum);

      days.push({
        date: d,
        isoDate: iso,
        dayName: colName,
        dayNumber: dayFormatted,
        isToday: iso === todayStr,
        events: blocks
      });
    }

    return days;
  });

  public readonly weekRangeText = computed(() => {
    const days = this.weekDays();
    if (!days.length) return '';
    const start = days[0];
    const end = days[6];
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${monthNames[start.date.getMonth()]} ${start.dayNumber} — ${end.dayNumber}`;
  });

  private getBlocksForDay(date: Date, isoDate: string, dayOfWeek1to7: number): ScheduleBlock[] {
    const blocks: ScheduleBlock[] = [];

    // 1. Academic classes for this day of week
    const dayClasses = this.classes().filter(c => c.dayOfWeek === dayOfWeek1to7);
    for (const c of dayClasses) {
      const startParts = c.startTime.split(':');
      const startMins = parseInt(startParts[0], 10) * 60 + parseInt(startParts[1] || '0', 10);
      const endParts = c.endTime.split(':');
      const endMins = parseInt(endParts[0], 10) * 60 + parseInt(endParts[1] || '0', 10);
      const duration = Math.max(endMins - startMins, 45);

      const topPercent = Math.max(0, ((startMins - (this.startHour * 60)) / this.totalMinutes) * 100);
      const heightPercent = Math.min(100 - topPercent, (duration / this.totalMinutes) * 100);

      blocks.push({
        id: c.id,
        title: c.subjectName || 'Clase Universitaria',
        type: 'class',
        category: 'university',
        startMinutes: startMins,
        durationMinutes: duration,
        topPercent,
        heightPercent: Math.max(heightPercent, 7),
        formattedTime: `${c.startTime.substring(0, 5)} - ${c.endTime.substring(0, 5)}`,
        location: c.classroom ? `Salón ${c.classroom}` : 'Campus Central',
        actionText: 'Asistir',
        participants: ['Profesor', 'Grupo A']
      });
    }

    // 2. Events matching this date
    const dayEvents = this.events().filter(e => e.startsAt.startsWith(isoDate));
    for (const e of dayEvents) {
      const start = new Date(e.startsAt);
      const end = new Date(e.endsAt);
      const startMins = start.getHours() * 60 + start.getMinutes();
      const endMins = end.getHours() * 60 + end.getMinutes();
      const duration = Math.max(endMins - startMins, 45);

      const topPercent = Math.max(0, ((startMins - (this.startHour * 60)) / this.totalMinutes) * 100);
      const heightPercent = Math.min(100 - topPercent, (duration / this.totalMinutes) * 100);

      blocks.push({
        id: e.id,
        title: e.title,
        type: 'event',
        category: e.category,
        startMinutes: startMins,
        durationMinutes: duration,
        topPercent,
        heightPercent: Math.max(heightPercent, 7),
        formattedTime: `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')} - ${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`,
        location: e.location,
        actionText: e.category === 'work' ? 'Revisar' : 'Unirse',
        attachments: e.attachments,
        participants: e.participants,
        status: e.status
      });
    }

    // 3. Urgent tasks due on this date
    const dayTasks = this.tasks().filter(t => t.dueDate && t.dueDate.startsWith(isoDate));
    for (const t of dayTasks) {
      const due = new Date(t.dueDate!);
      const dueMins = due.getHours() * 60 + due.getMinutes();
      const startMins = Math.max(this.startHour * 60, dueMins - 60);
      const duration = 60;

      const topPercent = Math.max(0, ((startMins - (this.startHour * 60)) / this.totalMinutes) * 100);
      const heightPercent = (duration / this.totalMinutes) * 100;

      blocks.push({
        id: t.id,
        title: t.title,
        type: 'task',
        category: t.priority === 'urgent' ? 'urgent' : (t.category as any),
        startMinutes: startMins,
        durationMinutes: duration,
        topPercent,
        heightPercent: Math.max(heightPercent, 8),
        formattedTime: `Entrega: ${String(due.getHours()).padStart(2, '0')}:${String(due.getMinutes()).padStart(2, '0')}`,
        actionText: 'Completar',
        status: t.status,
        completed: t.status === 'completed'
      });
    }

    return blocks;
  }

  public loadData(): void {
    this.isLoading.set(true);

    // Fetch dashboard summary, events, and schedules from the real backend
    this.api.get<{ success: boolean; data: any[] }>('events').pipe(
      tap(res => {
        if (res?.data) {
          this.events.set(res.data.map((e: any) => ({
            id: e.id,
            title: e.title,
            description: e.description,
            location: e.location,
            color: e.color,
            startsAt: e.starts_at || e.startsAt,
            endsAt: e.ends_at || e.endsAt,
            isAllDay: e.is_all_day ?? false,
            category: e.category || 'personal',
            status: e.status || 'scheduled',
            participants: ['TY', 'AB', 'NR'],
            attachments: ['Agenda.pdf']
          })));
        }
      }),
      catchError(() => of(null))
    ).subscribe();

    this.api.get<{ success: boolean; data: any[] }>('academics/schedules/weekly').pipe(
      tap(res => {
        if (res?.data) {
          this.classes.set(res.data.map((s: any) => ({
            id: s.id,
            subjectId: s.subject_id || s.subjectId,
            subjectName: s.subject?.name || s.subjectName || 'Clase Magistral',
            dayOfWeek: s.day_of_week ?? s.dayOfWeek,
            startTime: s.start_time || s.startTime,
            endTime: s.end_time || s.endTime,
            classroom: s.classroom,
            building: s.building
          })));
        }
      }),
      catchError(() => of(null))
    ).subscribe();

    this.api.get<{ success: boolean; data: any[] }>('tasks').pipe(
      tap(res => {
        if (res?.data) {
          this.tasks.set(res.data.map((t: any) => ({
            id: t.id,
            title: t.title,
            description: t.description,
            priority: t.priority,
            status: t.status,
            category: t.category,
            projectId: t.project_id || t.projectId,
            dueDate: t.due_date || t.dueDate,
            completedAt: t.completed_at || t.completedAt
          })));
        }
        this.isLoading.set(false);
      }),
      catchError(() => {
        this.isLoading.set(false);
        return of(null);
      })
    ).subscribe();
  }

  public nextWeek(): void {
    const d = new Date(this.currentBaseDate());
    d.setDate(d.getDate() + 7);
    this.currentBaseDate.set(d);
  }

  public prevWeek(): void {
    const d = new Date(this.currentBaseDate());
    d.setDate(d.getDate() - 7);
    this.currentBaseDate.set(d);
  }

  public goToToday(): void {
    this.currentBaseDate.set(new Date());
  }

  public createEvent(eventData: any) {
    return this.api.post<{ success: boolean; data: CalendarEvent }>('events', eventData).pipe(
      tap(() => this.loadData())
    );
  }

  public toggleTaskStatus(taskId: string, currentStatus: string) {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    return this.api.put<{ success: boolean }>(`tasks/${taskId}`, {
      status: newStatus
    }).pipe(
      tap(() => this.loadData())
    );
  }
}
