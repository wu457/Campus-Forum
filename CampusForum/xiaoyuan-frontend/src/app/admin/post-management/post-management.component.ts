import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../admin.service';

interface Post {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  images: string[];
  like_count: number;
  comment_count: number;
  user: {
    id: number;
    username: string;
  };
  section: {
    id: number;
    name: string;
  };
}

interface Section {
  id: number;
  name: string;
}

@Component({
  selector: 'app-post-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './post-management.component.html',
  styleUrl: './post-management.component.css'
})
export class PostManagementComponent implements OnInit {
  posts: Post[] = [];
  sections: Section[] = [];
  loading = false;
  error = '';
  searchTerm = '';
  selectedSection: number | null = null;
  
  constructor(private adminService: AdminService) {}
  
  ngOnInit(): void {
    this.loadSections();
    this.loadPosts();
  }
  
  loadSections(): void {
    this.adminService.getAllSections()
      .subscribe({
        next: (response) => {
          this.sections = response.data;
        },
        error: (err) => {
          this.error = err.error?.msg || '加载板块列表失败';
        }
      });
  }
  
  loadPosts(): void {
    this.loading = true;
    
    this.adminService.getAllPosts()
      .subscribe({
        next: (response) => {
          this.posts = response.data;
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.msg || '加载帖子列表失败';
          this.loading = false;
        }
      });
  }
  
  deletePost(postId: number): void {
    if (!confirm('确定要删除此帖子吗？此操作不可撤销。')) return;
    
    this.adminService.deletePost(postId)
      .subscribe({
        next: () => {
          this.posts = this.posts.filter(post => post.id !== postId);
        },
        error: (err) => {
          this.error = err.error?.msg || '删除帖子失败';
        }
      });
  }
  
  search(): void {
    if (!this.searchTerm.trim() && !this.selectedSection) {
      this.loadPosts();
      return;
    }
    
    this.loading = true;
    
    const params: any = {};
    
    if (this.searchTerm.trim()) {
      params.search = this.searchTerm.trim();
    }
    
    if (this.selectedSection) {
      params.section_id = this.selectedSection;
    }
    
    this.adminService.getAllPosts(params)
      .subscribe({
        next: (response) => {
          this.posts = response.data;
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.msg || '搜索帖子失败';
          this.loading = false;
        }
      });
  }
  
  resetSearch(): void {
    this.searchTerm = '';
    this.selectedSection = null;
    this.loadPosts();
  }
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN');
  }
}
