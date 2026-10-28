/*
September/26/2026, Carlos Kassab
This script is to download all the Java libraries needed.
Even when it is explicitly developmed for JDBC drivers.
Usage:
Go to Maven central: https://central.sonatype.com/

- On the search box, type the java librarie you want, such as:csvjdbc
- Select your Java library, JDBC and MAven will display something like this:
<dependency>
    <groupId>net.sourceforge.csvjdbc</groupId>
    <artifactId>csvjdbc</artifactId>
    <version>1.0.46</version>
</dependency>

At the end of this script just create a new call to the function, like this:
// Download CSV files JDBC driver
downloadMavenJar(
  'net.sourceforge.csvjdbc',
  'csvjdbc',
  '1.0.46'
) 

run jss: jss/runscripts/ getjarLib.sh
The JDBC driver will be downloaded to the jarlibDir mentioned below.

*/

var SCRIPT_NAME = null
var JSS_HOME = null
if( typeof parameters !== 'undefined' && parameters.length > 1 ) {
  try {
    SCRIPT_NAME = parameters[0]
    JSS_HOME = parameters[1]
  } catch (error) {
    print('Error getting parameters: ' + error)
  }
} else {
  print('JSS_HOME parameter must be set in the shell or batch file.')
}
print( 'SCRIPT_NAME:' + SCRIPT_NAME )
print( 'JSS_HOME:' + JSS_HOME )
//Java.type('java.lang.System').exit(1) // Uncomment the start of this line for debug purposes

const jarlibDir = JSS_HOME + "/jarlib"

const HttpClient = Java.type('java.net.http.HttpClient')
const HttpRequest = Java.type('java.net.http.HttpRequest')
const HttpResponse = Java.type('java.net.http.HttpResponse')
const URI = Java.type('java.net.URI')
const Files = Java.type('java.nio.file.Files')
const Paths = Java.type('java.nio.file.Paths')
const StandardCopyOption = Java.type('java.nio.file.StandardCopyOption')

const client = HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NORMAL).build()

function download(url, destPath) {
  const dest = Paths.get(destPath)

  if( Files.exists(dest) ) {
    print(`Already exists: ${destPath}`)
    return
  }

  const parent = dest.getParent()

  if( parent != null )
    Files.createDirectories(parent)

  const temp = Paths.get(destPath + '.download')

  try {
    const request = HttpRequest.newBuilder().uri(URI.create(url)).GET().build()
    print(`Downloading: ${url}`)

    const response = client.send( request, HttpResponse.BodyHandlers.ofFile(temp) )

    if( response.statusCode() !== 200 ) {
      Files.deleteIfExists(temp)
      throw new Error(`HTTP ${response.statusCode()}: ${url}`)
    }

    Files.move( temp, dest,StandardCopyOption.REPLACE_EXISTING )

    print(`Downloaded: ${destPath}`)
  } catch (e) {
    Files.deleteIfExists(temp)
    throw e
  }
}



function downloadMavenJar(groupId, artifactId, version) {
  const groupPath = groupId.replace(/\./g, '/')
  const fileName = artifactId + "-" + version + ".jar"
  const destPath = jarlibDir + "/" + fileName
  const url = `https://repo1.maven.org/maven2/${groupPath}/${artifactId}/${version}/${fileName}`

  download( url, destPath )
}


// Download PostgreSQL JDBC driver
downloadMavenJar(
  'org.postgresql', //groupId
  'postgresql', //artifactId
  '42.7.13', // version
)

// Download SQLite JDBC driver
downloadMavenJar(
  'org.xerial', //groupId
  'sqlite-jdbc', //artifactId
  '3.53.4.0', // version
)

// Download DUCKDB JDBC driver
downloadMavenJar(
  'org.duckdb', //groupId
  'duckdb_jdbc', //artifactId
  '2.0.0.0', // version
)

// Download H2 JDBC driver
downloadMavenJar(
  'com.h2database', //groupId
  'h2', //artifactId
  '2.5.250', // version
)


// Download Oracle 19 JDBC driver, JDK11, JDK17, JDK19, and JDK21, it works with JDK 25 :)
downloadMavenJar(
  'com.oracle.database.jdbc', //groupId
  'ojdbc11', //artifactId
  '23.26.3.0.0', // version
)



// Download MS SQL SERVER JDBC driver
downloadMavenJar(
  'com.microsoft.sqlserver',
  'mssql-jdbc',
  '13.6.0.jre11'
)



// Download CSV files JDBC driver
downloadMavenJar(
  'net.sourceforge.csvjdbc',
  'csvjdbc',
  '1.0.46'
)











