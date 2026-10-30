#!/bin/bash
# Resolve paths relative to this script's location
RUNSCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
JSS_HOME="$(dirname "$RUNSCRIPT_DIR")"

WORK_DIR="$JSS_HOME/scripts/utils"
SCRIPT_NAME="getjarlib.jss"

cd "$WORK_DIR" || exit 1

$HOME/Apps/graalvmjdk25/bin/java --enable-native-access=ALL-UNNAMED --sun-misc-unsafe-memory-access=allow -cp "$JSS_HOME/jss-1.2.jar:$JSS_HOME/jarlib/*" org.jss.jss "$SCRIPT_NAME" "$JSS_HOME"

