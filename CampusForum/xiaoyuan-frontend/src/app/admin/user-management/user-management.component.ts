import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../admin.service';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  avatar: string;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  loading = false;
  error = '';
  editingUser: User | null = null;
  newRole = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    
    this.adminService.getAllUsers()
      .subscribe({
        next: (response) => {
          this.users = response.data;
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.msg || '加载用户列表失败';
          this.loading = false;
        }
      });
  }

  editUser(user: User): void {
    this.editingUser = {...user};
    this.newRole = user.role;
  }

  cancelEdit(): void {
    this.editingUser = null;
  }

  saveUserRole(): void {
    if (!this.editingUser) return;

    this.adminService.updateUserRole(this.editingUser.id, this.newRole)
      .subscribe({
        next: () => {
          // 更新本地用户列表
          const index = this.users.findIndex(u => u.id === this.editingUser!.id);
          if (index !== -1) {
            this.users[index].role = this.newRole;
          }
          this.editingUser = null;
        },
        error: (err) => {
          this.error = err.error?.msg || '更新用户角色失败';
        }
      });
  }

  deleteUser(userId: number): void {
    if (!confirm('确定要删除此用户吗？此操作不可撤销。')) return;

    this.adminService.deleteUser(userId)
      .subscribe({
        next: () => {
          this.users = this.users.filter(user => user.id !== userId);
        },
        error: (err) => {
          this.error = err.error?.msg || '删除用户失败';
        }
      });
  }
}
