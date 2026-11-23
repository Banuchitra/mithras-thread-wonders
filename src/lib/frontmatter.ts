// Read/write the content files' YAML front matter in the browser (gray-matter needs Node's fs).
import yaml from 'js-yaml';

export function parseFrontmatter(text: string): Record<string, unknown> {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  return m ? ((yaml.load(m[1]) as Record<string, unknown>) ?? {}) : {};
}

export function stringifyFrontmatter(data: Record<string, unknown>): string {
  const clean = JSON.parse(JSON.stringify(data)); // drop undefined
  return `---\n${yaml.dump(clean, { lineWidth: 100 })}---\n`;
}
