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

  active: Theme;

  setLightTheme(): void {
    this.setActiveTheme(LightTheme);
  }

  setDarkTheme(): void {
    this.setActiveTheme(DarkTheme);
  }

  setRegularSizeTheme(): void {
    this.setActiveTheme(RegularSizeTheme);
  }

  setActiveTheme(theme: Theme): void {
    this.active = theme;
    Object.keys(this.active.properties).forEach((property) => {
      document.documentElement.style.setProperty(
        property,
        this.active.properties[property]
      );
    });
  }
}
