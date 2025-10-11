import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../admin.service';

interface Permission {
  id: number;
  name: string;
  description: string;
  resource: string;
  action: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: number[] | Permission[];
}

@Component({
  selector: 'app-permission-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './permission-management.component.html',
  styleUrl: './permission-management.component.css'
})
export class PermissionManagementComponent implements OnInit {
  permissions: Permission[] = [];
  roles: Role[] = [];
  loading = false;
  error = '';
  selectedRole: Role | null = null;
  editingPermissions: number[] = [];
  
  constructor(private adminService: AdminService) {}
  
  ngOnInit(): void {
    this.loadRoles();
    this.loadPermissions();
  }
  
  loadRoles(): void {
    this.loading = true;
    
    this.adminService.getAllRoles()
      .subscribe({
        next: (response) => {
          this.roles = response.data;
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.msg || '加载角色列表失败';
          this.loading = false;
        }
      });
  }
  
  loadPermissions(): void {
    this.adminService.getAllPermissions()
      .subscribe({
        next: (response) => {
          this.permissions = response.data;
        },
        error: (err) => {
          this.error = err.error?.msg || '加载权限列表失败';
        }
      });
  }
  
  selectRole(role: Role): void {
    this.selectedRole = role;
    // 检查role.permissions是否为数组，如果是对象数组，则提取id
    if (Array.isArray(role.permissions) && role.permissions.length > 0 && typeof role.permissions[0] === 'object') {
      // 如果permissions是对象数组，提取id
      this.editingPermissions = (role.permissions as Permission[]).map(p => p.id);
    } else {
      // 如果permissions已经是id数组，直接使用
      this.editingPermissions = [...(role.permissions as number[])];
    }
  }
  
  togglePermission(permissionId: number): void {
    const index = this.editingPermissions.indexOf(permissionId);
    if (index === -1) {
      this.editingPermissions.push(permissionId);
    } else {
      this.editingPermissions.splice(index, 1);
    }
  }
  
  hasPermission(permissionId: number): boolean {
    return this.editingPermissions.includes(permissionId);
  }
  
  saveRolePermissions(): void {
    if (!this.selectedRole) return;
    
    this.adminService.updateRolePermissions(this.selectedRole.id, this.editingPermissions)
      .subscribe({
        next: () => {
          // 更新本地角色权限
          const index = this.roles.findIndex(r => r.id === this.selectedRole!.id);
          if (index !== -1) {
            this.roles[index].permissions = [...this.editingPermissions];
          }
          this.selectedRole = null;
        },
        error: (err) => {
          this.error = err.error?.msg || '更新角色权限失败';
        }
      });
  }
  
  cancelEdit(): void {
    this.selectedRole = null;
    this.editingPermissions = [];
  }
  
  getPermissionName(permissionId: number): string {
    const permission = this.permissions.find(p => p.id === permissionId);
    return permission ? permission.name : '未知权限';
  }
}
