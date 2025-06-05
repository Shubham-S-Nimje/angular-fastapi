import { Component } from '@angular/core';

@Component({
  selector: 'app-hero',
  standalone: false,
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css',
})
export class HeroComponent {
  words: string[] = [
    'Full Stack Developer',
    'Frontend Developer',
    'Backend Developer',
    'MERN Stack Developer',
    'MEAN Stack Developer',
    'Python Developer',
    'Backend Developer',
  ];
  i = 0;
  j = 0;
  isDeleting = false;

  ngAfterViewInit(): void {
    this.type();
  }

  type() {
    const currentWord = this.words[this.i];
    const el = document.getElementById('typewriter');

    if (!el) return;

    if (this.isDeleting) {
      el.textContent = currentWord.substring(0, this.j - 1);
      this.j--;
      if (this.j === 1) {
        this.isDeleting = false;
        this.i = (this.i + 1) % this.words.length;
      }
      setTimeout(() => this.type(), 100);
    } else {
      el.textContent = currentWord.substring(0, this.j + 1);
      this.j++;
      if (this.j === currentWord.length) {
        // ✅ Wait for 1 second before starting delete
        setTimeout(() => {
          this.isDeleting = true;
          this.type();
        }, 1000);
      } else {
        setTimeout(() => this.type(), 100);
      }
    }
  }
}
