import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../core/services/ai.service';

@Component({
  selector: 'app-ai-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (ai.isDrawerOpen()) {
      <!-- Backdrop overlay -->
      <div class="drawer-backdrop" (click)="ai.toggleDrawer(false)"></div>

      <!-- Slide-over Drawer Panel -->
      <div class="ai-drawer-panel neo-surface">
        <!-- Header -->
        <div class="drawer-header">
          <div class="header-left">
            <div class="ai-avatar">✨</div>
            <div class="header-info">
              <h3 class="header-title">Kronos Copilot</h3>
              <div class="model-badge">
                <span class="status-dot"></span>
                <span>OpenRouter GPT-4o-mini</span>
              </div>
            </div>
          </div>
          <button class="close-btn" (click)="ai.toggleDrawer(false)" title="Cerrar chat">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Quick Prompts Chips -->
        <div class="quick-prompts-bar">
          <span class="prompts-label">Preguntas rápidas:</span>
          <div class="chips-scroll">
            @for (prompt of ai.suggestedPrompts; track prompt) {
              <button class="prompt-chip" (click)="sendQuickPrompt(prompt)">
                {{ prompt }}
              </button>
            }
          </div>
        </div>

        <!-- Messages History -->
        <div class="messages-container">
          @for (msg of ai.messages(); track msg.id) {
            <div class="message-row" [class.user-row]="msg.role === 'user'">
              @if (msg.role === 'assistant') {
                <div class="message-avatar">🤖</div>
              }
              <div class="message-bubble" [class.user-bubble]="msg.role === 'user'">
                <div class="message-text" [innerHTML]="formatMessage(msg.content)"></div>
                @if (msg.metadata?.tokens) {
                  <span class="token-badge">{{ msg.metadata?.tokens }} tokens procesados</span>
                }
              </div>
            </div>
          }

          @if (ai.isSending()) {
            <div class="message-row">
              <div class="message-avatar">🤖</div>
              <div class="message-bubble typing-bubble">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
              </div>
            </div>
          }
        </div>

        <!-- Input Bar (Tactile Inset Box) -->
        <div class="drawer-input-area">
          <form class="input-form" (ngSubmit)="sendMessage()">
            <input 
              type="text" 
              placeholder="Pregúntale a Kronos sobre tus clases, entregas o tiempo..."
              [(ngModel)]="inputText"
              name="message"
              [disabled]="ai.isSending()"
              class="chat-input" />
            <button 
              type="submit" 
              class="send-btn" 
              [disabled]="!inputText.trim() || ai.isSending()"
              title="Enviar mensaje">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .drawer-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(18, 19, 22, 0.4);
      backdrop-filter: blur(4px);
      z-index: 50;
      animation: fadeIn 0.2s ease;
    }

    .ai-drawer-panel {
      position: fixed;
      top: 14px;
      right: 14px;
      bottom: 14px;
      width: 440px;
      max-width: calc(100vw - 28px);
      background-color: var(--bg-surface-warm);
      border-radius: 28px;
      box-shadow: -8px 0 30px rgba(0, 0, 0, 0.2), var(--shadow-level-3);
      border: 2px solid var(--border-dark);
      z-index: 60;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideIn {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }

    /* HEADER */
    .drawer-header {
      padding: 18px 20px;
      border-bottom: 1.5px solid var(--border-dark);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--bg-surface);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .ai-avatar {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      background: linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      box-shadow: 0 3px 0 var(--border-dark);
      border: 1.5px solid var(--border-dark);
    }

    .header-title {
      font-family: var(--font-display);
      font-size: 16px;
      font-weight: 700;
      color: var(--ink-primary);
    }

    .model-badge {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      color: var(--ink-secondary);
      font-weight: 600;
    }

    .status-dot {
      width: 7px;
      height: 7px;
      background-color: #10B981;
      border-radius: 50%;
      box-shadow: 0 0 6px #10B981;
    }

    .close-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 1.5px solid var(--border-dark);
      background: var(--bg-surface);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 0 var(--border-dark);
      transition: all 0.1s ease;
    }

    .close-btn:active {
      transform: translateY(1px);
      box-shadow: none;
    }

    /* QUICK PROMPTS */
    .quick-prompts-bar {
      padding: 10px 16px;
      background: var(--bg-inset);
      border-bottom: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .prompts-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--ink-secondary);
    }

    .chips-scroll {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      padding-bottom: 4px;
    }

    .prompt-chip {
      background: var(--bg-surface);
      border: 1px solid var(--border-dark);
      border-radius: var(--radius-pill);
      padding: 4px 10px;
      font-size: 11.5px;
      font-weight: 600;
      color: var(--ink-primary);
      white-space: nowrap;
      cursor: pointer;
      box-shadow: 0 1.5px 0 var(--border-dark);
      transition: all 0.1s ease;
    }

    .prompt-chip:hover {
      background: #FEF08A;
    }

    .prompt-chip:active {
      transform: translateY(1px);
      box-shadow: none;
    }

    /* MESSAGES */
    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .message-row {
      display: flex;
      gap: 10px;
      align-items: flex-start;
      max-width: 90%;
    }

    .message-row.user-row {
      margin-left: auto;
      justify-content: flex-end;
    }

    .message-avatar {
      font-size: 18px;
      margin-top: 2px;
    }

    .message-bubble {
      background: var(--bg-surface);
      border: 1.5px solid var(--border-dark);
      border-radius: 18px;
      padding: 12px 14px;
      font-size: 13.5px;
      line-height: 1.5;
      color: var(--ink-primary);
      box-shadow: 0 3px 0 var(--border-dark);
    }

    .message-bubble.user-bubble {
      background: var(--border-dark);
      color: #FFFFFF;
      box-shadow: 0 3px 0 rgba(0, 0, 0, 0.25);
    }

    .token-badge {
      display: block;
      font-size: 10px;
      color: var(--ink-muted);
      margin-top: 6px;
      font-family: var(--font-mono);
    }

    .typing-bubble {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 12px 16px;
    }

    .dot {
      width: 6px;
      height: 6px;
      background: var(--border-dark);
      border-radius: 50%;
      animation: pulse 1s infinite;
    }

    .dot:nth-child(2) { animation-delay: 0.2s; }
    .dot:nth-child(3) { animation-delay: 0.4s; }

    @keyframes pulse {
      0%, 100% { opacity: 0.2; transform: scale(0.8); }
      50% { opacity: 1; transform: scale(1.2); }
    }

    /* INPUT BAR */
    .drawer-input-area {
      padding: 14px 16px;
      background: var(--bg-surface);
      border-top: 1.5px solid var(--border-dark);
    }

    .input-form {
      display: flex;
      align-items: center;
      background: var(--bg-inset);
      border: 1.5px solid var(--border-dark);
      border-radius: var(--radius-pill);
      padding: 4px 6px 4px 14px;
      box-shadow: var(--shadow-inset);
    }

    .chat-input {
      flex: 1;
      border: none;
      background: transparent;
      outline: none;
      font-size: 13.5px;
      font-family: var(--font-sans);
      color: var(--ink-primary);
    }

    .send-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--border-dark);
      color: #FFFFFF;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 0 rgba(0, 0, 0, 0.3);
      transition: all 0.1s ease;
    }

    .send-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      box-shadow: none;
    }

    .send-btn:not(:disabled):active {
      transform: translateY(1px);
      box-shadow: none;
    }
  `]
})
export class AiDrawerComponent {
  public readonly ai = inject(AiService);

  public inputText = '';

  public sendMessage(): void {
    if (!this.inputText.trim()) return;
    const text = this.inputText;
    this.inputText = '';
    this.ai.sendMessage(text);
  }

  public sendQuickPrompt(prompt: string): void {
    this.ai.sendMessage(prompt);
  }

  public formatMessage(content: string): string {
    // Basic Markdown format: **bold** and newlines
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  }
}
