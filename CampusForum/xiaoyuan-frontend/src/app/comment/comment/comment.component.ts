import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-comment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css']
})
export class CommentComponent implements OnInit {
  @Input() postId!: number;
  
  comments: any[] = [];
  commentForm: FormGroup;
  defaultAvatar = 'http://localhost:5000/media/avatar/initial-avatar.jpg';
  currentUserId: string | null = null;
  userAvatar: string | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.commentForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  ngOnInit() {
    // 从localStorage获取当前用户信息
    const userString = localStorage.getItem('currentUser');
    if (userString) {
      const user = JSON.parse(userString);
      this.currentUserId = user.id.toString();
    }
    this.loadComments();
    this.loadUserAvatar();
  }

  loadUserAvatar() {
    // 从localStorage获取当前用户信息
    const userString = localStorage.getItem('currentUser');
    if (!userString) return;
    
    const user = JSON.parse(userString);
    const userId = user.id.toString();
    
    const headers = new HttpHeaders({
      'Authorization': localStorage.getItem('token') || ''
    });
    
    this.http.get<any>('http://localhost:5000/api/profile', { headers }).subscribe({
      next: (user) => {
        if (user.avatarUrl) {
          // 处理头像URL，确保正确的服务器地址，与个人中心保持一致
          this.userAvatar = user.avatarUrl.startsWith('/') ? 
            `http://localhost:5000${user.avatarUrl}` : user.avatarUrl;
          console.log('用户评论头像路径:', this.userAvatar);
        } else {
          this.userAvatar = this.defaultAvatar;
        }
      },
      error: (err) => {
        console.error('获取用户头像失败:', err);
        this.userAvatar = this.defaultAvatar;
      }
    });
  }
  
  onImageError(event: any) {
    console.error('图片加载失败，使用默认头像');
    event.target.src = this.defaultAvatar;
  }

  loadComments() {
    this.http.get<any>(`http://localhost:5000/api/posts/${this.postId}/comments`)
      .subscribe({
        next: (response) => {
          // 处理评论数据，确保头像URL正确
          this.comments = response.data.map((comment: any) => {
            // 处理评论用户头像URL，确保正确的服务器地址
            if (comment.user && comment.user.avatar) {
              // 如果头像路径以 / 开头，添加服务器地址前缀
              if (comment.user.avatar.startsWith('/')) {
                comment.user.avatar = `http://localhost:5000${comment.user.avatar}`;
              }
              
              // 检查当前用户ID是否与评论用户ID匹配
              if (this.currentUserId === comment.user.id.toString() && this.userAvatar) {
                // 如果是当前用户的评论且有自定义头像，使用当前用户的头像
                comment.user.avatar = this.userAvatar;
              }
            }
            return comment;
          });
        },
        error: (err) => {
          console.error('加载评论失败:', err);
          if (err.status === 0) {
            console.error('无法连接到服务器，请检查服务器是否运行');
          }
        }  
      });
  }

  submitComment() {
    if (this.commentForm.invalid) return;
    
    // 从localStorage获取当前用户信息
    const userString = localStorage.getItem('currentUser');
    if (!userString) {
      console.error('用户未登录');
      return;
    }
    
    const user = JSON.parse(userString);
    const userId = user.id.toString();
    
    const headers = new HttpHeaders({
      'Authorization': localStorage.getItem('token') || '',  // 使用token进行认证
      'Content-Type': 'application/json'
    });
    
    // 构建评论数据，包含用户头像信息
    const commentData = {
      ...this.commentForm.value,
      userAvatar: this.userAvatar // 添加用户头像信息
    };
  
    this.http.post<any>(
      `http://localhost:5000/api/posts/${this.postId}/comments`,
      commentData,
      { headers }
    ).subscribe({
      next: () => {
        this.commentForm.reset();
        this.loadComments();
      },
      error: (err) => {
        console.error('发表评论失败:', err);
        if (err.status === 401) {
          console.error('认证失败，请重新登录');
        }
      }
    });
  }

  canDeleteComment(comment: any): boolean {
    return this.currentUserId === comment.user.id.toString();
  }

  deleteComment(commentId: number) {
    if (!confirm('确定要删除这条评论吗？')) return;
    
    const headers = new HttpHeaders({
      'Authorization': localStorage.getItem('token') || ''
    });

    this.http.delete(`http://localhost:5000/api/comments/${commentId}`, { headers })
      .subscribe({
        next: () => this.loadComments(),
        error: (err) => console.error('删除评论失败:', err)
      });
  }
}