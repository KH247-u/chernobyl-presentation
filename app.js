document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const slides = Array.from(document.querySelectorAll(".slide"));
    const dotsContainer = document.getElementById("slide-dots");
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    const notesToggleBtn = document.getElementById("notes-toggle-btn");
    const speakerNotesDrawer = document.getElementById("speaker-notes-drawer");
    const closeNotesBtn = document.getElementById("close-notes-btn");
    const notesBody = document.getElementById("notes-body");
    const progressBar = document.getElementById("slide-progress-bar");
    const currentSlideNumSpan = document.getElementById("current-slide-num");
    
    let currentSlideIndex = 0;
    const totalSlides = slides.length;

    // ==========================================================================
    // Slide Navigation Setup
    // ==========================================================================

    // Initialize slide dots
    function initDots() {
        dotsContainer.innerHTML = "";
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement("div");
            dot.classList.add("dot");
            if (i === 0) dot.classList.add("active");
            dot.title = `Slide ${i + 1}`;
            dot.addEventListener("click", () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }
    }

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
        
        // Load speaker notes
        loadSpeakerNotes();
    }

    // Update UI elements (progress bar, buttons, dots, counter)
    function updateUI() {
        // Update dots
        const dots = Array.from(document.querySelectorAll(".dot"));
        dots.forEach((dot, idx) => {
            if (idx === currentSlideIndex) {
                dot.classList.add("active");
            } else {
                dot.classList.remove("active");
            }
        });

        // Update buttons state
        prevBtn.disabled = currentSlideIndex === 0;
        nextBtn.disabled = currentSlideIndex === totalSlides - 1;

        // Update counter
        currentSlideNumSpan.textContent = currentSlideIndex + 1;

        // Update progress bar
        const progressPercentage = ((currentSlideIndex + 1) / totalSlides) * 100;
        progressBar.style.width = `${progressPercentage}%`;
    }

    // Load Speaker Notes for the active slide
    function loadSpeakerNotes() {
        const activeSlide = slides[currentSlideIndex];
        const notesContent = activeSlide.querySelector(".speaker-notes-content");
        
        if (notesContent) {
            notesBody.innerHTML = notesContent.innerHTML;
        } else {
            notesBody.innerHTML = "<p>No speaker notes available for this slide.</p>";
        }
    }

    // Toggle Speaker Notes Drawer
    function toggleSpeakerNotes() {
        speakerNotesDrawer.classList.toggle("closed");
    }

    // Close Speaker Notes Drawer
    function closeSpeakerNotes() {
        speakerNotesDrawer.classList.add("closed");
    }

    // Event Listeners for Navigation Controls
    prevBtn.addEventListener("click", () => goToSlide(currentSlideIndex - 1));
    nextBtn.addEventListener("click", () => goToSlide(currentSlideIndex + 1));
    notesToggleBtn.addEventListener("click", toggleSpeakerNotes);
    closeNotesBtn.addEventListener("click", closeSpeakerNotes);

    // Keyboard Navigation
    document.addEventListener("keydown", (e) => {
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
                e.preventDefault(); // Prevent page scrolling
                goToSlide(currentSlideIndex + 1);
                break;
            case "n":
            case "N":
                toggleSpeakerNotes();
                break;
            case "Escape":
                closeSpeakerNotes();
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
            let relativeX = xCoord - rect.left;
            
            // Clamp value within bounds
            if (relativeX < 0) relativeX = 0;
            if (relativeX > rect.width) relativeX = rect.width;

            const percentage = (relativeX / rect.width) * 100;
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

        // Touch Drag Events (Mobile & Classroom Smartboards)
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
    initDots();
    updateUI();
    loadSpeakerNotes();
});
