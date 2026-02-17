export interface User {
    id: string;
    full_name: string;
    roll_number: string;
    mobile_number?: string;
    department?: string;
    year: number;
    profile_image?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Club {
    id: string;
    name: string;
    logo: string;
}

export interface Event {
    id: string;
    name: string;
    club: string;
    clubId: string;
    description: string;
    rules: string;
    venue: string;
    date: string; // ISO string
    deadline: string; // ISO string
    poster: string;
    isClosed: boolean;
    registrationType: 'individual' | 'group' | 'both';
    minGroupSize?: number;
    maxGroupSize?: number;
    status: 'Open' | 'Closed';
    registeredCount?: number;
    maxCapacity?: number;
    representativePhone: string;
}

export interface Announcement {
    id: string;
    title: string;
    content: string;
    date: string;
}

export interface Registration {
    id: string;
    eventId: string;
    event: Event;
    studentId: string;
    registrationDate: string;
    status: 'confirmed' | 'pending' | 'cancelled';
    groupCode?: string;
    groupMembers?: string[];
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'announcement' | 'confirmation' | 'update';
    date: string;
    isRead: boolean;
}
