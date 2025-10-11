import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private router: Router, private userService: UserService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // 使用UserService检查用户是否登录和是否为管理员
    const currentUser = this.userService.getCurrentUser();
    
    if (!currentUser) {
      this.router.navigate(['/']);
      return false;
    }
    
    // 检查用户角色
    if (this.userService.isAdmin()) {
      return true;
    } else {
      // 如果用户不是管理员，重定向到首页
      this.router.navigate(['/home']);
      return false;
    }
  }
}