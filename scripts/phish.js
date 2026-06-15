function phishCalculator() {

    // get the values from the form elements
    const sender = document.querySelector('input[name="sender"]:checked').value;
    const know = document.querySelector('input[name="know"]:checked').value;
    const urgency = document.querySelector('input[name="urgency"]:checked').value;
    const money = document.querySelector('input[name="money"]:checked').value;
    const download = document.querySelector('input[name="download"]:checked').value;
    const cp = document.querySelector('input[name="cp"]:checked').value;
    // const tone = document.querySelector('input[name="tone"]:checked').value;
    const prosecution = document.querySelector('input[name="prosecution"]:checked').value;
    const payment = document.querySelector('input[name="payment"]:checked').value;
    const power = document.querySelector('input[name="power"]:checked').value;
    const number = document.querySelector('input[name="number"]:checked').value;

    // perform the logic
    let result = "";
    var tally = 0;
    const y = "yes";
    const n = "no";

    if (sender==n) {
        tally += 5;
        console.log(tally);
        if (know==y) {
            tally += 5;
            console.log(tally);
            if (money==y) {
                tally += 20;
                console.log(tally);
            }
        }
        if (urgency==y) {
            tally += 15;
            console.log(tally);
        }
        if (money==y) {
            tally += 10;
            console.log(tally);
        }
        if (download==y) {
            tally += 10;
            console.log(tally);
        }
        if (cp==y) {
            tally += 30;
            console.log(tally);
        }
        if (prosecution==y) {
            tally += 20;
            console.log(tally);
        }
        if (payment==y) {
            tally += 30;
            console.log(tally);
        }
        if (power==y) {
            tally += 20;
            console.log(tally);
        }
        if (number==y) {
            tally += 50;
            console.log(tally);
        }
    }


    // display the result
    const resultDiv = document.getElementById('result');
    resultDiv.style.display = 'flex'; 
    resultDiv.innerHTML = tally;

}