// GitHub Pages serves under a sub-path; plain <img> and absolute links need it prefixed.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000') + BASE_PATH;

export const asset = (path: string) => `${BASE_PATH}${path}`;
export const pageUrl = (path: string) => `${SITE_URL}${path}`;
