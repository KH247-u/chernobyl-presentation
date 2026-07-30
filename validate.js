/**
 * Redesign Verification Script
 * Validates index.html and style.css for redesigned presentation constraints.
 */
const fs = require('fs');
const path = require('path');

const indexHtmlPath = path.join(__dirname, 'index.html');
const styleCssPath = path.join(__dirname, 'style.css');
const appJsPath = path.join(__dirname, 'app.js');

let errors = [];
let warnings = [];

console.log('=== REDESIGNED CHERNOBYL PRESENTATION VALIDATION ===\n');

// 1. Check file existence
[indexHtmlPath, styleCssPath, appJsPath].forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`[OK] File exists: ${path.basename(file)}`);
    } else {
        errors.push(`Missing critical file: ${path.basename(file)}`);
    }
});

if (errors.length > 0) {
    console.error('\nCritical errors found during file checking. Aborting.');
    process.exit(1);
}

// 2. Validate index.html content
const indexContent = fs.readFileSync(indexHtmlPath, 'utf8');

// A. Check number of slides
const slideMatches = indexContent.match(/<section[^>]*class="[^"]*slide[^"]*"[^>]*>/gi);
const numSlides = slideMatches ? slideMatches.length : 0;
if (numSlides === 15) {
    console.log(`[OK] Contains exactly 15 slides (Found: ${numSlides})`);
} else {
    errors.push(`Requirement failure: Presentation must have exactly 15 slides. Found: ${numSlides}`);
}

// B. Check that speaker notes are COMPLETELY REMOVED
const speakerNotesDrawerMatches = indexContent.match(/speaker-notes-drawer/gi);
const speakerNotesClassMatches = indexContent.match(/class="speaker-notes-content"/gi);
const speakerNotesBtnMatches = indexContent.match(/notes-toggle-btn/gi);

if (!speakerNotesDrawerMatches && !speakerNotesClassMatches && !speakerNotesBtnMatches) {
    console.log(`[OK] Speaker notes features are completely removed from HTML.`);
} else {
    errors.push(`Requirement failure: Speaker notes references still exist in index.html!`);
}

// C. Verify all slide bullet count limits (max 5 bullet points)
// Check if any ul block has more than 5 list items. We'll search for ul tags and count their children.
const slideBlocks = indexContent.split(/<section[^>]*class="[^"]*slide[^"]*"[^>]*>/i);
// Skip the first block as it is before the first slide
slideBlocks.shift();

slideBlocks.forEach((block, idx) => {
    const listMatches = block.match(/<li[^>]*>/gi);
    const numBullets = listMatches ? listMatches.length : 0;
    if (numBullets > 5) {
        errors.push(`Slide ${idx + 1} has ${numBullets} bullet points (Limit is 5).`);
    } else {
        console.log(`[OK] Slide ${idx + 1} bullet count: ${numBullets} (under limit)`);
    }
});

// 3. Validate style.css constraints
const styleContent = fs.readFileSync(styleCssPath, 'utf8');

// A. Check that progress bar is 6-8px
const progressHeightMatches = styleContent.match(/height:\s*(6|7|8)px/i);
if (progressHeightMatches) {
    console.log(`[OK] Top progress bar thickness is between 6-8px (Found: ${progressHeightMatches[0]}).`);
} else {
    warnings.push(`Progress bar thickness might not be styled between 6-8px.`);
}

// B. Verify animated gradient colors
const gradientColors = [
    '#26c6da', // Cyan
    '#ffd54f', // Yellow
    '#ff9100', // Orange
    '#e53935'  // Red
];
let colorCount = 0;
gradientColors.forEach(color => {
    if (styleContent.toLowerCase().includes(color)) {
        colorCount++;
    }
});
if (colorCount >= 3) {
    console.log(`[OK] Widescreen layout matches projector safety gradient theme colors.`);
} else {
    warnings.push(`Projector gradient safety colors are missing or styled differently (Found ${colorCount}/4).`);
}

// 4. Validate app.js
const appContent = fs.readFileSync(appJsPath, 'utf8');
const drawerLogicMatches = appContent.match(/speaker-notes-drawer|notesToggleBtn|notesBody|toggleSpeakerNotes/gi);
if (!drawerLogicMatches) {
    console.log(`[OK] Speaker notes JS controllers are successfully removed.`);
} else {
    errors.push(`Requirement failure: app.js contains residual speaker notes logic!`);
}

// 5. Summarize validation
console.log('\n=== REDESIGN VALIDATION SUMMARY ===');
if (errors.length > 0) {
    console.error(`[FAILED] ${errors.length} error(s) found:`);
    errors.forEach(e => console.error(`  - ${e}`));
    process.exit(1);
} else {
    console.log('[PASSED] All redesign structural checks passed successfully.');
    if (warnings.length > 0) {
        console.log('\nWarnings:');
        warnings.forEach(w => console.log(`  - ${w}`));
    }
    process.exit(0);
}
