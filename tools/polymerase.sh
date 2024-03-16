#!/bin/bash
# 17.03.2024
# Written by @Grauhut (Twitter, Bluesky)

# /$$$$$$$           /$$
#| $$__  $$         | $$
#| $$  \ $$ /$$$$$$ | $$ /$$   /$$ /$$$$$$/$$$$   /$$$$$$   /$$$$$$  /$$$$$$   /$$$$$$$  /$$$$$$
#| $$$$$$$//$$__  $$| $$| $$  | $$| $$_  $$_  $$ /$$__  $$ /$$__  $$|____  $$ /$$_____/ /$$__  $$
#| $$____/| $$  \ $$| $$| $$  | $$| $$ \ $$ \ $$| $$$$$$$$| $$  \__/ /$$$$$$$|  $$$$$$ | $$$$$$$$
#| $$     | $$  | $$| $$| $$  | $$| $$ | $$ | $$| $$_____/| $$      /$$__  $$ \____  $$| $$_____/
#| $$     |  $$$$$$/| $$|  $$$$$$$| $$ | $$ | $$|  $$$$$$$| $$     |  $$$$$$$ /$$$$$$$/|  $$$$$$$
#|__/      \______/ |__/ \____  $$|__/ |__/ |__/ \_______/|__/      \_______/|_______/  \_______/
#                        /$$  | $$
#                       |  $$$$$$/
#                        \______/

######### Usage #########
# This script will take an input file in form of a .html Inkscape export and strip lines drawn on it down into basic points.
# These points are checked for errors within the .00XXXX margin
# The script will output a list of path that are created by connecting points, each with a unique ID. Each path has a weight in it what defines how long it'll take to traverse.
# This weight is, simply spoken, the amount of kilometers that need to be traveled. By manually adjust it, you can have a path that has a "10" in both directions go up a mountain by
# changeing the value to 50 and down by modifiying the other direction to 5 to put it to scale.

######## Polymerase.sh ########

### Function stack
## Cleanup
# Removes everything that was created in tmp
function cleanup() {
	rm -rf tmp points pathes
}

### Prepare env
## Create folders
mkdir tmp points pathes

## Output color codes
color_red='\033[1;31m'
color_green='\033[1;32m'
color_yellow='\033[1;33m'
color_purple='\033[1;35m'
color_no='\033[0m' # No Color

### Get input
var_input_file=$1
# Sanity check for input
if [[ -z ${var_input_file} ]]; then
	echo -e "${color_red}Error: Missing input file.${color_no}\n"
	cleanup
	exit 1
fi

### Break up HTML file into path listing
echo -e "${color_green}Running: Breaking file into path listings${color_no}\n"
grep ctx ${var_input_file} > tmp/routen
sed -i '/beginPath/d' tmp/routen
sed -i '/beginPath/d' tmp/routen
sed -i '/global/d' tmp/routen
sed -i '/stroke/d' tmp/routen
sed -i '/miter/d' tmp/routen
sed -i '/lineW/d' tmp/routen
sed -i '/lineC/d' tmp/routen
sed -i '/getElementById/d' tmp/routen
sed -i 's/ctx\.lineTo(//g' tmp/routen
sed -i 's/ctx\.moveTo(//g' tmp/routen
sed -i 's/^[ \t]*//' tmp/routen
sed -i 's/);//g' tmp/routen


### Break up HTML file into a list of pathes to extract the path data
echo -e "${color_green}Running: Extracting path data${color_no}\n"
grep 'path' ${var_input_file} | sed -e 's/\/\/\ #//g' > tmp/listOfPathes
for i in $(cat tmp/listOfPathes); do
	echo -ne "${color_yellow}Processing: $i              ${color_no}\r"
	grep -A 10 $i routen.html > pathes/$i.path
	sed -i 's/\/\/\ #//g' pathes/$i.path
	sed -i '/beginPath/d' pathes/$i.path
	sed -i '/beginPath/d' pathes/$i.path
	sed -i '/global/d' pathes/$i.path
	sed -i '/stroke/d' pathes/$i.path
	sed -i '/miter/d' pathes/$i.path
	sed -i '/lineW/d' pathes/$i.path
	sed -i '/lineC/d' pathes/$i.path
	sed -i '/getElementById/d' pathes/$i.path
	sed -i 's/ctx\.lineTo(//g' pathes/$i.path
	sed -i 's/ctx\.moveTo(//g' pathes/$i.path
	sed -i 's/^[ \t]*//' pathes/$i.path
	sed -i 's/);//g' pathes/$i.path
	sed -i 's/--//g' pathes/$i.path
	sed -i '/^$/d' pathes/$i.path
done

### Error correction
var_error_correct_counter=1
var_error_correct_total_lines=$(wc -l tmp/routen | cut -f1 -d\ )
	echo -e "${color_green}Running: Error correction${color_no}\n"
while IFS= read -r line; do
	echo -ne "${color_yellow}Running: ${var_error_correct_counter}/${var_error_correct_total_lines}.${color_no}\r"
	var_error_correct=$line
	var_error_correct_x=$(echo $var_error_correct | sed -e 's/,.*//g')
	var_error_correct_y=$(echo $var_error_correct | sed -e 's/^.*,\ //g')
	### Check if another X/Y variable is within error tolerance
		# Extract last four digits
		var_error_correct_x_extract=$(echo ${var_error_correct_x} | sed -e 's/[0-9][0-9][0-9][0-9]$//g')
		var_error_correct_y_extract=$(echo ${var_error_correct_y} | sed -e 's/[0-9][0-9][0-9][0-9]$//g')
		grep -n "${var_error_correct_x_extract}[0-9][0-9][0-9][0-9], ${var_error_correct_y_extract}[0-9][0-9][0-9][0-9]" tmp/routen | cut -f1 -d: > tmp/current_error_routen
		# Run over the grep output and replace every single line that was found with correct coordinates
		while IFS= read -r line; do
			var_error_correct_pipe=$line
			sed -i "${var_error_correct_pipe}c\\${var_error_correct_x},\ ${var_error_correct_y}" tmp/routen
		done < "tmp/current_error_routen"

		# Parses over all files in pathes/ to find broken coordinates
		grep -n "${var_error_correct_x_extract}[0-9][0-9][0-9][0-9], ${var_error_correct_y_extract}[0-9][0-9][0-9][0-9]" pathes/*.path | cut -f1,2 -d: > tmp/current_error_pathes
		# Run over the grep output and replace every single line that was found with correct coordinates
		while IFS= read -r line; do
			var_error_correct_pipe=$line
			sed -i "$(echo ${var_error_correct_pipe} | cut -f2 -d:)c\\${var_error_correct_x},\ ${var_error_correct_y}" $(echo ${var_error_correct_pipe} | cut -f1 -d:)
		done < "tmp/current_error_pathes"


		((var_error_correct_counter++))
done < "tmp/routen"

### Create an indexed list of all points
cat tmp/routen | sort | uniq > tmp/coordinates
var_coordinate_input="tmp/coordinates"

### Writing points to points/ directory
var_point_read_counter=1
while IFS= read -r line; do
	echo $line > points/${var_point_read_counter}.point
	((var_point_read_counter++))
done < "${var_coordinate_input}"

### Set head for route.js
echo "const routes =  [" > routes.js
for j in $(ls -1 pathes); do
		echo -ne "${color_yellow}Processing: Path ${j}                      ${color_no}\r"
	x1=$(sed '2q;d' pathes/$j | sed -e 's/,.*//g')
	y1=$(sed '2q;d' pathes/$j | sed -e 's/^.*,\ //g')
	x2=$(sed '3q;d' pathes/$j | sed -e 's/,.*//g')
	y2=$(sed '3q;d' pathes/$j | sed -e 's/^.*,\ //g')

	if [[ $x1 > $x2 ]]; then
		dx=$(bc <<< $x1-$x2)
	else
		dx=$(bc <<< $x2-$x1)
	fi

	if [[ $y1 > $y2 ]]; then
    dy=$(bc <<< $y1-$y2)
	else
    dy=$(bc <<< $y2-$y1)
	fi
	#Distanz zwischen den Punkten
	dist=$(bc <<< "scale=6; sqrt($dx*$dx+$dy*$dy)")

	# What's the first point called?
	point_a=$(sed '2q;d' pathes/$j)
	point_a_name=$(grep -l "$point_a" points/* | sed -e 's/points\///g' | sed -e 's/\.point//g')
	point_b=$(sed '3q;d' pathes/$j)
	point_b_name=$(grep -l "$point_b" points/* | sed -e 's/points\///g' | sed -e 's/\.point//g')
	if [[ -z "${point_a_name}" ]] || [[ -z "${point_b_name}" ]]; then
		echo -e "${color_red}Error: A variable came back empty. This is caused by either a broken input file or something we oversaw when programming this. Dumping running vars.${color_no}\n"
		echo "$j || $x1 $x2 $y1 $y2 || $dx $dy || $dist || $point_a || $point_a_name || $point_b || $point_b_name"
		exit 1
	fi
	echo "[$point_a_name, $point_b_name, $dist]," >> routes.js
	echo "[$point_b_name, $point_a_name, $dist]," >> routes.js
done
### Set bottom and remove last ,
sed -i '$s/.$//' routes.js
echo "];" >> routes.js

echo -e "\n"
echo "const points =  [" > point.js
for k in $(ls -1 points); do
	echo -ne "${color_yellow}Processing: Point ${k}                      ${color_no}\r"
	x1=$(sed '1q;d' points/$k | sed -e 's/,.*//g')
	y1=$(sed '1q;d' points/$k | sed -e 's/^.*,\ //g')
	point=$(echo $k | sed -e 's/\.point//g')
	echo "[$x1, $y1, $point]," >> point.js
done
sed -i '$s/.$//' point.js
echo "];" >> point.js

echo -e "${color_green}Great success. Copy point.js and routes.js into the assets folder.${color_no}\n"

