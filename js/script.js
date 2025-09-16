document.addEventListener('DOMContentLoaded', function() {
    const dayCards = document.querySelectorAll('.day-card');
    const conceptCards = document.querySelectorAll('.concept-card');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const totalDays = dayCards.length;
    let completedDays = 0;
    let completedConcepts = 0;

    const updateProgress = () => {
        const progressPercentage = (completedDays / totalDays) * 100;
        progressBar.style.width = `${progressPercentage}%`;
        progressText.textContent = `${completedDays} / ${totalDays} Modules Complete`;
    };

    dayCards.forEach(card => {
        const completeBtn = card.querySelector('.complete-btn');
        const day = card.dataset.day;

        if (localStorage.getItem(`day-${day}-complete`) === 'true') {
            completedDays++;
            card.classList.add('bg-green-50', 'border', 'border-green-200');
            completeBtn.textContent = 'Completed';
            completeBtn.disabled = true;
        }

        completeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (localStorage.getItem(`day-${day}-complete`) !== 'true') {
                localStorage.setItem(`day-${day}-complete`, 'true');
                completedDays++;
                card.classList.add('bg-green-50', 'border', 'border-green-200');
                completeBtn.textContent = 'Completed';
                completeBtn.disabled = true;
                updateProgress();
            }
        });
    });

    // Handle concept card completion
    conceptCards.forEach(card => {
        const conceptCompleteBtn = card.querySelector('.concept-complete-btn');
        const concept = card.dataset.concept;

        // Check completion status and update UI accordingly
        const completionStatus = localStorage.getItem(`concept-${concept}-status`) || 'mark-complete';
        updateConceptButtonState(card, completionStatus);
        
        if (completionStatus === 'completed') {
            completedConcepts++;
        }

        // Add click functionality for button - only allows reversion from completed to mark-complete
        conceptCompleteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent triggering the card click event
            const currentStatus = localStorage.getItem(`concept-${concept}-status`) || 'mark-complete';
            
            if (currentStatus === 'completed') {
                // Allow reversion from completed to mark-complete
                localStorage.setItem(`concept-${concept}-status`, 'mark-complete');
                updateConceptButtonState(card, 'mark-complete');
                completedConcepts--;
                updateProgress();
            }
            // Button does nothing for mark-complete or in-progress states
        });

        // Add click functionality for card - starts in-progress when card is clicked
        card.addEventListener('click', (e) => {
            // Don't trigger if button was clicked
            if (e.target.classList.contains('concept-complete-btn')) {
                return;
            }
            
            const currentStatus = localStorage.getItem(`concept-${concept}-status`) || 'mark-complete';
            
            if (currentStatus === 'mark-complete') {
                // Start in-progress when card is clicked
                localStorage.setItem(`concept-${concept}-status`, 'in-progress');
                updateConceptButtonState(card, 'in-progress');
            }
            
            // Continue with original popup functionality
            if (concept === 'discrimination') {
                openDiscriminationPopup();
            } else if (concept === 'calibration') {
                openCalibrationPopup();
            }
        });
    });

    // Function to update button state and card appearance
    function updateConceptButtonState(card, status) {
        const btn = card.querySelector('.concept-complete-btn');
        
        // Reset classes
        card.classList.remove('concept-completed', 'concept-mark-complete', 'concept-in-progress');
        btn.classList.remove('bg-red-500', 'bg-yellow-500', 'bg-green-500');
        
        switch(status) {
            case 'mark-complete':
                btn.textContent = 'Mark Complete';
                btn.classList.add('bg-red-500');
                card.classList.add('concept-mark-complete');
                break;
            case 'in-progress':
                btn.textContent = 'In Progress';
                btn.classList.add('bg-yellow-500');
                card.classList.add('concept-in-progress');
                break;
            case 'completed':
                btn.textContent = 'Completed';
                btn.classList.add('bg-green-500');
                card.classList.add('concept-completed');
                break;
        }
    }

    // Function to mark concept as complete (only via scroll)
    function markConceptComplete(concept) {
        const currentStatus = localStorage.getItem(`concept-${concept}-status`) || 'mark-complete';
        
        // Only auto-complete if status is 'in-progress' (user has manually indicated intent)
        if (currentStatus === 'in-progress') {
            localStorage.setItem(`concept-${concept}-status`, 'completed');
            completedConcepts++;
            
            const card = document.querySelector(`[data-concept="${concept}"]`);
            updateConceptButtonState(card, 'completed');
            updateProgress();
        }
    }

    // Add scroll detection to popups
    function addScrollDetection(popupId, concept) {
        const popup = document.getElementById(popupId);
        if (popup) {
            const popupContent = popup.querySelector('.popup-content');
            if (popupContent) {
                popupContent.addEventListener('scroll', function() {
                    const scrollTop = popupContent.scrollTop;
                    const scrollHeight = popupContent.scrollHeight;
                    const clientHeight = popupContent.clientHeight;
                    
                    // Check if user has scrolled to 90% of the content
                    const scrollPercent = (scrollTop + clientHeight) / scrollHeight;
                    if (scrollPercent >= 0.9) {
                        markConceptComplete(concept);
                    }
                });
            }
        }
    }

    // Initialize scroll detection for both popups
    setTimeout(() => {
        addScrollDetection('discriminationPopup', 'discrimination');
        addScrollDetection('calibrationPopup', 'calibration');
    }, 100);

    updateProgress();

    const ctx = document.getElementById('metricsChart').getContext('2d');
    const metricsData = {
        labels: ['AUC/Gini', 'KS Statistic', 'Brier Score', 'Calibration Plot', 'HL Test'],
        datasets: [{
            label: 'Rank-Order Sensitivity',
            data: [5, 5, 2, 2, 2],
            backgroundColor: 'rgba(59, 130, 246, 0.7)',
        }, {
            label: 'Probability Accuracy Sensitivity',
            data: [1, 1, 5, 5, 4],
            backgroundColor: 'rgba(16, 185, 129, 0.7)',
        }, {
            label: 'Threshold Dependence',
            data: [1, 5, 1, 1, 1],
            backgroundColor: 'rgba(239, 68, 68, 0.7)',
        }, {
            label: 'Visual Interpretation',
            data: [3, 3, 1, 5, 2],
            backgroundColor: 'rgba(249, 115, 22, 0.7)',
        }]
    };

    const metricsChart = new Chart(ctx, {
        type: 'bar',
        data: metricsData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
                x: {
                    stacked: true,
                    max: 15,
                    title: {
                        display: true,
                        text: 'Property Score (Higher is Stronger)'
                    }
                },
                y: {
                    stacked: true,
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Qualitative Properties of Validation Metrics',
                    font: { size: 16 }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.x !== null) {
                                label += context.parsed.x;
                            }
                            return label;
                        }
                    }
                }
            },
        }
    });
});

// Popup Functions
function openDiscriminationPopup() {
    const popup = document.getElementById('discriminationPopup');
    popup.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function openCalibrationPopup() {
    const popup = document.getElementById('calibrationPopup');
    popup.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closePopup() {
    const discriminationPopup = document.getElementById('discriminationPopup');
    const calibrationPopup = document.getElementById('calibrationPopup');
    
    if (discriminationPopup) discriminationPopup.style.display = 'none';
    if (calibrationPopup) calibrationPopup.style.display = 'none';
    
    document.body.style.overflow = 'auto'; // Restore scrolling
}

function closeCalibrationPopup() {
    closePopup();
}

// Close popup when clicking on overlay
document.addEventListener('DOMContentLoaded', function() {
    const discriminationPopup = document.getElementById('discriminationPopup');
    const calibrationPopup = document.getElementById('calibrationPopup');
    
    if (discriminationPopup) {
        discriminationPopup.addEventListener('click', function(e) {
            if (e.target === discriminationPopup) {
                closePopup();
            }
        });
    }
    
    if (calibrationPopup) {
        calibrationPopup.addEventListener('click', function(e) {
            if (e.target === calibrationPopup) {
                closePopup();
            }
        });
    }
    
    // Close popup with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closePopup();
        }
    });
});