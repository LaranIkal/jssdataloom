## Working with the jssrepl

## 1. Start the jssrepl

### Linux, Open a terminal window in $HOME/Apps/jssdataloom/runscripts, and run: `./jssrepl.sh`

### Windows, Open a terminal window in C:\Apps\jssdataloom\runscripts, and run: `jssrepl.bat`

The launcher starts Java with the right options and classpath.

| Option | Purpose |
|---|---|
| `--enable-native-access=ALL-UNNAMED` | Allows JLine and GraalVM to use native access without warnings |
| `--sun-misc-unsafe-memory-access=allow` | Allows libraries that still use `sun.misc.Unsafe` memory access on newer JDKs |
| `-Dpolyglot.engine.WarnInterpreterOnly=false` | Hides the "interpreter only" performance warning |
| `-cp jssrepl.jar:jarlib/*` | Puts the shell and all libraries on the classpath |
| `JsRepl` | The main class |




**Work with the interactive shell**

After starting the REPL, you should see the banner and the `js>` prompt:

```text
/...jssdataloom/runscripts$ ./jssrepl.sh 
The parameter is a directory, maybe jssrepl home?: /home/you/Apps/jssrepl
To run a jss file do: load <path-to-jss-file>
jss - GraalVM JavaScript Polyglot Context interactive shell
Type JavaScript to evaluate it, or :help for commands.
Left/Right arrows edit the line; Up/Down browse the last 6 commands.
To see parameters when you ran jssrepl, type:parameters, it is a JavaScript array you can use.
jssrepl home directory is stored in parameters array.
js> 

...
js>
js> parameters
[
  "/home/you/Apps/jssdataloom",
  "/home/you/Apps/jssdataloom"
]
js> 

```

Try a few lines:

```text
js> 6 * 7
42
js> "hello".toUpperCase()
"HELLO"
js> parameters[0]
"/home/you/Apps/jssdataloom"
js> :quit
```

`parameters[0]` shows the folder that contains `jssrepl.jar`, which confirms the launcher is using the right jar.

**Loading a library file from your jssrepl**

Using a text editor, create file `hello.jss` save it to your jssrepl/scripts folder, load it and call the function - hello("YourName"):

```javascript
function hello(name) { return "Hello, " + name + "!" }
```

Start your jssrepl and load your `hello.jss`:

```text
js> load(parameters[0] + '/scripts/hello.jss')
...
js> hello("YourName")
"Hello, YourName!"
```

- Edit script: "/scripts/dataextraction/dataextraction.jss", and set var replMode = "YES"
- Load the script, type:load(parameters[0] + "/scripts/dataextraction/dataextraction.jss")
```text
js> load(parameters[0] + "/scripts/dataextraction/dataextraction.jss")
*** START Inventory Transactions Extract Script

*** Loading configurations, and Inventory Transactions Query, Done.

Testing filtersAndXref:
Data validation itemdata|ITM-02667 exists

XREF:
Data Xref itemdata|ITM-02667 (-> MIG-ITM-02667) -> MIG-ITM-02667

Database connection and noxref output file - ready.

*** REPL MODE READY ***
After using the REPL, COMMENT line: var replMode = "YES" 
Now you can run your MAIN data extraction script instructions step by step.
If you change anything in your script(Instructions, Query, etc.), reload your full script.
Type a variable name from your loaded scripts, to see its value.
Before exit the REPL, Remember to close your files and database connections.
js>
```

- Type a variable name from your loaded scripts, to check its value, ex:
```text
js> extractName
"Inventory Transactions"
js> headerFields
[
  "ItemCode",
  "Warehouse",
  "Location",
  "TransactionDate",
  "TransactionTime",
  "TransactionAmount"
]
js> 

```

- This same way, you can check and print your data extraction query:
```text
js> dataExtractionQuery
"\nSELECT a.ItemCode, a.Warehouse, a.Location, \n       STRFTIME('%m/%d/%Y', a.TransactionDate) AS TransactionDate,\n       TIME(a.TransactionDate) AS TransactionTime,\n       CAST(a.Quantity * b.Price *10000 AS INTEGER)/10000.0 AS TransactionAmount -- Same behavior as Oracle's TRUNC(x,4)\nFROM InventoryTransactions a\n  JOIN ItemPrices b\n    ON a.ItemCode = b.ItemCode \nWHERE TransactionAmount > 0\n"
js> print(dataExtractionQuery)

SELECT a.ItemCode, a.Warehouse, a.Location, 
       STRFTIME('%m/%d/%Y', a.TransactionDate) AS TransactionDate,
       TIME(a.TransactionDate) AS TransactionTime,
       CAST(a.Quantity * b.Price *10000 AS INTEGER)/10000.0 AS TransactionAmount -- Same behavior as Oracle's TRUNC(x,4)
FROM InventoryTransactions a
  JOIN ItemPrices b
    ON a.ItemCode = b.ItemCode 
WHERE TransactionAmount > 0

```

- You can run your functions:
```text
js> utils.GetNumericDateTime()
"20261106113123"
js>
```

- You can check how the fields are formatted, run and print function:
```text
js> formatField("MyItemCode")
"\"MyItemCode\""
js> print(formatField("MyItemCode"))
"MyItemCode"
js>
```

- To exit the REPL, just type:
```text
js> :q

Bye.
```

- For additional information on the jssrepl, please go to:https://github.com/LaranIkal/jssrepl


---

## 6. Troubleshooting

| Problem | Cause and fix |
|---|---|
| `java: command not found` or `'java' is not recognized` | `JAVA_HOME` or `PATH` is not set, or you did not open a new terminal. Redo section 2 |
| `java -version` does not mention GraalVM or shows a version below 25 | Another JDK is first in `PATH`. Move `$JAVA_HOME/bin` (Linux) or `%JAVA_HOME%\bin` (Windows) to the front |
| `UnsupportedClassVersionError` | The JDK running jssrepl is older than the one that built it. Use GraalVM JDK 25 or newer |
| `jss: no jssrepl jar found at ...` | `jssrepl.jar` is not where `JSSREPL_HOME` points. Copy it there (section 3) or fix `JSSREPL_HOME` in the launcher |
| `Error: Could not find or load main class JsRepl` | The jar does not contain the class. Run `jar tf jssrepl.jar` and look for `JsRepl.class`. If missing, rebuild using `Buildingjssrepl.md` |
| `NoClassDefFoundError: org/graalvm/polyglot/...` or `org/jline/...` | The `jarlib` folder is missing or incomplete. Copy the full folder next to `jssrepl.jar` |
| `No language and polyglot implementation was found` | The GraalJS jars are missing from `jarlib`. Rebuild the library folder using `Buildingjssrepl.md`, section 3 |
| `WARNING: A restricted method ... has been called` | The `--enable-native-access=ALL-UNNAMED` option is missing from your launcher. Use the scripts in section 4 exactly |
| Arrow keys print `^[[A` instead of recalling history | The terminal is not detected as a real terminal. Run jss from a normal terminal window, not from an IDE console or a pipe. On Windows, use Windows Terminal or PowerShell |
| `Permission denied` when running `jssrepl.sh` | Run `chmod +x ~/Apps/jssrepl/jssrepl.sh` |
| `jssrepl: command not found` (Linux) | `~/.local/bin` is not in `PATH`, or you did not run `source ~/.bashrc` |
| `'jssrepl' is not recognized` (Windows) | The jssrepl folder is not in `Path`, or the terminal was opened before you changed it. Open a new terminal |
