/*******************************************************************************
* cleanfile.jss
* Reads an input file and cleans all non printing characters.
* This file cleaner was created to be used on Infor BaaN/LN, it is using output charset ISO8859_1
* Carlos Kassab
* 2026-October-26
********************************************************************************/

const Files = Java.type("java.nio.file.Files")
const Paths = Java.type("java.nio.file.Paths")
const Charset = Java.type("java.nio.charset.Charset")
const StandardCharsets = Java.type("java.nio.charset.StandardCharsets")
const System = Java.type("java.lang.System")
const BufferedReader = Java.type("java.io.BufferedReader")
const InputStreamReader = Java.type("java.io.InputStreamReader")
const BufferedWriter = Java.type("java.io.BufferedWriter")
const OutputStreamWriter = Java.type("java.io.OutputStreamWriter")
const ByteBuffer = Java.type("java.nio.ByteBuffer")
const CodingErrorAction = Java.type("java.nio.charset.CodingErrorAction")

const ISO8859_1 = Charset.forName("ISO-8859-1") 
const UTF8 = StandardCharsets.UTF_8
const UTF16LE = Charset.forName("UTF-16LE")
const UTF16BE = Charset.forName("UTF-16BE")
const UTF32LE = Charset.forName("UTF-32LE")
const UTF32BE = Charset.forName("UTF-32BE")

const OUTPUTCHARSET = ISO8859_1 // SET YOUR OUTPUT CHARSET AS NEEDED

const AllowedExtraChars = "äëïöüÄËÖÜáéíóúÁÉÍÓÚçñÑ"

const input = new BufferedReader( new InputStreamReader(System.in) )
print("\nReads an input file and cleans all non printing characters.")
print("Set your output charset in line 28.")
print("Creates output filename: inputfilename.ext_cleaned.")
print("Full Path And Name of The Text To Be Cleaned <Hit Enter or CTRL-C to Just Exit.>: ")
const fileName = input.readLine()

if( fileName === null )
  System.exit(0)

const file = fileName.trim()

if( file.length === 0 )
  System.exit(0)


const outputFile = file + "_cleaned"

let bytes

try {
  bytes = Files.readAllBytes(Paths.get(file))
} catch( error ) {
  System.err.println( `Could not open '${file}': ${error.message}` )
  System.exit(1)
}

const info = detectEncoding(bytes)
const content = new java.lang.String( bytes.slice(info.skip), info.encoding )
const lines = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");

if( lines.length > 0 && lines[lines.length - 1] === "" )
  lines.pop()


try {
  const writer = new BufferedWriter( new OutputStreamWriter( Files.newOutputStream(Paths.get(outputFile)), OUTPUTCHARSET ) )
  for( const line of lines ) {
    writer.write( cleanLine(line) )
    writer.newLine()
  }

  writer.close()

} catch( error ) {
  System.err.println( `Could not write '${outputFile}': ${error.message}` )
  System.exit(1)
}

System.out.println(`Created: ${outputFile}`)


function detectEncoding(bytes) {

  if( bytes.length >= 3 && ( bytes[0] & 0xFF ) === 0xEF && ( bytes[1] & 0xFF) === 0xBB && ( bytes[2] & 0xFF ) === 0xBF )
    return { encoding: UTF8, skip: 3 }

  if( bytes.length >= 4 && ( bytes[0] & 0xFF) === 0xFF && ( bytes[1] & 0xFF) === 0xFE && bytes[2] === 0 && bytes[3] === 0 )
    return { encoding: UTF32LE, skip: 4 }

  if( bytes.length >= 4 && bytes[0] === 0 && bytes[1] === 0 && ( bytes[2] & 0xFF ) === 0xFE && ( bytes[3] & 0xFF ) === 0xFF )
    return { encoding: UTF32BE, skip: 4 }

  if( bytes.length >= 2 && ( bytes[0] & 0xFF ) === 0xFF && ( bytes[1] & 0xFF ) === 0xFE )
    return { encoding: UTF16LE, skip: 2 }

  if( bytes.length >= 2 && ( bytes[0] & 0xFF ) === 0xFE && ( bytes[1] & 0xFF ) === 0xFF )
    return { encoding: UTF16BE, skip: 2 }

  if( validUtf8( bytes ) )
    return { encoding: UTF8, skip: 0 }

  return { encoding: ISO8859_1, skip: 0 }
}


function validUtf8(bytes) {
  try {
    UTF8.newDecoder().onMalformedInput(CodingErrorAction.REPORT).onUnmappableCharacter(CodingErrorAction.REPORT).decode(ByteBuffer.wrap(bytes))
    return true
  } catch( error ) {
    return false
  }
}


function cleanLine(line) {
  let result = ""

  for( const c of line ) {
    const code = c.charCodeAt(0)
    if( ( code >= 0x20 && code <= 0x7E ) || AllowedExtraChars.includes(c) )
      result += c
  }

  return result;
}


