import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PostService } from '../post.service';
import { SectionService } from '../../section/section.service';
import { UserService } from '../../user/user.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SidebarComponent } from "../../shared/sidebar/sidebar.component";

@Component({
  selector: 'app-list',
  imports: [CommonModule, SidebarComponent],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class PostListComponent implements OnInit {
  posts: any[] = [];
  currentSection: any = null;
  
  constructor(
    private postService: PostService, 
    private sectionService: SectionService,
    private userService: UserService,
    private router: Router, 
    private route: ActivatedRoute
  ) {}
  
  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const sectionId = params.get('id');
      if (sectionId) {
        this.loadSectionAndPosts(sectionId);
      }
    });
  }
  
  loadSectionAndPosts(sectionId: string) {
    // 首先获取板块信息
    this.sectionService.getSectionById(sectionId).subscribe({
      next: (res) => {
        this.currentSection = res.data;
        // 根据板块名称决定加载哪些帖子
        if (this.currentSection.name === '最新消息') {
          // 如果是"最新消息"板块，显示所有板块的帖子
          this.loadAllPosts();
        } else {
          // 其他板块只显示该板块的帖子
          this.loadPostsBySection(sectionId);
        }
      },
      error: (err) => {
        console.error('获取板块信息失败:', err);
        // 如果获取板块信息失败，默认显示该板块的帖子
        this.loadPostsBySection(sectionId);
      }
    });
  }
  
  loadAllPosts() {
    this.postService.getAllPosts().subscribe({
      next: (res) => this.posts = res.data,
      error: (err) => console.error('获取所有帖子失败:', err)
    });
  }
  
  loadPostsBySection(sectionId: string) {
    this.postService.getPostsBySection(sectionId).subscribe({
      next: (res) => this.posts = res.data,
      error: (err) => console.error('获取板块帖子失败:', err)
    });
  }
  createPost() {
    const sectionId = this.route.snapshot.paramMap.get('id');
    this.router.navigate(['/post/create'], { queryParams: { sectionId } });
  }
  viewPost(post: any) {
    this.router.navigate(['/post', post.id]);
  }
  updatePost(post: any) {
    if (this.canEditPost(post)) {
      this.router.navigate(['/post/edit', post.id]);
    } else {
      alert('您没有权限编辑此帖子');
    }
  }
  
  deletePost(post: any) {
    if (this.canDeletePost(post)) {
      if (confirm('确定要删除这篇帖子吗？')) {
        this.postService.deletePost(post.id).subscribe(() => {
          this.posts = this.posts.filter(p => p.id !== post.id);
        });
      }
    } else {
      alert('您没有权限删除此帖子');
    }
  }
  
  // 检查是否可以编辑帖子
  canEditPost(post: any): boolean {
    const currentUser = this.userService.getCurrentUser();
    if (!currentUser) {
      return false;
    }
    // 管理员或帖子作者可以编辑
    return currentUser.role === 'admin' || currentUser.id === post.user?.id;
  }
  
  // 检查是否可以删除帖子
  canDeletePost(post: any): boolean {
    const currentUser = this.userService.getCurrentUser();
    if (!currentUser) {
      return false;
    }
    // 管理员或帖子作者可以删除
    return currentUser.role === 'admin' || currentUser.id === post.user?.id;
  }
}