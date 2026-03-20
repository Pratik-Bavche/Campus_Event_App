export interface User {
    id: string;
    full_name: string;
    roll_number: string;
    email: string;
    department: string;
    year: number;
    mobile_number?: string;
    profile_image?: string;
    division?: string;
    created_at?: string;
    updated_at?: string;
}

export interface AppUser {
    id: string;
    club_id?: string;
    email: string;
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
    clubId: string;
    title: string;
    content: string;
    eventId?: string;
    date: string;
    pinned: boolean;
}

export interface Registration {
    id: string;
    event_id: string;
    student_id?: string;
    roll_no: string;
    name: string;
    email: string;
    department?: string;
    year?: string;
    status: 'REGISTERED' | 'ATTENDED' | 'CANCELLED';
    division?: string;
    registered_at?: string;
    // For mapping to UI
    event?: Event;
}

export interface Attendance {
    id: string;
    event_id: string;
    student_id?: string;
    prn: string;
    roll_number?: string;
    name: string;
    email: string;
    department?: string;
    division?: string;
    year?: string;
    status: 'PRESENT' | 'ABSENT';
    timestamp?: string;
    scan_method: 'QR' | 'MANUAL';
    certificate_issued: boolean;
    certificate_url?: string;
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'announcement' | 'confirmation' | 'update';
    date: string;
    isRead: boolean;
}


export interface Feedback {
    id: string;
    event_id: string;
    student_name: string;
    student_email: string;
    roll_no: string;
    rating: number;
    comment: string;
    created_at?: string;
}

export interface Certificate {
    id: string;
    event_id: string;
    roll_no: string;
    student_name: string;
    event_title: string;
    certificate_url: string;
    issuer_club_id?: string;
    issued_at?: string;
}
