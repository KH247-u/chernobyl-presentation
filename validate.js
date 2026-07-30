/**
 * Redesign Verification Script - Presentation Canvas Edition
 * Validates index.html, style.css, and app.js for presentation canvas scaling.
 */
const fs = require('fs');
const path = require('path');

const indexHtmlPath = path.join(__dirname, 'index.html');
const styleCssPath = path.join(__dirname, 'style.css');
const appJsPath = path.join(__dirname, 'app.js');

let errors = [];
let warnings = [];

console.log('=== PRESENTATION MODE CANVAS VALIDATION ===\n');

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

// C. Verify fullscreen UI button exists
if (indexContent.includes('id="fullscreen-btn"')) {
    console.log(`[OK] Fullscreen button (Present Mode toggle) exists in HTML.`);
} else {
    errors.push(`Requirement failure: Fullscreen button is missing in index.html!`);
}

// D. Verify fixed presentation canvas wrapper exists
if (indexContent.includes('id="presentation-canvas"')) {
    console.log(`[OK] Fixed 16:9 Presentation Canvas wrapper is configured in HTML.`);
} else {
    errors.push(`Requirement failure: Presentation canvas wrapper is missing in index.html!`);
}

// 3. Validate style.css constraints
const styleContent = fs.readFileSync(styleCssPath, 'utf8');

// A. Check for 1920x1080 canvas rules
if (styleContent.includes('width: 1920px') && styleContent.includes('height: 1080px')) {
    console.log(`[OK] Canvas dimensions are locked to 1920x1080 coordinates.`);
} else {
    errors.push(`Requirement failure: Canvas does not have static 1920px width and 1080px height styled.`);
}

// B. Check body overflow rule
if (styleContent.includes('overflow: hidden') || styleContent.includes('overflow:hidden')) {
    console.log(`[OK] Page scrollbars are successfully disabled via overflow rules.`);
} else {
    warnings.push(`Page overflow is not set to hidden in style.css. Ensure scrolling is disabled.`);
}

// 4. Validate app.js
const appContent = fs.readFileSync(appJsPath, 'utf8');
if (appContent.includes('resizeCanvas') && appContent.includes('Math.min(scaleX, scaleY)')) {
    console.log(`[OK] JavaScript scale calculation matrix is active.`);
} else {
    errors.push(`Requirement failure: Scaling calculations are missing in app.js.`);
}

if (appContent.includes('requestFullscreen') && (appContent.includes('"F"') || appContent.includes('"f"'))) {
    console.log(`[OK] Fullscreen API triggers and 'F' key togglers are verified.`);
} else {
    errors.push(`Requirement failure: Fullscreen toggle hotkey bindings are missing in app.js.`);
}

// 5. Summarize validation
console.log('\n=== VALIDATION SUMMARY ===');
if (errors.length > 0) {
    console.error(`[FAILED] ${errors.length} error(s) found:`);
    errors.forEach(e => console.error(`  - ${e}`));
    process.exit(1);
} else {
    console.log('[PASSED] All Presentation Mode constraints verified successfully.');
    process.exit(0);
}
