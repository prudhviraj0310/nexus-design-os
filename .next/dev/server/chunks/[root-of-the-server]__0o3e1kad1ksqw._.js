module.exports = [
(()=>{"use strict";return[
"[project]/src/app/api/tokens/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {
__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/db/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/db/schema.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$seed$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/db/seed.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$seed$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$seed$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const { db } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDb"])();
        let allTokens = await db.select().from(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tokens"]);
        if (allTokens.length === 0) {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$seed$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["seedDatabase"])();
            allTokens = await db.select().from(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tokens"]);
        }
        const filtered = category && category !== 'all' ? allTokens.filter((t)=>t.category === category) : allTokens;
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            totalCount: allTokens.length,
            filteredCount: filtered.length,
            tokens: filtered
        });
    } catch (err) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: err.message
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/core/tokens/parser.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "inferCategory",
    ()=>inferCategory,
    "inferType",
    ()=>inferType,
    "isToken",
    ()=>isToken,
    "parseDTCGTree",
    ()=>parseDTCGTree
]);
function isToken(obj) {
    return typeof obj === 'object' && obj !== null && '$value' in obj;
}
function inferCategory(path, type) {
    const root = path.split('.')[0].toLowerCase();
    if ([
        'color',
        'colors',
        'colour'
    ].includes(root)) return 'color';
    if ([
        'spacing',
        'space',
        'padding',
        'margin',
        'gap'
    ].includes(root)) return 'spacing';
    if ([
        'size',
        'sizing',
        'width',
        'height'
    ].includes(root)) return 'sizing';
    if ([
        'typography',
        'font',
        'text'
    ].includes(root)) return 'typography';
    if ([
        'radius',
        'border-radius',
        'borderradius'
    ].includes(root)) return 'borderRadius';
    if ([
        'shadow',
        'shadows',
        'box-shadow'
    ].includes(root)) return 'shadow';
    if ([
        'opacity',
        'alpha'
    ].includes(root)) return 'opacity';
    if ([
        'motion',
        'transition',
        'animation',
        'duration'
    ].includes(root)) return 'motion';
    if ([
        'breakpoint',
        'screens'
    ].includes(root)) return 'breakpoint';
    if (type === 'color') return 'color';
    if ([
        'fontSize',
        'fontFamily',
        'fontWeight',
        'lineHeight'
    ].includes(type || '')) return 'typography';
    if (type === 'borderRadius') return 'borderRadius';
    if (type === 'shadow') return 'shadow';
    return 'other';
}
function inferType(val, category, explicitType) {
    if (explicitType) return explicitType;
    if (typeof val === 'string') {
        if (val.startsWith('#') || val.startsWith('rgb') || val.startsWith('hsl')) return 'color';
        if (val.endsWith('px') || val.endsWith('rem') || val.endsWith('em') || val.endsWith('%')) return 'dimension';
        if (val.endsWith('ms') || val.endsWith('s')) return 'duration';
    }
    if (category === 'color') return 'color';
    if (category === 'spacing' || category === 'sizing') return 'dimension';
    if (category === 'borderRadius') return 'borderRadius';
    if (category === 'shadow') return 'shadow';
    return 'custom';
}
function parseDTCGTree(tree, parentPath = '', inheritedType) {
    const result = [];
    for (const [key, value] of Object.entries(tree)){
        if (key.startsWith('$')) continue; // Skip metadata keys at group level
        const currentPath = parentPath ? `${parentPath}.${key}` : key;
        const currentGroupType = tree.$type || inheritedType;
        if (isToken(value)) {
            const type = inferType(value.$value, inferCategory(currentPath, value.$type || currentGroupType), value.$type || currentGroupType);
            const category = inferCategory(currentPath, type);
            const rawVal = typeof value.$value === 'object' ? JSON.stringify(value.$value) : String(value.$value);
            const isAliasMatch = typeof rawVal === 'string' && rawVal.startsWith('{') && rawVal.endsWith('}');
            const aliasTarget = isAliasMatch ? rawVal.slice(1, -1).trim() : undefined;
            result.push({
                name: key,
                path: currentPath,
                category,
                type,
                rawValue: rawVal,
                resolvedValue: rawVal,
                isAlias: isAliasMatch,
                aliasTarget,
                isDeprecated: Boolean(value.$extensions?.['deprecated'] || value.$deprecated),
                description: value.$description,
                extensions: value.$extensions
            });
        } else if (typeof value === 'object' && value !== null) {
            result.push(...parseDTCGTree(value, currentPath, currentGroupType));
        }
    }
    return result;
}
}),
"[project]/src/core/tokens/resolver.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "resolveTokenAliases",
    ()=>resolveTokenAliases
]);
function resolveTokenAliases(tokens) {
    const tokenMap = new Map();
    for (const token of tokens){
        tokenMap.set(token.path, {
            ...token
        });
    }
    const cycles = [];
    const unresolvedAliases = [];
    function resolvePath(path, visited = new Set()) {
        const token = tokenMap.get(path);
        if (!token) {
            return {
                value: path
            };
        }
        if (!token.isAlias || !token.aliasTarget) {
            return {
                value: token.rawValue
            };
        }
        const targetPath = token.aliasTarget;
        if (visited.has(targetPath)) {
            const cycleArray = [
                ...visited,
                targetPath
            ];
            cycles.push({
                path,
                cycle: cycleArray
            });
            return {
                value: `[Circular: ${cycleArray.join(' -> ')}]`,
                cycleDetected: true
            };
        }
        if (!tokenMap.has(targetPath)) {
            unresolvedAliases.push({
                path,
                target: targetPath
            });
            return {
                value: `[Unresolved: {${targetPath}}]`
            };
        }
        visited.add(path);
        const nextResult = resolvePath(targetPath, new Set(visited));
        return nextResult;
    }
    const resolvedTokens = [];
    for (const token of tokenMap.values()){
        if (token.isAlias && token.aliasTarget) {
            const res = resolvePath(token.path);
            resolvedTokens.push({
                ...token,
                resolvedValue: res.value
            });
        } else {
            resolvedTokens.push(token);
        }
    }
    return {
        tokens: resolvedTokens,
        cycles,
        unresolvedAliases
    };
}
}),
"[project]/src/db/index.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {
__turbopack_context__.s([
    "getDb",
    ()=>getDb,
    "initializeSchema",
    ()=>initializeSchema
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$electric$2d$sql$2f$pglite__$5b$external$5d$__$2840$electric$2d$sql$2f$pglite$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$electric$2d$sql$2f$pglite$29$__ = __turbopack_context__.i("[externals]/@electric-sql/pglite [external] (@electric-sql/pglite, esm_import, [project]/node_modules/@electric-sql/pglite)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pglite$2f$driver$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/pglite/driver.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/db/schema.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f40$electric$2d$sql$2f$pglite__$5b$external$5d$__$2840$electric$2d$sql$2f$pglite$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$electric$2d$sql$2f$pglite$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pglite$2f$driver$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f40$electric$2d$sql$2f$pglite__$5b$external$5d$__$2840$electric$2d$sql$2f$pglite$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$electric$2d$sql$2f$pglite$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pglite$2f$driver$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
let pgliteInstance = null;
let dbInstance = null;
async function getDb(dataDir) {
    if (dbInstance && pgliteInstance) {
        return {
            db: dbInstance,
            client: pgliteInstance
        };
    }
    // Use persistent storage if directory is provided or default to local .data/novadesign-db
    const targetDir = dataDir || __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["resolve"](process.cwd(), '.data/novadesign-db');
    if (targetDir !== ':memory:') {
        __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["mkdirSync"](targetDir, {
            recursive: true
        });
        pgliteInstance = new __TURBOPACK__imported__module__$5b$externals$5d2f40$electric$2d$sql$2f$pglite__$5b$external$5d$__$2840$electric$2d$sql$2f$pglite$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$electric$2d$sql$2f$pglite$29$__["PGlite"](targetDir);
    } else {
        pgliteInstance = new __TURBOPACK__imported__module__$5b$externals$5d2f40$electric$2d$sql$2f$pglite__$5b$external$5d$__$2840$electric$2d$sql$2f$pglite$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$electric$2d$sql$2f$pglite$29$__["PGlite"]();
    }
    dbInstance = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pglite$2f$driver$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["drizzle"])(pgliteInstance, {
        schema: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
    });
    // Ensure tables exist
    await initializeSchema(pgliteInstance);
    return {
        db: dbInstance,
        client: pgliteInstance
    };
}
async function initializeSchema(client) {
    await client.exec(`
    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS design_systems (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      version TEXT NOT NULL DEFAULT '1.0.0',
      description TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS tokens (
      id TEXT PRIMARY KEY,
      design_system_id TEXT NOT NULL REFERENCES design_systems(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      path TEXT NOT NULL,
      category TEXT NOT NULL,
      type TEXT NOT NULL,
      raw_value TEXT NOT NULL,
      resolved_value TEXT NOT NULL,
      is_alias BOOLEAN NOT NULL DEFAULT FALSE,
      alias_target TEXT,
      is_deprecated BOOLEAN NOT NULL DEFAULT FALSE,
      description TEXT,
      extensions JSONB,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS components (
      id TEXT PRIMARY KEY,
      design_system_id TEXT NOT NULL REFERENCES design_systems(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      framework TEXT NOT NULL DEFAULT 'react',
      description TEXT,
      props JSONB NOT NULL,
      variants JSONB,
      code_snippet TEXT,
      token_dependencies JSONB,
      is_deprecated BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS audit_reports (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      rule_id TEXT NOT NULL,
      severity TEXT NOT NULL,
      message TEXT NOT NULL,
      file_path TEXT NOT NULL,
      line INTEGER NOT NULL,
      evidence TEXT,
      suggested_fix TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS delivery_jobs (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      target_repo TEXT NOT NULL,
      branch TEXT NOT NULL,
      pull_request_url TEXT,
      status TEXT NOT NULL,
      diff_summary TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
}
;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/db/schema.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "auditReports",
    ()=>auditReports,
    "components",
    ()=>components,
    "deliveryJobs",
    ()=>deliveryJobs,
    "designSystems",
    ()=>designSystems,
    "projects",
    ()=>projects,
    "tokens",
    ()=>tokens,
    "workspaces",
    ()=>workspaces
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/pg-core/table.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/pg-core/columns/text.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/pg-core/columns/timestamp.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$boolean$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/pg-core/columns/boolean.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/pg-core/columns/jsonb.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/pg-core/columns/integer.js [app-route] (ecmascript)");
;
const workspaces = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])('workspaces', {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])('id').primaryKey(),
    name: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])('name').notNull(),
    slug: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])('slug').notNull().unique(),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])('created_at').defaultNow().notNull()
});
const projects = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])('projects', {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])('id').primaryKey(),
    workspaceId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])('workspace_id').notNull().references(()=>workspaces.id, {
        onDelete: 'cascade'
    }),
    name: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])('name').notNull(),
    slug: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])('slug').notNull(),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])('created_at').defaultNow().notNull()
});
const designSystems = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])('design_systems', {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])('id').primaryKey(),
    projectId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])('project_id').notNull().references(()=>projects.id, {
        onDelete: 'cascade'
    }),
    name: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])('name').notNull(),
    version: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])('version').notNull().default('1.0.0'),
    description: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])('description'),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])('created_at').defaultNow().notNull()
});
const tokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])('tokens', {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])('id').primaryKey(),
    designSystemId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])('design_system_id').notNull().references(()=>designSystems.id, {
        onDelete: 'cascade'
    }),
    name: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])('name').notNull(),
    path: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])('path').notNull(),
    category: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])('category').notNull(),
    type: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])('type').notNull(),
    rawValue: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])('raw_value').notNull(),
    resolvedValue: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])('resolved_value').notNull(),
    isAlias: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$boolean$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["boolean"])('is_alias').default(false).notNull(),
    aliasTarget: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])('alias_target'),
    isDeprecated: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$boolean$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["boolean"])('is_deprecated').default(false).notNull(),
    description: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])('description'),
    extensions: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonb"])('extensions'),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])('created_at').defaultNow().notNull()
});
const components = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])('components', {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])('id').primaryKey(),
    designSystemId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])('design_system_id').notNull().references(()=>designSystems.id, {
        onDelete: 'cascade'
    }),
    name: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])('name').notNull(),
    category: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])('category').notNull(),
    framework: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])('framework').notNull().default('react'),
    description: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])('description'),
    props: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonb"])('props').notNull(),
    variants: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonb"])('variants'),
    codeSnippet: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])('code_snippet'),
    tokenDependencies: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonb"])('token_dependencies'),
    isDeprecated: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$boolean$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["boolean"])('is_deprecated').default(false).notNull(),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])('created_at').defaultNow().notNull()
});
const auditReports = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])('audit_reports', {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])('id').primaryKey(),
    projectId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])('project_id').notNull().references(()=>projects.id, {
        onDelete: 'cascade'
    }),
    ruleId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])('rule_id').notNull(),
    severity: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])('severity').notNull(),
    message: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])('message').notNull(),
    filePath: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])('file_path').notNull(),
    line: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])('line').notNull(),
    evidence: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])('evidence'),
    suggestedFix: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])('suggested_fix'),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])('created_at').defaultNow().notNull()
});
const deliveryJobs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])('delivery_jobs', {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])('id').primaryKey(),
    projectId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])('project_id').notNull().references(()=>projects.id, {
        onDelete: 'cascade'
    }),
    targetRepo: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])('target_repo').notNull(),
    branch: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])('branch').notNull(),
    pullRequestUrl: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])('pull_request_url'),
    status: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])('status').notNull(),
    diffSummary: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])('diff_summary'),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])('created_at').defaultNow().notNull()
});
}),
"[project]/src/db/seed.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {
__turbopack_context__.s([
    "seedDatabase",
    ()=>seedDatabase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/db/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/db/schema.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$tokens$2f$parser$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/core/tokens/parser.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$tokens$2f$resolver$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/core/tokens/resolver.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
async function seedDatabase(customDb) {
    const { db } = customDb ? customDb : await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDb"])();
    const workspaceId = 'ws-acme-corp';
    const projectId = 'proj-core-web';
    const designSystemId = 'ds-nova-design';
    // 1. Create Workspace
    await db.insert(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workspaces"]).values({
        id: workspaceId,
        name: 'Acme Corporation',
        slug: 'acme-corp'
    }).onConflictDoNothing();
    // 2. Create Project
    await db.insert(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["projects"]).values({
        id: projectId,
        workspaceId,
        name: 'Core Web Platform',
        slug: 'core-web'
    }).onConflictDoNothing();
    // 3. Create Design System
    await db.insert(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["designSystems"]).values({
        id: designSystemId,
        projectId,
        name: 'Nova Design System',
        version: '1.2.0',
        description: 'Production design system for Acme web and mobile applications'
    }).onConflictDoNothing();
    // 4. Sample W3C DTCG Token Tree
    const tokenTree = {
        color: {
            primitive: {
                blue: {
                    500: {
                        $value: '#3b82f6',
                        $type: 'color',
                        $description: 'Base blue 500'
                    },
                    600: {
                        $value: '#2563eb',
                        $type: 'color',
                        $description: 'Hover blue 600'
                    }
                },
                slate: {
                    900: {
                        $value: '#0f172a',
                        $type: 'color',
                        $description: 'Deep text slate'
                    },
                    100: {
                        $value: '#f1f5f9',
                        $type: 'color',
                        $description: 'Light gray background'
                    }
                }
            },
            brand: {
                primary: {
                    $value: '{color.primitive.blue.500}',
                    $type: 'color',
                    $description: 'Brand primary action color'
                },
                primaryHover: {
                    $value: '{color.primitive.blue.600}',
                    $type: 'color',
                    $description: 'Brand primary hover state'
                }
            },
            text: {
                primary: {
                    $value: '{color.primitive.slate.900}',
                    $type: 'color',
                    $description: 'Main body copy color'
                }
            },
            legacy: {
                accent: {
                    $value: '#ff007f',
                    $type: 'color',
                    $description: 'Legacy magenta accent (deprecated)',
                    $extensions: {
                        deprecated: true,
                        replacement: 'color.brand.primary'
                    }
                }
            }
        },
        spacing: {
            xs: {
                $value: '4px',
                $type: 'dimension',
                $description: 'Extra small spacing'
            },
            sm: {
                $value: '8px',
                $type: 'dimension',
                $description: 'Small spacing'
            },
            md: {
                $value: '16px',
                $type: 'dimension',
                $description: 'Medium default spacing'
            },
            lg: {
                $value: '24px',
                $type: 'dimension',
                $description: 'Large spacing'
            },
            xl: {
                $value: '32px',
                $type: 'dimension',
                $description: 'Extra large spacing'
            }
        },
        borderRadius: {
            sm: {
                $value: '4px',
                $type: 'borderRadius',
                $description: 'Small rounded corners'
            },
            md: {
                $value: '8px',
                $type: 'borderRadius',
                $description: 'Medium rounded corners'
            },
            full: {
                $value: '9999px',
                $type: 'borderRadius',
                $description: 'Pill / full rounded radius'
            }
        },
        typography: {
            fontFamily: {
                sans: {
                    $value: 'Inter, system-ui, sans-serif',
                    $type: 'fontFamily'
                }
            },
            fontSize: {
                base: {
                    $value: '16px',
                    $type: 'fontSize'
                },
                lg: {
                    $value: '18px',
                    $type: 'fontSize'
                }
            }
        }
    };
    const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$tokens$2f$parser$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseDTCGTree"])(tokenTree);
    const resolved = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$tokens$2f$resolver$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveTokenAliases"])(parsed);
    for (const token of resolved.tokens){
        const tokenId = `tok-${token.path.replace(/\./g, '-')}`;
        await db.insert(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tokens"]).values({
            id: tokenId,
            designSystemId,
            name: token.name,
            path: token.path,
            category: token.category,
            type: token.type,
            rawValue: token.rawValue,
            resolvedValue: token.resolvedValue,
            isAlias: token.isAlias,
            aliasTarget: token.aliasTarget || null,
            isDeprecated: Boolean(token.isDeprecated),
            description: token.description || null,
            extensions: token.extensions || null
        }).onConflictDoNothing();
    }
    // 5. Register Sample Components
    await db.insert(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["components"]).values({
        id: 'comp-button',
        designSystemId,
        name: 'Button',
        category: 'inputs',
        framework: 'react',
        description: 'Interactive button component supporting primary, secondary, and ghost variants.',
        props: [
            {
                name: 'variant',
                type: "'primary' | 'secondary' | 'ghost'",
                required: false,
                defaultValue: 'primary'
            },
            {
                name: 'size',
                type: "'sm' | 'md' | 'lg'",
                required: false,
                defaultValue: 'md'
            },
            {
                name: 'children',
                type: 'ReactNode',
                required: true
            }
        ],
        variants: [
            {
                name: 'variant',
                values: [
                    'primary',
                    'secondary',
                    'ghost'
                ]
            },
            {
                name: 'size',
                values: [
                    'sm',
                    'md',
                    'lg'
                ]
            }
        ],
        codeSnippet: '<Button variant="primary" size="md">Click Me</Button>',
        tokenDependencies: [
            'color.brand.primary',
            'spacing.md',
            'borderRadius.md'
        ],
        isDeprecated: false
    }).onConflictDoNothing();
    await db.insert(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["components"]).values({
        id: 'comp-badge',
        designSystemId,
        name: 'Badge',
        category: 'feedback',
        framework: 'react',
        description: 'Compact status badge indicator.',
        props: [
            {
                name: 'children',
                type: 'ReactNode',
                required: true
            },
            {
                name: 'tone',
                type: "'neutral' | 'success' | 'critical'",
                required: false
            }
        ],
        tokenDependencies: [
            'spacing.xs',
            'borderRadius.full'
        ],
        isDeprecated: false
    }).onConflictDoNothing();
    return {
        workspaceId,
        projectId,
        designSystemId,
        tokenCount: resolved.tokens.length,
        componentCount: 2
    };
}
// Auto-run if executed directly
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
    seedDatabase().then((res)=>{
        console.log('Database seeded successfully:', res);
    }).catch((err)=>{
        console.error('Failed to seed database:', err);
    });
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
]})(),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/runtime-reacts.external.js [external] (next/dist/server/runtime-reacts.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/runtime-reacts.external.js", () => require("next/dist/server/runtime-reacts.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0o3e1kad1ksqw._.js.map