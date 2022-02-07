export interface Theme {
  name: string;
  properties: any;
}

export enum ColorThemes {
  LIGHT = 'LIGHT',
  DARK = 'DARK'
}

export enum SizeThemes {
  REGULAR = 'REGULAR'
}

export const LightTheme: Theme = {
  name: ColorThemes.LIGHT,
  properties: {
    '--primary': '#00BFA5',
    '--primary-highlight': '#1AD9BF',

    '--button-background': '#212121',
    '--button-background-highlight': '#484848',
    '--button-disabled': '#9E9E9E',
    '--button-text': '#FFFFFF',
    '--item-highlight': '#E0FFFB',

    '--input-background': '#EEEEEE',
    '--input-border': '#9E9E9E',
    '--input-text': '#000000',
    '--input-text-ph': '#9E9E9E',
    '--input-text-ph-light': '#D1D1D1',

    '--background-primary': '#E0E0E0',
    '--background-secondary': '#9E9E9E',
    '--background-container': '#FFFFFF',
    '--background-header': '#E0F2F1',
    '--background-page': '#EEEEEE',

    '--text-primary': '#000000',
    '--text-secondary': '#9E9E9E',

    '--icon-primary': '#000000',
    '--icon-secondary': '#9E9E9E',

    '--facebook': '#5890FF',
    '--google': '#FFFFFF',

    '--error': '#b71c1c',
    '--error-light': '#f05545',
    '--error-light-highlight': '#FF6F5F',
    '--info': '#4FC3F7',
    '--warning': '#f9a825',
    '--success': '#1b5e20'
  }
};

export const DarkTheme: Theme = {
  name: ColorThemes.DARK,
  properties: {
    '--primary': '#00BFA5',
    '--primary-highlight': '#1AD9BF',

    '--button-background': '#212121',
    '--button-background-highlight': '#484848',
    '--button-disabled': '#455a64',
    '--button-text': '#FFFFFF',
    '--item-highlight': '#E0FFFB',

    '--input-background': '#546e7a',
    '--input-border': '#FFFFFF',
    '--input-text': '#FFFFFF',
    '--input-text-ph': '#aaa',
    '--input-text-ph-light': '#6d6d6d',

    '--background-primary': 'hsl(0, 0%, 7%)',
    '--background-secondary': '#FFFFFF',
    '--background-container': '#212121',
    '--background-header': '#37474f',
    '--background-page': '#282828',

    '--text-primary': '#FFFFFF',
    '--text-secondary': '#aaa',

    '--icon-primary': '#FFFFFF',
    '--icon-secondary': '#aaa',

    '--facebook': '#5890FF',
    '--google': '#FFFFFF',

    '--error': '#b71c1c',
    '--error-light': '#f05545',
    '--error-light-highlight': '#FF6F5F',
    '--info': '#4FC3F7',
    '--warning': '#f9a825',
    '--success': '#1b5e20'
  }
};

export const RegularSizeTheme: Theme = {
  name: SizeThemes.REGULAR,
  properties: {
    '--text-tiny': '10px',
    '--text-regular': '14px',
    '--text-large': '18px',
    '--text-huge': '22px',

    '--heading-regular': '20px',

    '--icon-tiny': '12px',
    '--icon-regular': '16px',
    '--icon-large': '20px'
  }
};
