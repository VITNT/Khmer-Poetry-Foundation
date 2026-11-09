import historicalPoems from '../data/historical-poems.json';
import additionalPoems from '../data/additional-poems.json';

import type { Poem } from '../content';
import samplePoems from '../data/sample-poems.json';
export const poems: Poem[] = [...historicalPoems, ...additionalPoems, ...samplePoems];
export const themes = ['All works', ...new Set(poems.map(poem => poem.theme))];
export const sourcedCount = historicalPoems.length + additionalPoems.length;
export const sampleCount = samplePoems.length;
