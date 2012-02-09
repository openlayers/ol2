#!/bin/sh

if [ -z $1 ]; then
    echo "Usage: $0 VERSION"
    exit 1
fi

VERSION=$1
TAG=release-$VERSION
DIR=OpenLayers-$VERSION

export_svn() {
    svn export http://svn.openlayers.org/tags/openlayers/$TAG $DIR
}

export_git() {
    if ! git describe $TAG > /dev/null 2>&1; then
        echo "Tag $TAG not found. It needs to be an annotated tag."
        exit 2
    fi

    # go to top level of work tree
    cd `git rev-parse --show-cdup`

    if [ -e tools/$DIR ]; then
        echo "$DIR exists - please remove it"
        exit 3
    fi

    mkdir tools/$DIR
    git archive --format=tar $TAG | tar -xC tools/$DIR
    cd tools
}

wget -c http://closure-compiler.googlecode.com/files/compiler-latest.zip
unzip -u compiler-latest.zip

if svn info > /dev/null 2>&1; then
    export_svn
else
    export_git
fi

cd $DIR/build
mv ../../compiler.jar ../tools/closure-compiler.jar
./build.py -c closure full
cp OpenLayers.js ..
rm ../tools/closure-compiler.jar

cd ..
cd tools
RELEASE_VER=$TAG python exampleparser.py
cd ..
for i in google ie6-style style; do
    csstidy theme/default/$i.css --template=highest theme/default/$i.tidy.css
done    

mkdir doc/devdocs
mkdir doc/apidocs
rm tools/*.pyc

mkdir /osgeo/openlayers/docs/api/$VERSION
cp OpenLayers.js /osgeo/openlayers/docs/api/$VERSION
cp -a img/ /osgeo/openlayers/docs/api/$VERSION
cp -a theme/ /osgeo/openlayers/docs/api/$VERSION

cd ..

naturaldocs -i OpenLayers-$VERSION/lib -o HTML OpenLayers-$VERSION/doc/devdocs -p OpenLayers-$VERSION/doc_config -s Small OL
naturaldocs -i OpenLayers-$VERSION/lib -o HTML OpenLayers-$VERSION/doc/apidocs -p OpenLayers-$VERSION/apidoc_config -s Small OL

tar cvfz OpenLayers-$VERSION.tar.gz OpenLayers-$VERSION/
zip -9r OpenLayers-$VERSION.zip OpenLayers-$VERSION/

cp OpenLayers-$VERSION.* /osgeo/openlayers/docs/download 
