#!/bin/bash

# Fix import paths in all pages
find pages -name "*.tsx" -type f -exec sed -i '' 's|@/components/AuthContext|../contexts/AuthContext|g' {} \;
find pages -name "*.tsx" -type f -exec sed -i '' 's|@/components/ui/PixelComponents|../components/ui/PixelComponents|g' {} \;
find pages -name "*.tsx" -type f -exec sed -i '' 's|@/components/PixelComponents|../components/PixelComponents|g' {} \;
find pages -name "*.tsx" -type f -exec sed -i '' 's|@/components/PixelCharts|../components/PixelCharts|g' {} \;
find pages -name "*.tsx" -type f -exec sed -i '' 's|@/lib/supabase|../lib/supabase|g' {} \;

echo "✅ Fixed all import paths!"