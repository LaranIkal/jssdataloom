# jssdataloom

GraalVM polyglot data extraction — weaves DB queries, filter rules, and xref mappings into clean output files.

## What it does

Takes database rows, filter rules, and cross-reference mappings, and weaves them into a single structured output. 
No build step, no framework — just `.jss` scripts with full JDBC access.

## Key features

- **Polyglot context** — plain JavaScript with native Java/JDBC access via GraalVM
  - jssdataloom uses the compiled Polyglot context JavaScript Shell: https://github.com/LaranIkal/jss
- **Indexed filtering** — up to 6-column lookup keys, built in-memory from files or queries
- **Cross-referencing** — map source values to target values (e.g. `ITM-001` → `MIG-ITM-001`)
- **Multi-DB** — Oracle, PostgreSQL, SQLite
- **RFC 4180 output** — configurable separator and enclosing char, auto-escaped
- **NoXref capture** — rows that pass the filter but have no xref match are saved separately

## Requirements

- GraalVM JDK 25+(Minimum JDK version:graalvm-community-25.4.4.1.1+1.1) (Community Edition works)
- JDBC drivers on classpath (Oracle, PostgreSQL, SQLite, etc.)

## Creating a new data extraction
- See CREATE_NEW_EXTRACTION_SCRIPT.pdf

## Quick start using shell and batch files

## Project Structure:
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
