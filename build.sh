#!/bin/bash
echo "Starting build process..."

# Install dependencies
npm install

# Create production build
NODE_OPTIONS="--max_old_space_size=4096" npm run build

# Exit with success
exit 0
