import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// 统计数据接口定义
export interface AdminStatistics {
  user_statistics: {
    total_users: number;
    new_users_today: number;
    online_users: number;
  };
  post_statistics: {
    total_posts: number;
    new_posts_today: number;
  };
  comment_statistics: {
    total_comments: number;
    new_comments_today: number;
  };
  section_statistics: {
    id: number;
    name: string;
    post_count: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // 用户管理相关API
  getAllUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/users`);
  }

  updateUserRole(userId: number, role: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/users/${userId}/role`, { role });
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/users/${userId}`);
  }

  // 帖子管理相关API
  getAllPosts(params?: { section_id?: number, search?: string }): Observable<any> {
    let url = `${this.apiUrl}/admin/posts`;
    const queryParams: string[] = [];
    
    if (params) {
      if (params.section_id) {
        queryParams.push(`section_id=${params.section_id}`);
      }
      if (params.search) {
        queryParams.push(`search=${encodeURIComponent(params.search)}`);
      }
    }
    
    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }
    
    return this.http.get(url);
  }

  deletePost(postId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/posts/${postId}`);
  }

  // 板块管理相关API
  getAllSections(): Observable<any> {
    return this.http.get(`${this.apiUrl}/sections`);
  }

  createSection(section: { name: string, description: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/sections`, section);
  }

  updateSection(sectionId: number, section: { name: string, description: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/sections/${sectionId}`, section);
  }

  deleteSection(sectionId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/sections/${sectionId}`);
  }

  // 权限管理相关API
  getAllRoles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/roles`);
  }

  getAllPermissions(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/permissions`);
  }

  updateRolePermissions(roleId: number, permissionIds: number[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/roles/${roleId}/permissions`, { permission_ids: permissionIds });
  }
  
  // 获取管理员统计数据
  getAdminStatistics(): Observable<{msg: string, data: AdminStatistics}> {
    return this.http.get<{msg: string, data: AdminStatistics}>(`${this.apiUrl}/admin/statistics`);
  }
}