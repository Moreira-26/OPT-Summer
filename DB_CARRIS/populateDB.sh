#!/bin/bash

# Set database credentials and table name
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=pg!password

psql -h localhost -U $DB_USER -d $DB_NAME -f create.sql

CSV_FILES=("nodes_version.csv" "segment_version.csv" "stops_version.csv" "lines_version.csv" "paths_version.csv" "tracks_version.csv" "gistlines_version.csv" "gistlines_lines.csv" "glines_paths.csv" "lines_paths.csv" "paths_segs.csv" "path_segs_tracks.csv" "routes_version.csv" "routes_tracks.csv")

for file in "${CSV_FILES[@]}"
do
    # Extract table name from file name
    table_name="${file%.*}"

    # Import data using psql COPY command
    psql -h localhost -U $DB_USER -d $DB_NAME -c "\copy $table_name FROM '$file' DELIMITER ';' CSV HEADER;"
done

