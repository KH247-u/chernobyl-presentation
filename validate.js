/**
 * Presentation Verification Script
 * Validates index.html and style.css for project requirements.
 */
const fs = require('fs');
const path = require('path');

const indexHtmlPath = path.join(__dirname, 'index.html');
const styleCssPath = path.join(__dirname, 'style.css');
const appJsPath = path.join(__dirname, 'app.js');

let errors = [];
let warnings = [];

console.log('=== CHERNOBYL DISASTER PRESENTATION APP VALIDATION ===\n');

// 1. Check file existence
[indexHtmlPath, styleCssPath, appJsPath].forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`[OK] File exists: ${path.basename(file)}`);
    } else {
        errors.push(`Missing critical file: ${path.basename(file)}`);
    }
});

if (errors.length > 0) {
    console.error('\nCritical errors found during file checking. Aborting full validation.');
    console.error(errors.join('\n'));
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

// B. Check titles & structure
const requiredTitleKeywords = [
    'CHERNOBYL DISASTER',
    'What is a Nuclear Power Plant',
    'About the Chernobyl Plant',
    'Why the Disaster Happened',
    'The Explosion',
    'Immediate Emergency Response',
    'Evacuation & Disaster Management',
    'Containment Measures',
    'Health Effects',
    'Environmental Impact',
    'Wildlife After the Disaster',
    'Deaths and Long-Term Impact',
    'Lessons Learned',
    'Conclusion',
    'References & Thank You'
];

requiredTitleKeywords.forEach((title, idx) => {
    // Escape regex chars
    const escapedTitle = title.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(escapedTitle, 'i');
    if (regex.test(indexContent)) {
        console.log(`[OK] Found slide outline theme: "${title}"`);
    } else {
        warnings.push(`Possible missing slide theme: "${title}". Make sure slide content covers this topic.`);
    }
});

// C. Verify all slides have speaker notes
const speakerNotesMatches = indexContent.match(/class="speaker-notes-content"/gi);
const numSpeakerNotes = speakerNotesMatches ? speakerNotesMatches.length : 0;
if (numSpeakerNotes === 15) {
    console.log(`[OK] Every slide (15/15) has detailed speaker notes.`);
} else {
    errors.push(`Requirement failure: All slides must contain speaker notes. Found: ${numSpeakerNotes} speaker note sections.`);
}

// 3. Validate style.css projector constraints
const styleContent = fs.readFileSync(styleCssPath, 'utf8');

// A. Check colors
const projectorColorTokens = [
    '#FFD54F', // Safety Yellow
    '#26C6DA', // Cyan/Teal
    '#E53935', // Red
    '#43A047', // Green
    '#FFFFFF'  // White
];

projectorColorTokens.forEach(color => {
    if (styleContent.toLowerCase().includes(color.toLowerCase())) {
        console.log(`[OK] Projector-optimized color token verified: ${color}`);
    } else {
        warnings.push(`Projector-optimized color token not explicitly styled: ${color}`);
    }
});

// B. Ensure no medium/dark gray colors for text to avoid low contrast
const darkGrayHexPatterns = [/#333/i, /#444/i, /#555/i, /#666/i, /#777/i, /#888/i, /#999/i, /#aaa/i, /#bbb/i, /#ccc/i];
darkGrayHexPatterns.forEach(pattern => {
    if (pattern.test(styleContent)) {
        warnings.push(`Contrast check: Found dark/medium gray color match (${pattern.source}) in CSS. Ensure text contrast is kept high.`);
    }
});

// 4. Summarize validation
console.log('\n=== VALIDATION SUMMARY ===');
if (errors.length > 0) {
    console.error(`[FAILED] ${errors.length} error(s) found:`);
    errors.forEach(e => console.error(`  - ${e}`));
    process.exit(1);
} else {
    console.log('[PASSED] All structural and thematic tests passed successfully.');
    if (warnings.length > 0) {
        console.log('\nWarnings (recommendations only):');
        warnings.forEach(w => console.log(`  - ${w}`));
    }
    process.exit(0);
}
