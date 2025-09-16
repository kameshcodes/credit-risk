document.addEventListener('DOMContentLoaded', function() {
    const dayCards = document.querySelectorAll('.day-card');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const totalDays = dayCards.length;
    let completedDays = 0;

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