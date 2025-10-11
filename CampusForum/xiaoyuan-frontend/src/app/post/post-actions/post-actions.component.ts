import { Component, Input, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-post-actions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './post-actions.component.html',
  styleUrls: ['./post-actions.component.css']
})
export class PostActionsComponent implements OnInit {
  @Input() postId!: number;
  
  postlikeCount = 0;
  userPostliked = false;
  userFavorited = false;
  favoriteCount = 0;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadPostlikeStatus();
    this.loadFavoriteStatus();
  }

  loadPostlikeStatus() {
    // 从localStorage获取当前用户信息和token
    const token = localStorage.getItem('token') || '';
    
    const headers = new HttpHeaders({
      'Authorization': token
    });

    this.http.get<any>(`http://localhost:5000/api/posts/${this.postId}/postlike-status`, { headers })
      .subscribe({
        next: (response) => {
          this.postlikeCount = response.postlike_count;
          this.userPostliked = response.user_postliked;
        },
        error: (err) => console.error('加载点赞状态失败:', err)
      });
  }

  loadFavoriteStatus() {
    // 从localStorage获取当前用户信息和token
    const token = localStorage.getItem('token') || '';
    
    const headers = new HttpHeaders({
      'Authorization': token
    });

    this.http.get<any>(`http://localhost:5000/api/posts/${this.postId}/favorite-status`, { headers })
      .subscribe({
        next: (response) => {
          this.userFavorited = response.user_favorited;
          this.favoriteCount = response.favorite_count;
        },
        error: (err) => console.error('加载收藏状态失败:', err)
      });
  }

  togglePostlike() {
    // 从localStorage获取当前用户信息和token
    const token = localStorage.getItem('token') || '';
    
    const headers = new HttpHeaders({
      'Authorization': token
    });

    this.http.post<any>(`http://localhost:5000/api/posts/${this.postId}/postlike`, {}, { headers })
      .subscribe({
        next: (response) => {
          this.userPostliked = response.postliked;
          this.postlikeCount += this.userPostliked ? 1 : -1;
        },
        error: (err) => console.error('点赞操作失败:', err)
      });
  }

  toggleFavorite() {
    // 从localStorage获取当前用户信息和token
    const token = localStorage.getItem('token') || '';
    
    const headers = new HttpHeaders({
      'Authorization': token
    });

    this.http.post<any>(`http://localhost:5000/api/posts/${this.postId}/favorite`, {}, { headers })
      .subscribe({
        next: (response) => {
          this.userFavorited = response.favorited;
          this.favoriteCount += this.userFavorited ? 1 : -1;
        },
        error: (err) => console.error('收藏操作失败:', err)
      });
  }
}