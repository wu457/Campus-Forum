import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PostService } from '../post.service';
import { PostActionsComponent } from "../post-actions/post-actions.component";
import { CommentComponent } from "../../comment/comment/comment.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detail',
  standalone: true,
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.css',
  imports: [CommonModule, PostActionsComponent, CommentComponent]
})
export class DetailComponent implements OnInit {
  post: any = {};
  postId: string = '';
  defaultAvatar = 'http://localhost:5000/media/avatar/initial-avatar.jpg';
  
  constructor(private route: ActivatedRoute, private postService: PostService) {}
  
  ngOnInit() {
    this.postId = this.route.snapshot.paramMap.get('id') || '';
    if (this.postId) {
      this.postService.getPostById(this.postId).subscribe(res => this.post = res.data);
    }
  }
  
  onImageError(event: any) {
    // console.error('图片加载失败，使用默认头像');
    event.target.src = this.defaultAvatar;
  }
}
