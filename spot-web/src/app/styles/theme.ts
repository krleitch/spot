export interface Theme {
    name: string;
    properties: any;
}

export enum ColorThemes {
    LIGHT = 'LIGHT',
    DARK = 'DARK',
}

export enum SizeThemes {
    REGULAR = "REGULAR",
}

export const LightTheme: Theme = {
    name: ColorThemes.LIGHT,
    properties: {
        "--primary": "#00BFA5",
        "--primary-highlight": "#1AD9BF",

        "--button-background": "#212121",
        "--button-background-highlight": "#484848",
        "--button-text": "#FFFFFF",
        "--item-highlight": "#E0FFFB",

        "--background-primary": "#E0E0E0",
        "--background-secondary": "#9E9E9E",
        "--background-container": "#FFFFFF",
        "--background-page": "#EEEEEE",

        "--text-primary": "#000000",
        "--text-secondary": "#9E9E9E",

        "--facebook": "#5890FF",
        "--google": "#FFFFFF",

        "--error": "#b71c1c",
        "--error-light": "#f05545",
        "--info": "#4FC3F7",
        "--warning": "#f9a825",
        "--success": "#1b5e20",
    }
};

export const DarkTheme: Theme = {
    name: ColorThemes.DARK,
    properties: {
        "--primary": "#00BFA5",
        "--primary-highlight": "#1AD9BF",

        "--button-background": "#212121",
        "--button-background-highlight": "#484848",
        "--button-text": "#FFFFFF",
        "--item-highlight": "#E0FFFB",

        "--background-primary": "#E0E0E0",
        "--background-secondary": "#9E9E9E",
        "--background-container": "#FFFFFF",
        "--background-page": "#EEEEEE",

        "--text-primary": "#000000",
        "--text-secondary": "#9E9E9E",

        "--facebook": "#5890FF",
        "--google": "#FFFFFF",

        "--error": "#b71c1c",
        "--error-light": "#f05545",
        "--info": "#4FC3F7",
        "--warning": "#f9a825",
        "--success": "#1b5e20",
    }
};

export const RegularSizeTheme: Theme = {
    name: SizeThemes.REGULAR,
    properties: {
        "--tiny-text": "8px",
        "--regular-text": "12px",
        "--large-text": "16px",
        "--huge-text": "20px",

        "--heading": "20px",
    }
}