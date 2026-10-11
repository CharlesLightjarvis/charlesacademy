import type { LevelCode } from './learn';

/**
 * Niveau tel que renvoyé par l'administration (table levels).
 */
export type Level = {
    id: number;
    code: LevelCode;
    name: string;
};
