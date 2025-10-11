import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PostService {
  constructor(private http: HttpClient) {}
//获取帖子列表
  getAllPosts(): Observable<any> {
    return this.http.get('http://localhost:5000/api/posts');
  }

  getPostsBySection(sectionId: string): Observable<any> {
    return this.http.get(`http://localhost:5000/api/sections/${sectionId}/posts`);
  }
//根据ID获取单个帖子
  getPostById(id: string): Observable<any> {
    return this.http.get(`http://localhost:5000/api/posts/${id}`);
  }
//创建帖子（不带图片，向后兼容）
  createPost(data: any): Observable<any> {
    return this.http.post('http://localhost:5000/api/posts', data);
  }
  
  //创建带图片的帖子
  createPostWithImages(formData: FormData): Observable<any> {
    return this.http.post('http://localhost:5000/api/posts', formData);
  }
//更新帖子（不带图片，向后兼容）
  updatePost(id: string, data: any): Observable<any> {
    return this.http.put(`http://localhost:5000/api/posts/${id}`, data);
  }
  
  //更新带图片的帖子
  updatePostWithImages(id: string, formData: FormData): Observable<any> {
    return this.http.put(`http://localhost:5000/api/posts/${id}`, formData);
  }
//删除帖子
  deletePost(id: string): Observable<any> {
    return this.http.delete(`http://localhost:5000/api/posts/${id}`);
  }
  
  //搜索帖子
  searchPosts(keyword: string): Observable<any> {
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get('http://localhost:5000/api/posts/search', { params });
  }
  
  //获取热门帖子（根据点赞数排序，前5个）
  getHotPosts(): Observable<any> {
    return this.http.get('http://localhost:5000/api/posts/hot');
  }
}