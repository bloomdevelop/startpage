import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { Icon } from '@iconify/react';
import localforage from 'localforage';
import type { Widget, WidgetType } from '../types/widgets';
import { useStore } from '@nanostores/react';
import { theme } from '../stores/themeStore';
import NotesWidget from './widgets/NotesWidget';
import WebsiteWidget from './widgets/WebsiteWidget';
import TodoWidget from './widgets/TodoWidget';
import { WIDGET_ICONS } from '../constants';

const storage = localforage.createInstance({
    name: "startpage-db",
    storeName: "widgets",
    driver: localforage.INDEXEDDB,
});

const defaultWidgets: Widget[] = [
    {
        id: '1',
        type: 'notes',
        title: 'Quick Notes',
        content: ''
    },
    {
        id: '2',
        type: 'website',
        title: 'Google',
        url: 'https://www.google.com'
    },
    {
        id: '3',
        type: 'todo',
        title: 'Tasks',
        items: []
    }
];

function Widgets() {
    const themeValue = useStore(theme);
    const [widgets, setWidgets] = useState<Widget[]>([]);
    const [isAddingWidget, setIsAddingWidget] = useState(false);
    const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);
    const [dragOverWidgetId, setDragOverWidgetId] = useState<string | null>(null);
    const saveTimeoutRef = useRef<number | null>(null);

    const loadWidgets = useCallback(async () => {
        try {
            const storedWidgets = await storage.getItem<Widget[]>("widgets");
            setWidgets(storedWidgets || defaultWidgets);
        } catch (error) {
            console.error("Error loading widgets:", error);
            setWidgets(defaultWidgets);
        }
    }, []);

    useEffect(() => {
        loadWidgets();
    }, [loadWidgets]);

    const debouncedSave = useCallback((newWidgets: Widget[]) => {
        if (saveTimeoutRef.current) {
            window.clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = window.setTimeout(async () => {
            try {
                await storage.setItem("widgets", newWidgets);
            } catch (error) {
                console.error("Error saving widgets:", error);
            }
            saveTimeoutRef.current = null;
        }, 1000);
    }, []);

    const updateWidgets = useCallback((getNewWidgets: (prev: Widget[]) => Widget[]) => {
        setWidgets(prevWidgets => {
            const newWidgets = getNewWidgets(prevWidgets);
            debouncedSave(newWidgets);
            return newWidgets;
        });
    }, [debouncedSave]);

    const handleSaveWidget = useCallback((updatedWidget: Widget) => {
        updateWidgets(prevWidgets => 
            prevWidgets.map(widget =>
                widget.id === updatedWidget.id ? updatedWidget : widget
            )
        );
    }, [updateWidgets]);

    const handleDeleteWidget = useCallback((id: string) => {
        updateWidgets(prevWidgets => prevWidgets.filter(widget => widget.id !== id));
    }, [updateWidgets]);

    const addWidget = useCallback((type: WidgetType) => {
        const newWidget: Widget = {
            id: crypto.randomUUID(),
            type,
            title: type.charAt(0).toUpperCase() + type.slice(1),
            ...(type === 'notes' && { content: '' }),
            ...(type === 'website' && { url: 'https://' }),
            ...(type === 'todo' && { items: [] })
        } as Widget;

        updateWidgets(prevWidgets => [...prevWidgets, newWidget]);
        setIsAddingWidget(false);
    }, [updateWidgets]);

    const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, widget: Widget) => {
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('input') || target.closest('textarea')) {
            e.preventDefault();
            return;
        }

        setDraggedWidgetId(widget.id);
        e.dataTransfer.effectAllowed = 'move';
    }, []);

    const handleDragEnd = useCallback(() => {
        setDraggedWidgetId(null);
        setDragOverWidgetId(null);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>, targetId: string) => {
        e.preventDefault();
        if (draggedWidgetId === targetId) return;
        setDragOverWidgetId(targetId);
    }, [draggedWidgetId]);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>, targetId: string) => {
        e.preventDefault();
        if (!draggedWidgetId || draggedWidgetId === targetId) return;

        updateWidgets(prevWidgets => {
            const draggedIndex = prevWidgets.findIndex(w => w.id === draggedWidgetId);
            const targetIndex = prevWidgets.findIndex(w => w.id === targetId);
            
            if (draggedIndex === -1 || targetIndex === -1) return prevWidgets;

            const newWidgets = [...prevWidgets];
            const [draggedWidget] = newWidgets.splice(draggedIndex, 1);
            newWidgets.splice(targetIndex, 0, draggedWidget);
            return newWidgets;
        });

        setDraggedWidgetId(null);
        setDragOverWidgetId(null);
    }, [draggedWidgetId, updateWidgets]);

    const toggleAddingWidget = useCallback(() => {
        setIsAddingWidget(prev => !prev);
    }, []);

    const renderWidget = useCallback((widget: Widget) => {
        switch (widget.type) {
            case 'notes':
                return (
                    <NotesWidget
                        widget={widget}
                        onSave={handleSaveWidget}
                        onDelete={handleDeleteWidget}
                    />
                );
            case 'website':
                return (
                    <WebsiteWidget
                        widget={widget}
                        onSave={handleSaveWidget}
                        onDelete={handleDeleteWidget}
                    />
                );
            case 'todo':
                return (
                    <TodoWidget
                        widget={widget}
                        onSave={handleSaveWidget}
                        onDelete={handleDeleteWidget}
                    />
                );
            default:
                return null;
        }
    }, [handleSaveWidget, handleDeleteWidget]);

    return (
        <div className="w-min-full space-y-4">
            <div className="flex justify-between gap-8 items-center mb-4">
                <h2 className="text-xl font-semibold text-themed">Widgets</h2>
                <button
                    onClick={toggleAddingWidget}
                    className={`px-4 py-2 flex items-center gap-2 ${
                        themeValue.glassEffect ? 'glass-effect' : 'no-glass'
                    } gpu-accelerated`}
                >
                    <Icon icon="fluent:add-24-regular" />
                    Add Widget
                </button>
            </div>

            <div className="grid gap-4">
                {widgets.map((widget) => (
                    <div
                        key={widget.id}
                        className={`${
                            themeValue.glassEffect ? 'glass-effect' : 'no-glass'
                        } ${
                            draggedWidgetId === widget.id ? 'opacity-50' : ''
                        } ${dragOverWidgetId === widget.id ? 'ring-2 ring-primary' : ''}`}
                        draggable
                        data-widget-id={widget.id}
                        onDragStart={(e) => handleDragStart(e, widget)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, widget.id)}
                        onDrop={(e) => handleDrop(e, widget.id)}
                    >
                        {renderWidget(widget)}
                    </div>
                ))}
            </div>

            {isAddingWidget && (
                <div className="modal-backdrop">
                    <div className={`p-6 rounded-lg w-96 ${
                        themeValue.glassEffect ? 'glass-effect' : 'no-glass'
                    }`}>
                        <h3 className="text-xl font-semibold mb-4 text-themed">Add Widget</h3>
                        <div className="space-y-2">
                            {(Object.entries(WIDGET_ICONS) as [WidgetType, string][]).map(([type, icon]) => (
                                <button
                                    key={type}
                                    onClick={() => addWidget(type)}
                                    className={`w-full px-4 py-2 flex items-center gap-2 ${
                                        themeValue.glassEffect ? 'glass-effect hover-glass' : 'no-glass hover-no-glass'
                                    }`}
                                >
                                    <Icon icon={icon} />
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </button>
                            ))}
                            <button
                                onClick={toggleAddingWidget}
                                className="w-full btn-accent px-4 py-2 rounded"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default memo(Widgets); 