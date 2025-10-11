import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../user.service';

@Component({
  selector: 'app-login',
  standalone:true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent {
  loginForm: FormGroup;
  submitted = false;
  errorMsg = '';

  constructor(
    private fb: FormBuilder, 
    private userService: UserService, 
    public router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    this.submitted = true;
    if (this.loginForm.invalid) return;
    
    const { username, password } = this.loginForm.value;
    
    this.userService.login(username, password).subscribe({
      next: (res: any) => {
        console.log('登录成功', res);
        
        // 如果是管理员，导航到管理员页面，否则导航到首页
        if (res.user.role === 'admin') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: err => {
        console.error('登录失败', err);
        this.errorMsg = err.error?.msg || '登录失败，请检查用户名和密码';
      }
    });
  }
}
