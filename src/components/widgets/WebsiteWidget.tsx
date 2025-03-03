import { useState, useEffect, useCallback, useRef } from 'react';
import type { WebsiteWidget as WebsiteWidgetType } from '../../types/widgets';
import { Icon } from '@iconify/react';
import { useStore } from '@nanostores/react';
import { theme } from '../../stores/themeStore';

interface WebsiteWidgetProps {
    widget: WebsiteWidgetType;
    onSave: (widget: WebsiteWidgetType) => void;
    onDelete: (id: string) => void;
}

export default function WebsiteWidget({ widget, onSave, onDelete }: WebsiteWidgetProps) {
    const themeValue = useStore(theme);
    const [url, setUrl] = useState(widget.url);
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(widget.title);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isIframeLoaded, setIsIframeLoaded] = useState(false);

    useEffect(() => {
        setUrl(widget.url);
        setTitle(widget.title);
    }, [widget]);

    const handleSave = useCallback(() => {
        onSave({
            ...widget,
            url,
            title
        });
        setIsEditing(false);
    }, [widget, url, title, onSave]);

    const handleDelete = useCallback(() => {
        onDelete(widget.id);
    }, [widget.id, onDelete]);

    const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
    }, []);

    const handleUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setUrl(e.target.value);
    }, []);

    const toggleEditing = useCallback(() => {
        setIsEditing(prev => !prev);
    }, []);

    const handleIframeLoad = useCallback(() => {
        setIsIframeLoaded(true);
    }, []);

    return (
        <div className="p-4 text-themed w-full">
            <div className="flex justify-between items-center mb-2">
                {isEditing ? (
                    <div className="flex flex-col gap-2 w-full mr-2">
                        <input
                            type="text"
                            value={title}
                            onChange={handleTitleChange}
                            placeholder="Title"
                            className={`px-2 py-1 ${
                                themeValue.glassEffect ? 'glass-effect' : 'no-glass'
                            }`}
                        />
                        <input
                            type="url"
                            value={url}
                            onChange={handleUrlChange}
                            placeholder="URL"
                            className={`px-2 py-1 ${
                                themeValue.glassEffect ? 'glass-effect' : 'no-glass'
                            }`}
                        />
                    </div>
                ) : (
                    <h3 className="text-lg font-semibold">{title}</h3>
                )}
                <div className="flex gap-2">
                    <button
                        onClick={isEditing ? handleSave : toggleEditing}
                        className={`p-1 ${
                            themeValue.glassEffect ? 'glass-effect' : 'no-glass'
                        }`}
                    >
                        <Icon icon={isEditing ? "fluent:save-24-regular" : "fluent:edit-24-regular"} />
                    </button>
                    <button
                        onClick={handleDelete}
                        className="p-1 btn-error"
                    >
                        <Icon icon="fluent:delete-24-regular" />
                    </button>
                </div>
            </div>
            {!isEditing && (
                <div className="w-full h-96 bg-white overflow-hidden widget-iframe">
                    {!isIframeLoaded && (
                        <div className={`w-full h-full flex items-center justify-center ${
                            themeValue.glassEffect ? 'glass-effect' : 'no-glass'
                        }`}>
                            Loading...
                        </div>
                    )}
                    <iframe
                        ref={iframeRef}
                        src={url}
                        title={title}
                        className={`w-full h-full border-0 ${isIframeLoaded ? 'opacity-100' : 'opacity-0'}`}
                        sandbox="allow-scripts allow-same-origin allow-popups"
                        onLoad={handleIframeLoad}
                        loading="lazy"
                    />
                </div>
            )}
        </div>
    );
} 