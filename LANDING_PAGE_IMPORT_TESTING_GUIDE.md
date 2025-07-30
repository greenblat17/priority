# Landing Page Import Feature - Testing Guide

## Overview
The GTM Manifest can now be automatically populated by importing data from your landing page. This feature uses AI to intelligently extract product information, saving time during onboarding.

## How to Test

### 1. Access the Import Feature
- Go to **Onboarding** (`/onboarding/gtm-setup`) or **Settings** (`/settings/gtm`)
- Look for the **"Import from Landing Page"** button in the top-right of the form
- Click the button to open the import dialog

### 2. Import Process
1. **Enter URL**: Type or paste your landing page URL (must be https:// or http://)
2. **Click Import**: The system will:
   - Fetch your landing page
   - Extract metadata and content
   - Use AI to analyze and structure the information
3. **Review Results**: The form will auto-fill with extracted data
4. **Edit as Needed**: All fields remain editable
5. **Save**: Click "Complete Setup" or "Save Changes"

### 3. Test URLs to Try
- Your own product landing page
- Popular SaaS products (e.g., https://www.notion.so)
- Developer tools (e.g., https://vercel.com)
- Open source projects with good landing pages

### 4. What Gets Extracted
- **Product Name**: From title, headings, or brand mentions
- **Product Description**: Summary of what the product does
- **Target Audience**: Who the product is for
- **Value Proposition**: Unique value provided
- **Current Stage**: Guessed from content maturity
- **Business Model**: How it makes money
- **Tech Stack**: Technologies detected or mentioned

### 5. Expected Behaviors
- **Loading State**: Shows spinner while importing
- **Success**: Form fills with data, success toast appears
- **Partial Data**: Some fields may be empty if not detected
- **Error Handling**: Clear error messages for:
  - Invalid URLs
  - Unreachable pages
  - Timeout (10 seconds)
  - Parsing failures

### 6. Edge Cases to Test
- Landing pages with minimal content
- Single-page applications (SPAs)
- Pages with auth walls
- Non-English content
- Technical documentation sites
- Pages with heavy JavaScript rendering

### 7. Security Features
- Only accepts valid HTTP/HTTPS URLs
- 10-second timeout prevents hanging
- User must be authenticated
- No JavaScript execution from scraped pages
- Limited content extraction (3000 chars)

## Troubleshooting

### Import Button Not Visible
- Ensure you're on the GTM setup or settings page
- Check browser console for errors

### Import Fails
- Verify the URL is publicly accessible
- Check if the page loads in your browser
- Try a different URL to isolate the issue

### No Data Extracted
- Some pages may not have enough content
- AI might not detect certain information types
- Manual entry is always available as fallback

### Form Doesn't Update
- Check browser console for errors
- Ensure JavaScript is enabled
- Try refreshing the page

## Success Criteria
✅ Import button is visible and clickable
✅ Dialog opens with URL input field
✅ Valid URLs are accepted
✅ Loading state shows during import
✅ Form auto-fills with extracted data
✅ User can edit imported data
✅ Save works with imported data
✅ Error messages are clear and helpful

## Next Steps
After successful import:
1. Review all extracted information
2. Fill in any missing fields
3. Adjust descriptions to match your vision
4. Save to start getting better AI prioritization!