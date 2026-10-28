# Data Extraction Easy With jss

Many companies do data extraction to CSV(comma or pipe separated) files, because they have tools to import data.

Here we want to show a way to extract data using JSS(https://github.com/LaranIkal/jss) and Java JDBC libraries. Of course, you need Java :)

Let's begin with the installation:

- Install Java from graalvm(https://www.graalvm.org/), Go to https://github.com/graalvm/graalvm-ce-builds/releases/.
  Minumum Java JDK version Needed : graalvm-community-25.4.4.1.1+1.1

On Linux: Open graalvm-community-jdk-25i4-25.0.4.1.1_linux-x64_bin.tar.gz
On Windows: Open graalvm-community-jdk-25i4-25.0.4.1.1_windows-x64_bin.zip

Extract folder graalvm-community-25.4.4.1.1+1.1 inside folder $HOME/Apps on Linux or C:\Apps on Windows. 

You will have this folder $HOME/Apps/graalvm-community-25.4.4.1.1+1.1 or C:\Apps\graalvm-community-25.4.4.1.1+1.1

To keep the path short, rename folder:

graalvm-community-25.4.4.1.1+1.1 to graalvmjdk25, so you will have:

$HOME/Apps/graalvmjdk25 or C:\Apps\graalvmjdk25


Extract the script engine and scripts, folder jss to $HOME/Apps on Linux or C:\Apps on Windows

You must have folder: $HOME/Apps/jss or C:\Apps\jss

Now you can run the batch files inside $HOME/Apps/jss or C:\Apps\jss folder.

Shell and Batch files are in folder jss/runscripts



Folders structure:

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






