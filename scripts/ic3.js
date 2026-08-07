// v0.3.0 2026 08 07

// Data mapping: mapping the parent categories to the child options and CSV file paths
const fileMap = {
    all: [
        { label: "Elder Fraud Data 2020 -2025", file: "../data/ElderFraudReportData2020-2025.csv", secondaryFilter: 'year' },
        { label: "IC3 Data 2020 - 2025", file: "../data/IC3FraudData2020-2025.csv", secondaryFilter: 'year' },
        { label: "Victims by Age Group 2020 - 2025", file: "../data/VictimsByAgeGroup2020-2025.csv", secondaryFilter: 'year' }
    ],
    subReports: [
        { label: "AI References 2025", file: "../data/AIReferencesByComplaint2025.csv", secondaryFilter: 'none' },
        { label: "Crime Types by Age Group 2025", file: "../data/CrimeTypesByAgeGroup2025.csv", secondaryFilter: 'age' },
        { label: "Cryptocurrecny Fraud Report 2025", file: "../data/CryptocurrencyFraudReportData2025.csv", secondaryFilter: 'none' }
    ],
    special: [
        { label: "17 and Younger Fraud Data 2025", file: "../data/IC3FraudReport17orYounger2025.csv", secondaryFilter: 'none' },
        { label: "Sextortion 2025", file: "../data/SextortionByAge2025.csv", secondaryFilter: 'none' }
    ]
};

// central application state
const state = {
    rawData: [],
    filteredData: [],
    selectedYear: [],
    selectedAgeRange: [],
    activeFilterType: 'none',
    currentPage: 1,
    pageSize: 15,
    sortColumn: null,
    sortAcsending: true
};

// cache references to the html elements
const parentSelect = document.getElementById('primary-select');
const childSelect = document.getElementById('child-select');
const yearSelect = document.getElementById('year-select');
const ageSelect = document.getElementById('age-select');
const tableHead = document.getElementById('table-head');
const tableBody = document.getElementById('table-body');
const prevBtn = document.getElementById('prev-page-btn');
const nextBtn = document.getElementById('next-page-btn');
const pageIndicator = document.getElementById('page-indicator');

// --- Event Listeners ---

// event 1 parent select changes -> populate child select
parentSelect.addEventListener('change', (e) => {
    const selectedCategory = e.target.value;

    childSelect.innerHTML = '';

    if (!selectedCategory || !fileMap[selectedCategory]) {
        childSelect.add(new Option('-- Select Category First --', ''));
        childSelect.disabled = true;
        disableDownstreamControls();
        resetTableState();
        return;
    }

    // populate new children
    childSelect.add(new Option('-- Choose Dataset --', ''));
    fileMap[selectedCategory].forEach(item => {
        childSelect.add(new Option(item.label, item.file));
    });

    childSelect.disabled = false;
    disableDownstreamControls();
    resetTableState();
});

// event 2 child select changes -> fetch CSV and populate year dropdown
childSelect.addEventListener('change', async (e) => {
    const filePath = e.target.value;
    const selectedCategory = parentSelect.value;

    if (!filePath) {
        disableDownstreamControls();
        resetTableState();
        return;
    }

    // find dataset configuration enrty from fileMap
    const datasetConfig = fileMap[selectedCategory]?.find(item => item.file ===filePath);

    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`HTTP error! status: ${reponse.status}`);

        const csvText = await response.text();
        // console.log(csvText);

        state.rawData = parseCSV(csvText);

        // logRowsToDOM(state.rawData);

        state.currentPage = 1;
        state.sortColumn = null;
    
        // configure secondary dropdown (year, age, none) based on the datasetConfig
        const filterType = datasetConfig ? datasetConfig.secondaryFilter : 'none'; 
        setupSecondaryFilter(filterType, state.rawData);
        
        runPipeline();

    } catch (err) {
        console.error('Failed to load CSV file:', err);
        disableDownstreamControls();
        resetTableState();
    }
});

// event 3 year select changes -> filter table
yearSelect.addEventListener('change', (e) => {
    state.selectedYear = e.target.value;
    state.currentPage = 1 
    runPipeline();
});

// event 4 age range select changes -> filter table
ageSelect.addEventListener('change', (e) => {
    state.selectedAgeRange = e.target.value;
    state.currentPage = 1;
    runPipeline();
});

// event 5 column header click -> sorting
tableHead.addEventListener('click', (e) => {
    const th = e.target.closest('th');
    if (!th || !th.dataset.column) return;

    const columnKey = th.dataset.column;

    if (state.sortColumn === columnKey) {
        state.sortAcsending = !state.sortAcsending;
    } else{
        state.sortColumn = columnKey;
        state.sortAcsending = true;
    }

    runPipeline();
});

// event 6 pagination buttons
prevBtn.addEventListener('click', () => {
    if (state.currentPage > 1) {
        state.currentPage--;
        runPipeline();
    }
});

nextBtn.addEventListener('click', () => {
    const maxPages = Math.ceil(state.filteredData.length / state.pageSize);
    if (state.currentPage < maxPages) {
        state.currentPage++;
        runPipeline();
    }
})

// -- secondary filter control logic ---

function populateYearDropDown(uniqueYears) {
    const yearSelect = document.getElementById('year-select');
    if (!yearSelect) return;

    console.log(yearSelect);

    yearSelect.innerHTML = '';
    yearSelect.add(new Option('All Years', ''));

    if (!uniqueYears || !uniqueYears.length) {
        yearSelect.disabled = true;
        console.log('fail');
        return;
    }
    console.log(1);
    console.log(uniqueYears);
    uniqueYears.forEach(year => {
        yearSelect.add(new Option(year, year));
    });

    yearSelect.disabled = false;
}

function extractUniqueYears(data) {
    if (!Array.isArray(data) || !data.length) {
        console.warn('extractUniqueYears recieved invalid or emply data array')
        return [];
    }
    // console.log(data);
    const yearSet = new Set();
    // RegEx matches 4-digit years between 1900 and 2099 embeded in any string
    const yearRegex = /\b20[2-9]\d\b/;

    const headers = Object.keys(data[0] || {});
    headers.forEach(header => {
        const matches = String(header).match(yearRegex);
        if (matches) {
            matches.forEach(year => yearSet.add(year));
        }
    });

    data.forEach(row => {
        if (!row || typeof row !== 'object') return;

        Object.values(row).forEach(val => {
            if (val === null || val === undefined) return;

            const strVal = String(val).trim();
            const matches = strVal.match(yearRegex);

            if (matches) {
                matches.forEach(year => yearSet.add(year));
            }
        });
    });

    return Array.from(yearSet).sort((a, b) => b - a);
}

function setupSecondaryFilter(filterType, data) {
    state.activeFilterType = filterType;
    state.selectedYear = '';
    state.selectedAgeRange = '';

    console.log(filterType);

    // reset and disable both controls by default
    yearSelect.value = '';
    yearSelect.disabled = true;
    ageSelect.value = '';
    ageSelect.disabled = true;

    if (filterType === 'year') {
        const uniqueYears = extractUniqueYears(data);
        populateYearDropDown(uniqueYears);
        yearSelect.disabled = false;
    } else if (filterType === 'age') {
        ageSelect.disabled = false;
    }
}

// age range matching helper
function matchesAgeRange(cellValue, rangeStr) {
    if (!rangeStr) return true;
    if (!cellValue) return false;

    const str = String(cellValue).toLowerCase();

    // direct string match
    if (str.includes(rangeStr.toLowerCase())) {
        return true;
    }

    // extract embedded range from string
    const cellRangeMatch = str.match(/(\d+)\s*[---]\s*(\d+)/);
    if (cellRangeMatch) {
        const cellMin = Number(cellRangeMatch[1]);
        const cellMax = Number(cellRangeMatch[2]);

        if (rangeStr === 'under 20') return cellMin < 20;
        if (rangeStr === '60+') return cellMax >= 60;

        const [selectMin, selectMax] = rangeStr.split('-').map(Number);
        // overlap check
        return cellMin <= selectMax && cellMax >= selectMin;
    }

    return false;
}

function disableDownstreamControls() {
    yearSelect.value = '';
    yearSelect.disabled = true;
    ageSelect.value = '';
    ageSelect.disabled = true;
}

// minimal csv parser
function parseCSV(text) {

    const cleanText = text.replace(/\r/g, '');
    // console.log(cleanText);

    const lines = text.trim().split('\n').filter(line => line.trim().length > 0);
    if (lines.length === 0) return [];
    // console.log(lines);

    const parseCSVLine = (line) => {
        const values = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"' || char === "'") {
                inQuotes = !inQuotes
            } else if (char === ',' && !inQuotes) {
                values.push(cleanCellValue(current));
                current = '';
            } else {
                current += char;
            }
        }
        values.push(cleanCellValue(current));
        return values;
    };

    const cleanCellValue = (val) => {
        return String(val)
            .trim()
            .replace(/\\"/g, '"')
            .replace(/\\'/g, "'")
            .replace(/^["'\\]+|["'\\]+$/g, '');
    };

    const headers = parseCSVLine(lines[0]);
    // console.log(headers);

    return lines.slice(1).map(line => {
        const values = parseCSVLine(line);
        return headers.reduce((obj, header, index) => {
            obj[header] = values[index] !== undefined ? values[index] : '';
            return obj;
        }, {});
    })
}

// --- DOM diagnostic logger ---

function logRowsToDOM(parsedData, containerId = 'debug-output') {
    let container = document.getElementById(containerId);

    if (!container) {
        container = document.createElement('pre');
        container.id = containerId;
        container.style.cssText = `
            background: #1e1e1e;
            color: #00ff66;
            padding: 12px;
            font-family: monospace;
            font-size: 12px;
            border-radius: 6px;
            max-height: 220px;
            overflow-y: auto;
            margin: 15px 0;
        `;
        document.body.prepend(container)
    }
    if (!parsedData.length) {
        container.textContent = 'DEBUG LOG: No rows parsed.';
        return;
    }

    const sample = parsedData.slice(0, 2);
    let logText = `=== PARSED CSV DOM DIAGNOSTIC ===\n`;
    logText += `Total Rows Parsed: ${parsedData.length}\n`;
    logText += `Headers: [ ${Object.keys(parsedData[0]).join(', ')} ]\n\n`;
    logText += `First ${sample.length} Rows Rendered Output:\n`;

    sample.forEach((row, i) => {
        logText += `\nRow [${i + 1}]:\n`;
        Object.entries(row).forEach(([key, val]) => {
        logText += `  ${key} -> ${val}\n`;
        });
    });

    container.textContent = logText;
}

// sanitize raw cell values into clean numbers or strings for accurate comparisson
function parseSortValue(val) {
    if (val === null || val === undefined || val === '') {
        return null; 
    }

    const str = String(val).trim();
    // console.log(str);

    // strip currency symbols commas and percentage signs
    const cleanNumStr = str.replace(/[\$,%]/g, '');

    // check if valid number

    const num = Number(cleanNumStr);
    if (!isNaN(num) && cleanNumStr !== '') {
        return num;
    }

    return str.toLocaleLowerCase();
}

// --- render functions ---

function renderTable(pageData) {

    const tableHead = document.querySelector('#table-head');
    const tableBody = document.querySelector('#table-body');

    const table = tableHead?.closest('table') || document.querySelector('table');
    if (table) {
        table.style.borderCollapse = 'separate';
        table.style.borderSpacing = '0';
    }

    if (!state.rawData.length || !state.rawData) {
        clearElement(tableHead);
        clearElement(tableBody);
        resetTableState();
        return;
    }

    if (!tableBody || !tableHead) {
        console.error('Critical error. Could not find table-head or table-body');
    }
    const headers = Object.keys(state.rawData[0]);
    const yearRegex = /(?:19|20)\d{2}/;
    const ageRegex = /(age|under 20|20\s*29|30\s*39|40\s*49|50\s*59|60\+?)/i;

    const visibleHeaders = headers.filter(header => {
        const headerStr = String(header).trim().toLowerCase();
        const selectedYearStr = String(state.selectedYear).trim();
        const selectedAgeStr = String(state.selectedAgeRange).trim();
        const cleanHeader = String(headerStr).toLowerCase().replace(/[_/\\-]/g, ' ').trim();
        const rawAge = String(state.selectedAgeRange).toLowerCase().replace(/[_/\\-]/g, ' ').trim();

        const containsYear = yearRegex.test(headerStr);
        const containsAge = ageRegex.test(cleanHeader);

        if (containsYear && selectedYearStr) {
            return headerStr.includes(selectedYearStr);
        }

        if (containsAge && selectedAgeStr) {

            console.log('success');

            const normSelected = selectedAgeStr.replace(/[_/\\-]/g, ' ').trim();

            if (normSelected.includes('under 20') || normSelected.includes('under20')) {
                return cleanHeader.includes('under 20') || cleanHeader.includes('under20');
            }

            if (normSelected.includes('60')) {
                return cleanHeader.includes('60');
            }

            return cleanHeader.includes(normSelected) || headerStr.includes(selectedAgeStr);
        }
        
        return true;

    });

    console.log('Active Filter Type:', state.activeFilterType);
    console.log('Selected Year/Age:', state.selectedYear || state.selectedAgeRange);
    console.log('Filtered Visible Headers:', visibleHeaders);

    // build thead
    const headFrag = document.createDocumentFragment();
    const trHead = document.createElement('tr');

    visibleHeaders.forEach((key, index) => {
        const th = document.createElement('th');
        th.dataset.column = key;
        th.style.cursor = 'pointer';
        th.style.whiteSpace = 'nowrap';

        if (index === 0) {
            th.style.position = 'sticky';
            th.style.left = '0px';
            th.style.zIndex = '30';
            th.style.backgroundColor = '#f5e9c1';
        }

        let indicator = ' ⇅';
        if (state.sortColumn === key) {
            indicator = state.sortAcsending ? '▲' : ' ▼';
        }
        th.textContent = key + indicator;
        trHead.appendChild(th);
    });

    headFrag.appendChild(trHead);
    tableHead.innerHTML = '';
    tableHead.appendChild(headFrag);

    // build tbody
    const bodyFrag = document.createDocumentFragment();

    pageData.forEach(row => {
        const tr = document.createElement('tr');
        visibleHeaders.forEach(key => {
            const td = document.createElement('td');
            td.textContent = row[key] !== undefined && row[key] !== null ? row[key] : '';
            tr.appendChild(td);
        });
        bodyFrag.appendChild(tr);
    });
    tableBody.innerHTML = '';
    tableBody.appendChild(bodyFrag);
}

function renderPagination() {
    const maxPages = Math.ceil(state.filteredData.length / state.pageSize) || 1;
    pageIndicator.textContent = `Page ${state.currentPage} of ${maxPages}`;
    prevBtn.disabled = state.currentPage === 1;
    nextBtn.disabled = state.currentPage >= maxPages;
}

function resetTableState() {
    state.rawData = [];
    state.filteredData = [];
    state.selectedYear = '';
    state.selectedAgeRange = '';
    state.activeFilterType = 'none';
    state.currentPage = 1;
    state.sortColumn = null;
    tableHead.innerHTML = '';
    tableBody.innerHTML = '';
    pageIndicator.textContent = 'Page 1 of 1';
    prevBtn.disabled = true;
    nextBtn.disabled = true;
}

function clearElement(element) {
    if (!element) return;
    if (element.replaceChildren) {
        element.replaceChildren();
    } else {
        element.innerHTML = '';
    }
}

function runPipeline() {
    
    // filter by active secondary
    state.filteredData = state.rawData.filter(row => {
        let matchesSecondary = true;

        if (state.activeFilterType === 'year' && state.selectedYear) {
            console.log(state.selectedYear);
            
            const inHeader = Object.keys(row).some(key => String(key).includes(state.selectedYear));
            
            matchesSecondary = inHeader;

        } else if (state.activeFilterType === 'age') {
            console.log(state.selectedAgeRange);
            const ageKey = Object.keys(row).find(k => /age/i.test(k));
            matchesSecondary = !state.selectedAgeRange || Object.keys(row).some(key => String(key).includes(state.selectedAgeRange));
        }
        console.log(matchesSecondary);

        return matchesSecondary;
    });

    // sort active column
    if (state.sortColumn) {
        const col = state.sortColumn;
        const dir = state.sortAcsending ? 1 : -1;

        state.filteredData.sort((a,b) => {
            const valA = parseSortValue(a[col]);
            const valB = parseSortValue(b[col]);

            // push empty null cells to the bottom
            if (valA === null && valB === null) return 0;
            if (valA === null) return 1;
            if (valB === null) return -1;

            // compare numbers
            if (typeof valA === 'number' && typeof valB === 'number') {
                return (valA - valB) * dir;
            }

            // compare strings 
            return String(valA).localeCompare(String(valB)) * dir;
        });
    }

    // paginate
    const start = (state.currentPage - 1) * state.pageSize;
    const pageData = state.filteredData.slice(start, start + state.pageSize);

    // render
    renderTable(pageData);
    renderPagination();
}