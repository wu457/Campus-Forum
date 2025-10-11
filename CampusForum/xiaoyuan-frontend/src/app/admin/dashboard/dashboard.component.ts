import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  // 管理功能列表
  adminFeatures = [
    { name: '数据统计', description: '查看用户、帖子和板块的统计数据和可视化图表', route: '/admin/statistics' },
    { name: '用户管理', description: '管理系统用户，包括编辑角色、删除', route: '/admin/users' },
    { name: '板块管理', description: '管理论坛板块，包括创建、编辑和删除板块', route: '/admin/sections' },
    { name: '帖子管理', description: '管理所有帖子，包括查找、编辑和删除帖子', route: '/admin/posts' },
    { name: '权限管理', description: '设置用户权限', route: '/admin/permissions' }
  ];
}