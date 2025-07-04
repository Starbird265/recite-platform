#!/bin/bash

# Fix import paths in all pages - corrected version
find pages -name "*.tsx" -type f -exec sed -i '' 's|../components/ui/PixelComponents|../components/PixelComponents|g' {} \;

echo "✅ Fixed PixelComponents import paths!"