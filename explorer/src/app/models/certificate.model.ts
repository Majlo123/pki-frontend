export interface CertificateDetails {
  serialNumber: string;
  subjectCommonName: string;
  issuerCommonName: string;
  validFrom: string; // Primamo kao string, pa parsiramo
  validTo: string;
  type: 'ROOT' | 'INTERMEDIATE' | 'END_ENTITY';
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
}

// Za listu dostupnih izdavaoca
export interface IssuerDetails {
  serialNumber: string;
  commonName: string;
  validTo: string;
}

// Za slanje zahteva za izdavanje
export interface SubjectData {
  commonName: string;
  organization: string;
  organizationalUnit: string;
  country: string;
  email: string;
}

export interface IssueCertificateRequest {
  type: 'INTERMEDIATE' | 'END_ENTITY'; // ROOT izdaje samo admin sa posebnim alatom
  issuerSerialNumber: string;
  subjectData: SubjectData;
  validFrom: string;
  validTo: string;
  // Ekstenzije se za sada mogu slati implicitno ili ih backend određuje na osnovu tipa
}