/*******************************************************************************
* GeneralLibs.jss
* General Functions to Support Scripts 
* Carlos Kassab
* 2026-October-27
********************************************************************************/

// Establish namespace
var utils = utils || {}

// Loading Java Libraries
var FileClass       = Java.type('java.io.File') // Obtain the Java File class
var FileWriterClass = Java.type('java.io.FileWriter') // Obtain the FileWriter class
var DriverManager   = Java.type('java.sql.DriverManager')
var Properties      = Java.type('java.util.Properties')
var System          = Java.type("java.lang.System")
var Files           = Java.type('java.nio.file.Files')
var Paths           = Java.type('java.nio.file.Paths')

load( scriptsPath + "lib/DataBaseConnections.jss" )
load( scriptsPath + "lib/DataIndexer.jss" )

// Small functions here.

utils.getFileWriter = function ( filePath, overwriteOrAppend ) {
  var outputFileName = new FileClass( filePath )

  // Create FileWriter instance, passing the File object
  if (overwriteOrAppend === "append") {
    return new FileWriterClass( outputFileName, true )
  }
  return new FileWriterClass( outputFileName )
}


utils.GetNumericDateTime = function() {
  const deviceTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  return new Date().toLocaleString('sv-SE', { timeZone: deviceTimeZone })
                    .replaceAll('-', '').replaceAll(':', '').replaceAll(' ', '').slice(0, 14)
}


utils.WriteLog = function( textToWrite, fileName ) {
  try {
    const eventDate = utils.GetNumericDateTime()
    var file = new FileClass( fileName ) // Set File Name
    const javaFilePath = Paths.get(fileName)

    if( Files.exists(javaFilePath) && Files.size(javaFilePath) >= config.MAXLOGFILESIZE )
      Files.deleteIfExists(javaFilePath)

    // Open the file in append mode, if the file does not exist, it creates it
    const writer = new FileWriterClass( file, true )  
    writer.write( eventDate + ":" + textToWrite + "\n" ) // Write content to file
    writer.close() // Close the writer to flush the data
  } catch( error ) {
    print( "Error " + error + " writing to file:" + fileName )
  }
}

