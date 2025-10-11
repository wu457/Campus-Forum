import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { UserService } from './user.service';



@NgModule({
  declarations: [],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    HttpClientModule
  ],
  providers: [UserService]
})
export class UserModule { }
