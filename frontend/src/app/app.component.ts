import { Component } from '@angular/core';
import { UserService } from './user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'Shubham nimje';
  user: any;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.fetchUserData();

    this.userService.userData$.subscribe((data) => {
      this.user = data;
      console.log('My Details:', this.user);
    });
  }
}
