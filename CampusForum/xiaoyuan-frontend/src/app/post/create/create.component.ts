import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PostService } from '../post.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './create.component.html',
  styleUrl: './create.component.css'
})
export class CreateComponent {
  postForm: FormGroup;
  selectedImages: File[] = [];
  imagePreviewUrls: string[] = [];
  
  constructor(private fb: FormBuilder, private postService: PostService, private router: Router, private route: ActivatedRoute) {
    const sectionId = this.route.snapshot.queryParamMap.get('sectionId') || '';
    this.postForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      section_id: [sectionId, Validators.required]
    });
  }
  
  onImagesSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      // 清除之前的预览
      this.imagePreviewUrls = [];
      this.selectedImages = [];
      
      // 获取选择的文件
      const files = event.target.files;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // 只接受图片文件
        if (file.type.match('image.*')) {
          this.selectedImages.push(file);
          
          // 创建预览
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.imagePreviewUrls.push(e.target.result);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  }
  
  removeImage(index: number) {
    this.selectedImages.splice(index, 1);
    this.imagePreviewUrls.splice(index, 1);
  }
  
  onSubmit() {
    if (this.postForm.invalid) return;
    
    // 从localStorage获取当前用户信息
    const userString = localStorage.getItem('currentUser');
    if (!userString) {
      alert('请先登录');
      return;
    }
    
    // 解析用户信息获取用户ID
    const user = JSON.parse(userString);
    const userId = user.id;
    
    // 使用FormData来处理文件上传
    const formData = new FormData();
    formData.append('title', this.postForm.value.title);
    formData.append('content', this.postForm.value.content);
    formData.append('section_id', this.postForm.value.section_id);
    formData.append('user_id', userId.toString());
    
    // 添加图片文件
    this.selectedImages.forEach(image => {
      formData.append('images', image);
    });
    
    this.postService.createPostWithImages(formData).subscribe({
      next: () => {
        this.router.navigate(['/home']);
        alert('帖子创建成功');
      },
      error: (err) => {
        console.error('发布帖子失败:', err);
        alert('发布失败: ' + (err.error?.msg || '未知错误'));
      }
    });
  }
}
