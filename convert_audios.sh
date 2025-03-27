#!/bin/bash

# Specify the directory (change this to your target directory)
TARGET_DIR="./audio"
filter_directory="";
# Create an array with the names of subdirectories in the target directory
OUT_DIR="./src/assets/math";

# Loop to run ffmpeg command x times with different parameters
for i in "$TARGET_DIR"/*; do
    filename_no_ext=$(basename "$i" .wav)
    ffmpeg -y -i "$i" "$OUT_DIR/$filename_no_ext.mp3"
done
