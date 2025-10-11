import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent {
  passwordForm: FormGroup;
  successMsg = '';
  errorMsg = '';

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.passwordForm = this.fb.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('newPassword')!.value === form.get('confirmPassword')!.value ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.passwordForm.invalid) return;
    
    // 从localStorage获取token
    const token = localStorage.getItem('token') || '';
    
    const headers = new HttpHeaders({
      Authorization: token
    });
    
    this.http.post('http://localhost:5000/api/profile/change-password', {
      oldPassword: this.passwordForm.value.oldPassword,
      newPassword: this.passwordForm.value.newPassword
    }, { headers }).subscribe({
      next: () => {
        this.successMsg = '密码修改成功！';
        this.errorMsg = '';
        this.passwordForm.reset();
      },
      error: err => {
        this.errorMsg = err.error?.message || '密码修改失败';
        this.successMsg = '';
      }
    });
  }
}
