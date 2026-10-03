import { Injectable, signal, inject } from '@angular/core';
import { ApiService } from './api.service';
import { ChatMessage, ChatConversation } from '../models';
import { tap, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private readonly api = inject(ApiService);

  public readonly isDrawerOpen = signal<boolean>(false);
  public readonly isSending = signal<boolean>(false);
  public readonly activeConversationId = signal<string | null>(null);
  public readonly messages = signal<ChatMessage[]>([]);

  public readonly suggestedPrompts = [
    '¿Cuáles son mis tareas urgentes para hoy y mañana?',
    'Organízame un bloque de estudio para el parcial de IA',
    '¿Qué clases tengo programadas esta semana?',
    'Crea un resumen de mis entregas pendientes'
  ];

  constructor() {
    this.initConversation();
  }

  public toggleDrawer(forceState?: boolean): void {
    if (forceState !== undefined) {
      this.isDrawerOpen.set(forceState);
    } else {
      this.isDrawerOpen.update(v => !v);
    }
  }

  public initConversation(): void {
    this.api.get<{ success: boolean; data: ChatConversation[] }>('chat/conversations').pipe(
      tap(res => {
        if (res?.data && res.data.length > 0) {
          const conv = res.data[0];
          this.activeConversationId.set(conv.id);
          this.loadConversation(conv.id);
        } else {
          this.createDefaultConversation();
        }
      }),
      catchError(() => {
        this.createDefaultConversation();
        return of(null);
      })
    ).subscribe();
  }

  public createDefaultConversation(): void {
    this.api.post<{ success: boolean; data: ChatConversation }>('chat/conversations', {
      title: 'Organización Semanal con Kronos AI'
    }).pipe(
      tap(res => {
        if (res?.data?.id) {
          this.activeConversationId.set(res.data.id);
          this.addWelcomeMessage();
        }
      }),
      catchError(() => {
        this.addWelcomeMessage();
        return of(null);
      })
    ).subscribe();
  }

  public loadConversation(conversationId: string): void {
    this.api.get<{ success: boolean; data: { id: string; messages: any[] } }>(`chat/conversations/${conversationId}`).pipe(
      tap(res => {
        if (res?.data?.messages) {
          this.messages.set(res.data.messages.map((m: any) => ({
            id: m.id,
            conversationId,
            role: m.role,
            content: m.content,
            createdAt: m.created_at || m.createdAt,
            metadata: m.metadata
          })));
        } else {
          this.addWelcomeMessage();
        }
      }),
      catchError(() => {
        this.addWelcomeMessage();
        return of(null);
      })
    ).subscribe();
  }

  private addWelcomeMessage(): void {
    this.messages.set([
      {
        id: 'welcome-msg',
        conversationId: this.activeConversationId() || 'default',
        role: 'assistant',
        content: '¡Hola Alfonso! 👋 Soy tu copiloto inteligente de **Kronos**. Estoy sincronizado con tus materias de la U, entregas pendientes y calendario personal. ¿En qué te ayudo a organizar hoy?',
        createdAt: new Date().toISOString()
      }
    ]);
  }

  public sendMessage(text: string) {
    if (!text.trim() || this.isSending()) return;

    const userMsg: ChatMessage = {
      id: 'temp-' + Date.now(),
      conversationId: this.activeConversationId() || 'default',
      role: 'user',
      content: text,
      createdAt: new Date().toISOString()
    };

    this.messages.update(prev => [...prev, userMsg]);
    this.isSending.set(true);

    const convId = this.activeConversationId();
    if (!convId) {
      this.simulateLocalResponse(text);
      return;
    }

    this.api.post<{ success: boolean; data: { assistant_message: any } }>(`chat/conversations/${convId}/messages`, {
      message: text
    }).pipe(
      tap(res => {
        if (res?.data?.assistant_message) {
          const m = res.data.assistant_message;
          const assistantMsg: ChatMessage = {
            id: m.id,
            conversationId: convId,
            role: 'assistant',
            content: m.content,
            createdAt: m.createdAt || new Date().toISOString(),
            metadata: m.metadata
          };
          this.messages.update(prev => [...prev, assistantMsg]);
        }
        this.isSending.set(false);
      }),
      catchError(err => {
        console.warn('AI Message API fallback:', err);
        this.simulateLocalResponse(text);
        return of(null);
      })
    ).subscribe();
  }

  private simulateLocalResponse(query: string) {
    setTimeout(() => {
      const response: ChatMessage = {
        id: 'resp-' + Date.now(),
        conversationId: this.activeConversationId() || 'default',
        role: 'assistant',
        content: `Revisé tu horario de esta semana. Tienes pendiente la entrega del **Informe de Arquitectura Modular** y tus clases de **Inteligencia Artificial**. ¿Deseas que reserve un bloque de estudio de 2 horas hoy a las 16:00?`,
        createdAt: new Date().toISOString()
      };
      this.messages.update(prev => [...prev, response]);
      this.isSending.set(false);
    }, 900);
  }
}
