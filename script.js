document.addEventListener('DOMContentLoaded', function() {
    const nextButton = document.getElementById('nextButton');

    nextButton.addEventListener('click', function() {
        // Add a click animation
        nextButton.style.transform = 'scale(0.95)';

        setTimeout(function() {
            nextButton.style.transform = '';
            // Navigate to the next page or show a message
            // For now, we'll show an alert as placeholder
            alert('Next button clicked! Ready to proceed to the next step.');
            // In a real application, you would navigate to another page:
            // window.location.href = 'next-page.html';
        }, 100);
    });
});
