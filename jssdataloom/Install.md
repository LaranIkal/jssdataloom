# Data Extraction Easy With jssdataloom

Many companies do data extraction to CSV(comma or pipe separated) files, because they have tools to import data.

Here we want to show a way to extract data using JSS(https://github.com/LaranIkal/jss) and Java JDBC libraries.

Let's begin with the installation:


### Download jssdataloom latest release from github: https://github.com/LaranIkal/jssdataloom
 or from github green -Code- button, download zip.

### Download And Install Java from graalvm(https://www.graalvm.org/), Go to https://github.com/graalvm/graalvm-ce-builds/releases/.
  Minumum GraalVM Java JDK version Needed : graalvm-community-25.4.4.1.1+1.1

On Linux: Open graalvm-community-jdk-25i4-25.0.4.1.1_linux-x64_bin.tar.gz
On Windows: Open graalvm-community-jdk-25i4-25.0.4.1.1_windows-x64_bin.zip

Extract folder graalvm-community-25.4.4.1.1+1.1 inside folder $HOME/Apps on Linux or C:\Apps on Windows. 

You will have this folder $HOME/Apps/graalvm-community-25.4.4.1.1+1.1 or C:\Apps\graalvm-community-25.4.4.1.1+1.1

To keep the path short, rename folder:

graalvm-community-25.4.4.1.1+1.1 to graalvmjdk25, so you will have:

$HOME/Apps/graalvmjdk25 or C:\Apps\graalvmjdk25

***Note***. Optional - You may install https://adoptium.net/ JDK 25 LTS(Tested version: jdk-25.0.5+8).
To be according the JDK installation, install JDK in $HOME/Apps/graalvmjdk25 or C:\Apps\graalvmjdk25
  - ** Paths as mentioned, are needed to run the scripts. Avoiding path variable config, some systems don't allow it. **

### Extract the script engine and scripts: - folder jssdataloom - to $HOME/Apps on Linux or C:\Apps on Windows

You must have folder: $HOME/Apps/jssdataloom or C:\Apps\jssdataloom

Now you can run the batch files inside $HOME/Apps/jssdataloom or C:\Apps\jssdataloom folder.

Shell and Batch files are in folder jssdataloom/runscripts



## Folders structure:
```markdown
📁 jssdataloom (JavaScript PolyglotContext shell), this is the root folder.
├── jss-1.2.jar
├──📁 runscripts
|  ├── cleanfile.bat            # Starts utils/cleanfile.jss on Windows
|  ├── cleanfile.sh             # Starts utils/cleanfile.jss on Linux
|  ├── dataextraction.bat       # Linux Shell to start the extract JavaScript script
|  ├── dataextraction.sh        # Windows Batch to start the extract JavaScript script
|  ├── getjarlib.bat            # Starts utils/getjarlib.jss on Windows
|  └── getjarlib.sh             # Starts utils/getjarlib.jss on Linux
└──📁 scripts
   ├── config.jss               # Global configuration
   ├──📁 lib
   │  ├── GeneralLibs.jss            # Entry point — loads all libs + utility functions
   │  ├── DataBaseConnections.jss    # utils.getDBConnection()
   │  └── DataIndexer.jss            # indexer.* functions
   ├──📁 dataextraction
   │  ├── dataextraction.jss         # Main extraction script
   │  ├── dataextractionqueries.jss  # SQL queries
   │  ├── filtersandxref.txt         # Filter/Xref data (pipe-delimited)
   │  ├── filtersandxrefindexed.json # (generated) Indexed structure for debugging
   │  ├──📁 datafiles
   │  │  ├── InventoryTransactions.csv   # (generated) Output with xref applied
   │  │  └── NoXrefInventoryTransactions.txt  # (generated) Rows that failed xref
   │  ├──📁 docs
   │  │  └── Data Extraction Layout And Description.xlsx
   │  └──📁 log
   │     └── dataextraction.log
   └──📁 utils
      ├── cleanfile.jss # Reads an input file and cleans all non printing characters.
      └── getjarlib.jss # Helps you to download all the Java JDBC libraries needed.

```




