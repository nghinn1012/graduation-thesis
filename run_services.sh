#!/bin/bash

# Open Terminator with a specific layout
terminator -l mylayout &

# Allow time for Terminator to open the layout
sleep 2

# Send commands to specific panes
terminator -p "terminal9" -e "bash -c 'cd server/user-service && npm start; exec bash'" &
terminator -p "terminal8" -e "bash -c 'cd server/post-service && npm start; exec bash'" &
terminator -p "terminal6" -e "bash -c 'cd server/notification-service && npm start; exec bash'" &
terminator -p "terminal5" -e "bash -c 'cd server/api-gateway && npm start; exec bash'" &
terminator -p "terminal4" -e "bash -c 'cd client && npm run dev; exec bash'" &
