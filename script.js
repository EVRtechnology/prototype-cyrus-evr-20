document.addEventListener('DOMContentLoaded', function() {
    const nextButton = document.getElementById('nextButton');

    if (!nextButton) {
        console.error('Next button element not found');
        return;
    }

    nextButton.addEventListener('click', function() {
        nextButton.style.transform = 'scale(0.95)';

        setTimeout(function() {
            nextButton.style.transform = '';
            alert('Next button clicked! Ready to proceed to the next step.');
        }, 100);
    });
});
