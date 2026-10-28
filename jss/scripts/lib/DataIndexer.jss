/*******************************************************************************
* DataIndexer.jss
* Functions to load a dynamic filter and xref file and create indexes without duplicating Data
* 
* Carlos Kassab
* 2026-October-27
********************************************************************************/

// indexes point to the unique ID
// See sample of usage at the on of this file

var indexer = indexer || {}

indexer.buildIndexedList = function(lines) {
  const records = new Map()

  var recordId = 0
  for( const lineString of lines) {
    const line = lineString.trim()   

    if( !line ) continue
    
    const values = line.split('|').map(value => value.trim())
    recordId += 1
    let recordKey = "R#" + String(recordId)

    records.set( recordKey, values ) // Creates data row, keys[0] is the data row record key

    // Actual index might be up to 6 columns, starting from the first left column
    // increment it if more index fields needed
    const depth = Math.min( values.length, 6 ) 
    let key = ""
    for( let i = 0; i < depth; i++ ) { // Building the index keys
      key = ( i === 0 ? values[0] : key + "|" + values[i] ) // Concatenate Index columns, using ternary expression for simplicity.

      const ids = records.get(key)
      if( ids === undefined )
        records.set( key, recordKey ) // Index with 1 field: plain string, no array
      else if( typeof ids === "string" ) // Index with more than one field: now it becomes an array
        records.set( key, [ ids, recordKey ] )
      else
        ids.push( recordKey ) // Index with 3 and more fields: add to the array
    }

  }

  return records
}


indexer.loadListFromFile = function(filePath) {
  const Runtime = Java.type("java.lang.Runtime")
  const Files   = Java.type("java.nio.file.Files")
  const Paths   = Java.type("java.nio.file.Paths")

  const heapMB = Runtime.getRuntime().maxMemory() / 1048576
  const fileMB = Files.size(Paths.get(filePath)) / 1048576

  if (heapMB <= fileMB) {
    print("File Size Must be Less Than Heap Memory Size.")
    print("Max heap MB: " + heapMB)
    print("File MB: " + fileMB + "\n\n")
    return null
  }

  const lines = Files.readAllLines(Paths.get(filePath))
  return indexer.buildIndexedList(lines)
}


/*
sqlQuery must be this way(Oracle Query Example)):
const sqlQuery = "SELECT NVL(col1,'') || '|' || NVL(col2,'') || '|' || NVL(col3,'')  AS combined FROM your_table WHERE ..."
*/
indexer.loadListFromQuery = function( dbConn, sqlQuery ) {

  const statement = dbConn.prepareStatement( sqlQuery )
  statement.setFetchSize(5000)   // fewer network round-trips for large result sets
  const resultSet = statement.executeQuery()

  const lines = []
  try {
    while( resultSet.next() ) {
      const line = resultSet.getString(1)
      if( line !== null ) lines.push( line )
    }
  } finally {
    resultSet.close()
    statement.close()
  }

  return indexer.buildIndexedList( lines )
}


indexer.saveMapsToFile = function(listMap, filePath) {
  const entriesArray = Array.from(listMap.entries())

  const lines = []
  let currentLine = []

  for( const entry of entriesArray ) {
    if( entry[0].startsWith("R#") && currentLine.length > 0 ) {
      lines.push(currentLine.join(","))
      currentLine = []
    }
    currentLine.push(JSON.stringify(entry));
  }
  if( currentLine.length > 0 ) {
    lines.push(currentLine.join(","))
  }

  const jsonString = "[\n" + lines.join(",\n") + "\n]"

  const path = java.nio.file.Paths.get(filePath)
  java.nio.file.Files.write(path, java.util.Collections.singletonList(jsonString))
}   


indexer.loadMapsFromFile = function(filePath) {
  const jsonString = java.nio.file.Files.readString(java.nio.file.Paths.get(filePath))
  const entriesArray = JSON.parse(jsonString)
  return new Map(entriesArray)
}   



indexer.getRecordIds = function(listMap, ...values) {
  const key = values.filter(v => v !== undefined).map(v => String(v).trim()).join("|")
  const ids = listMap.get(key)
  if (ids === undefined) return undefined
  return typeof ids === "string" ? [ids] : ids
}   


indexer.existsIn = function(listMap, ...values) {
  const key = values.filter(v => v !== undefined).map(v => String(v).trim()).join("|")
  return listMap.has(key)
}   


indexer.getXref = function(listMap, ...values) {
  const xrefValPosition = values.length
  const uniqueIds = indexer.getRecordIds( listMap, ...values ) // One index may point to more than one data row.

  if ( !uniqueIds || uniqueIds.length === 0 )
    return undefined

  const row = listMap.get( uniqueIds[0] )  // Bring only the first data row, first record ID, uniqueIds[0]

  if( !row || row.length === 0 )
    return undefined

  return row[xrefValPosition]
}


/**
 * Returns an array of rows (each row is an array of column strings)
 * for every record matching the given prefix, or undefined if none.
 *
 * getData(map, "A")           -> all rows whose 1st column is "A"
 * getData(map, "A", "B")      -> all rows starting with A|B
 * getData(map, "A", "B", "C") -> all rows starting with A|B|C
 */
indexer.getData = function(listMap, ...values) {
  const recordIds = indexer.getRecordIds( listMap, ...values )

  if (!recordIds || recordIds.length === 0)
    return undefined

  const dataRows = []
  for( const recordId of recordIds ) {
    const dataRow = listMap.get(recordId)   // record is [dataRow]

    if( dataRow && dataRow.length > 0)
      dataRows.push(dataRow)
  }

  return dataRows.length > 0 ? dataRows : undefined
}



/* ========================== SAMPLE OF USAGE 1 FIELD DATA LIST ==================================

Lists can have many rows, but as the parameter in buildIndexedList function, only max 6 fields 
starting from the first at the left will be part of the index.

// ============================================================
// field Count by row = 1
// Validation only
//
// Values.txt:
// ABC
// DEF
// KAGC
// ============================================================
/*
print("\n*** 1 field data and index\n")
const validationMap = indexer.loadListFromFile("Values.txt")
if( indexer.existsIn(validationMap, "DEF") )
  print( "Validation value DEF exists" )

indexer.saveMapsToFile(validationMap, "ValuesIdx.json")
const validationMapReloaded = indexer.loadMapsFromFile("ValuesIdx.json")

if( indexer.existsIn(validationMapReloaded, "DEF") )
  print( "JSON RELOADED - Validation value DEF exists" )
*/



// ======================= SAMPLE FROM DATABASE =====================================
/* 

sqlQuery must be this way(Oracle Query Example)):
const sqlQuery = "SELECT NVL(col1,'') || '|' || NVL(col2,'') || '|' || NVL(col3,'')  AS combined FROM your_table WHERE ..."

const listLoaded = indexer.loadListFromQuery( dbConn, sqlQuery ) // SET CORRECT OPEN dbConn BEFORE RUNNING
print("listLoaded RECORDS LOADED TO LIST:" + listLoaded.size + "\n")
print(" mapLoaded - Test Search: <recordtosearch>: " + indexer.existsIn( listLoaded, '<recordtosearch>' ) )
// Same principle as files, but using queries.
*/


/* ========================== SAMPLE OF USAGE DATA LIST WITH 3 FIELDS ==================================
datalist.txt:

Warehouse|Location|LocationTo
W391|L3452|L002
W230|L34567|L004
W391|L9876|L5678
*/

/* Comment this line and line 270 to execute next code.

// Lists can have many rows, but as the parameter in buildIndexedList function, only max 6 fields 
// starting from the first at the left will be part of the index.

// field Count by row = 3
// Validation + Xref

var dataListMap = indexer.loadListFromFile("datalist.txt")

// It is possible to validate data in the list using 1, 2 or the 3 fields(Up to 6 indexed fields):
print("\n*** 1 field validation:")
if( indexer.existsIn(dataListMap, "W230") )
 print("Data validation W230 exists")

print("\n*** 2 fields validation:")
if( indexer.existsIn(dataListMap, "W230", "L34567") )
 print("Data validation W230|L34567 exists")

print("\n*** 3 fields validation:")
if( indexer.existsIn(dataListMap, "W230", "L34567", "L004") )
 print( "Data validation W230|L34567|L004 exists" )


// An Xref value can be obtained using 1 or 2 fields for this list(it has 3 fields)
//
// If supplied with one field, you will get the first key and row found, and return field value in the next position in the row
print("\n\n XREF:")
const xrefValue1 = indexer.getXref(dataListMap, "W391")
if( xrefValue1 !== undefined )
  print("Data Xref W391 (-> L3452) -> " + xrefValue1)

// If supplied with two fields, you will get the first key and row found, and return field value in the next position in the row
const xrefValue2 = indexer.getXref(dataListMap, "W391", "L3452")
if( xrefValue2 !== undefined )
  print("Data Xref W391|L3452 (-> L002) -> " + xrefValue2)


// Maps can be saved to see how the data indexed structure is built
indexer.saveMapsToFile(dataListMap, "datalist.json")
const dataListMapReloaded = indexer.loadMapsFromFile("datalist.json") // Also can be reloaded, used for validation and xref.
print("\n Data Reloaded ***")
if( indexer.existsIn(dataListMapReloaded, "W230", "L34567", "L004") )
 print( "Data validation W230|L34567|L004 exists" )

const xrefValue33 = indexer.getXref(dataListMapReloaded, "W391", "L3452")
if( xrefValue33 !== undefined )
  print("Data Xref W391|L3452 (-> L002) -> " + xrefValue33)

*/



