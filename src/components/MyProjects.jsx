import { useState } from 'react'

// ── DATA ──────────────────────────────────────────────────────────────────────

const PROJECTS = [
  {
    id: 'ws2table',
    name: 'WS2Table',
    status: 'POC Complete',
    statusColor: 'green',
    description: 'Config-driven JSON-to-relational-DB sync engine. Zero code changes to add a new API integration.',
    tech: ['Java 17', 'H2', 'Jackson', 'JUnit 5', 'Maven'],
    stats: [
      { val: '3', label: 'Config tables' },
      { val: '4+', label: 'Nesting levels' },
      { val: '7', label: 'Tests' },
      { val: '18', label: 'Source files' },
    ],
  },
]

const WS2TABLE_SECTIONS = [
  { id: 'overview',   label: 'Overview' },
  { id: 'arch',       label: 'Architecture' },
  { id: 'config',     label: 'Config Model' },
  { id: 'schema',     label: 'Schema Template' },
  { id: 'flow',       label: 'Sync Flow' },
  { id: 'context',    label: 'Context Stack' },
  { id: 'decisions',  label: 'Design Decisions' },
  { id: 'tests',      label: 'Tests' },
  { id: 'roadmap',    label: 'Roadmap' },
]

// ── SUB-COMPONENTS ────────────────────────────────────────────────────────────

function Badge({ color = 'gray', children }) {
  const colors = {
    green:  'bg-green-950 text-green-400 border border-green-900',
    blue:   'bg-sky-950 text-sky-400 border border-sky-900',
    amber:  'bg-amber-950 text-amber-400 border border-amber-900',
    purple: 'bg-purple-950 text-purple-400 border border-purple-900',
    red:    'bg-red-950 text-red-400 border border-red-900',
    gray:   'bg-gray-800 text-gray-400 border border-gray-700',
  }
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono font-semibold ${colors[color]}`}>
      {children}
    </span>
  )
}

function SectionHeading({ children }) {
  return (
    <h3 className="text-gray-100 font-semibold text-base mt-6 mb-3 first:mt-0">
      {children}
    </h3>
  )
}

function Prose({ children }) {
  return <p className="text-gray-400 text-sm leading-relaxed mb-3">{children}</p>
}

function Callout({ color = 'blue', title, children }) {
  const styles = {
    blue:   'border-sky-600 bg-sky-950/40 text-sky-300',
    green:  'border-green-600 bg-green-950/40 text-green-300',
    amber:  'border-amber-500 bg-amber-950/40 text-amber-300',
  }
  return (
    <div className={`border-l-2 rounded-r px-4 py-3 my-4 text-sm ${styles[color]}`}>
      {title && <strong className="block text-white mb-1">{title}</strong>}
      {children}
    </div>
  )
}

function CodeBlock({ filename, children }) {
  return (
    <div className="my-4 rounded-lg overflow-hidden border border-gray-700">
      {filename && (
        <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
          </div>
          <span className="text-gray-500 text-xs font-mono ml-2">{filename}</span>
        </div>
      )}
      <pre className="bg-gray-900 px-4 py-4 overflow-x-auto text-xs font-mono text-gray-300 leading-relaxed">
        {children}
      </pre>
    </div>
  )
}

function DataTable({ headers, rows }) {
  return (
    <div className="my-4 rounded-lg border border-gray-700 overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-800 border-b border-gray-700">
            {headers.map((h) => (
              <th key={h} className="text-left px-3 py-2 text-xs font-mono text-gray-500 uppercase tracking-wider whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 text-gray-400 text-xs align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Mono({ children }) {
  return (
    <code className="font-mono text-sky-400 bg-gray-800 px-1 py-0.5 rounded text-xs">
      {children}
    </code>
  )
}

// ── SECTION CONTENT ───────────────────────────────────────────────────────────

function OverviewSection({ project }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-gray-100 text-xl font-bold">{project.name}</h2>
        <Badge color={project.statusColor}>{project.status}</Badge>
      </div>
      <Prose>{project.description}</Prose>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        {project.stats.map((s) => (
          <div key={s.label} className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3">
            <div className="text-2xl font-bold font-mono text-gray-100">{s.val}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {project.tech.map((t) => <Badge key={t} color="gray">{t}</Badge>)}
      </div>

      <SectionHeading>The Problem</SectionHeading>
      <Prose>
        A recurring enterprise pattern: pull data from external HTTP APIs and land it in a relational
        database for reporting or downstream consumption. The naive approach is writing a new Java class
        per integration — tedious and expensive to maintain as endpoints evolve.
      </Prose>
      <Prose>
        The harder challenge is <strong className="text-gray-200">nested JSON structures</strong>. A vehicles
        endpoint returns an array of vehicles, each with a nested price object, each price with a taxation
        array. Flattening this correctly into three relational tables while maintaining FK relationships
        requires careful tree traversal and context management.
      </Prose>

      <SectionHeading>Key Innovation</SectionHeading>
      <Callout color="green" title="Zero-code integrations">
        All integration definitions live in the database. Adding a new web service integration requires only
        inserting configuration rows — no Java code changes needed.
      </Callout>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        {[
          { icon: '01', title: 'No code per integration', body: 'All behavior declared in DB rows. Insert config, get a new pipeline.' },
          { icon: '02', title: 'Deep nesting handled', body: 'Arrays inside objects inside arrays — up to N levels, each mapped to its own destination table.' },
          { icon: '03', title: 'Schema evolution built-in', body: 'New API fields are auto-detected against the schema template. Missing DB columns get ALTER TABLE.' },
          { icon: '04', title: 'Idempotent upserts', body: 'Merge keys drive INSERT vs UPDATE. Re-running the same sync never duplicates rows.' },
        ].map((c) => (
          <div key={c.icon} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="text-xs font-mono text-sky-400 mb-2">{c.icon}</div>
            <div className="text-gray-200 font-medium text-sm mb-1">{c.title}</div>
            <div className="text-gray-400 text-xs leading-relaxed">{c.body}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ArchSection() {
  return (
    <div>
      <SectionHeading>Three-Layer Architecture</SectionHeading>
      <Prose>
        Configuration tables declare intent; the sync engine executes it; destination tables receive the output.
      </Prose>

      <div className="my-4 bg-gray-800/50 border border-gray-700 rounded-lg p-6 space-y-3 text-center font-mono text-sm">
        <div className="text-amber-400 text-xs uppercase tracking-wider mb-1">External Source</div>
        <div className="inline-block border border-amber-700 bg-amber-950/30 text-amber-300 rounded px-4 py-2">HTTP JSON API</div>
        <div className="text-gray-600">↓</div>

        <div className="text-sky-400 text-xs uppercase tracking-wider">Configuration (DB)</div>
        <div className="flex flex-wrap justify-center gap-2">
          {['WST_CONFIG', 'WST_OUTPUT_MAPPING', 'WST_OUT_MAPPING_MERGE_KEY'].map((t) => (
            <div key={t} className="border border-sky-800 bg-sky-950/40 text-sky-300 rounded px-3 py-1.5 text-xs">{t}</div>
          ))}
        </div>
        <div className="text-gray-600">↓ drives ↓</div>

        <div className="text-green-400 text-xs uppercase tracking-wider">Engine</div>
        <div className="inline-block border-2 border-green-700 bg-green-950/40 text-green-300 rounded px-6 py-2 font-bold">Ws2TableSync</div>
        <div className="text-gray-600">↓</div>

        <div className="text-purple-400 text-xs uppercase tracking-wider">Destination Tables (auto-created)</div>
        <div className="flex flex-wrap justify-center gap-2">
          {['WST_CARS', 'WST_CAR_PRICE', 'WST_TAXATION', '...any table'].map((t) => (
            <div key={t} className="border border-purple-800 bg-purple-950/40 text-purple-300 rounded px-3 py-1.5 text-xs">{t}</div>
          ))}
        </div>
      </div>

      <SectionHeading>Package Layout</SectionHeading>
      <DataTable
        headers={['Package', 'Responsibility']}
        rows={[
          [<Mono>pt.ws2table</Mono>, 'Ws2TableSync (orchestrator), PocRunner (entry point)'],
          [<Mono>.db</Mono>, 'ConnectionFactory, ConfigRepository, MappingRepository, SchemaSetup, SqlHelper (interface), H2SqlHelper'],
          [<Mono>.schema</Mono>, 'SchemaNode (sealed), SchemaTreeParser, JsonPathNavigator'],
          [<Mono>.model</Mono>, 'WstConfig, OutputMapping, MergeKey, MappingContext (immutable), SyncResult, UpsertResult, ColumnDefinition'],
          [<Mono>.http</Mono>, 'SimpleHttpClient — thin JDK HttpClient wrapper'],
          [<Mono>.mock</Mono>, 'MockHttpServer — embedded JDK HttpServer for tests'],
          [<Mono>.util</Mono>, 'SqlNames — camelCase ↔ UPPER_SNAKE_CASE, reserved-word escaping'],
        ]}
      />

      <SectionHeading>POC Stack (zero external infrastructure)</SectionHeading>
      <DataTable
        headers={['Component', 'Implementation', 'Notes']}
        rows={[
          ['Database', <Mono>H2 in-memory</Mono>, 'jdbc:h2:mem:ws2table — seeded by PocRunner. Production swaps this.'],
          ['HTTP client', 'JDK HttpClient', 'SimpleHttpClient wraps java.net.http — GET only.'],
          ['Mock server', 'JDK HttpServer', 'MockHttpServer serves canned JSON. No WireMock dependency.'],
          ['JSON', 'Jackson Databind', 'Only external dependency. Parses schema template + HTTP responses.'],
        ]}
      />
    </div>
  )
}

function ConfigSection() {
  return (
    <div>
      <Prose>
        Every integration is fully described by rows in three tables. No Java changes needed per integration.
      </Prose>

      <SectionHeading>WST_CONFIG — one row per API endpoint</SectionHeading>
      <DataTable
        headers={['Column', 'Type', 'Notes']}
        rows={[
          [<Mono>ID</Mono>, 'INTEGER PK', 'Auto-generated'],
          [<Mono>NAME</Mono>, 'VARCHAR', 'Human-readable label'],
          [<Mono>BASE_URL</Mono>, 'VARCHAR', 'e.g. http://api.example.com'],
          [<Mono>PATH</Mono>, 'VARCHAR', 'e.g. /vehicles'],
          [<Mono>RESPONSE_SCHEMA_TEMPLATE</Mono>, 'CLOB', 'Nested JSON describing the response structure — see Schema Template section'],
          [<Mono>IS_ACTIVE</Mono>, 'SMALLINT', '1 = included in each sync run'],
          [<Mono>LAST_RUN</Mono>, 'TIMESTAMP', 'Updated after each successful sync pass'],
          ['Audit cols', 'TIMESTAMP/VARCHAR', 'CREATED_AT, CREATED_BY, CHANGED_AT, CHANGED_BY'],
        ]}
      />

      <SectionHeading>WST_OUTPUT_MAPPING — one row per destination table</SectionHeading>
      <DataTable
        headers={['Column', 'Type', 'Notes']}
        rows={[
          [<Mono>ID</Mono>, 'INTEGER PK', ''],
          [<Mono>ID_WST_CONFIG</Mono>, 'INTEGER FK', 'References WST_CONFIG'],
          [<Mono>JSON_PATH</Mono>, 'VARCHAR', 'Dot-notation path, e.g. ROOT.vehicles[*].price'],
          [<Mono>DESTINATION_TABLE</Mono>, 'VARCHAR', 'Output table name, e.g. WST_CAR_PRICE'],
          [<Mono>SORT_ORDER</Mono>, 'INTEGER', 'Processing order — parent must be < child (validated at startup)'],
        ]}
      />

      <SectionHeading>WST_OUT_MAPPING_MERGE_KEY — one row per merge key field</SectionHeading>
      <DataTable
        headers={['Column', 'Type', 'Notes']}
        rows={[
          [<Mono>ID_WST_OUTPUT_MAPPING</Mono>, 'INTEGER FK', 'References WST_OUTPUT_MAPPING'],
          [<Mono>FIELD_NAME</Mono>, 'VARCHAR', 'Field name in the JSON response'],
          [<Mono>SOURCE_PATH</Mono>, 'VARCHAR', 'null if direct field; full JSON path if the key comes from an ancestor level'],
        ]}
      />

      <Callout color="blue" title="Why SOURCE_PATH?">
        A child table (e.g. WST_CAR_PRICE) needs vehicleId from its parent array element for its FK column.
        SOURCE_PATH tells the engine exactly which ancestor level to pull from — preventing ambiguity when
        the same field name appears at multiple nesting levels.
      </Callout>

      <SectionHeading>Example: Vehicles API — complete configuration</SectionHeading>
      <DataTable
        headers={['SORT_ORDER', 'JSON_PATH', 'DESTINATION_TABLE', 'MERGE KEY', 'SOURCE_PATH']}
        rows={[
          ['1', <Mono>ROOT.vehicles[*]</Mono>, <Mono>WST_CARS</Mono>, <Mono>vehicleId</Mono>, 'null (direct)'],
          ['2', <Mono>ROOT.vehicles[*].price</Mono>, <Mono>WST_CAR_PRICE</Mono>, <Mono>vehicleId</Mono>, <Mono>ROOT.vehicles[*]</Mono>],
          ['3', <Mono>ROOT.vehicles[*].price.taxation[*]</Mono>, <Mono>WST_TAXATION</Mono>, <Mono>vehicleId</Mono>, <Mono>ROOT.vehicles[*]</Mono>],
        ]}
      />
    </div>
  )
}

function SchemaSection() {
  return (
    <div>
      <Prose>
        The <Mono>RESPONSE_SCHEMA_TEMPLATE</Mono> column holds a JSON structure mirroring the API response shape.
        It declares which fields to extract and provides SQL type information for each field.
        It is a <strong className="text-gray-200">whitelist</strong> — only declared fields are read; unknown fields are ignored.
      </Prose>

      <SectionHeading>Node Types (sealed interface SchemaNode)</SectionHeading>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
        {[
          { tag: 'S', color: 'blue', title: 'Scalar', body: 'A leaf field. Has type (string/integer/number/date/clob). Strings require mandatory maxLength.' },
          { tag: 'A', color: 'purple', title: 'Array', body: 'A repeating collection. Contains items which is always an Object node.' },
          { tag: 'O', color: 'green', title: 'Object', body: 'A nested sub-document. Has a properties map of child nodes (any mix of Scalar/Array/Object).' },
        ].map((n) => (
          <div key={n.tag} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <Badge color={n.color}>{n.tag}</Badge>
            <div className="text-gray-200 font-medium text-sm mt-2 mb-1">{n.title}</div>
            <div className="text-gray-400 text-xs leading-relaxed">{n.body}</div>
          </div>
        ))}
      </div>

      <SectionHeading>Type Mapping</SectionHeading>
      <DataTable
        headers={['JSON type', 'SQL type', 'Constraint']}
        rows={[
          [<Mono>string</Mono>, <Mono>VARCHAR(n)</Mono>, 'maxLength required — validation fails without it'],
          [<Mono>integer</Mono>, <Mono>INTEGER</Mono>, ''],
          [<Mono>number</Mono>, <Mono>DOUBLE</Mono>, ''],
          [<Mono>date</Mono>, <Mono>DATE</Mono>, ''],
          [<Mono>clob</Mono>, <Mono>CLOB</Mono>, 'Large text; maxLength not required'],
        ]}
      />

      <SectionHeading>Example Schema Template</SectionHeading>
      <CodeBlock filename="RESPONSE_SCHEMA_TEMPLATE (WST_CONFIG row)">
{`{
  "type": "object",
  "properties": {
    "vehicles": {                        // Array node
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "vehicleId": { "type": "integer" },
          "make":      { "type": "string", "maxLength": 100 },
          "model":     { "type": "string", "maxLength": 100 },
          "price": {                     // Object node
            "type": "object",
            "properties": {
              "basePrice": { "type": "number" },
              "currency":  { "type": "string", "maxLength": 3 },
              "taxation": {              // Array node (level 3)
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "taxType": { "type": "string", "maxLength": 50 },
                    "amount":  { "type": "number" }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}`}
      </CodeBlock>

      <Callout color="green" title="Startup validation catches problems early">
        Before any HTTP call, the engine validates: all string fields have maxLength, all merge key fields
        exist in the schema at their declared path, and SORT_ORDER is consistent (every parent has a lower
        value than its children).
      </Callout>
    </div>
  )
}

function FlowSection() {
  const steps = [
    { n: '1', title: 'Load active configs', body: 'Fetch all WST_CONFIG rows where IS_ACTIVE = 1.' },
    { n: '2', title: 'Validate', body: 'For each config: check schema parseable, all string fields have maxLength, merge key fields exist, SORT_ORDER hierarchy valid, SOURCE_PATH references valid. Abort config if any check fails.' },
    { n: '3', title: 'HTTP GET', body: 'Call base_url + path using SimpleHttpClient. Abort config on error.' },
    { n: '4', title: 'Parse schema', body: 'Deserialize RESPONSE_SCHEMA_TEMPLATE into a SchemaNode tree (Scalar/Array/Object sealed nodes).' },
    { n: '5', title: 'Loop mappings (ordered by SORT_ORDER)', body: 'For each OutputMapping: use JsonPathNavigator to navigate the JSON response to this path and collect the list of elements.' },
    { n: '6', title: 'For each element: resolve columns', body: 'Extract direct scalar values from the schema at this level. Resolve FK columns from ancestor MappingContext.' },
    { n: '7', title: 'Ensure destination table exists', body: 'If table missing → CREATE TABLE. If table exists → check all expected columns are present; ALTER TABLE ADD COLUMN for any missing ones.' },
    { n: '8', title: 'Check merge key nulls', body: 'If any merge key field is null in this element → skip row + log warning. Processing continues.' },
    { n: '9', title: 'Upsert row', body: 'SELECT COUNT(*) by merge keys. If found → UPDATE (skipping CREATED_AT/BY). If not found → INSERT.' },
    { n: '10', title: 'Push to MappingContext (immutable)', body: 'Create a NEW context object with this row\'s values added. Pass to recursive child mapping processing.' },
    { n: '11', title: 'Update LAST_RUN', body: 'After all mappings processed successfully, update LAST_RUN timestamp in WST_CONFIG.' },
  ]

  return (
    <div>
      <Prose>
        The engine processes each active config in sequence. The tree walk is <strong className="text-gray-200">recursive</strong> —
        after upserting a row, the engine finds child mappings of the current path and calls itself for each child element.
        This is what makes arbitrarily deep nesting work without special-casing each level.
      </Prose>

      <div className="my-4 space-y-0 relative">
        <div className="absolute left-4 top-8 bottom-8 w-px bg-gray-700" />
        {steps.map((s) => (
          <div key={s.n} className="flex gap-4 py-3">
            <div className="w-8 h-8 rounded-full bg-sky-600 text-white text-xs font-mono font-bold flex items-center justify-center shrink-0 z-10 relative">
              {s.n}
            </div>
            <div className="pt-1">
              <div className="text-gray-200 font-medium text-sm mb-0.5">{s.title}</div>
              <div className="text-gray-400 text-xs leading-relaxed">{s.body}</div>
            </div>
          </div>
        ))}
      </div>

      <Callout color="amber" title="Abort vs Skip">
        Validation failures and HTTP errors abort the entire config (no LAST_RUN update).
        Null merge keys skip only that one row — the sync continues and LAST_RUN is still updated.
      </Callout>
    </div>
  )
}

function ContextSection() {
  return (
    <div>
      <Prose>
        The context stack solves <strong className="text-gray-200">FK propagation through nested levels</strong> — a child row at
        level 3 needs the key value from its grandparent at level 1.
      </Prose>

      <Callout color="amber" title="The original bug this solved">
        In a naïve implementation, a mutable context object shared across sibling elements would cause
        the second vehicle's FK to bleed into the first vehicle's price rows.
        The immutable context approach makes this impossible.
      </Callout>

      <SectionHeading>How MappingContext works</SectionHeading>
      <Prose>
        <Mono>MappingContext</Mono> is an <strong className="text-gray-200">immutable record</strong>. Each call to{' '}
        <Mono>.push(mappingPath, values)</Mono> returns a <em>new</em> context object. The original is never modified.
        This means sibling elements in an array always start from the same clean parent context.
      </Prose>

      <SectionHeading>Live example: Vehicle #1 processing</SectionHeading>
      <div className="my-4 bg-gray-900 border border-gray-700 rounded-lg p-4 font-mono text-xs space-y-1">
        <div className="text-gray-500 mb-3">// Processing Vehicle #1 (vehicleId=101)</div>

        <div className="border-l-2 border-sky-500 pl-3 py-2 bg-gray-800/50 rounded-r">
          <div className="text-gray-500 text-xs mb-1">path: ROOT.vehicles[*]</div>
          <div className="text-sky-400">vehicleId</div> = <span className="text-green-400">101</span>,{' '}
          <div className="text-sky-400 inline">make</div> = <span className="text-green-400">"Toyota"</span>
        </div>

        <div className="text-gray-600 pl-6">↓ push() → NEW context for price child</div>

        <div className="border-l-2 border-purple-500 pl-3 ml-6 py-2 bg-gray-800/50 rounded-r">
          <div className="text-gray-500 text-xs mb-1">path: ROOT.vehicles[*].price</div>
          <div className="text-purple-400">basePrice</div> = <span className="text-green-400">25000.0</span>
          <div className="text-gray-600 text-xs mt-1">+ inherits vehicleId=101 via SOURCE_PATH ROOT.vehicles[*]</div>
        </div>

        <div className="text-gray-600 pl-12">↓ push() → NEW context for taxation child</div>

        <div className="border-l-2 border-green-500 pl-3 ml-12 py-2 bg-gray-800/50 rounded-r">
          <div className="text-gray-500 text-xs mb-1">path: ROOT.vehicles[*].price.taxation[*]</div>
          <div className="text-green-400">taxType</div> = <span className="text-sky-400">"VAT"</span>,{' '}
          <div className="text-green-400 inline">amount</div> = <span className="text-sky-400">5000.0</span>
          <div className="text-gray-600 text-xs mt-1">+ inherits vehicleId=101 resolved through 2 ancestor levels</div>
        </div>

        <div className="border-t border-gray-700 mt-3 pt-3 text-gray-500">
          // Processing Vehicle #2 starts from the ORIGINAL level-1 context.<br />
          // Vehicle #1's values are gone — context isolation guaranteed.
        </div>
      </div>

      <SectionHeading>resolve() lookup</SectionHeading>
      <Prose>
        When building FK columns for a row, <Mono>MappingContext.resolve(fieldName, sourcePath)</Mono> finds the value.
        If <Mono>sourcePath</Mono> is provided, it looks up exactly that path in the context stack.
        If null, it searches all ancestor levels by field name. The explicit SOURCE_PATH prevents ambiguity
        when the same field name exists at multiple nesting levels.
      </Prose>
    </div>
  )
}

function DecisionsSection() {
  const decisions = [
    {
      n: 1, title: 'Immutable MappingContext',
      body: 'Context is never mutated — each push() creates a new object. Sibling array elements can never pollute each other\'s FK values.',
      rationale: 'Resolves: critical bug where mutable shared context caused FK bleed across siblings',
    },
    {
      n: 2, title: 'SOURCE_PATH on merge keys',
      body: 'Instead of searching context by field name (ambiguous if the same name appears at multiple levels), each merge key explicitly declares which JSON path level to pull from.',
      rationale: 'Resolves: FK type resolution ambiguity in deep hierarchies',
    },
    {
      n: 3, title: 'SORT_ORDER validated, not auto-assigned',
      body: 'Users control SORT_ORDER values, but the engine validates at startup that every parent has a strictly lower value than its children. Fails loudly before any HTTP call.',
      rationale: 'Resolves: silent processing-order bugs',
    },
    {
      n: 4, title: 'Startup validation as a gate',
      body: 'Six checks before any data processing: schema parseable, all strings have maxLength, merge key fields exist in schema, SORT_ORDER hierarchy valid, SOURCE_PATH references valid.',
      rationale: 'Resolves: silent failures mid-sync that corrupt partial output',
    },
    {
      n: 5, title: 'Null merge key → skip row + warn',
      body: 'If a merge key field is null in the API response, the row is skipped with a warning. The sync continues and LAST_RUN is still updated.',
      rationale: 'Resolves: undefined behavior when API returns null keys',
    },
    {
      n: 6, title: 'Schema evolution at upsert time',
      body: 'Every upsert checks that all expected columns (direct scalars + FK columns from context) exist in the destination table. Missing columns trigger ALTER TABLE ADD COLUMN.',
      rationale: 'Resolves: API adding new fields silently breaking downstream inserts',
    },
    {
      n: 7, title: 'SqlHelper interface for DB portability',
      body: 'All SQL generation is behind a SqlHelper interface. H2SqlHelper is the POC implementation. Swapping to Postgres/Oracle means writing a new implementation class only.',
      rationale: 'Resolves: POC-to-production DB migration path',
    },
    {
      n: 8, title: 'SELECT-then-UPDATE/INSERT upsert',
      body: 'Upsert = SELECT COUNT(*) by merge keys → if found: UPDATE; else: INSERT. Avoids reliance on database-specific MERGE/ON CONFLICT syntax.',
      rationale: 'Resolves: DB portability — accepted performance trade-off for POC scale',
    },
  ]

  return (
    <div>
      <Prose>
        Eight decisions shaped the architecture. Each resolved a specific risk identified during design review.</Prose>
      <div className="space-y-3 mt-4">
        {decisions.map((d) => (
          <div key={d.n} className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex gap-4">
            <div className="shrink-0 w-7 h-7 rounded bg-sky-950 border border-sky-800 text-sky-400 font-mono text-xs font-bold flex items-center justify-center mt-0.5">
              {d.n}
            </div>
            <div>
              <div className="text-gray-200 font-medium text-sm mb-1">{d.title}</div>
              <div className="text-gray-400 text-xs leading-relaxed mb-2">{d.body}</div>
              <div className="text-amber-400 font-mono text-xs">→ {d.rationale}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TestsSection() {
  return (
    <div>
      <Prose>Seven JUnit 5 tests across two test classes cover all critical scenarios.</Prose>

      <SectionHeading>SyncProcessTest — Vehicles API (3-level nesting)</SectionHeading>
      <DataTable
        headers={['Test', 'Verifies', 'Result']}
        rows={[
          ['firstRunCreatesTablesAndInsertsRows', '3 tables created, 8 rows inserted (2 cars + 2 prices + 4 taxation)', <Badge color="green">PASS</Badge>],
          ['secondRunUpdatesRowsNoDuplicates', 'Re-run same data → 0 inserts, 8 updates', <Badge color="green">PASS</Badge>],
          ['missingMaxLengthFailsValidation', 'String field without maxLength aborts config with clear error', <Badge color="green">PASS</Badge>],
          ['sortOrderInconsistencyFailsValidation', 'Child SORT_ORDER < parent aborts config', <Badge color="green">PASS</Badge>],
        ]}
      />

      <SectionHeading>DeepNestingSyncTest — Catalog API (4-level nesting)</SectionHeading>
      <DataTable
        headers={['Test', 'Verifies', 'Result']}
        rows={[
          ['firstRunCreatesTablesAndInsertsRows', '4-level hierarchy: 2 categories + 3 products + 7 variants = 12 rows', <Badge color="green">PASS</Badge>],
          ['secondRunUpdatesRowsNoDuplicates', 'Re-run 4-level → 0 inserts, 12 updates', <Badge color="green">PASS</Badge>],
          ['variantMergeKeysCrossMultipleAncestorLevels', 'variantCode "BLK" maps to different products — context isolation confirmed across 2+ ancestor levels', <Badge color="green">PASS</Badge>],
        ]}
      />

      <Callout color="green" title="What DeepNestingSyncTest specifically proves">
        The same variant code ("BLK") exists under multiple products. Without correct MappingContext isolation,
        the engine would confuse them. This test confirms ancestor context never bleeds across sibling elements,
        even at 4 levels of nesting.
      </Callout>

      <SectionHeading>Run commands</SectionHeading>
      <CodeBlock filename="terminal">
{`# Run all tests
mvn test

# Run a specific test class
mvn test -Dtest=SyncProcessTest
mvn test -Dtest=DeepNestingSyncTest

# Run the POC (H2 in-memory, 2 sync passes)
mvn compile exec:java`}
      </CodeBlock>
    </div>
  )
}

function RoadmapSection() {
  return (
    <div>
      <Prose>POC phase is complete. The engine validates the core synchronization pattern end-to-end.</Prose>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        {[
          {
            label: '✓ Done (POC)', color: 'green',
            items: ['Config-driven sync engine', 'Unlimited nesting depth', 'Immutable context stack', 'Schema evolution (ALTER)', 'Startup validation gate', 'SqlHelper abstraction', '7 JUnit 5 tests passing', 'Zero external infrastructure'],
          },
          {
            label: '→ Next', color: 'blue',
            items: ['Choose target DB engine', 'Write production SqlHelper impl', 'Integrate into DAEMON2 scheduler', 'Add HTTP authentication support', 'Add pagination support'],
          },
          {
            label: 'Later', color: 'gray',
            items: ['Batch upsert for performance', 'Transaction management', 'Full-replace load strategy', 'Observability / metrics', 'Config UI / admin'],
          },
        ].map((col) => (
          <div key={col.label} className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
            <div className={`px-4 py-2.5 text-xs font-mono font-semibold border-b border-gray-700 ${
              col.color === 'green' ? 'bg-green-950/60 text-green-400 border-green-900' :
              col.color === 'blue'  ? 'bg-sky-950/60 text-sky-400 border-sky-900' :
                                     'bg-gray-750 text-gray-500'
            }`}>
              {col.label}
            </div>
            <ul className="p-3 space-y-1.5">
              {col.items.map((item) => (
                <li key={item} className="text-gray-400 text-xs flex items-start gap-2">
                  <span className="text-gray-600 mt-0.5">–</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <Callout color="blue" title="Key presentation talking point">
        The architectural insight is that adding a new API integration requires zero Java code.
        An operator inserts rows into WST_CONFIG and WST_OUTPUT_MAPPING, and the engine handles
        the rest — including creating the destination tables on first run.
      </Callout>
    </div>
  )
}

// ── SECTION RENDERER ──────────────────────────────────────────────────────────

function WS2TableContent({ section }) {
  switch (section) {
    case 'overview':   return <OverviewSection project={PROJECTS[0]} />
    case 'arch':       return <ArchSection />
    case 'config':     return <ConfigSection />
    case 'schema':     return <SchemaSection />
    case 'flow':       return <FlowSection />
    case 'context':    return <ContextSection />
    case 'decisions':  return <DecisionsSection />
    case 'tests':      return <TestsSection />
    case 'roadmap':    return <RoadmapSection />
    default:           return null
  }
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────

export default function MyProjects() {
  const [activeProject, setActiveProject] = useState('ws2table')
  const [activeSection, setActiveSection] = useState('overview')

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="w-52 shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col overflow-y-auto">
        <div className="px-4 pt-5 pb-3">
          <span className="text-xs font-mono font-semibold text-gray-500 uppercase tracking-wider">Projects</span>
        </div>
        <div className="px-2 pb-4 space-y-0.5">
          {PROJECTS.map((p) => (
            <button
              key={p.id}
              onClick={() => { setActiveProject(p.id); setActiveSection('overview') }}
              className={`w-full text-left px-3 py-2 rounded text-sm font-medium transition-colors ${
                activeProject === p.id
                  ? 'bg-gray-800 text-gray-100'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        <div className="px-4 pb-3 pt-2 border-t border-gray-800">
          <span className="text-xs font-mono font-semibold text-gray-500 uppercase tracking-wider">Sections</span>
        </div>
        <nav className="px-2 pb-4 space-y-0.5">
          {WS2TABLE_SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                activeSection === s.id
                  ? 'bg-sky-950 text-sky-300 border border-sky-900'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
              }`}
            >
              {s.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-8 py-6">
          <WS2TableContent section={activeSection} />
        </div>
      </main>
    </div>
  )
}
