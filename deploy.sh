#!/bin/bash
# Run this once to initialize git and set up for GitHub push
set -e

cd /Users/shaihen/Documents/apps/Allaay

rm -f .git/index.lock 2>/dev/null || true
git config user.email "shaigian1@gmail.com"
git config user.name "Shai"
git add .
git commit -m "Initial commit - Allaay app"

echo ""
echo "✅ Done! Now:"
echo "1. Create a GitHub repo at https://github.com/new  (name: allaay)"
echo "2. Run: git remote add origin https://github.com/YOUR_USERNAME/allaay.git"
echo "3. Run: git push -u origin main"
