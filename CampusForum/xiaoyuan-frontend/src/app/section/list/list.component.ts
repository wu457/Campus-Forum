import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SectionService } from '../section.service';
import { CommonModule, DatePipe } from '@angular/common';
import { SidebarComponent } from "../../shared/sidebar/sidebar.component";
import { FormsModule } from '@angular/forms';
import { PostService } from '../../post/post.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-section-list',
  imports: [
    CommonModule,
    FormsModule,
    SidebarComponent,
    DatePipe
],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class SectionListComponent implements OnInit {
  sections: any[] = [];
  selectedSectionId: number | null = null;
  searchKeyword: string = '';
  searchResults: any[] = [];
  hotPosts: any[] = [];
  
  // 处理图片加载错误
  onImageError(event: any) {
    event.target.src = 'assets/default-post-image.png'; // 设置默认图片
  }
  
  constructor(
    private sectionService: SectionService, 
    private postService: PostService,
    private router: Router
  ) {}

  ngOnInit() {
    this.getSections();
    this.getHotPosts();
  }
  getSections() {
    this.sectionService.getHotSections().subscribe(res => this.sections = res.data);
  }
  
  getHotPosts() {
    this.postService.getHotPosts().subscribe({
      next: (res) => {
        this.hotPosts = res.data;
      },
      error: (err) => {
        console.error('获取热门帖子失败:', err);
      }
    });
  }
  goToSection(section: any) {
    this.router.navigate(['/section', section.id]);
  }
  selectSection(section: any) {
    this.selectedSectionId = section.id;
    this.goToSection(section);
  }
  
  searchPosts() {
    if (!this.searchKeyword.trim()) {
      this.searchResults = [];
      return;
    }
    
    this.postService.searchPosts(this.searchKeyword).subscribe({
      next: (res) => {
        this.searchResults = res.data;
      },
      error: (err) => {
        console.error('搜索失败:', err);
      }
    });
  }
  
  viewPost(post: any) {
    this.router.navigate(['/post', post.id]);
  }
}