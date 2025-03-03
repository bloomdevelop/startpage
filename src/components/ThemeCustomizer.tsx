import { useState, useCallback, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useStore } from '@nanostores/react';
import { theme } from '../stores/themeStore';
import type { Theme } from '../types/theme';
import { defaultTheme } from '../types/theme';

interface ColorGroup {
    title: string;
    description: string;
    colors: Array<{
        key: keyof Theme['colors'];
        label: string;
        description?: string;
    }>;
}

const COLOR_GROUPS: ColorGroup[] = [
    {
        title: 'Brand Colors',
        description: 'Primary colors that define your application theme',
        colors: [
            { key: 'primary', label: 'Primary', description: 'Main action color' },
            { key: 'secondary', label: 'Secondary', description: 'Supporting color' },
            { key: 'accent', label: 'Accent', description: 'Highlight color' }
        ]
    },
    {
        title: 'Status Colors',
        description: 'Colors that indicate different states and feedback',
        colors: [
            { key: 'success', label: 'Success', description: 'Positive actions and states' },
            { key: 'warning', label: 'Warning', description: 'Cautionary actions and states' },
            { key: 'error', label: 'Error', description: 'Error states and destructive actions' },
            { key: 'info', label: 'Info', description: 'Informational states and actions' }
        ]
    },
    {
        title: 'Surface Colors',
        description: 'Colors for different surface levels and states',
        colors: [
            { key: 'background', label: 'Background', description: 'Main background color' },
            { key: 'surface', label: 'Surface', description: 'Component background color' },
            { key: 'surfaceHover', label: 'Surface Hover', description: 'Hover state for surfaces' },
            { key: 'surfaceActive', label: 'Surface Active', description: 'Active state for surfaces' }
        ]
    },
    {
        title: 'Text Colors',
        description: 'Colors for different types of text',
        colors: [
            { key: 'text', label: 'Text', description: 'Primary text color' },
            { key: 'textSecondary', label: 'Secondary Text', description: 'Less prominent text' },
            { key: 'textDisabled', label: 'Disabled Text', description: 'Disabled state text' }
        ]
    },
    {
        title: 'Border Colors',
        description: 'Colors for borders and dividers',
        colors: [
            { key: 'border', label: 'Border', description: 'Default border color' },
            { key: 'borderHover', label: 'Border Hover', description: 'Border color on hover' }
        ]
    },
    {
        title: 'Link Colors',
        description: 'Colors for links and navigation',
        colors: [
            { key: 'link', label: 'Link', description: 'Default link color' },
            { key: 'linkHover', label: 'Link Hover', description: 'Link color on hover' }
        ]
    }
];

export default function ThemeCustomizer() {
    const themeValue = useStore(theme);
    const [isOpen, setIsOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [isLoadingImage, setIsLoadingImage] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeColorGroup, setActiveColorGroup] = useState<string>('Brand Colors');

    const handleColorChange = useCallback((key: keyof Theme['colors'], value: string) => {
        theme.set({
            ...themeValue,
            colors: {
                ...themeValue.colors,
                [key]: value
            }
        });
    }, [themeValue]);

    const validateAndLoadImage = useCallback((url: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(url);
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = url;
        });
    }, []);

    const applyBackgroundImage = useCallback(async (imageSource: string) => {
        try {
            setIsLoadingImage(true);
            setError(null);
            await validateAndLoadImage(imageSource);
            theme.set({
                ...themeValue,
                backgroundImage: imageSource
            });
            setImageUrl('');
        } catch (err) {
            setError('Failed to load image. Please try a different URL.');
        } finally {
            setIsLoadingImage(false);
        }
    }, [themeValue, validateAndLoadImage]);

    const handleUrlSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageUrl.trim()) return;
        
        // Basic URL validation
        try {
            new URL(imageUrl);
            await applyBackgroundImage(imageUrl);
        } catch {
            setError('Please enter a valid image URL');
        }
    }, [imageUrl, applyBackgroundImage]);

    const clearBackgroundImage = useCallback(() => {
        theme.set({
            ...themeValue,
            backgroundImage: ''
        });
        setError(null);
        setImageUrl('');
    }, [themeValue]);

    const handleOverlayChange = useCallback((value: number) => {
        theme.set({
            ...themeValue,
            backgroundOverlay: value
        });
    }, [themeValue]);

    const handleBlurChange = useCallback((value: number) => {
        theme.set({
            ...themeValue,
            blur: value
        });
    }, [themeValue]);

    const handleBorderRadiusChange = useCallback((value: number) => {
        theme.set({
            ...themeValue,
            borderRadius: value
        });
    }, [themeValue]);

    const resetTheme = useCallback(() => {
        theme.set(defaultTheme);
        setError(null);
        setImageUrl('');
    }, []);

    const getColorValue = useCallback((key: keyof Theme['colors']) => {
        return themeValue.colors?.[key] || defaultTheme.colors[key];
    }, [themeValue.colors]);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 p-3 rounded-full btn-surface shadow-lg gpu-accelerated z-50"
            >
                <Icon icon="fluent:paint-brush-24-regular" className="w-6 h-6" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 p-6 rounded-lg glass shadow-xl w-96 theme-transition max-h-[80vh] overflow-y-auto z-50">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-themed-darker bg-opacity-50 backdrop-blur-sm p-2 -m-2 rounded z-[51]">
                <h3 className="text-lg font-semibold">Customize Theme</h3>
                <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 btn-surface rounded hover:bg-themed-hover"
                >
                    <Icon icon="fluent:dismiss-24-regular" />
                </button>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-lg font-medium mb-2">Colors</label>
                    <div className="space-y-4">
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {COLOR_GROUPS.map((group) => (
                                <button
                                    key={group.title}
                                    onClick={() => setActiveColorGroup(group.title)}
                                    className={`px-3 py-1 rounded whitespace-nowrap ${
                                        activeColorGroup === group.title
                                            ? 'btn-primary'
                                            : themeValue.glassEffect
                                            ? 'glass-effect'
                                            : 'btn-surface'
                                    }`}
                                >
                                    {group.title}
                                </button>
                            ))}
                        </div>
                        
                        {COLOR_GROUPS.map((group) => (
                            <div
                                key={group.title}
                                className={`space-y-3 ${
                                    activeColorGroup === group.title ? 'block' : 'hidden'
                                }`}
                            >
                                <p className="text-sm text-themed-secondary">{group.description}</p>
                                <div className="grid gap-3">
                                    {group.colors.map(({ key, label, description }) => {
                                        const colorValue = getColorValue(key);
                                        return (
                                            <div key={key} className="flex items-center gap-3">
                                                <div className="flex-shrink-0">
                                                    <input
                                                        type="color"
                                                        value={colorValue}
                                                        onChange={(e) => handleColorChange(key, e.target.value)}
                                                        className="w-8 h-8 rounded cursor-pointer"
                                                        title={description}
                                                    />
                                                </div>
                                                <div className="flex-grow">
                                                    <div className="text-sm font-medium">{label}</div>
                                                    {description && (
                                                        <div className="text-xs text-themed-secondary">
                                                            {description}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-shrink-0 font-mono text-xs text-themed-secondary">
                                                    {colorValue.toUpperCase()}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border-t border-themed pt-4">
                    <label className="block text-lg font-medium mb-2">Background</label>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Image URL</label>
                            <div className="space-y-2">
                                <form onSubmit={handleUrlSubmit} className="flex gap-2">
                                    <input
                                        type="url"
                                        placeholder="Enter image URL"
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        className="flex-1 px-2 py-1 rounded text-sm"
                                        disabled={isLoadingImage}
                                    />
                                    <button
                                        type="submit"
                                        className="btn-primary px-3 py-1 rounded text-sm flex items-center gap-1"
                                        disabled={isLoadingImage || !imageUrl.trim()}
                                    >
                                        {isLoadingImage ? (
                                            <Icon icon="fluent:spinner-ios-20-regular" className="animate-spin" />
                                        ) : (
                                            <Icon icon="fluent:arrow-enter-20-regular" />
                                        )}
                                    </button>
                                </form>
                                {error && (
                                    <p className="text-error text-sm">{error}</p>
                                )}
                                {themeValue.backgroundImage && (
                                    <button
                                        onClick={clearBackgroundImage}
                                        disabled={isLoadingImage}
                                        className="w-full btn-error px-4 py-2 rounded flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        <Icon icon="fluent:delete-24-regular" />
                                        Remove Background
                                    </button>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Overlay Opacity ({themeValue.backgroundOverlay}%)
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={themeValue.backgroundOverlay}
                                onChange={(e) => handleOverlayChange(Number(e.target.value))}
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>

                <div className="border-t border-themed pt-4">
                    <label className="block text-lg font-medium mb-2">Effects</label>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Blur ({themeValue.blur}px)
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="20"
                                value={themeValue.blur}
                                onChange={(e) => handleBlurChange(Number(e.target.value))}
                                className="w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Border Radius ({themeValue.borderRadius}px)
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="20"
                                value={themeValue.borderRadius}
                                onChange={(e) => handleBorderRadiusChange(Number(e.target.value))}
                                className="w-full"
                            />
                        </div>

                        <div>
                            <label className="flex items-center justify-between text-sm font-medium">
                                <div>
                                    <span>Glass Effect</span>
                                    <p className="text-xs text-themed-secondary">
                                        Enable translucent glass effect on components
                                    </p>
                                </div>
                                <button
                                    onClick={() => theme.set({
                                        ...themeValue,
                                        glassEffect: !themeValue.glassEffect
                                    })}
                                    className={`
                                        relative inline-flex h-6 w-11 items-center rounded-full
                                        transition-colors duration-200
                                        focus:outline-none
                                        ${themeValue.glassEffect 
                                            ? 'bg-green-500/50 shadow-inner shadow-primary/25' 
                                            : 'bg-red-500/50'
                                        }
                                    `}
                                    role="switch"
                                    aria-checked={themeValue.glassEffect}
                                >
                                    <span className="sr-only">
                                        {themeValue.glassEffect ? 'Disable' : 'Enable'} glass effect
                                    </span>
                                    <span
                                        className={`
                                            inline-block h-5 w-5 transform rounded-full
                                            transition-transform duration-200
                                            ${themeValue.glassEffect
                                                ? 'translate-x-5.5 bg-white'
                                                : 'translate-x-0.5 bg-secondary'
                                            }
                                        `}
                                    >
                                        <span className="absolute inset-0 flex items-center justify-center transition-opacity">
                                            <Icon
                                                icon={themeValue.glassEffect ? "fluent:checkmark-24-regular" : "fluent:dismiss-24-regular"}
                                                className={`
                                                    w-3 h-3
                                                    ${themeValue.glassEffect
                                                        ? 'text-black'
                                                        : 'text-white'
                                                    }
                                                `}
                                            />
                                        </span>
                                    </span>
                                </button>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="border-t border-themed pt-4">
                    <button
                        onClick={resetTheme}
                        className="w-full py-2 px-4 btn-warning rounded flex items-center justify-center gap-2"
                    >
                        <Icon icon="fluent:arrow-reset-24-regular" />
                        Reset to Default Theme
                    </button>
                </div>
            </div>
        </div>
    );
} 