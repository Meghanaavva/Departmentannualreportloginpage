# Annual Report Portal - Implementation Guide

## Overview
This guide explains how to implement the requested features in the Annual Report Portal. Most features are already implemented in the current code.

## Feature 1: Row Selection & Highlighting

### Current Implementation
The state variables already exist:
```typescript
const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
const [selectedRowSection, setSelectedRowSection] = useState<number | null>(null);
```

### Required Changes
Add the following to each `<TableRow>` in sections 5, 7, and 20:

**For Section 5 (Faculty) - Line ~2385:**
```typescript
<TableRow 
  key={index} 
  className={`hover:bg-gray-50 cursor-pointer transition-colors ${
    selectedRowSection === section.id && selectedRowIndex === index 
      ? 'bg-blue-100 border-l-4' 
      : ''
  }`}
  style={selectedRowSection === section.id && selectedRowIndex === index ? { borderLeftColor: primaryColor } : {}}
  onClick={() => {
    setSelectedRowIndex(index);
    setSelectedRowSection(section.id);
  }}
>
```

**For Section 7 (Students) - Line ~2581:**
Same pattern as above

**For Section 20 (Placements) - Line ~3335:**
Same pattern as above

## Feature 2: Year-Based Logic ✅ ALREADY IMPLEMENTED

### Sections 1-4 (Fixed across years)
- Uses `'master'` key in sectionData
- Function `getSectionTextData(sectionId, field, defaultValue)` returns from 'master' for sections 1-4
- Function `saveSectionData(sectionId, data)` saves to 'master' for sections 1-4

### Sections 5-24 (Dynamic per year)
- Uses `selectedYear` key in data structures
- `getSectionData(sectionId, dataType)` returns data for current selectedYear
- All saves go to year-specific location

## Feature 3: Green Status Dots ✅ ALREADY IMPLEMENTED

### Function `hasSectionData(sectionId)` (Line ~832)
Already checks:
- Sections 1-3: Check master data for any non-empty values
- Section 4: Returns true only for years 2024-25 and 2023-24
- Sections 5, 7, 20: Check if array data exists for selectedYear
- Sections 6, 8-19, 21-24: Check if year-specific sectionData has values

Green dots appear at:
- Line ~3809: Sidebar navigation
- Line ~3948: Section cards grid

## Feature 4: Download Report with Selected Sections ✅ ALREADY IMPLEMENTED

### Section Selection Dialog (Line ~4337)
- Users can select/deselect sections
- `selectedSectionsForDownload` state tracks selections

### Download Function (Line ~883)
```typescript
const handleDownloadReport = useCallback(() => {
  const sectionsToInclude = sections.filter(section => 
    selectedSectionsForDownload[section.id]
  );
  // Only selected sections are included in PDF
}, [selectedYear, allYearData, sections, sectionData, selectedSectionsForDownload]);
```

## Feature 5: Import & Save Functionality ✅ ALREADY IMPLEMENTED

### Import with Auto-Fill (Line ~1339)
- `processExcelFile()` handles CSV, JSON, TXT, DOC, Excel
- `matchField()` smart field matcher (Line ~1315)
- Auto-fills matching fields based on field name similarity

### Save with Change Detection (Line ~1771)
```typescript
const saveSectionData = useCallback((sectionId: number, data: SectionTextData) => {
  const originalData = sectionData[yearKey]?.[sectionId] || {};
  const hasChanges = JSON.stringify(originalData) !== JSON.stringify(data);
  
  if (!hasChanges && Object.keys(originalData).length > 0) {
    toast.info('No changes detected');
    return;
  }
  // Only saves if there are actual changes
}, [selectedYear, sectionData]);
```

## Feature 6: Move Download Button to Top ✅ NEEDS UPDATE

### Current Location (Line ~4444)
Download button is at the bottom of section selection dialog.

### Required Change:
Move the download button section (lines 4444-4462) to AFTER line 4348 (after DialogDescription) and BEFORE line 4350 (before the space-y-4 div):

```typescript
          </DialogHeader>
          
          {/* Action Buttons - MOVED TO TOP */}
          <div className="flex justify-end gap-3 px-6 py-4 border-b bg-gray-50">
            <Button
              variant="outline"
              onClick={() => setShowSectionSelectDialog(false)}
              className="hover:bg-gray-100 hover:shadow-sm transition-all"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDownloadReport}
              className="hover:shadow-md transition-all"
              style={{ backgroundColor: primaryColor, color: 'white' }}
              disabled={Object.values(selectedSectionsForDownload).filter(Boolean).length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Selected Sections
            </Button>
          </div>
          
          <div className="space-y-4 py-4">
```

Then remove the duplicate button section at the bottom (lines 4444-4462).

## Summary of Implementation Status

| Feature | Status | Lines |
|---------|--------|-------|
| Row Selection & Highlighting | **Needs 3 edits** | 2385, 2581, 3335 |
| Year-Based Logic | ✅ Complete | 1822-1849 |
| Green Status Dots | ✅ Complete | 832-879 |
| Download with Selection | ✅ Complete | 883-1108 |
| Import Auto-Fill | ✅ Complete | 1339-1630 |
| Save with Change Detection | ✅ Complete | 1771-1818 |
| Download Button Position | **Needs 1 edit** | 4337-4463 |

## Testing Checklist

- [ ] Click a row in Faculty section - should highlight with blue background
- [ ] Click a row in Student section - should highlight
- [ ] Click a row in Placement section - should highlight
- [ ] Edit data in Section 1-4 - should show "Fixed for all years"
- [ ] Edit data in Section 5+ - should show year-specific message
- [ ] Check green dots appear only for sections with data
- [ ] Change year - green dots should update based on that year's data
- [ ] Download report - only selected sections should be included
- [ ] Import CSV/Excel - fields should auto-fill
- [ ] Click save without changes - should show "No changes detected"
- [ ] Edit data and save - should show "X changes updated"
- [ ] Download button should appear at top of section selection dialog

## Quick Fix Code Blocks

### Add to TableRow for Faculty (replace line 2385):
```jsx
<TableRow 
  key={index}
  className={`hover:bg-gray-50 cursor-pointer transition-colors ${selectedRowSection === section.id && selectedRowIndex === index ? 'bg-blue-100 border-l-4' : ''}`}
  style={selectedRowSection === section.id && selectedRowIndex === index ? { borderLeftColor: primaryColor } : {}}
  onClick={() => { setSelectedRowIndex(index); setSelectedRowSection(section.id); }}
>
```

### Relocate Download Button (in Dialog at line ~4348):
Move button div from bottom (line 4444) to top (after line 4348), wrapped in a gray banner for better visibility.
