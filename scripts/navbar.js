// v0.2.3 2026 07 13
function createNavbar() {

    // Get the current Directory

	let currentDirectory = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);

    // set the path prefix based on whether or not in a subdirectory

    let pathprefix = ''

    if (currentDirectory.includes("cyberpages") || currentDirectory.includes("flyingpages")) {
        pathprefix = '../';
    }

    // set all the path variables

    let indexPage = pathprefix + 'index.html';
    let cyberPage = pathprefix + 'cyberpages/cyber.html';
    let phishPage = pathprefix + 'cyberpages/phish.html';
    let cyberContactPage = pathprefix + 'cyberpages/cyberContact.html';
    let flyingPage = pathprefix + 'flyingpages/flying.html';
    let mpfratPage = pathprefix + 'flyingpages/mpfrat.html';
    let spfratPage = pathprefix + 'flyingpages/spfrat.html';
    let flyingContactPage = pathprefix + 'flyingpages/flyingContact.html';

    // build navigation using path variables

    const navbarHTML = `
    <div class="navbar">
        <div class="title">
            <a href="` + indexPage + `" id="title"><img src="/Users/Quinn/Documents/flyingcyber/images/logo.png" id="logo"></a>
        </div>
        <div id="navbar">
        <div class="dropdown">
            <a href="` + flyingPage + `" class="dropbtn">Flying</a>
            <div class="dropdown-content">
                <a href="` + spfratPage + `">Single-Pilot F.R.A.T.</a>
                <a href="` + mpfratPage + `">Multi-Pilot F.R.A.T.</a>
                <a href="` + flyingContactPage + `">Contact</a>
            </div>
        </div>
        <div class="dropdown">
            <a href="` + cyberPage + `" class="dropbtn">Cyber</a>
            <div class="dropdown-content">
                <a href="` + phishPage + `">Am I Being Scammed?</a>
                <a href="` + cyberContactPage + `">Contact</a>
            </div>
        </div>
        </div>
    </div>
    `;

    // insert navbar html into the element with the ID 'navbar'

    document.getElementById('navbar').innerHTML = navbarHTML;

}

// call the function to create the navbar when the page loads

window.onload = createNavbar;