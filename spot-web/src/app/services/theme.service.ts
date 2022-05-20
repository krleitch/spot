import { Injectable } from '@angular/core';
import {
  DarkTheme,
  LightTheme,
  RegularSizeTheme,
  Theme
} from '@src/app/styles/theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  constructor() {}

  activeColorTheme: Theme;
  activeSizeTheme: Theme;

  setLightTheme(): void {
    this.activeColorTheme = LightTheme;
    localStorage.setItem('themeWeb', LightTheme.name);
    this.setActiveTheme(LightTheme);
  }

  setDarkTheme(): void {
    this.activeColorTheme = DarkTheme;
    localStorage.setItem('themeWeb', DarkTheme.name);
    this.setActiveTheme(DarkTheme);
  }

  setRegularSizeTheme(): void {
    this.activeSizeTheme = RegularSizeTheme;
    this.setActiveTheme(RegularSizeTheme);
  }

  setActiveTheme(theme: Theme): void {
    Object.keys(theme.properties).forEach((property) => {
      document.documentElement.style.setProperty(
        property,
        theme.properties[property]
      );
    });
  }
}
