## `README.md`

```markdown
# Data Extraction Scripts General Description
```
**Carlos Kassab**
**2026-October-27**

Data extraction framework using GraalVM Polyglot Context (GraalJS + Java).

## Architecture

```
📁 jss (JavaScript PolyglotContext shell), this is the root folder.
├── jss-1.2.jar
├──📁runscripts
|  ├── cleanfile.bat            # Starts utils/cleanfile.jss on Windows
|  ├── cleanfile.sh             # Starts utils/cleanfile.jss on Linux
|  ├── dataextraction.bat       # Shell file for Linux to start the extract JavaScript script
|  ├── dataextraction.sh        # Batch file for Windows to start the extract JavaScript script
|  ├── getjarlib.bat            # Starts utils/getjarlib.jss on Windows
|  └── getjarlib.sh             # Starts utils/getjarlib.jss on Linux
└──📁scripts
   ├── config.jss                    # Global configuration
   ├──📁lib
   │  ├── GeneralLibs.jss           # Entry point — loads all libs + utility functions
   │  ├── DataBaseConnections.jss   # utils.getDBConnection()
   │  └── DataIndexer.jss           # indexer.* functions
   ├──📁dataextraction
   │  ├── dataextraction.jss        # Main extraction script
   │  ├── dataextractionqueries.jss # SQL queries
   │  ├── filtersandxref.txt        # Filter/Xref data (pipe-delimited)
   │  ├── filtersandxrefindexed.json# (generated) Indexed structure for debugging
   │  ├──📁datafiles
   │  │  ├── InventoryTransactions.csv   # (generated) Output with xref applied
   │  │  └── NoXrefInventoryTransactions.txt  # (generated) Rows that failed xref
   │  ├──📁docs
   │  │  └── Data Extraction Layout And Description.xlsx
   │  └──📁log
   │     └── dataextraction.log
   └──📁utils
      ├── cleanfile.jss # Reads an input file and cleans all non printing characters.
      └── getjarlib.jss # This script helps you to download all the Java JDBC libraries needed.
```

---

## How to Run

```bash
Check your jss/runscripts directory for samples
```

`parameters[1]` = scripts path (e.g. `scripts/`).

---

## Configuration (`config.jss`)

| Key | Description | Example |
|-----|-------------|---------|
| `FIELDSEPARATOR` | Delimiter for output files | `\|` |
| `FIELDENCLOSING` | Enclosing char for fields (empty = none) | `"` |
| `SQLITEPROD` | Path to SQLite production DB | `./data/prod.db` |
| `ORASERVER` / `ORAPORT` / `DBNAME` / `DBUSER` / `DBPASS` | Oracle connection | — |
| `PSQLDBSERVER` / `PSQLDBPORT` / `PSQLDBNAME` / `PSQLDBUSER` / `PSQLDBPASS` | PostgreSQL connection | — |

---

## Libraries

### `utils` (from `GeneralLibs.jss` + `DataBaseConnections.jss`)

| Function | Description |
|----------|-------------|
| `utils.getDBConnection(dbType, dbConfig)` | Returns a JDBC `Connection`. Supports `'Oracle'`, `'PostgreSQL'`, `'sqlite'` |
| `utils.getFileWriter(filePath, mode)` | Returns a `FileWriter`. Mode: `"overwrite"` or `"append"` |
| `utils.getNumericDateTime()` | Returns `YYYYMMDDHHmmss` in local timezone |
| `utils.writeLog(text, fileName)` | Appends timestamped line to log file |

### `indexer` (from `DataIndexer.jss`)

| Function | Description |
|----------|-------------|
| `indexer.buildIndexedList(lines)` | Builds a `Map` with indexed keys (up to 6 columns) + data rows (`R#n`) |
| `indexer.loadListFromFile(filePath)` | Reads a pipe-delimited file, returns indexed Map. Checks heap size first. |
| `indexer.loadListFromQuery(dbConn, sqlQuery)` | Reads pipe-delimited rows from a DB query, returns indexed Map. |
| `indexer.existsIn(map, ...values)` | Returns `true` if the key (1–6 fields) exists in the index |
| `indexer.getXref(map, ...values)` | Returns the value at position `values.length` in the first matching row |
| `indexer.getData(map, ...values)` | Returns all data rows matching the prefix |
| `indexer.getRecordIds(map, ...values)` | Returns array of `R#n` record IDs for the key |
| `indexer.saveMapsToFile(map, filePath)` | Serializes Map to JSON (for debugging) |
| `indexer.loadMapsFromFile(filePath)` | Deserializes JSON back to Map |

---

## Filter / Xref File Format (`filtersandxref.txt`)

Pipe-delimited, up to 6 index columns. The **last column** is the xref value.

```
datatable|Key1|Key2|Key3...
itemdata |ITM-01327|MIG-ITM-01327|
itemdata |ITM-02667|MIG-ITM-02667|
```

- **Index fields**: columns 1–N (max 6), used for lookup via `existsIn` / `getXref`
- **Xref value**: the column at position `values.length` (i.e., one past the last lookup field)

Example: `indexer.getXref(map, "itemdata", "ITM-02667")` → `"MIG-ITM-02667"`

---

## Main Script Flow (`dataextraction.jss`)

1. **Load** config, libraries, and query
2. **Build index** from `filtersandxref.txt`
3. **Open** DB connection via `utils.getDBConnection()`
4. **Set up** output files (header + writers)
5. **Execute** `dataXtract(sqlQuery)`:
   - For each row in result set:
     - Check filter: `indexer.existsIn(filtersAndXref, "itemdata", itemCode)`
     - If passes → get xref: `indexer.getXref(...)` → write to main output with field formatting
     - If xref missing → write to `NoXref` file
6. **Close** all connections and file writers
7. **Log** summary

---

## Field Formatting Rules

When writing output rows:

| Condition | Action |
|-----------|--------|
| `FIELDENCLOSING` is empty | Strip `FIELDSEPARATOR` from value, write raw |
| `FIELDENCLOSING` is set | Double any `FIELDENCLOSING` chars inside value (RFC 4180), wrap with enclosing chars |
| `colName === "Warehouse"` | Prefix with `"MIG-"` |
| `colName === "ItemCode"` | Replace with xref value |

---

## Adding a New Extraction

1. Create folder: `scripts/<name>/`
2. Create `<name>queries.jss` with your SQL
3. Create `<name>.jss` (copy `dataextraction.jss` as template)
4. Add `filtersandxref.txt` if filtering/xref is needed
5. Update `headerFields` array to match your query columns
6. Adjust filter/xref logic in `dataXtract()` as needed

---

## Debugging Tips

- `indexer.saveMapsToFile(map, "debug.json")` — inspect the indexed structure
- `Java.type('java.lang.System').exit(1)` — force exit during debugging
- Log file: `scripts/<name>/log/<name>.log`
- `NoXref` file captures rows that passed the filter but had no xref match
```

Save this as `README.md` in your scripts root. Want me to adjust anything — add a section, change the tone, or split it into separate docs per library?


