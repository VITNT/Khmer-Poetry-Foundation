import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import ts from 'typescript';
const modules = new Map();
export function moduleURL(path) {
 path = resolve(path);
 if (modules.has(path)) return modules.get(path);
 if (path.endsWith('.json')) {
  const url = `data:text/javascript;base64,${Buffer.from('export default ' + readFileSync(path, 'utf8')).toString('base64')}`;
  modules.set(path, url);
  return url;
 }
 let source = readFileSync(path, 'utf8').replace("import { env } from '$env/dynamic/private';", 'const env = {};');
 source = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
 source = source.replace(/from ['"]([^'"]+)['"]/g, (_, name) => {
  const url = name.startsWith('$lib/') ? moduleURL(`src/lib/${name.slice(5)}.ts`)
   : name.startsWith('.') ? moduleURL(resolve(dirname(path), name.endsWith('.json') ? name : `${name}.ts`)) : import.meta.resolve(name);
  return `from ${JSON.stringify(url)}`;
 });
 const url = `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
 modules.set(path, url);
 return url;
}
