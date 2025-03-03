import { useEffect, useState, useRef, useCallback, useMemo, memo, type FormEvent } from 'react';
import { Icon } from "@iconify/react";
import localforage from 'localforage';
import type { Link } from '../types/links';
import { useStore } from '@nanostores/react';
import { theme } from '../stores/themeStore';

interface LinksProps {
    defaultLinks: Link[];
}

const storage = localforage.createInstance({
    name: "startpage-db",
    storeName: "links",
    driver: localforage.INDEXEDDB,
});

function getInitials(title: string): string {
    const words = title.split(" ");
    return words.map((word) => word.charAt(0).toUpperCase()).join("");
}

function Links({ defaultLinks }: LinksProps) {
    const themeValue = useStore(theme);
    const [links, setLinks] = useState<Link[]>(defaultLinks);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLink, setEditingLink] = useState<Link | null>(null);
    const [draggedLinkId, setDraggedLinkId] = useState<string | null>(null);
    const [dragOverLinkId, setDragOverLinkId] = useState<string | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const dragTimeoutRef = useRef<number | null>(null);

    const loadLinks = useCallback(async () => {
        try {
            const storedLinks = await storage.getItem<Link[]>("links");
            setLinks(storedLinks || defaultLinks);
        } catch (error) {
            console.error("Error loading links:", error);
            setLinks(defaultLinks);
        }
    }, [defaultLinks]);

    useEffect(() => {
        loadLinks();
    }, [loadLinks]);

    const saveLinks = useCallback(async (newLinks: Link[]) => {
        try {
            await storage.setItem("links", newLinks);
            setLinks(newLinks);
        } catch (error) {
            console.error("Error saving links:", error);
        }
    }, []);

    const handleSubmit = useCallback(async (e: FormEvent) => {
        e.preventDefault();
        if (!formRef.current) return;

        const formData = new FormData(formRef.current);
        const title = formData.get("title") as string;
        const href = formData.get("href") as string;

        if (!title || !href) return;

        const newLink = {
            title,
            href,
            id: editingLink?.id || crypto.randomUUID(),
        };

        let newLinks;
        if (editingLink) {
            newLinks = links.map(link =>
                link.id === editingLink.id ? newLink : link
            );
        } else {
            newLinks = [...links, newLink];
        }

        await saveLinks(newLinks);
        setIsModalOpen(false);
        setEditingLink(null);
        formRef.current.reset();
    }, [links, editingLink, saveLinks]);

    const handleDelete = useCallback(async (id: string) => {
        if (!id) return;
        const newLinks = links.filter(link => link.id !== id);
        await saveLinks(newLinks);
    }, [links, saveLinks]);

    const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, link: Link) => {
        if (!isEditMode) {
            e.preventDefault();
            return;
        }

        const target = e.target as HTMLElement;
        if (target.closest('button')) {
            e.preventDefault();
            return;
        }

        setDraggedLinkId(link.id);
        e.dataTransfer.effectAllowed = 'move';
    }, [isEditMode]);

    const handleDragEnd = useCallback(() => {
        setDraggedLinkId(null);
        setDragOverLinkId(null);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>, targetId: string) => {
        e.preventDefault();
        if (draggedLinkId === targetId) return;
        setDragOverLinkId(targetId);
    }, [draggedLinkId]);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>, targetId: string) => {
        e.preventDefault();
        if (!draggedLinkId || draggedLinkId === targetId) return;

        const draggedIndex = links.findIndex(link => link.id === draggedLinkId);
        const targetIndex = links.findIndex(link => link.id === targetId);
        
        if (draggedIndex === -1 || targetIndex === -1) return;

        const newLinks = [...links];
        const [draggedLink] = newLinks.splice(draggedIndex, 1);
        newLinks.splice(targetIndex, 0, draggedLink);
        
        saveLinks(newLinks);
        setDraggedLinkId(null);
        setDragOverLinkId(null);
    }, [draggedLinkId, links, saveLinks]);

    const handleOpenModal = useCallback(() => {
        setEditingLink(null);
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setEditingLink(null);
    }, []);

    const handleEditLink = useCallback((link: Link) => {
        setEditingLink(link);
        setIsModalOpen(true);
    }, []);

    const toggleEditMode = useCallback(() => {
        setIsEditMode(prev => !prev);
    }, []);

    const modalTitle = useMemo(() => editingLink ? 'Edit Link' : 'Add Link', [editingLink]);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-semibold text-themed">Links</h1>
                <div className="flex gap-2">
                    <button
                        onClick={toggleEditMode}
                        className={`px-4 py-2 flex items-center gap-2 ${
                            isEditMode ? 'btn-warning' : themeValue.glassEffect ? 'glass-effect' : 'no-glass'
                        } gpu-accelerated`}
                    >
                        <Icon icon={isEditMode ? "fluent:edit-off-24-regular" : "fluent:edit-24-regular"} />
                        {isEditMode ? 'Done' : 'Edit'}
                    </button>
                    <button 
                        onClick={handleOpenModal}
                        className={`px-4 py-2 flex items-center gap-2 ${
                            themeValue.glassEffect ? 'glass-effect' : 'no-glass'
                        } gpu-accelerated`}
                    >
                        <Icon icon="fluent:add-24-regular" />
                        Add Link
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-4">
                {links.map((link) => (
                    <div
                        key={link.id}
                        className={`group relative flex items-center justify-center w-32 h-16 text-base ${
                            themeValue.glassEffect ? 'glass-effect hover-glass' : 'no-glass hover-no-glass'
                        } ${isEditMode ? 'cursor-grab' : 'cursor-pointer'} shadow-md text-themed transition-all duration-200 ${
                            draggedLinkId === link.id ? 'opacity-50' : ''
                        } ${dragOverLinkId === link.id ? 'ring-2 ring-warning' : ''} ${
                            isEditMode ? 'ring-1 ring-warning/50' : ''
                        }`}
                        draggable={isEditMode}
                        data-link-id={link.id}
                        onDragStart={(e) => handleDragStart(e, link)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, link.id)}
                        onDrop={(e) => handleDrop(e, link.id)}
                        onClick={() => {
                            if (!isEditMode) {
                                window.location.href = link.href;
                            }
                        }}
                    >
                        <div className={`absolute inset-0 ${
                            themeValue.glassEffect ? 'glass-effect' : 'no-glass'
                        } transition-opacity duration-200 ${
                            isEditMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`} />
                        <span className="relative z-10">{getInitials(link.title)}</span>
                        {isEditMode && (
                            <div className="absolute flex gap-1 top-0 right-0 p-1 z-20">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditLink(link);
                                    }}
                                    className="btn-warning p-1 rounded cursor-pointer"
                                >
                                    <Icon icon="fluent:edit-24-regular" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(link.id);
                                    }}
                                    className="btn-error p-1 rounded cursor-pointer"
                                >
                                    <Icon icon="fluent:delete-24-regular" />
                                </button>
                            </div>
                        )}
                        {!isEditMode && (
                            <div className="absolute bottom-0 left-0 right-0 p-1 text-xs text-center bg-themed-overlay rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                {link.title}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="modal-backdrop">
                    <div className={`p-6 rounded-lg w-96 ${
                        themeValue.glassEffect ? 'glass-effect' : 'no-glass'
                    }`}>
                        <h3 className="text-xl font-semibold mb-4 text-themed">
                            {modalTitle}
                        </h3>
                        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label
                                    htmlFor="title"
                                    className="block text-sm font-medium text-themed-secondary"
                                >
                                    Title
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    required
                                    defaultValue={editingLink?.title}
                                    className="px-2 py-1 mt-1 block w-full rounded-md"
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="href"
                                    className="block text-sm font-medium text-themed-secondary"
                                >
                                    URL
                                </label>
                                <input
                                    type="url"
                                    id="href"
                                    name="href"
                                    required
                                    defaultValue={editingLink?.href}
                                    className="px-2 py-1 mt-1 block w-full rounded-md"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="btn-surface px-4 py-2 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary px-4 py-2 rounded-lg"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default memo(Links); 