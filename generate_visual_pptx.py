import asyncio
import os
from playwright.async_api import async_playwright
from pptx import Presentation
from pptx.util import Inches

async def generate_screenshots():
    # Ensure screenshots directory exists
    if not os.path.exists('screenshots'):
        os.makedirs('screenshots')

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        # Create a page with 1920x1080 resolution
        page = await browser.new_page(viewport={"width": 1920, "height": 1080})
        
        # Construct absolute file URL
        file_path = os.path.abspath('index.html')
        file_url = f"file:///{file_path.replace(chr(92), '/')}"
        
        print(f"Loading page: {file_url}")
        await page.goto(file_url, wait_until="networkidle")
        
        # Get total slides
        total_slides = await page.evaluate("() => document.querySelectorAll('.slide').length")
        print(f"Found {total_slides} slides.")
        
        # Hide the progress bar and navigation UI for cleaner screenshots if desired
        # Or keep them since user wants it "exactly like same look". We will keep them.
        
        screenshot_paths = []
        
        for i in range(total_slides):
            print(f"Capturing slide {i+1}...")
            # Use the global goToSlide function we know exists in app.js, or simulate right arrow
            await page.evaluate(f"if (typeof goToSlide === 'function') {{ goToSlide({i}); }} else {{ document.querySelectorAll('.slide').forEach(s => s.classList.remove('active')); document.querySelectorAll('.slide')[{i}].classList.add('active'); }}")
            
            # Remove explosion effect overlay just for the screenshot so it doesn't cover everything
            await page.evaluate("document.body.classList.remove('trigger-glitch')")
            
            # Wait for transitions
            await page.wait_for_timeout(800)
            
            # Screenshot the canvas exactly
            canvas = await page.query_selector("#presentation-canvas")
            screenshot_path = f"screenshots/slide_{i+1}.png"
            await canvas.screenshot(path=screenshot_path)
            screenshot_paths.append(screenshot_path)
            
        await browser.close()
        return screenshot_paths

def create_pptx(screenshot_paths):
    prs = Presentation()
    # Set slide size to 16:9 (1920x1080 is 16:9)
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    
    blank_layout = prs.slide_layouts[6] # Usually 6 is blank
    
    for idx, path in enumerate(screenshot_paths):
        slide = prs.slides.add_slide(blank_layout)
        # Add picture filling the whole slide
        slide.shapes.add_picture(path, 0, 0, width=prs.slide_width, height=prs.slide_height)
        print(f"Added slide {idx+1} to PPTX")
        
    pptx_filename = 'Chernobyl_Disaster_Visual.pptx'
    prs.save(pptx_filename)
    print(f"Successfully saved {pptx_filename}")

async def main():
    paths = await generate_screenshots()
    create_pptx(paths)

if __name__ == '__main__':
    asyncio.run(main())
