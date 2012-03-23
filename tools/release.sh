#!/bin/sh

VERSION=$1

wget -c http://closure-compiler.googlecode.com/files/compiler-latest.zip
unzip compiler-latest.zip 

wget -O release-${VERSION}.tar.gz https://github.com/openlayers/openlayers/tarball/release-${VERSION}
tar xvzf release-${VERSION}.tar.gz
mv openlayers-openlayers-* OpenLayers-${VERSION}
cd OpenLayers-${VERSION}/build

mv ../../compiler.jar ../tools/closure-compiler.jar
./build.py -c closure full
./build.py -c closure mobile OpenLayers.mobile.js
./build.py -c closure light OpenLayers.light.js
./build.py -c none full OpenLayers.debug.js
./build.py -c none mobile OpenLayers.mobile.debug.js
./build.py -c none light OpenLayers.light.debug.js
cp OpenLayers.js ..
cp OpenLayers.*.js ..
rm ../tools/closure-compiler.jar

cd ..
cd tools
python exampleparser.py
cd ..
for i in google ie6-style style; do
    csstidy theme/default/$i.css --template=highest theme/default/$i.tidy.css
done    

mkdir doc/devdocs
mkdir doc/apidocs
rm tools/*.pyc

mkdir -p /osgeo/openlayers/docs/api/$VERSION
cp OpenLayers*.js /osgeo/openlayers/docs/api/$VERSION
cp -a img/ /osgeo/openlayers/docs/api/$VERSION
cp -a theme/ /osgeo/openlayers/docs/api/$VERSION

cd ..

naturaldocs -i OpenLayers-$VERSION/lib -o HTML OpenLayers-$VERSION/doc/devdocs -p OpenLayers-$VERSION/doc_config -s Small OL
naturaldocs -i OpenLayers-$VERSION/lib -o HTML OpenLayers-$VERSION/doc/apidocs -p OpenLayers-$VERSION/apidoc_config -s Small OL

tar cvfz OpenLayers-$VERSION.tar.gz OpenLayers-$VERSION/
zip -9r OpenLayers-$VERSION.zip OpenLayers-$VERSION/

cp OpenLayers-$VERSION.* /osgeo/openlayers/docs/download 
