import { Component, inject, signal, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-settings',
  imports: [],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings implements OnInit {
  private translate = inject(TranslateService);
  public currentLanguage = signal<string>('en');

  ngOnInit(): void {
    const savedLang = localStorage.getItem('language');
    if (savedLang) {
      this.currentLanguage.set(savedLang);
      this.translate.use(savedLang);
    }
  }

  public changeLanguage(lang: string): void {
    this.currentLanguage.set(lang);
    this.translate.use(lang);
    localStorage.setItem('language', lang);
  }
}
