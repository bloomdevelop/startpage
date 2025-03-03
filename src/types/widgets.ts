export type WidgetType = 'notes' | 'website' | 'todo';

export interface BaseWidget {
    id: string;
    type: WidgetType;
    title: string;
}

export interface NotesWidget extends BaseWidget {
    type: 'notes';
    content: string;
}

export interface WebsiteWidget extends BaseWidget {
    type: 'website';
    url: string;
}

export interface TodoItem {
    id: string;
    text: string;
    completed: boolean;
}

export interface TodoWidget extends BaseWidget {
    type: 'todo';
    items: TodoItem[];
}

export type Widget = NotesWidget | WebsiteWidget | TodoWidget; 