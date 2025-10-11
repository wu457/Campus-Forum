import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SectionService {
  constructor(private http: HttpClient) {}
  //获取所有板块
  getSections(): Observable<any> {
    return this.http.get('http://localhost:5000/api/sections');
  }
  //获取热门板块（帖子数量最多的前3个）
  getHotSections(): Observable<any> {
    return this.http.get('http://localhost:5000/api/sections/hot');
  }
  //根据id获取单个板块
  getSectionById(id: string): Observable<any> {
    return this.http.get(`http://localhost:5000/api/sections/${id}`);

  }
  //创建板块
  createSection(data: any): Observable<any> {
    return this.http.post('http://localhost:5000/api/sections', data);

  }
  //更新板块
  updateSection(id: string, data: any): Observable<any> {
    return this.http.put(`http://localhost:5000/api/sections/${id}`, data);
  }
  //删除板块
  deleteSection(id: string): Observable<any> {
    return this.http.delete(`http://localhost:5000/api/sections/${id}`);
  }
}