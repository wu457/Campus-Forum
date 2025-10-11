import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  avatarFile: File | null = null;
  avatarPreview: string | ArrayBuffer | null = null;
  defaultAvatar = 'http://localhost:5000/media/avatar/initial-avatar.jpg'; // 默认头像路径
  successMsg = '';
  errorMsg = '';
  
  // 点赞和收藏帖子相关
  activeTab: string | null = null;
  likedPosts: any[] = [];
  favoritePosts: any[] = [];
  myPosts: any[] = []; // 用户发布的帖子

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.profileForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: [{value: '', disabled: true}]
    });
  }

  ngOnInit() {
    // 先设置默认头像
    this.avatarPreview = this.defaultAvatar;
    console.log('默认头像路径:', this.defaultAvatar);
    
    // 从localStorage获取token
    const token = localStorage.getItem('token') || '';
    
    const headers = new HttpHeaders({
      Authorization: token
    });
    // 获取当前用户信息
    this.http.get<any>('http://localhost:5000/api/profile', { headers }).subscribe({
      next: (user) => {
        console.log('用户信息:', user);
        this.profileForm.patchValue({
          username: user.username,
          email: user.email
        });
        // 处理头像URL，确保正确的服务器地址
        if (user.avatarUrl) {
          this.avatarPreview = user.avatarUrl.startsWith('/') ? 
            `http://localhost:5000${user.avatarUrl}` : user.avatarUrl;
          console.log('用户头像路径:', this.avatarPreview);
        } else {
          this.avatarPreview = this.defaultAvatar;
          console.log('使用默认头像:', this.avatarPreview);
        }
      },
      error: (err) => {
        console.error('获取用户信息失败:', err);
        this.avatarPreview = this.defaultAvatar;
      }
    });
  }

  onImageError(event: any) {
    console.error('图片加载失败，使用默认头像');
    event.target.src = this.defaultAvatar;
    this.avatarPreview = this.defaultAvatar;
  }

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      this.avatarFile = event.target.files[0];
      if (this.avatarFile) {  // 添加这个判断
        const reader = new FileReader();
        reader.onload = e => this.avatarPreview = reader.result;
        reader.readAsDataURL(this.avatarFile);
      }
    }
  }

  onSubmit() {
    // 从localStorage获取token
    const token = localStorage.getItem('token') || '';
    
    const headers = new HttpHeaders({
      Authorization: token
    });
    if (this.profileForm.invalid) return;
    const formData = new FormData();
    formData.append('username', this.profileForm.value.username);
    if (this.avatarFile) {
      formData.append('avatar', this.avatarFile);
    }
    this.http.post('http://localhost:5000/api/profile/update', formData, { headers }).subscribe({
      next: () => {
        this.successMsg = '修改成功！';
        this.errorMsg = '';
      },
      error: err => {
        this.errorMsg = err.error?.message || '修改失败';
        this.successMsg = '';
      }
    });
  }
  
  // 显示用户点赞的帖子
  showLikedPosts() {
    this.activeTab = 'liked';
    this.getLikedPosts();
  }
  
  // 显示用户收藏的帖子
  showFavoritePosts() {
    this.activeTab = 'favorite';
    this.getFavoritePosts();
  }
  
  // 显示用户发布的帖子
  showMyPosts() {
    this.activeTab = 'my';
    this.getMyPosts();
  }
  
  // 获取用户点赞的帖子
  getLikedPosts() {
    // 从localStorage获取token
    const token = localStorage.getItem('token') || '';
    
    const headers = new HttpHeaders({
      Authorization: token
    });
    
    this.http.get<any>('http://localhost:5000/api/user/liked-posts', { headers }).subscribe({
      next: (response) => {
        this.likedPosts = response.data || [];
      },
      error: (err) => {
        console.error('获取点赞帖子失败:', err);
        this.errorMsg = '获取点赞帖子失败';
      }
    });
  }
  
  // 获取用户收藏的帖子
  getFavoritePosts() {
    // 从localStorage获取token
    const token = localStorage.getItem('token') || '';
    
    const headers = new HttpHeaders({
      Authorization: token
    });
    
    this.http.get<any>('http://localhost:5000/api/user/favorites', { headers }).subscribe({
      next: (response) => {
        this.favoritePosts = response.data || [];
      },
      error: (err) => {
        console.error('获取收藏帖子失败:', err);
        this.errorMsg = '获取收藏帖子失败';
      }
    });
  }
  
  // 获取用户发布的帖子
  getMyPosts() {
    // 从localStorage获取token
    const token = localStorage.getItem('token') || '';
    
    const headers = new HttpHeaders({
      Authorization: token
    });
    
    this.http.get<any>('http://localhost:5000/api/user/my-posts', { headers }).subscribe({
      next: (response) => {
        this.myPosts = response.data || [];
      },
      error: (err) => {
        console.error('获取我的帖子失败:', err);
        this.errorMsg = '获取我的帖子失败';
      }
    });
  }
}
