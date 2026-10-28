/*******************************************************************************
* DataBaseConnections.jss
* Functions to initialize database connections.
* 
* Carlos Kassab
* 2026-October-23
********************************************************************************/

// Establish namespace
var utils = utils || {}

utils.getDBConnection = function (dbType, dbConfig) {
  const properties = new Properties()

  switch( dbType ) {

    case 'Oracle': {
      const dbUrl = 'jdbc:oracle:thin:@'
        + dbConfig.ORASERVER + ':' + dbConfig.ORAPORT + '/' + dbConfig.DBNAME
      properties.setProperty("user", dbConfig.DBUSER)
      properties.setProperty("password", dbConfig.DBPASS)
      return DriverManager.getConnection(dbUrl, properties)
    }

    case 'PostgreSQL': {
      const dbUrl = 'jdbc:postgresql://'
        + dbConfig.PSQLDBSERVER + ':' + dbConfig.PSQLDBPORT + '/' + dbConfig.PSQLDBNAME
      properties.setProperty("user", dbConfig.PSQLDBUSER)
      properties.setProperty("password", dbConfig.PSQLDBPASS)
      return DriverManager.getConnection(dbUrl, properties)
    }

    case 'sqlite': {
      if( !dbConfig.DBPATH )
        throw new Error("SQLITEDB DBPATH not set in config")

      const javaFilePath = Paths.get(dbConfig.DBPATH)
      if( !Files.exists(javaFilePath) )
        throw new Error("SQLite file not found: " + dbConfig.DBPATH)

      const dbUrl = 'jdbc:sqlite:' + dbConfig.DBPATH
      return DriverManager.getConnection(dbUrl, properties)
    }   
     
    default:
      throw new Error('Invalid DB Type: ' + dbType)
  }

}


