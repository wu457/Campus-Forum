import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // 从localStorage加载用户信息
    const userString = localStorage.getItem('currentUser');
    if (userString) {
      try {
        const user = JSON.parse(userString);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('解析用户信息失败', error);
        localStorage.removeItem('currentUser');
      }
    }
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap((res: any) => {
          if (res && res.user) {
            // 保存用户信息到localStorage
            localStorage.setItem('currentUser', JSON.stringify(res.user));
            localStorage.setItem('token', res.user.id.toString()); // 使用用户ID作为token
            
            // 更新当前用户Subject
            this.currentUserSubject.next(res.user);
          }
        })
      );
  }

  logout(): void {
    // 清除localStorage中的用户信息
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    
    // 重置当前用户Subject
    this.currentUserSubject.next(null);
    
    // 导航到登录页
    this.router.navigate(['/']);
  }

  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { username, email, password });
  }

  updateProfile(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/profile/update`, formData)
      .pipe(
        tap((res: any) => {
          // 更新本地存储的用户信息
          const userString = localStorage.getItem('currentUser');
          if (userString) {
            try {
              const user = JSON.parse(userString);
              if (formData.get('username')) {
                user.username = formData.get('username');
              }
              if (formData.get('avatar')) {
                // 这里需要后端返回新的头像URL
                // user.avatar = res.avatarUrl;
              }
              localStorage.setItem('currentUser', JSON.stringify(user));
              this.currentUserSubject.next(user);
            } catch (error) {
              console.error('更新用户信息失败', error);
            }
          }
        })
      );
  }

  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/profile/change-password`, { oldPassword, newPassword });
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`);
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user !== null && user.role === 'admin';
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}