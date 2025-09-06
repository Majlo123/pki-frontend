export interface User {
    id: number;
    email: string;
    role: 'ADMIN' | 'CA_USER' | 'END_ENTITY_USER';
}

