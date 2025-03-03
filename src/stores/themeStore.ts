import { atom, map } from 'nanostores';
import type { Theme } from '../types/theme';
import { defaultTheme } from '../types/theme';
import localforage from 'localforage';

const storage = localforage.createInstance({
    name: "startpage-db",
    storeName: "theme",
    driver: localforage.INDEXEDDB,
});

export const theme = map<Theme>(defaultTheme);

// Load theme from storage
storage.getItem<Theme>('theme').then((savedTheme) => {
    if (savedTheme) {
        theme.set(savedTheme);
    }
    // Ensure initial theme is applied
    updateCSSVariables(theme.get());
});

// Save theme to storage whenever it changes
theme.subscribe((themeValue: Theme) => {
    storage.setItem('theme', themeValue).catch(error => {
        console.error('Error saving theme:', error);
    });
    // Ensure CSS variables are updated whenever theme changes
    updateCSSVariables(themeValue);
});

// Update CSS variables
function updateCSSVariables(themeValue: Theme) {
    if (typeof document === 'undefined') return;
    
    const root = document.documentElement;
    const { colors, backgroundImage, backgroundOverlay, blur, borderRadius } = themeValue;

    // Apply colors
    Object.entries(colors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value);
    });

    // Apply background image and opacity
    if (backgroundImage && backgroundImage.trim() !== '') {
        root.style.setProperty('--background-image', backgroundImage.startsWith('data:') ? backgroundImage : `url('${backgroundImage}')`);
        root.style.setProperty('--background-opacity', `${1 - (backgroundOverlay ?? 40) / 100}`);
    } else {
        root.style.setProperty('--background-image', 'none');
        root.style.setProperty('--background-opacity', '0');
    }

    // Apply other theme properties with fallbacks
    root.style.setProperty('--background-overlay', `${backgroundOverlay ?? 40}%`);
    root.style.setProperty('--blur', `${blur ?? 0}`);
    root.style.setProperty('--border-radius', `${borderRadius ?? 8}px`);
} 