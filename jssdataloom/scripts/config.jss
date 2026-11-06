
var config = {
  MAXLOGFILESIZE: 3 * 1024 * 1024,
  FIELDSEPARATOR: ',',
  FIELDENCLOSING: '"',
  SQLITETEST: {
    DBPATH: scriptsPath + 'data/sampledata.sqlite' 
  },
  SQLITEPROD: {
    DBPATH: scriptsPath + 'data/sampledata.sqlite' 
  },
  ORATESTSERVER: {
    ORASERVER:'mytestdb.server.com',
    ORAPORT:'1588',
    DBNAME:'MYTESTDB',
    DBUSER:'dbuser',
    DBPASS:'dbuserpassword'
  },
  ORAPRODSERVER: {
    ORASERVER:'myproddb.server.com',
    ORAPORT:'1589',
    DBNAME:'MYPRODDB',
    DBUSER:'dbuser',
    DBPASS:'dbuserpassword'
  }
}

// If reached 3 MB, clean log and restart it:
// MAXLOGFILESIZE: 3 * 1024 * 1024
// From dataextaction.jss, when loading config we have:
// var scriptsPath = jssdataloomHome + "/scripts/"