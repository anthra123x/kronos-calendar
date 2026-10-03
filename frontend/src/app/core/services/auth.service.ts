import { Injectable, signal, inject } from '@angular/core';
import { ApiService } from './api.service';
import { User } from '../models';
import { tap, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly api = inject(ApiService);
  
  public readonly currentUser = signal<User | null>(null);
  public readonly isAuthenticated = signal<boolean>(false);
  public readonly isLoading = signal<boolean>(false);

  constructor() {
    this.checkInitialAuth();
  }

  public checkInitialAuth(): void {
    const token = localStorage.getItem('kronos_token');
    const cachedUser = localStorage.getItem('kronos_user');

    if (token && cachedUser) {
      try {
        this.currentUser.set(JSON.parse(cachedUser));
        this.isAuthenticated.set(true);
        // Refresh profile in background
        this.fetchProfile().subscribe();
        return;
      } catch (e) {
        // Corrupted cache
      }
    }

    // Auto-login with demo credentials
    this.autoLoginDemo();
  }

  public autoLoginDemo() {
    this.isLoading.set(true);
    return this.api.post<{ success: boolean; data: { user: User; token: string } }>('auth/login', {
      email: 'demo@kronos.app',
      password: 'password'
    }).pipe(
      tap(res => {
        if (res?.data?.token) {
          localStorage.setItem('kronos_token', res.data.token);
          localStorage.setItem('kronos_user', JSON.stringify(res.data.user));
          this.currentUser.set(res.data.user);
          this.isAuthenticated.set(true);
        }
        this.isLoading.set(false);
      }),
      catchError(err => {
        console.warn('Auto-login fallback:', err);
        // Offline demo user fallback
        const fallbackUser: User = {
          id: 'b1394050-87fa-467e-9e84-3e7bb48ba975',
          name: 'Alfonso',
          email: 'demo@kronos.app',
          bio: 'Estudiante de ingeniería, desarrollador y entusiasta de la productividad.',
          timezone: 'America/Bogota',
          locale: 'es'
        };
        this.currentUser.set(fallbackUser);
        this.isAuthenticated.set(true);
        this.isLoading.set(false);
        return of(null);
      })
    ).subscribe();
  }

  public fetchProfile() {
    return this.api.get<{ success: boolean; data: User }>('auth/me').pipe(
      tap(res => {
        if (res?.data) {
          this.currentUser.set(res.data);
          localStorage.setItem('kronos_user', JSON.stringify(res.data));
        }
      }),
      catchError(() => of(null))
    );
  }

  public logout(): void {
    localStorage.removeItem('kronos_token');
    localStorage.removeItem('kronos_user');
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }
}
