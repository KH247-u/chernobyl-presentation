document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const container = document.getElementById("presentation-container");
    const canvas = document.getElementById("presentation-canvas");
    const slides = Array.from(document.querySelectorAll(".slide"));
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    const progressBar = document.getElementById("slide-progress-bar");
    const timelineIndicator = document.getElementById("timeline-indicator-active");
    const headerSlideNumSpan = document.getElementById("current-slide-num");
    const fullscreenBtn = document.getElementById("fullscreen-btn");
    
    let currentSlideIndex = 0;
    const totalSlides = slides.length;

    // ==========================================================================
    // Dynamic 16:9 Scaling Math
    // ==========================================================================
    function resizeCanvas() {
        if (!container || !canvas) return;
        
        const targetWidth = 1920;
        const targetHeight = 1080;
        
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // Calculate scaling factor to fit window bounds
        const scaleX = windowWidth / targetWidth;
        const scaleY = windowHeight / targetHeight;
        const scale = Math.min(scaleX, scaleY);
        
        // Apply scaling
        canvas.style.transform = `scale(${scale})`;
    }

    // Bind resize events
    window.addEventListener("resize", resizeCanvas);
    // Trigger initial scale computation
    resizeCanvas();
    // Run scale calculation slightly delayed to ensure page measurements are ready
    setTimeout(resizeCanvas, 50);

    // ==========================================================================
    // Fullscreen API Actions
    // ==========================================================================
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            // Request Fullscreen on the outer viewport container
            container.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    if (fullscreenBtn) {
        fullscreenBtn.addEventListener("click", toggleFullscreen);
    }

    // Monitor fullscreen state switches (handles Esc button as well)
    document.addEventListener("fullscreenchange", () => {
        const enterIcon = document.querySelector(".enter-fullscreen");
        const exitIcon = document.querySelector(".exit-fullscreen");
        
        if (document.fullscreenElement) {
            if (enterIcon) enterIcon.style.display = "none";
            if (exitIcon) exitIcon.style.display = "block";
            if (fullscreenBtn) fullscreenBtn.title = "Exit Present (F)";
        } else {
            if (enterIcon) enterIcon.style.display = "block";
            if (exitIcon) exitIcon.style.display = "none";
            if (fullscreenBtn) fullscreenBtn.title = "Present (F)";
        }
        
        // Re-scale immediately to snap to monitor dimensions
        resizeCanvas();
        setTimeout(resizeCanvas, 100);
    });

    // ==========================================================================
    // Slide Navigation Setup
    // ==========================================================================

    // Go to specific slide
    function goToSlide(index) {
        if (index < 0 || index >= totalSlides) return;
        
        // Remove active class from old slide
        slides[currentSlideIndex].classList.remove("active");
        
        // Update index
        currentSlideIndex = index;
        
        // Add active class to new slide
        slides[currentSlideIndex].classList.add("active");
        
        // Update progress controls
        updateUI();
    }

    // Update UI elements (progress bar, timeline indicator, buttons, counters)
    function updateUI() {
        // Update buttons state
        prevBtn.disabled = currentSlideIndex === 0;
        nextBtn.disabled = currentSlideIndex === totalSlides - 1;

        // Update counters
        if (headerSlideNumSpan) headerSlideNumSpan.textContent = currentSlideIndex + 1;

        // Update top progress bar (linear width scaling)
        const progressPercentage = ((currentSlideIndex + 1) / totalSlides) * 100;
        if (progressBar) {
            progressBar.style.width = `${progressPercentage}%`;
        }

        // Update footer timeline indicator width
        if (timelineIndicator) {
            timelineIndicator.style.width = `${progressPercentage}%`;
            
            // Shift color along gradient checkpoints
            let color = "var(--accent-cyan)";
            if (progressPercentage > 75) {
                color = "var(--accent-red)";
            } else if (progressPercentage > 50) {
                color = "var(--accent-orange)";
            } else if (progressPercentage > 25) {
                color = "var(--accent-yellow)";
            }
            timelineIndicator.style.backgroundColor = color;
        }
    }

    // Event Listeners for Navigation Controls
    prevBtn.addEventListener("click", () => goToSlide(currentSlideIndex - 1));
    nextBtn.addEventListener("click", () => goToSlide(currentSlideIndex + 1));

    // Keyboard Navigation & Hotkeys
    document.addEventListener("keydown", (e) => {
        // Toggle Fullscreen on 'F' key (avoid if user is typing, though no input is present here)
        if (e.key === "f" || e.key === "F") {
            toggleFullscreen();
            return;
        }

        switch (e.key) {
            case "ArrowRight":
            case "PageDown":
                goToSlide(currentSlideIndex + 1);
                break;
            case "ArrowLeft":
            case "PageUp":
                goToSlide(currentSlideIndex - 1);
                break;
            case " ": // Spacebar
                e.preventDefault(); // Prevent default viewport scrolling
                goToSlide(currentSlideIndex + 1);
                break;
        }
    });

    // ==========================================================================
    // Slide 2: Interactive Fission Flow Diagram
    // ==========================================================================
    const flowSteps = Array.from(document.querySelectorAll(".flow-step"));
    const flowCaption = document.getElementById("flow-caption");

    const flowDescriptions = {
        "step-fission": "<strong>1. Nuclear Fission:</strong> Uranium-235 atoms split when hit by neutrons, releasing massive thermal energy and additional neutrons, sustaining the chain reaction.",
        "step-steam": "<strong>2. Steam Generation:</strong> Water circulates through the Reactor Core, absorbing the fission heat, and boils into high-pressure, superheated steam.",
        "step-turbine": "<strong>3. Turbine Rotation:</strong> The high-pressure steam expands against the blades of the Steam Turbine, forcing the turbine shaft to spin at high speeds.",
        "step-electricity": "<strong>4. Electricity Output:</strong> The spinning turbine turns the electromagnetic rotor of the Generator, generating high-voltage electric currents for the power grid."
    };

    flowSteps.forEach(step => {
        step.addEventListener("click", () => {
            // Deactivate all steps
            flowSteps.forEach(s => s.classList.remove("active"));
            
            // Activate clicked step
            step.classList.add("active");
            
            // Update explanation
            const stepId = step.id;
            if (flowDescriptions[stepId]) {
                flowCaption.innerHTML = flowDescriptions[stepId];
            }
        });
    });

    // ==========================================================================
    // Slide 8: Before/After Containment Slider
    // ==========================================================================
    const sliderBar = document.getElementById("slider-bar");
    const sliderImageOverlay = document.getElementById("slider-image-overlay");
    const sliderFrame = document.querySelector(".slider-frame");

    if (sliderBar && sliderImageOverlay && sliderFrame) {
        let isDragging = false;

        function setSliderPosition(xCoord) {
            const rect = sliderFrame.getBoundingClientRect();
            
            // Factor in current CSS zoom scale on parent canvas
            const canvasScale = canvas.getBoundingClientRect().width / canvas.offsetWidth;
            
            let relativeX = (xCoord - rect.left) / canvasScale;
            
            // Clamp value within bounds
            const rawWidth = sliderFrame.offsetWidth;
            if (relativeX < 0) relativeX = 0;
            if (relativeX > rawWidth) relativeX = rawWidth;

            const percentage = (relativeX / rawWidth) * 100;
            sliderBar.style.left = `${percentage}%`;
            sliderImageOverlay.style.width = `${percentage}%`;
        }

        // Mouse Drag Events
        sliderBar.addEventListener("mousedown", (e) => {
            isDragging = true;
            e.preventDefault();
        });

        window.addEventListener("mouseup", () => {
            isDragging = false;
        });

        window.addEventListener("mousemove", (e) => {
            if (!isDragging) return;
            setSliderPosition(e.clientX);
        });

        // Touch Drag Events
        sliderBar.addEventListener("touchstart", (e) => {
            isDragging = true;
        });

        window.addEventListener("touchend", () => {
            isDragging = false;
        });

        window.addEventListener("touchmove", (e) => {
            if (!isDragging) return;
            if (e.touches && e.touches[0]) {
                setSliderPosition(e.touches[0].clientX);
            }
        });

        // Click on Frame to slide immediately
        sliderFrame.addEventListener("click", (e) => {
            if (e.target !== sliderBar && !sliderBar.contains(e.target)) {
                setSliderPosition(e.clientX);
            }
        });
    }

    // ==========================================================================
    // Initialization
    // ==========================================================================
    updateUI();
});
