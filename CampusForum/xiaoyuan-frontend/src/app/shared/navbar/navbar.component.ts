import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UserService } from '../../user/user.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  username: string = '';
  constructor(public router: Router, private userService: UserService) {}
  
  ngOnInit() {
    // 从UserService获取当前用户信息
    this.userService.currentUser$.subscribe(user => {
      this.username = user?.username || '';
    });
  }
  isLoggedIn() {
    return !!this.userService.getCurrentUser();
  }
  
  isAdmin() {
    return this.userService.isAdmin();
  }
  logout() {
    this.userService.logout();
  }
}
