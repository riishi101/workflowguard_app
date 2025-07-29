#!/usr/bin/env node

/**
 * Typography Migration Script
 * 
 * This script helps identify text styling patterns that need to be migrated
 * to use the new typography components for consistency.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Patterns to search for and their replacements
const patterns = [
  // Headings
  {
    pattern: /<h1[^>]*className="[^"]*text-2xl[^"]*"[^>]*>/g,
    replacement: '<H3',
    description: 'H1 with text-2xl -> H3'
  },
  {
    pattern: /<h1[^>]*className="[^"]*text-3xl[^"]*"[^>]*>/g,
    replacement: '<H2',
    description: 'H1 with text-3xl -> H2'
  },
  {
    pattern: /<h1[^>]*className="[^"]*text-4xl[^"]*"[^>]*>/g,
    replacement: '<H1',
    description: 'H1 with text-4xl -> H1'
  },
  {
    pattern: /<h2[^>]*className="[^"]*text-lg[^"]*"[^>]*>/g,
    replacement: '<H5',
    description: 'H2 with text-lg -> H5'
  },
  {
    pattern: /<h2[^>]*className="[^"]*text-xl[^"]*"[^>]*>/g,
    replacement: '<H4',
    description: 'H2 with text-xl -> H4'
  },
  {
    pattern: /<h3[^>]*className="[^"]*text-lg[^"]*"[^>]*>/g,
    replacement: '<H5',
    description: 'H3 with text-lg -> H5'
  },
  
  // Paragraphs
  {
    pattern: /<p[^>]*className="[^"]*text-sm[^"]*"[^>]*>/g,
    replacement: '<PSmall',
    description: 'P with text-sm -> PSmall'
  },
  {
    pattern: /<p[^>]*className="[^"]*text-xs[^"]*"[^>]*>/g,
    replacement: '<PXSmall',
    description: 'P with text-xs -> PXSmall'
  },
  
  // Spans
  {
    pattern: /<span[^>]*className="[^"]*text-sm[^"]*"[^>]*>/g,
    replacement: '<SpanSmall',
    description: 'Span with text-sm -> SpanSmall'
  },
  {
    pattern: /<span[^>]*className="[^"]*text-xs[^"]*"[^>]*>/g,
    replacement: '<SpanXSmall',
    description: 'Span with text-xs -> SpanXSmall'
  },
  
  // Display numbers
  {
    pattern: /<div[^>]*className="[^"]*text-3xl[^"]*font-bold[^"]*"[^>]*>/g,
    replacement: '<DisplayMedium',
    description: 'Div with text-3xl font-bold -> DisplayMedium'
  },
  {
    pattern: /<div[^>]*className="[^"]*text-2xl[^"]*font-bold[^"]*"[^>]*>/g,
    replacement: '<DisplaySmall',
    description: 'Div with text-2xl font-bold -> DisplaySmall'
  },
  {
    pattern: /<div[^>]*className="[^"]*text-4xl[^"]*font-bold[^"]*"[^>]*>/g,
    replacement: '<DisplayLarge',
    description: 'Div with text-4xl font-bold -> DisplayLarge'
  }
];

// Files to process
const filesToProcess = [
  'src/pages/WorkflowHistory.tsx',
  'src/pages/WorkflowHistoryDetail.tsx',
  'src/pages/CompareVersions.tsx',
  'src/pages/TermsOfService.tsx',
  'src/pages/PrivacyPolicy.tsx',
  'src/pages/ContactUs.tsx',
  'src/pages/HelpSupport.tsx',
  'src/pages/ManageSubscription.tsx',
  'src/pages/Index.tsx',
  'src/pages/NotFound.tsx',
  'src/components/EmptyDashboard.tsx',
  'src/components/EmptyWorkflowHistory.tsx',
  'src/components/WelcomeModal.tsx',
  'src/components/ConnectHubSpotModal.tsx',
  'src/components/CancelSubscriptionModal.tsx',
  'src/components/CreateNewWorkflowModal.tsx',
  'src/components/RestoreVersionModal.tsx',
  'src/components/RollbackConfirmModal.tsx',
  'src/components/ViewDetailsModal.tsx'
];

console.log('Typography Migration Analysis');
console.log('============================\n');

filesToProcess.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${file}`);
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  let hasPatterns = false;
  
  console.log(`📁 ${file}:`);
  
  patterns.forEach(({ pattern, replacement, description }) => {
    const matches = content.match(pattern);
    if (matches) {
      console.log(`  🔍 ${description}: ${matches.length} matches`);
      hasPatterns = true;
    }
  });
  
  if (!hasPatterns) {
    console.log('  ✅ No patterns found');
  }
  
  console.log('');
});

console.log('\nMigration Instructions:');
console.log('1. Import typography components: import { H1, H2, H3, H4, H5, P, PSmall, PXSmall, Span, SpanSmall, SpanXSmall, DisplayLarge, DisplayMedium, DisplaySmall } from "@/components/ui/typography";');
console.log('2. Replace HTML elements with typography components');
console.log('3. Remove redundant className attributes that are now handled by the components');
console.log('4. Test the changes to ensure proper styling'); 