/*******************************************************************************
* dataextraction.jss
* Data Extraction For Inventory Transactions With Amounts
* Carlos Kassab
* 2026-October-26
********************************************************************************/

// Set Initial Script Parameters
var scriptsPath = parameters[1] != null ? parameters[1] + "/scripts/" : null
var xtractDirName = 'dataextraction'
var extractName = "Inventory Transactions"
var logFileName = scriptsPath + xtractDirName + "/log/dataextraction.log"

// LOAD SCRIPTS CONFIG AND LIBRARIES
load( scriptsPath + "config.jss" )
load( scriptsPath + "lib/GeneralLibs.jss" )
load( scriptsPath + xtractDirName + "/dataextractionqueries.jss" )

utils.WriteLog( "*".repeat(80) + "\n", logFileName )
utils.WriteLog("*** START " + extractName + " Extract Script", logFileName )
print( "*** START " + extractName + " Extract Script\n" )
utils.WriteLog( "*** Loading configurations, and " + extractName + " Query, Done.", logFileName )
print( "*** Loading configurations, and " + extractName + " Query, Done." )


/* VALUES INITIALIZATION***********************************************************************************************************/

/* Dynamic Filters File must have the next structure:
  datatable|Key Value 1|Key Value 2  |Key Value 3... it might be up to 6 possible index fields
  itemdata |ITM-01327  |MIG-ITM-01327|
*/
var filtersAndXref = indexer.loadListFromFile( scriptsPath + xtractDirName +'/filtersandxref.txt' )
indexer.saveMapsToFile(filtersAndXref, scriptsPath + xtractDirName + '/filtersandxrefindexed.json') // To see how data was indexed.

print("Testing filtersAndXref:")
if( indexer.existsIn(filtersAndXref, "itemdata", "ITM-02667") )
 print("Data validation itemdata|ITM-02667 exists")

print("\nXREF:")
var xrefValue = indexer.getXref(filtersAndXref, "itemdata", "ITM-02667")
if( xrefValue !== undefined )
  print("Data Xref itemdata|ITM-02667 (-> MIG-ITM-02667) -> " + xrefValue)

/* Output Data Files Header *********************************************/
var headerFields = [
                    "ItemCode",	"Warehouse", "Location", "TransactionDate",	"TransactionTime",
                    "TransactionAmount" 
                    //"TransactionAmount" // It is possible to comment this field line when field not needed
                   ]

var colsCount = headerFields.length // It is header columns based for output columns, additional columns maybe added at the end of the query fields.
var fileHeader = headerFields.map( field => config.FIELDENCLOSING + field + config.FIELDENCLOSING).join(config.FIELDSEPARATOR);

// Data With No Xref will be in this file
var noXrefFile = `${scriptsPath}${xtractDirName}/datafiles/NoXrefInventoryTransactions.txt`
var noXrefFileWriter = utils.getFileWriter( noXrefFile, "overwrite" )
noXrefFileWriter.write( fileHeader + "\n" )

// For filters and/or xrefs, we need these values for this data extraction:
var itemCodePosition = headerFields.indexOf("ItemCode") + 1 // JavaScript Starts With 0, The resultset Starts With 1, same field name and position must be in queries.

//print("File Header:\n" + fileHeader + "\n") //debug print
//print("File Header COLUMNS COUNT:" + fileHeader.split("|").length + "\n") //debug print
//Java.type('java.lang.System').exit(1) // Kept here as reference on how to exit when debugging

var dbConn = utils.getDBConnection('sqlite', config.SQLITEPROD ) // OPEN DATABASE CONNECTION
// Connections scripts already in GeneralLibs.jss: 'Oracle', 'PostgreSQL', 'sqlite'


/* Use this code when testing data was loaded into the target DB

  //var dbConnTEST = oracleDBConn(config.ORATESTSERVER) // ===>>>>>>>> TESTING ONLY, COMMENT IT FOR PRODUCTION
  // Get Loaded records from target company
  //const loadedRecords = loadListFromQuery( dbConn, loadedRecordsQuery ) // SET CORRECT DBCONN BEFORE RUNNING
  //if( dbConnTEST ) try { dbConnTEST.close() } catch (e) { print( e ) } // ===>>>>>>>> TESTING ONLY, COMMENT IT FOR PRODUCTION
  //Java.type('java.lang.System').exit(1)

*/


/* DATA EXTRACT FUNCTION **************************************************************************************************/
function dataXtract( sqlQuery ) {
  var recordsCount = 0
  var printedRows = 0
  try {
    var stmt = dbConn.prepareStatement( sqlQuery )
    stmt.setFetchSize(10000)
    var resultSet = stmt.executeQuery()
    var resultSetMetaData = resultSet.getMetaData()

    while( resultSet.next() ) {
      recordsCount += 1
      if( 1 === 1 
          && indexer.existsIn( filtersAndXref, "itemdata", resultSet.getString(itemCodePosition) )
          //&& existsIn( filtersAndXref, "othertable", resultSet.getString(22) ) // Check Field Position in Query
        ) {
        printedRows += 1

        const xrefValue = indexer.getXref( filtersAndXref, "itemdata", resultSet.getString(itemCodePosition) )
        if( 1 === 1  // Pending to set for GRNI, keeping logic for reuse
            && xrefValue !== undefined 
          ) {
          fileWriter.write( Array.from({ length: colsCount }, (_, i) => {
              let colName = resultSetMetaData.getColumnName(i + 1)
              let fieldValue = resultSet.getString(i + 1)
              if( fieldValue === null ) return ""

              if( colName === "Warehouse" ) fieldValue = "MIG-" + fieldValue
              if( colName === "ItemCode" ) fieldValue = xrefValue

              if( config.FIELDENCLOSING === "" ) {
                let esc = config.FIELDSEPARATOR.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                let re = new RegExp(esc, 'g')
                fieldValue = fieldValue.trim().replace(re, "") // Field Separator must not be part of data fields content.
                return fieldValue
              } else {
                const escEnclosing = config.FIELDENCLOSING.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                // If field enclosing char is part of data field content, escape the enclosing char by doubling it
                fieldValue = fieldValue.trim().replace(new RegExp(escEnclosing, 'g'), config.FIELDENCLOSING + config.FIELDENCLOSING)
                return config.FIELDENCLOSING + fieldValue + config.FIELDENCLOSING
              }
          }).join(config.FIELDSEPARATOR) + "\n")
        } else {
          noXrefFileWriter.write( Array.from({ length: colsCount }, (_, i) => resultSet.getString(i + 1)).join("|")  )
        }
      }
    }

  } finally {
    if( resultSet ) try { resultSet.close() } catch(e) {}
    if( stmt ) try { stmt.close()} catch (e) { print( e ) }
  }

  utils.WriteLog("DONE " + extractName + " Data Extraction, Records Extracted:" + recordsCount + ", Printed Records After Filters:" + printedRows, logFileName )
  print( "DONE " + extractName + " Data Extraction, Records Extracted:" + recordsCount + ", Printed Records After Filters:" + printedRows )
}



/* MAIN PROCESSING SECTION ********************************************************************************************************/

/* DATA EXTRACT********************************************************************************************************************/
// Output File Setup
var outputFile = `${scriptsPath}${xtractDirName}/datafiles/InventoryTransactions.csv`
var fileWriter = utils.getFileWriter( outputFile, "overwrite" )
// Write file header to data file
fileWriter.write( fileHeader + "\n" )

utils.WriteLog( "*** RUNNING " + extractName + " Data Extraction.\n", logFileName )
print( "\n\n*** RUNNING " + extractName + " Data Extraction.\n" )
utils.WriteLog( "Query to get Data For " + extractName + ":\n" + dataExtractionQuery + "\n", logFileName )
dataXtract( dataExtractionQuery )
utils.WriteLog( "Closing DB Connections And Files.\n", logFileName )
print( "\nClosing DB Connections And Files.\n" )

fileWriter.close() // Close output data file


// When having other queries in the same data extract, same header, similar validations, add them here

// Close db connection and file writers.
// Closing db here, after all data extracts. Sometimes they want more than 1 file from the same process, just different queries.
if( dbConn ) try { dbConn.close() } catch (e) { print( e ) } 

noXrefFileWriter.close()

utils.WriteLog( "*** END " + extractName + " Extract Script \n", logFileName )
print( "*** END " + extractName + " Extract Script\n" )

