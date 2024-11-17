dist:
    rm -rf dist
    rsync -a --filter="merge dist.txt" . dist
    du -sh dist
    cd dist && zip -q -r Triplon.zip .
    du -sh dist/Triplon.zip