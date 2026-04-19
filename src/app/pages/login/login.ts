import { Component, inject, OnDestroy, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormField, MatInputModule } from '@angular/material/input';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LoginService, LoginCredentialsDTO } from '../../services/login/login-service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [MatButtonModule, MatFormField, MatInputModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnDestroy {
  private loginService = inject(LoginService);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);

  private loginSubscription: Subscription | null = null;

  loginFormGroup = this.formBuilder.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  invalidCredentials = signal(false);

  login() {
    this.loginSubscription = this.loginService.login(
      this.loginFormGroup.value as LoginCredentialsDTO
    ).subscribe({
      next: () => this.navigateHome(),
        error: () => this.invalidCredentials.set(true)
    });
  }

  navigateHome(){
    this.router.navigate(['home']);
  }

  ngOnDestroy(): void {
    this.loginSubscription?.unsubscribe();
  }
}


