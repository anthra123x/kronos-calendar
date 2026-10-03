export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  timezone?: string;
  locale?: string;
  preferences?: {
    theme?: string;
    compact_view?: boolean;
    ai_suggestions?: boolean;
  };
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  category: 'university' | 'work' | 'personal' | 'health';
  projectId?: string;
  project?: Project;
  dueDate?: string;
  completedAt?: string;
  tags?: string[];
  createdAt?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  color?: string;
  startsAt: string;
  endsAt: string;
  isAllDay: boolean;
  category: 'university' | 'work' | 'personal' | 'health';
  status: 'scheduled' | 'cancelled' | 'completed';
  tags?: string[];
  attachments?: string[];
  participants?: string[];
}

export interface AcademicSubject {
  id: string;
  name: string;
  code: string;
  color?: string;
  credits?: number;
  classroom?: string;
  professorName?: string;
  currentGrade?: number;
  schedules?: AcademicSchedule[];
}

export interface AcademicSchedule {
  id: string;
  subjectId: string;
  subjectName?: string;
  dayOfWeek: number; // 1 (Mon) - 7 (Sun)
  startTime: string; // "08:00:00"
  endTime: string;   // "10:00:00"
  classroom?: string;
  building?: string;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  status: 'active' | 'archived' | 'completed';
  deadline?: string;
  tasksCount?: number;
  notesCount?: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: 'university' | 'work' | 'personal' | 'quick';
  isPinned: boolean;
  color?: string;
  tags?: string[];
  updatedAt?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  metadata?: {
    model?: string;
    tokens?: number;
    actions?: any[];
  };
}

export interface ChatConversation {
  id: string;
  title: string;
  createdAt: string;
  messagesCount?: number;
  messages?: ChatMessage[];
}

export interface DashboardData {
  date: {
    current_iso: string;
    day_name: string;
    formatted: string;
    timezone: string;
  };
  counters: {
    pending_tasks: number;
    completed_tasks_today: number;
    events_today: number;
    classes_today: number;
    unread_notifications: number;
    active_projects: number;
  };
  today_events: any[];
  today_classes: any[];
  urgent_tasks: Task[];
  active_projects: Project[];
}
