/*******************************************************************************
* dataextractionqueries.jss
* Data Extraction Queries For Inventory Transactions With Amounts
* Carlos Kassab
* 2026-October-26
********************************************************************************/

var dataExtractionQuery = `
SELECT a.ItemCode, a.Warehouse, a.Location, 
       STRFTIME('%m/%d/%Y', a.TransactionDate) AS TransactionDate,
       TIME(a.TransactionDate) AS TransactionTime,
       CAST(a.Quantity * b.Price *10000 AS INTEGER)/10000.0 AS TransactionAmount -- Same behavior as Oracle's TRUNC(x,4)
FROM InventoryTransactions a
  JOIN ItemPrices b
    ON a.ItemCode = b.ItemCode 
WHERE TransactionAmount > 0
`

/* This is useful if wanted to validate data on target database 
* loadedRecordsQuery must return ONE column with the values joined by '|', for example:
 *   it might be up to 6 possible index fields, ORACLE SAMPLE:
 *   "SELECT NVL(col1,'') || '|' || NVL(col2,'') || '|' || NVL(col3,'') AS datarow " +
 *   "FROM your_table WHERE ..."
 */
var loadedRecordsQuery = `
SELECT 
  a.ItemCode || '|' ||
  a.Warehouse || '|' ||
  a.Location AS datarow
FROM InventoryTransactions a
`

