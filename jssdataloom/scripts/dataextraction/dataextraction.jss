/*******************************************************************************
* dataextraction.jss
* Data Extraction For Inventory Transactions With Amounts
* Carlos Kassab
* 2026-October-26
********************************************************************************/

// REPL Mode is used to debug your script. Load it from REPL: 
// load(parameters[0] + "/scripts/dataextraction/dataextraction.jss")
// YES = Load script and prepare the environment for execution in REPL, without running extraction.
// NO  = Run the complete extraction.
var replMode = "NO" 

// Set Initial Script Parameters
var jssdataloomHome = parameters[1] != null ? parameters[1] : null

var scriptsPath = jssdataloomHome + "/scripts/" 
var xtractDirFullPath = scriptsPath + "dataextraction/"

var extractName = "Inventory Transactions"
var logFileName = xtractDirFullPath + "log/dataextraction.log"

// LOAD SCRIPTS CONFIG AND LIBRARIES
load( scriptsPath + "config.jss" )
load( scriptsPath + "lib/GeneralLibs.jss" )
load( xtractDirFullPath + "dataextractionqueries.jss" )

// Initialize field formatter, according to config file.
var formatField = utils.getFieldFormatter(config) 

utils.WriteLog( "*".repeat(80) + "\n", logFileName )
utils.WriteLog("*** START " + extractName + " Extract Script", logFileName )
utils.WriteLog( "*** Loading configurations, and " + extractName + " Query, Done.", logFileName )

print( "*** START " + extractName + " Extract Script\n" )
print( "*** Loading configurations, and " + extractName + " Query, Done." )

/* VALUES INITIALIZATION ***********************************************************************************************************/

/* Dynamic Filters File must have the next structure:
  datatable|Key Value 1|Key Value 2  |Key Value 3... it might be up to 6 possible index fields
  itemdata |ITM-01327  |MIG-ITM-01327|
*/
var filtersAndXref = indexer.loadListFromFile( xtractDirFullPath +'filtersandxref.txt' )
// Save the indexed data to inspect how it was indexed.
indexer.saveMapsToFile( filtersAndXref, xtractDirFullPath + 'filtersandxrefindexed.json' )

print("\nTesting filtersAndXref:")
if( indexer.existsIn(filtersAndXref, "itemdata", "ITM-02667") )
 print("Data validation itemdata|ITM-02667 exists")

print("\nXREF:")
var xrefValue = indexer.getXref(filtersAndXref, "itemdata", "ITM-02667")
if( xrefValue !== undefined )
  print("Data Xref itemdata|ITM-02667 (-> MIG-ITM-02667) -> " + xrefValue)

/* OUTPUT DATA FILES HEADER *********************************************/
var headerFields = [
                    "ItemCode",	"Warehouse", "Location", "TransactionDate",	"TransactionTime",
                    "TransactionAmount" 
                    //"TransactionAmount" // It is possible to comment this field line when field not needed
                   ]

// colsCount = number of header columns written to the output files. Counting starts at the leftmost query field.
// Extra columns maybe added at the rightmost query fields list for use in script logic (filtering, conditional field value operations).
var colsCount = headerFields.length
var fileHeader = headerFields.map( field => formatField(field) ).join( config.FIELDSEPARATOR )
  
// Data With No Xref will be written to this output file
var noXrefFile = xtractDirFullPath + "datafiles/NoXrefInventoryTransactions.txt"
var noXrefFileWriter = utils.getFileWriter( noXrefFile, "overwrite" )
noXrefFileWriter.write( fileHeader + "\n" )

//print("File Header:\n" + fileHeader + "\n") //debug print
//print("File Header COLUMNS COUNT:" + fileHeader.split("|").length + "\n") //debug print
//Java.type('java.lang.System').exit(1) // Kept here as reference on how to exit when debugging

// OPEN DATABASE CONNECTION, check GeneralLibs.jss for DB connections
var dbConn = utils.getDBConnection('sqlite', config.SQLITEPROD ) 

print("\nDatabase connection and noxref output file - ready.")

/* Use this code when testing data was loaded into the target DB:

  //var dbConnTEST = oracleDBConn(config.ORATESTSERVER) // ===>>>>>>>> TESTING YOUR DATA LOADED?
  // Get Loaded records from target DB
  //const loadedRecords = indexer.loadListFromQuery( dbConnTEST, loadedRecordsQuery ) // DataIndexer.jss
  //if( dbConnTEST ) try { dbConnTEST.close() } catch (e) { print( e ) } 
  //Java.type('java.lang.System').exit(1) // REPL mode?, will quit the REPL
*/

/* DATA EXTRACT FUNCTION **************************************************************************************************/
function dataXtract( sqlQuery ) {
  var recordsCount = 0, printedRows = 0, exportedRows = 0, noXrefRows = 0 // Init Stat Variables.

  try {
    var stmt = dbConn.prepareStatement( sqlQuery ) // Prepare and execute the SQL query.
    stmt.setFetchSize(10000)
    var resultSet = stmt.executeQuery()
    var resultSetMetaData = resultSet.getMetaData()
    colsCount = Math.min( resultSetMetaData.getColumnCount(), colsCount ) // Keep colsCount safe.
    var columnNames = Array.from({ length: colsCount }, (_, i) => resultSetMetaData.getColumnName(i + 1))

    var itemCodePosition = resultSet.findColumn("ItemCode") // For filters and/or xrefs, set item query field position once, ItemCode query column.

    // Read and process one query row at a time.
    while( resultSet.next() ) {
      recordsCount += 1
      if( 1 === 1 
          && indexer.existsIn( filtersAndXref, "itemdata", resultSet.getString(itemCodePosition) )
          //&& existsIn( filtersAndXref, "othertable", resultSet.getString(22) ) // Check Field Position in Query
          //&& !existsIn( loadedRecords, resultSet.getString(1), resultSet.getString(2), resultSet.getString(3) ) // it might be up to 6 possible index fields
        ) {
            printedRows += 1

            var itemXrefValue = indexer.getXref( filtersAndXref, "itemdata", resultSet.getString(itemCodePosition) )

            // Build the current output record, in this block of code you can apply field transformations.
            var outputFields = []
            for( var i = 0; i < colsCount; i++ )  {
              var colName = columnNames[i], fieldValue = resultSet.getString(i + 1) || ""

              // *** Apply data transformations and additional logic to each Query field here.
              if( colName === "Warehouse" ) fieldValue = "MIG-" + fieldValue
              if( colName === "ItemCode" ) fieldValue = itemXrefValue.trim()

              outputFields.push( formatField(fieldValue) )
            }
            var outputRecord = outputFields.join( config.FIELDSEPARATOR ) + "\n"

            // WRITE TO OUTPUT FILES
            if( 1 === 1 // Logic for easy xref validation commenting
                && itemXrefValue !== undefined
                // && More xrefs?, add it here.
              ) {
                fileWriter.write(outputRecord)
                exportedRows++
              } else {
                noXrefFileWriter.write(outputRecord)
                noXrefRows++
              }
          }
    }

  } finally {
    if( resultSet ) try { resultSet.close() } catch(e) {}
    if( stmt ) try { stmt.close()} catch (e) { print( e ) }
  }

  // LOG EXTRACTION SUMMARY
    var extractionSummary = "DONE " + extractName + " Data Extraction, " + "Records Read: " + recordsCount + 
                            ", Records After Filters: " + printedRows + ", Output File Records: " + exportedRows + ", NO Xref Records: " + noXrefRows
    utils.WriteLog(extractionSummary, logFileName)
    print(extractionSummary)  
}


/* MAIN PROCESSING SECTION ********************************************************************************************************/

/* RUN A DATA EXTRACT *************************************************************************************************************/
if( replMode !== "YES" ) { // Not REPL mode?, run your data extraction as command line script

  // Output File Setup
  var outputFile = xtractDirFullPath + "datafiles/InventoryTransactions.csv"
  var fileWriter = utils.getFileWriter( outputFile, "overwrite" )
  
  fileWriter.write( fileHeader + "\n" ) // Write file header to output file

  utils.WriteLog( "*** RUNNING " + extractName + " Data Extraction.\n", logFileName )
  print( "\n\n*** RUNNING " + extractName + " Data Extraction.\n" )
  utils.WriteLog( "Query to get Data For " + extractName + ":\n" + dataExtractionQuery + "\n", logFileName )

  dataXtract( dataExtractionQuery ) // Exec query, data transformations, write to files

  utils.WriteLog( "Closing DB Connections And Files.\n", logFileName )
  print( "\nClosing DB Connections And Files.\n" )

  fileWriter.close() // Close output data file

  //Have other sql queries? maybe different output file? but the same data extract structure, same filters, same header, similar validations, add them here.

  // Closing db here, after all data extracts.
  if( dbConn ) try { dbConn.close() } catch (e) { print( e ) } 

  noXrefFileWriter.close()

  utils.WriteLog( "*** END " + extractName + " Extract Script \n", logFileName )
  print( "*** END " + extractName + " Extract Script\n" )

} else {
 // REPL mode?, to quit the REPL -> :q <enter>
  print("\n*** REPL MODE READY ***")
  print("After using the REPL, SET line: var replMode = \"NO\" ")
  print("Now you can run your MAIN data extraction script instructions step by step.")
  print("If you change anything in your script(Instructions, Query, etc.), reload your full script.")
  print("Type a variable name from your loaded scripts, to see its value.")
  print("Before exit the REPL, Remember to close your files and database connections.\n")
}

