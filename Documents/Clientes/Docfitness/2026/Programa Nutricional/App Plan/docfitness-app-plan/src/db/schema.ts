import Dexie, { type EntityTable } from 'dexie';

export interface PatientRecord {
  id: string;
  nombre: string;
  objetivo?: string;
  pesoIni?: string;
  estatura?: string;
  updatedAt: number;
  createdAt: number;
}

export interface MetaRecord {
  key: string;
  value: any;
}

class AppDB extends Dexie {
  patients!: EntityTable<PatientRecord, 'id'>;
  meta!: EntityTable<MetaRecord, 'key'>;

  constructor() {
    super('docfitness-db');
    this.version(1).stores({
      patients: 'id, nombre, objetivo, pesoIni, estatura, updatedAt',
      meta: 'key',
    });
  }
}

export const db = new AppDB();
