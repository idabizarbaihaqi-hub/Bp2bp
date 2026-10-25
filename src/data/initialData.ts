import { BankOption } from '../types';

export const ADMIN_CREDENTIALS = {
  email: 'id.anamiler@gmail.com',
  password: 'Bandung123',
};

export const AVAILABLE_BANKS: BankOption[] = [
  { code: 'BRI', name: 'Bank BRI (Bank Rakyat Indonesia)', logo: 'BRI', color: '#00529C' },
  { code: 'MANDIRI', name: 'Bank Mandiri', logo: 'MDR', color: '#003366' },
  { code: 'BCA', name: 'Bank Central Asia (BCA)', logo: 'BCA', color: '#0060AF' },
  { code: 'BNI', name: 'Bank Negara Indonesia (BNI)', logo: 'BNI', color: '#F15A24' },
  { code: 'BSI', name: 'Bank Syariah Indonesia (BSI)', logo: 'BSI', color: '#00A39D' },
];

export const BILL_CATEGORIES = [
  { id: 'PLN', name: 'Listrik PLN', icon: 'Zap', sub: 'Token & Pascabayar' },
  { id: 'BPJS', name: 'BPJS Ketenagakerjaan', icon: 'ShieldCheck', sub: 'Iuran Resmi PMI/Keluarga' },
  { id: 'PULSA', name: 'Pulsa & Data', icon: 'Smartphone', sub: 'Telkomsel, Indosat, XL' },
  { id: 'PDAM', name: 'Air PDAM', icon: 'Droplets', sub: 'Tagihan Air Bersih' },
  { id: 'INTERNET', name: 'Internet & TV Kabel', icon: 'Wifi', sub: 'IndiHome, Biznet, dll' },
  { id: 'PBB', name: 'Pajak PBB / Daerah', icon: 'Landmark', sub: 'Pajak Daerah Resmi' },
];
