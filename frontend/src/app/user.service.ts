import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private userData = new BehaviorSubject<any>(null);
  private apiUrl = environment.apiUrl;
  userData$ = this.userData.asObservable();

  constructor(private http: HttpClient) {}

  fetchUserData() {
    this.http.get(`${this.apiUrl}/adminData`).subscribe((data) => {
      // console.log(data);
      this.userData.next(data);
    });
  }
}
