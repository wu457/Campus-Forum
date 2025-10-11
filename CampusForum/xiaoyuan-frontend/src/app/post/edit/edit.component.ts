import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PostService } from '../post.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.css'
})
export class EditComponent implements OnInit {
  postForm: FormGroup;
  postId: string = '';
  constructor(private fb: FormBuilder, private route: ActivatedRoute, private postService: PostService, private router: Router) {
    this.postForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required]
    });
  }
  ngOnInit() {
    this.postId = this.route.snapshot.paramMap.get('id') || '';
    if (this.postId) {
      this.postService.getPostById(this.postId).subscribe(res => {
        this.postForm.patchValue({ title: res.data.title, content: res.data.content });
      });
    }
  }
  onSubmit() {
    if (this.postForm.invalid) return;
    this.postService.updatePost(this.postId, this.postForm.value).subscribe(() => {
      this.router.navigate(['/home']);
    });
  }
}
