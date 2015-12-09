#!/bin/sh

# Script that builds http://dev.openlayers.org/ or a similar website.
# To get started, download an OpenLayers zipball from
# https://github.com/openlayers/ol2/archive/master.zip, unpack it, change into
# the tools/ directory, and run this script.
# Once installed, to update the website, just change into the tools/ directory
# and run this script again.

echo "<html><head><title>OpenLayers 2 Dev Website</title></head></body><h3>OpenLayers 2 Dev Website</h3><ul><li><a href='examples/'>Examples</a></li><li><a href='apidocs/'>API docs</a></li><li><a href='docs/'>Developer docs (use at your own risk)</a></li><li><a href='sandbox/'>Developer sandboxes (no official code in there)</a></li></ul>" > ../index.html

git clone git://github.com/openlayers/ol2.git

rsync -r --exclude=.git ol2/* ../

# make examples use built lib
cd ol2/tools

python exampleparser.py ../examples ../../../examples

cd ../build
./build.py tests.cfg
./build.py mobile.cfg OpenLayers.mobile.js
./build.py light.cfg OpenLayers.light.js
./build.py -c none tests.cfg OpenLayers.debug.js
./build.py -c none mobile.cfg OpenLayers.mobile.debug.js
./build.py -c none light.cfg OpenLayers.light.debug.js
cp OpenLayers*.js ../../../

cd ../../../
sed -i -e 's!../lib/OpenLayers.js?mobile!../OpenLayers.mobile.js!' examples/*.html
sed -i -e 's!../lib/OpenLayers.js!../OpenLayers.js!' examples/*.html
# Update Bing key
sed -i -e 's!AqTGBsziZHIJYYxgivLBf0hVdrAk9mWO5cQcb8Yux8sW5M8c8opEC2lZqKR1ZZXf!ApTJzdkyN1DdFKkRAE6QIDtzihNaf6IWJsT-nQ_2eMoO4PN__0Tzhl2-WgJtXFSp!' examples/*.js

# update the API docs
if [ ! -d apidocs ]; then
    mkdir -p apidocs
fi
if [ ! -d docs ]; then
    mkdir -p docs
fi
cd tools/ol2/
wget http://www.mirrorservice.org/sites/downloads.sourceforge.net/n/na/naturaldocs/Stable%20Releases/1.52/NaturalDocs-1.52.zip
unzip NaturalDocs-1.52.zip
perl NaturalDocs --input lib --output HTML ../../apidocs -p apidoc_config -s Default OL
perl NaturalDocs --input lib --output HTML ../../docs -p doc_config -s Default OL
cd ../
rm -Rf ol2
cd ../
svn export --force https://svn.osgeo.org/openlayers/sandbox/
cd tools/
