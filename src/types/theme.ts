export interface Theme {
    id: string;
    name: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        success: string;
        warning: string;
        error: string;
        info: string;
        background: string;
        surface: string;
        surfaceHover: string;
        surfaceActive: string;
        border: string;
        borderHover: string;
        text: string;
        textSecondary: string;
        textDisabled: string;
        link: string;
        linkHover: string;
    };
    backgroundImage?: string;
    backgroundOverlay?: number; // 0-100
    blur?: number; // 0-20
    borderRadius?: number; // 0-20
    glassEffect?: boolean;
}

export const defaultTheme: Theme = {
    id: 'default',
    name: 'Default Dark',
    colors: {
        primary: '#3B82F6',
        secondary: '#4B5563',
        accent: '#10B981',
        success: '#059669',
        warning: '#D97706',
        error: '#DC2626',
        info: '#0EA5E9',
        background: '#111827',
        surface: '#1F2937',
        surfaceHover: '#374151',
        surfaceActive: '#4B5563',
        border: '#374151',
        borderHover: '#4B5563',
        text: '#F9FAFB',
        textSecondary: '#9CA3AF',
        textDisabled: '#6B7280',
        link: '#60A5FA',
        linkHover: '#93C5FD',
    },
    backgroundOverlay: 40,
    blur: 0,
    borderRadius: 8,
    glassEffect: true,
}; 