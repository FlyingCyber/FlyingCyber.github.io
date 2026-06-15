document.getElementById('cyber-contact-form').addEventListener('submit', function(e) {
    e.preventDefault(); // Stop the page from reloading or redirecting

    // 1. Replace with your actual Google Form URL ending in /formResponse
    const googleFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLScT_roEROK2N5Fau6-sP7bL0kBcw2kSZpFqusyC6ccAEtJbNA/formResponse";
    
    // 2. Gather the form data automatically
    const formData = new FormData(this);

    // 3. Send the data silently to Google
    fetch(googleFormUrl, {
        method: 'POST',
        mode: 'no-cors', // <-- This bypasses the permission/CORS block!
        body: formData
    })
    .then(() => {
        // 4. What happens when it successfully sends:
        document.getElementById('cyber-contact-form').style.display = 'none'; // Hide the form
        document.getElementById('successMessage').style.display = 'block'; // Show thank you message
    })
    .catch(error => {
        console.error('Error submitting form:', error);
        alert('Something went wrong. Please try again.');
    });
});