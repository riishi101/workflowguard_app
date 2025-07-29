# Typography System

This document outlines the consistent typography system used across the WorkflowGuard application.

## Typography Components

### Headings

Use these components for all heading elements to ensure consistency:

- `H1` - Main page titles (text-4xl, font-bold)
- `H2` - Section titles (text-3xl, font-semibold)  
- `H3` - Subsection titles (text-2xl, font-semibold)
- `H4` - Card titles (text-xl, font-semibold)
- `H5` - Small section titles (text-lg, font-semibold)
- `H6` - Table headers (text-base, font-semibold)

### Paragraphs

Use these components for body text:

- `P` - Main body text (text-base, text-gray-700)
- `PSmall` - Smaller body text (text-sm, text-gray-600)
- `PXSmall` - Extra small text (text-xs, text-gray-500)

### Spans

Use these for inline text elements:

- `Span` - Inline text (text-base, text-gray-700)
- `SpanSmall` - Small inline text (text-sm, text-gray-600)
- `SpanXSmall` - Extra small inline text (text-xs, text-gray-500)

### Labels

Use these for form labels and small headings:

- `Label` - Form labels (text-sm, font-medium, text-gray-700)
- `LabelSmall` - Small labels (text-xs, font-medium, text-gray-600)

### Captions

Use for metadata and secondary information:

- `Caption` - Captions and metadata (text-xs, font-medium, text-gray-500)

### Display Components

Use these for large numbers and statistics:

- `DisplayLarge` - Large statistics (text-display-4xl, font-bold)
- `DisplayMedium` - Medium statistics (text-display-3xl, font-bold)
- `DisplaySmall` - Small statistics (text-display-2xl, font-bold)

### Links

Use these for consistent link styling:

- `Link` - Standard links (text-base, text-blue-600)
- `LinkSmall` - Small links (text-sm, text-blue-600)

## Usage Examples

```tsx
import { H1, H2, P, DisplayMedium, SpanSmall } from "@/components/ui/typography";

// Page header
<H1>Dashboard Overview</H1>

// Section header
<H2>Active Workflows</H2>

// Statistics
<DisplayMedium>99.9%</DisplayMedium>

// Body text
<P>This is the main content of the page.</P>

// Small text
<SpanSmall>Last updated: 2 hours ago</SpanSmall>
```

## Font Sizes Reference

- `text-4xl` (2.25rem) - H1, DisplayLarge
- `text-3xl` (1.875rem) - H2, DisplayMedium  
- `text-2xl` (1.5rem) - H3, DisplaySmall
- `text-xl` (1.25rem) - H4
- `text-lg` (1.125rem) - H5
- `text-base` (1rem) - H6, P, Span, Link
- `text-sm` (0.875rem) - PSmall, SpanSmall, Label, LinkSmall
- `text-xs` (0.75rem) - PXSmall, SpanXSmall, LabelSmall, Caption

## Color Guidelines

- **Primary text**: `text-gray-900` (headings)
- **Body text**: `text-gray-700` (paragraphs, spans)
- **Secondary text**: `text-gray-600` (small text, labels)
- **Muted text**: `text-gray-500` (captions, metadata)
- **Links**: `text-blue-600` with `hover:text-blue-800`

## Best Practices

1. **Always use typography components** instead of raw HTML elements
2. **Maintain hierarchy** - use H1 for main titles, H2 for sections, etc.
3. **Be consistent** - use the same component for similar content types
4. **Consider accessibility** - ensure proper heading hierarchy
5. **Use appropriate sizing** - don't use large text for small content
6. **Maintain color consistency** - use the predefined color classes

## Migration Guide

When updating existing code, replace:

```tsx
// Before
<h1 className="text-2xl font-semibold text-gray-900 mb-2">Title</h1>
<p className="text-sm text-gray-600">Content</p>

// After  
<H3 className="mb-2">Title</H3>
<PSmall>Content</PSmall>
```

This ensures consistent typography across the entire application. 