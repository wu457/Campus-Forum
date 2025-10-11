import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // 从localStorage获取token
    const token = localStorage.getItem('token');
    
    if (token) {
      // 克隆请求并添加Authorization头
      const authReq = request.clone({
        headers: request.headers.set('Authorization', token)
      });
      return next.handle(authReq);
    }
    
    return next.handle(request);
  }
}