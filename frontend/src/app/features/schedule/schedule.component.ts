import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarService, ScheduleBlock } from '../../core/services/calendar.service';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="schedule-viewport">
      <!-- SCHEDULE GRID WRAPPER (Neo-Skeuomorphic Board) -->
      <div class="schedule-board neo-surface">
        
        <!-- DAYS HEADER (7 Columns from Image 2) -->
        <div class="board-header">
          <!-- Corner spacer for time axis (shows week number) -->
          <div class="time-header-corner">
            <span class="week-label">W</span>
            <span class="week-number">40</span>
          </div>

          <!-- 7 Day Columns Headers -->
          <div class="days-header-row">
            @for (day of calendar.weekDays(); track day.isoDate) {
              <div class="day-header-cell" [class.is-today]="day.isToday">
                @if (day.isToday) {
                  <div class="today-pill">
                    <span class="day-name">{{ day.dayName }}</span>
                    <span class="day-number">{{ day.dayNumber }}</span>
                  </div>
                } @else {
                  <div class="normal-day-header">
                    <span class="day-name">{{ day.dayName }}</span>
                    <span class="day-number">{{ day.dayNumber }}</span>
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <!-- MAIN SCROLLABLE TIME GRID -->
        <div class="board-grid-scroll">
          <div class="time-grid-container">
            
            <!-- TIME AXIS COLUMN -->
            <div class="time-axis-col">
              @for (hour of timeSlots; track hour.time) {
                <div class="time-slot-label" [class.is-half]="hour.isHalf">
                  <span class="time-text">{{ hour.time }}</span>
                </div>
              }
            </div>

            <!-- 7 DAYS COLUMNS TRACKS -->
            <div class="days-columns-wrapper">
              <!-- Grid background horizontal lines -->
              <div class="grid-lines-bg">
                @for (hour of timeSlots; track hour.time) {
                  <div class="grid-h-line" [class.half-line]="hour.isHalf"></div>
                }
              </div>

              <!-- CURRENT TIME INDICATOR (Dashed line from Image 2) -->
              <div 
                class="current-time-line" 
                [style.top.%]="calendar.currentTimePositionPercent()">
                <div class="time-pill-marker">
                  {{ calendar.currentTimeFormatted() }}
                </div>
                <div class="dashed-line"></div>
              </div>

              <!-- 7 DAY COLUMNS WITH POSITIONED CARDS -->
              <div class="days-columns-content">
                @for (day of calendar.weekDays(); track day.isoDate) {
                  <div class="day-track-column" [class.today-track]="day.isToday">
                    
                    <!-- Events / Classes / Tasks inside this day -->
                    @for (block of day.events; track block.id) {
                      <div 
                        class="schedule-card-block"
                        [ngClass]="'card-' + block.category"
                        [style.top.%]="block.topPercent"
                        [style.height.%]="block.heightPercent"
                        [title]="block.title + ' (' + block.formattedTime + ')'">
                        
                        <!-- Card Top Bar: Icon + Category Badge -->
                        <div class="card-header">
                          <span class="card-icon">
                            @if (block.type === 'class') {
                              📚
                            } @else if (block.type === 'task') {
                              📌
                            } @else {
                              🎯
                            }
                          </span>
                          <span class="card-time-badge">{{ block.formattedTime }}</span>
                        </div>

                        <!-- Card Body: Title & Location -->
                        <div class="card-body">
                          <h4 class="card-title">{{ block.title }}</h4>
                          @if (block.location) {
                            <p class="card-location">{{ block.location }}</p>
                          }
                        </div>

                        <!-- Card Footer: Attachments, Participants & Action Button -->
                        <div class="card-footer">
                          @if (block.attachments && block.attachments.length > 0) {
                            <div class="attachment-pill">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                              </svg>
                              <span>{{ block.attachments[0] }}</span>
                            </div>
                          }

                          @if (block.participants && block.participants.length > 0) {
                            <div class="participants-avatars">
                              @for (p of block.participants; track p) {
                                <span class="mini-avatar">{{ p }}</span>
                              }
                              <span class="more-participants">+2</span>
                            </div>
                          }

                          @if (block.actionText) {
                            <button 
                              class="card-action-btn"
                              (click)="handleAction(block, $event)">
                              {{ block.actionText }}
                            </button>
                          }
                        </div>
                      </div>
                    }

                  </div>
                }
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .schedule-viewport {
      flex: 1;
      padding: 6px 24px 20px 24px;
      display: flex;
      flex-direction: column;
      height: calc(100vh - 140px);
      min-height: 500px;
    }

    .schedule-board {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: var(--shadow-level-2);
      border-radius: 24px;
      background-color: var(--bg-surface);
    }

    /* BOARD HEADER */
    .board-header {
      display: flex;
      align-items: center;
      border-bottom: 1.5px solid var(--border-dark);
      background-color: var(--bg-surface);
      height: 72px;
      flex-shrink: 0;
    }

    .time-header-corner {
      width: 72px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-right: 1.5px solid var(--border-dark);
      height: 100%;
      background-color: var(--bg-inset);
    }

    .week-label {
      font-size: 10px;
      font-weight: 700;
      color: var(--ink-muted);
    }

    .week-number {
      font-family: var(--font-mono);
      font-size: 13px;
      font-weight: 700;
      color: var(--ink-secondary);
    }

    .days-header-row {
      flex: 1;
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      height: 100%;
    }

    .day-header-cell {
      display: flex;
      align-items: center;
      justify-content: center;
      border-right: 1px solid var(--border-subtle);
      padding: 8px 4px;
    }

    .day-header-cell:last-child {
      border-right: none;
    }

    .normal-day-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }

    .day-name {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.04em;
      color: var(--ink-muted);
    }

    .day-number {
      font-family: var(--font-mono);
      font-size: 13px;
      font-weight: 700;
      color: var(--ink-primary);
    }

    /* Current active day pill (Dark pill from Image 2) */
    .today-pill {
      background-color: var(--border-dark);
      color: #FFFFFF;
      padding: 8px 18px;
      border-radius: var(--radius-pill);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    }

    .today-pill .day-name {
      color: rgba(255, 255, 255, 0.7);
      font-size: 10.5px;
    }

    .today-pill .day-number {
      color: #FFFFFF;
      font-size: 14px;
    }

    /* BOARD GRID SCROLL */
    .board-grid-scroll {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      position: relative;
    }

    .time-grid-container {
      display: flex;
      min-height: 1200px;
      position: relative;
    }

    /* TIME AXIS */
    .time-axis-col {
      width: 72px;
      border-right: 1.5px solid var(--border-dark);
      background-color: var(--bg-surface-warm);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
    }

    .time-slot-label {
      height: 48px;
      padding-right: 10px;
      display: flex;
      align-items: flex-start;
      justify-content: flex-end;
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 600;
      color: var(--ink-muted);
      border-bottom: 1px dashed var(--border-faint);
    }

    .time-slot-label.is-half {
      color: #C5BFB3;
      font-size: 10px;
      border-bottom: 1px solid var(--border-faint);
    }

    /* DAYS COLUMNS WRAPPER */
    .days-columns-wrapper {
      flex: 1;
      position: relative;
      display: flex;
    }

    .grid-lines-bg {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      pointer-events: none;
      z-index: 1;
    }

    .grid-h-line {
      height: 48px;
      border-bottom: 1px dashed var(--border-faint);
    }

    .grid-h-line.half-line {
      border-bottom: 1px solid var(--border-faint);
    }

    /* CURRENT TIME DASHED LINE (from Image 2) */
    .current-time-line {
      position: absolute;
      left: 0;
      right: 0;
      display: flex;
      align-items: center;
      z-index: 25;
      pointer-events: none;
      transform: translateY(-50%);
    }

    .time-pill-marker {
      background-color: #EC4899;
      color: #FFFFFF;
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: var(--radius-pill);
      box-shadow: 0 2px 4px rgba(236, 72, 153, 0.4);
      margin-left: 4px;
      flex-shrink: 0;
    }

    .dashed-line {
      flex: 1;
      height: 2px;
      border-bottom: 2px dashed #EC4899;
      opacity: 0.85;
    }

    /* DAYS COLUMNS CONTENT */
    .days-columns-content {
      position: relative;
      flex: 1;
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      z-index: 10;
    }

    .day-track-column {
      position: relative;
      border-right: 1px solid var(--border-faint);
      padding: 0 4px;
      height: 100%;
    }

    .day-track-column:last-child {
      border-right: none;
    }

    .day-track-column.today-track {
      background-color: rgba(0, 0, 0, 0.015);
    }

    /* SCHEDULE CARD BLOCKS (Neo-Skeuo Pastel Styling from Image 2) */
    .schedule-card-block {
      position: absolute;
      left: 4px;
      right: 4px;
      border-radius: 14px;
      padding: 8px 10px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
      box-shadow: 0 3px 0 var(--border-dark), 0 4px 8px rgba(0, 0, 0, 0.05);
      transition: transform 0.12s ease, box-shadow 0.12s ease;
      cursor: pointer;
    }

    .schedule-card-block:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 0 var(--border-dark), 0 8px 14px rgba(0, 0, 0, 0.08);
      z-index: 20;
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 4px;
    }

    .card-icon {
      font-size: 13px;
    }

    .card-time-badge {
      font-family: var(--font-mono);
      font-size: 9.5px;
      font-weight: 700;
      opacity: 0.8;
    }

    .card-body {
      flex: 1;
      overflow: hidden;
    }

    .card-title {
      font-family: var(--font-sans);
      font-size: 12.5px;
      font-weight: 700;
      line-height: 1.25;
      margin-bottom: 2px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-location {
      font-size: 10.5px;
      opacity: 0.75;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      margin-top: 6px;
      flex-wrap: wrap;
    }

    .attachment-pill {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      background: rgba(0, 0, 0, 0.08);
      padding: 1px 6px;
      border-radius: var(--radius-pill);
      font-size: 9.5px;
      font-weight: 600;
    }

    .participants-avatars {
      display: flex;
      align-items: center;
    }

    .mini-avatar {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background-color: #3B82F6;
      color: #FFFFFF;
      font-size: 8px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #FFFFFF;
      margin-left: -4px;
    }

    .mini-avatar:first-child {
      margin-left: 0;
    }

    .more-participants {
      font-size: 9px;
      font-weight: 700;
      opacity: 0.75;
      margin-left: 2px;
    }

    .card-action-btn {
      background-color: var(--border-dark);
      color: #FFFFFF;
      border: none;
      padding: 3px 10px;
      border-radius: var(--radius-pill);
      font-size: 10.5px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 1.5px 0 rgba(0, 0, 0, 0.3);
      transition: all 0.1s ease;
      margin-left: auto;
    }

    .card-action-btn:hover {
      background-color: #2F3138;
    }

    .card-action-btn:active {
      transform: translateY(1px);
      box-shadow: none;
    }
  `]
})
export class ScheduleComponent {
  public readonly calendar = inject(CalendarService);

  public readonly timeSlots = [
    { time: '07:00', isHalf: false },
    { time: '07:30', isHalf: true },
    { time: '08:00', isHalf: false },
    { time: '08:30', isHalf: true },
    { time: '09:00', isHalf: false },
    { time: '09:30', isHalf: true },
    { time: '10:00', isHalf: false },
    { time: '10:30', isHalf: true },
    { time: '11:00', isHalf: false },
    { time: '11:30', isHalf: true },
    { time: '12:00', isHalf: false },
    { time: '12:30', isHalf: true },
    { time: '13:00', isHalf: false },
    { time: '13:30', isHalf: true },
    { time: '14:00', isHalf: false },
    { time: '14:30', isHalf: true },
    { time: '15:00', isHalf: false },
    { time: '15:30', isHalf: true },
    { time: '16:00', isHalf: false },
    { time: '16:30', isHalf: true },
    { time: '17:00', isHalf: false },
    { time: '17:30', isHalf: true },
    { time: '18:00', isHalf: false },
    { time: '18:30', isHalf: true },
    { time: '19:00', isHalf: false },
    { time: '19:30', isHalf: true },
    { time: '20:00', isHalf: false }
  ];

  public handleAction(block: ScheduleBlock, event: MouseEvent): void {
    event.stopPropagation();
    if (block.type === 'task') {
      this.calendar.toggleTaskStatus(block.id, block.status || 'pending').subscribe();
    } else {
      alert(`Abriendo detalle de: ${block.title}`);
    }
  }
}
