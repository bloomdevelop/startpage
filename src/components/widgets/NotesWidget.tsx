import { useState, useEffect, useCallback, memo } from 'react';
import type { NotesWidget as NotesWidgetType } from '../../types/widgets';
import { Icon } from '@iconify/react';
import { useStore } from '@nanostores/react';
import { theme } from '../../stores/themeStore';

interface NotesWidgetProps {
    widget: NotesWidgetType;
    onSave: (widget: NotesWidgetType) => void;
    onDelete: (id: string) => void;
}

function NotesWidget({ widget, onSave, onDelete }: NotesWidgetProps) {
    const themeValue = useStore(theme);
    const [content, setContent] = useState(widget.content);
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(widget.title);

    useEffect(() => {
        setContent(widget.content);
        setTitle(widget.title);
    }, [widget]);

    const handleSave = useCallback(() => {
        onSave({
            ...widget,
            content,
            title
        });
        setIsEditing(false);
    }, [widget, content, title, onSave]);

    const handleDelete = useCallback(() => {
        onDelete(widget.id);
    }, [widget.id, onDelete]);

    const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
    }, []);

    const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
    }, []);

    const toggleEditing = useCallback(() => {
        setIsEditing(prev => !prev);
    }, []);

    return (
        <div className="p-4 text-themed w-full">
            <div className="flex justify-between items-center mb-2 gap-2">
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
            {isEditing ? (
                <textarea
                    value={content}
                    onChange={handleContentChange}
                    onBlur={handleSave}
                    className={`w-full h-48 resize-none ${
                        themeValue.glassEffect ? 'glass-effect' : 'no-glass'
                    }`}
                />
            ) : (
                <div className="whitespace-pre-wrap">{content}</div>
            )}
        </div>
    );
}

export default memo(NotesWidget); 