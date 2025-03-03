import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import type { TodoWidget as TodoWidgetType, TodoItem } from '../../types/widgets';
import { Icon } from '@iconify/react';
import { useStore } from '@nanostores/react';
import { theme } from '../../stores/themeStore';

interface TodoWidgetProps {
    widget: TodoWidgetType;
    onSave: (widget: TodoWidgetType) => void;
    onDelete: (id: string) => void;
}

function TodoWidget({ widget, onSave, onDelete }: TodoWidgetProps) {
    const themeValue = useStore(theme);
    const [items, setItems] = useState(widget.items);
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(widget.title);
    const [newItem, setNewItem] = useState('');

    useEffect(() => {
        setItems(widget.items);
        setTitle(widget.title);
    }, [widget]);

    const handleSave = useCallback(() => {
        onSave({
            ...widget,
            items,
            title
        });
        setIsEditing(false);
    }, [widget, items, title, onSave]);

    const handleDelete = useCallback(() => {
        onDelete(widget.id);
    }, [widget.id, onDelete]);

    const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
    }, []);

    const handleNewItemChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setNewItem(e.target.value);
    }, []);

    const toggleEditing = useCallback(() => {
        setIsEditing(prev => !prev);
    }, []);

    const handleAddItem = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!newItem.trim()) return;

        const newItems = [...items, { id: crypto.randomUUID(), text: newItem.trim(), completed: false }];
        setItems(newItems);
        setNewItem('');
        onSave({
            ...widget,
            items: newItems,
            title
        });
    }, [items, newItem, widget, title, onSave]);

    const handleToggleItem = useCallback((id: string) => {
        const newItems = items.map(item =>
            item.id === id ? { ...item, completed: !item.completed } : item
        );
        setItems(newItems);
        onSave({
            ...widget,
            items: newItems,
            title
        });
    }, [items, widget, title, onSave]);

    const handleDeleteItem = useCallback((id: string) => {
        const newItems = items.filter(item => item.id !== id);
        setItems(newItems);
        onSave({
            ...widget,
            items: newItems,
            title
        });
    }, [items, widget, title, onSave]);

    const completedCount = useMemo(() => items.filter(item => item.completed).length, [items]);
    const totalCount = useMemo(() => items.length, [items]);

    return (
        <div className="p-4 text-themed w-full">
            <div className="flex justify-between items-center gap-2 mb-2">
                {isEditing ? (
                    <input
                        type="text"
                        value={title}
                        onChange={handleTitleChange}
                        className={`px-2 py-1 ${
                            themeValue.glassEffect ? 'glass-effect' : 'no-glass'
                        }`}
                    />
                ) : (
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{title}</h3>
                        <span className="text-sm text-themed-secondary">
                            ({completedCount}/{totalCount})
                        </span>
                    </div>
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

            <form onSubmit={handleAddItem} className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={newItem}
                    onChange={handleNewItemChange}
                    placeholder="Add new item"
                    className={`flex-1 px-2 py-1 ${
                        themeValue.glassEffect ? 'glass-effect' : 'no-glass'
                    }`}
                />
                <button
                    type="submit"
                    className={`px-4 py-1 ${
                        themeValue.glassEffect ? 'glass-effect' : 'no-glass'
                    }`}
                >
                    Add
                </button>
            </form>

            <div className="space-y-2">
                {items.map(item => (
                    <div key={item.id} className="flex items-center gap-2">
                        <button
                            onClick={() => handleToggleItem(item.id)}
                            className={`p-1 ${
                                themeValue.glassEffect ? 'glass-effect' : 'no-glass'
                            }`}
                        >
                            <Icon
                                icon={item.completed ? "fluent:checkbox-checked-24-regular" : "fluent:checkbox-unchecked-24-regular"}
                                className={item.completed ? "text-accent" : "text-themed-secondary"}
                            />
                        </button>
                        <span className={item.completed ? "line-through text-themed-secondary" : ""}>
                            {item.text}
                        </span>
                        <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="ml-auto p-1 btn-accent"
                        >
                            <Icon icon="fluent:delete-24-regular" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default memo(TodoWidget); 