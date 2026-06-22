// v0.1.8 2026-06-15

// define the scoring system for the phishing email calculator
const scoringSystem = {
    sender: { yes: 0, no: 3 },
    urgency: { yes: 3, no: 0 },
    money: { yes: 5, no: 0 },
    download: { yes: 5, no: 0 },
    cp: { yes: 5, no: 0 },
    prosecution: { yes: 5, no: 0 },
    payment: { giftcards: 15, crypto: 15, creditcard: 2, bank: 5, na: 0 },
    power: { yes: 5, no: 0 },
    number: { yes: 10, no: 0 },
    free: { yes: 10, no: 0 },
};

// DOM elements 
const submitBtn = document.getElementById('phish-submit');
const modalOverlay = document.getElementById('phish-modal');
const closeModal = document.getElementById('close-modal');
const form = document.getElementById('phish-form');

submitBtn.addEventListener('click', function () {

    const formData = new FormData(form);
    let totalScore = 0;
    let questionsAnswered = 0;

    // get the values from the form elements
    for (let [questionName, answeredValue] of formData.entries()) {
        if (scoringSystem[questionName] && scoringSystem[questionName][answeredValue] !== undefined) {
            totalScore += scoringSystem[questionName][answeredValue];
            questionsAnswered++;
        }
    }

    // check for answered questions
    if (questionsAnswered === 0) {
        alert("Please answer at least one question before analyzing.");
        return;
    }

    // display results dynamically
    displayResults(totalScore);
});

// display the modal 
function displayResults(score) {

    const title = document.getElementById('verdict-title');
    const advice = document.getElementById('verdict-advice');

    title.style.color = "";

    if (score >= 15) {
        title.innerText = "Severe Risk / Scam Very Likely";
        title.style.color = "#dc3545";
        advice.innerText = "This exhibits critical similarities with known scammer behavior. Stop all contact immediately and report as spam if possible."
    }
    else if (score >= 10) {
        title.innerText = "High Risk / Scam Likely";
        title.style.color = "#dc3545";
        advice.innerText = "This exhibits critical similarities with known scammer behavior. Stop all contact immediately and report as spam if possible."
    }
    else if (score >= 5) {
        title.innerText = "Moderate Risk / Suspicious";
        title.style.color = "#ffc107";
        advice.innerText = "This has some characteristics of known scammer behavior. Proceed with caution and verify all information through another trusted channel."
    }
    else {
        title.innerText = "Low Risk";
        title.style.color = "#28a745";
        advice.innerText = "This does not match characteristics of known scammer behavior. If you are still unsure do not provide any personal information"
    }

    modalOverlay.style.display = "flex";

}

// close modal and reset the form
function closeModalResetForm() {
    modalOverlay.style.display = "none";

    form.reset();
    window.scrollTo({ top: 0, behavior: 'smooth' });

}

closeModal.addEventListener('click', closeModalResetForm);

window.addEventListener('click', (event) => {
    if (event.target === modalOverlay) {
        closeModalResetForm();
    }
});

// clear question button 
const clearBtns = document.querySelectorAll('.clear-q');

clearBtns.forEach(button => {
    button.addEventListener('click', function () {
        // get target name 
        const targetName = this.getAttribute('data-clear');

        // find the radio buttons
        const radios = document.querySelectorAll(`input[name="${targetName}"]`);

        // uncheck each radio button
        radios.forEach(radio => {
            radio.checked = false;
        });
    });
});

// clear questionaire button
const resetBtn = document.getElementById('reset-btn');

resetBtn.addEventListener('click', () => {
    modalOverlay.style.display = "none";

    window.scrollTo({ top: 0, behavior: 'smooth' });
});