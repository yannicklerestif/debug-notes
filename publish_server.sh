#!/bin/sh
# Forces the script to stop if any command fails
set -e

dotnet publish ./backend/DebugNotes.Backend/DebugNotes.Backend.csproj -c Release -o ./backend/publish
npm --prefix ./web run build

mkdir -p ./backend/publish/wwwroot
cp -R ./web/build/. ./backend/publish/wwwroot/

ssh_key=/Users/y.lerestif/.ssh/id_ed25519_hetzner_yannick
remote_host=yannick@debug-notes.com

ssh -i "$ssh_key" \
    "$remote_host" \
    'sudo systemctl stop debug-notes-backend'

rsync -av --delete \
    -e "ssh -i $ssh_key" \
    ./backend/publish/ \
    "$remote_host":/opt/debug-notes-backend/

ssh -i "$ssh_key" \
    "$remote_host" \
    'sudo systemctl start debug-notes-backend'
