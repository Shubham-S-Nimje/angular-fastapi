declare const google: any;
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import {
  GoogleLoginProvider,
  SocialAuthService,
  SocialUser,
} from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-signup',
  standalone: false,
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent {
  signupForm: FormGroup;
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
    this.signupForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
        confirm_password: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirm_password');

    if (
      password &&
      confirmPassword &&
      password.value !== confirmPassword.value
    ) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else if (confirmPassword?.errors?.['passwordMismatch']) {
      delete confirmPassword.errors['passwordMismatch'];
      if (Object.keys(confirmPassword.errors).length === 0) {
        confirmPassword.setErrors(null);
      }
    }
    return null;
  }

  get f() {
    return this.signupForm.controls;
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
              // navigate to dashboard or update UI
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

    // console.log(this.signupForm.value.email);

    if (this.signupForm.invalid) {
      return;
    }

    const { email, password, confirm_password } = this.signupForm.value;

    if (password !== confirm_password) {
      this.error = 'Passwords do not match';
      return;
    }

    this.http
      .post(`${this.apiUrl}/user/signup`, { email, password })
      .subscribe({
        next: (response) => {
          console.log('Success:', response);
          this.success = true;
          this.signupForm.reset();
          this.submitted = false;
        },
        error: (err) => {
          console.error('Error:', err);
          this.error = 'Something went wrong. Please try again.';
        },
      });
  }
}
