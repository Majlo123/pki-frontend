export interface Certificate {
    serialNumber: string;
    subject: string;
    issuer: string;
    validFrom: string;
    validTo: string;
    revoked: boolean;
    type: 'ROOT' | 'INTERMEDIATE' | 'END_ENTITY';
}

