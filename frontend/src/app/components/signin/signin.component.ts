declare const google: any;

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import {
  GoogleLoginProvider,
  SocialAuthService,
  SocialUser,
} from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-signin',
  standalone: false,
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.css',
})
export class SigninComponent {
  signinForm: FormGroup;
  submitted = false;
  success = false;
  error = '';
  private apiUrl = environment.apiUrl;
  private GOOGLE_CLIENT_ID = environment.GOOGLE_CLIENT_ID;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: SocialAuthService
  ) {
    this.signinForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  get f() {
    return this.signinForm.controls;
  }

  ngOnInit() {
    google.accounts.id.initialize({
      client_id: this.GOOGLE_CLIENT_ID,
      callback: this.handleCredentialResponse.bind(this),
    });

    google.accounts.id.renderButton(document.getElementById('googleBtn'), {
      theme: 'outline',
      size: 'large',
    });
  }

  handleCredentialResponse(response: any) {
    const idToken = response.credential;

    this.http.post(`${this.apiUrl}/user/google`, { token: idToken }).subscribe({
      next: (res: any) => {
        console.log('Login Success:', res);
        localStorage.setItem('access_token', res.access_token);
      },
      error: (err) => {
        console.error('Google login failed:', err);
      },
    });
  }

  signInWithGoogle(): void {
    this.authService
      .signIn(GoogleLoginProvider.PROVIDER_ID)
      .then((user: SocialUser) => {
        const googleToken = user.idToken;
        this.http
          .post(`${this.apiUrl}/user/google`, { token: googleToken })
          .subscribe({
            next: (res: any) => {
              console.log('Login Success:', res);
              localStorage.setItem('access_token', res.access_token);
              // navigate to profile
            },
            error: (err) => {
              console.error('Google login failed:', err);
            },
          });
      });
  }

  onSubmit() {
    this.submitted = true;
    this.error = '';
    this.success = false;

    if (this.signinForm.invalid) {
      return;
    }

    const { email, password } = this.signinForm.value;

    this.http
      .post(`${this.apiUrl}/user/signin`, { email, password })
      .subscribe({
        next: (response) => {
          console.log('Success:', response);
          this.success = true;
          this.signinForm.reset();
          this.submitted = false;
        },
        error: (err) => {
          console.error('Error:', err);
          this.error = 'Invalid email or password. Please try again.';
        },
      });
  }
}
