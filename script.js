let excelData = null;
let fileInput = document.getElementById('excelFile');
let numberInput = document.getElementById('numberInput');
let searchBtn = document.getElementById('searchBtn');
let fileStatus = document.getElementById('fileStatus');
let errorDiv = document.getElementById('error');

// Handle file upload
fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Get the first sheet
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Convert to JSON
            excelData = XLSX.utils.sheet_to_json(worksheet);
            
            fileStatus.textContent = `File loaded: ${file.name} (${excelData.length} rows)`;
            fileStatus.classList.add('success');
            searchBtn.disabled = false;
            errorDiv.classList.remove('show');
            
            console.log('Excel data loaded:', excelData);
            if (excelData.length > 0) {
                console.log('Sample row:', excelData[0]);
                console.log('Column names:', Object.keys(excelData[0]));
            }
        } catch (error) {
            showError('Error reading Excel file: ' + error.message);
            fileStatus.textContent = 'Error loading file';
            fileStatus.classList.remove('success');
            searchBtn.disabled = true;
        }
    };
    
    reader.readAsArrayBuffer(file);
});

// Handle search
searchBtn.addEventListener('click', searchNumber);
numberInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchNumber();
    }
});

function searchNumber() {
    const inputNumber = numberInput.value.trim();
    
    if (!inputNumber) {
        showError('Please enter a number');
        return;
    }
    
    if (!excelData || excelData.length === 0) {
        showError('Please upload an Excel file first');
        return;
    }
    
    // Clear previous error
    errorDiv.classList.remove('show');
    
    // Search for the number in Excel data
    const number = parseFloat(inputNumber);
    const numberStr = inputNumber;
    
    // Find all matching combinations
    const matchingCombinations = [];
    const seenCombinations = new Set(); // To avoid duplicates
    
    for (let row of excelData) {
        const keys = Object.keys(row);
        
        // Check ALL columns for matches (don't break after first match)
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const value = row[key];
            
            if (value != null) {
                // Check if the value matches the input number
                let isMatch = false;
                
                // Check direct number match
                if (parseFloat(value) === number) {
                    isMatch = true;
                }
                // Check if value contains the number (e.g., "420 Big" or "420")
                else if (typeof value === 'string' && value.includes(numberStr)) {
                    // Extract just the number part
                    const extractedNum = value.match(/\d+/);
                    if (extractedNum && parseFloat(extractedNum[0]) === number) {
                        isMatch = true;
                    }
                }
                
                if (isMatch) {
                    // Found a match in this column, now find the corresponding Big/Small, Colour, and Number
                    const combinations = extractCombinationsForMatch(row, keys, i, number);
                    
                    for (let combo of combinations) {
                        // Create a unique key to avoid duplicates
                        const comboKey = `${combo.bigSmall}|${combo.colour}|${combo.number}`;
                        if (!seenCombinations.has(comboKey)) {
                            seenCombinations.add(comboKey);
                            matchingCombinations.push(combo);
                        }
                    }
                }
            }
        }
    }
    
    if (matchingCombinations.length === 0) {
        showError(`Number ${inputNumber} not found in the Excel file`);
        clearResults();
    } else {
        displayAllResults(matchingCombinations);
    }
}

function displayAllResults(matchingCombinations) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = ''; // Clear previous results
    
    // Find matching values across all combinations
    const matchingValues = findMatchingValues(matchingCombinations);
    
    matchingCombinations.forEach((combination, index) => {
        const combinationNumber = index + 1;
        
        // Check which values match with other combinations
        const bigSmallMatches = matchingValues.bigSmall.has(combination.bigSmall);
        const colourMatches = matchingValues.colour.has(combination.colour);
        const numberMatches = matchingValues.number.has(String(combination.number));
        
        // Create result card
        const card = document.createElement('div');
        card.className = 'result-card';
        
        card.innerHTML = `
            <div class="combination-title">Combination ${combinationNumber}</div>
            <div class="result-item">
                <span class="result-label">Big/Small:</span>
                <span class="result-value ${bigSmallMatches ? 'highlight-match' : ''}">${combination.bigSmall}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Colour:</span>
                <span class="result-value ${colourMatches ? 'highlight-match' : ''}">${combination.colour}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Number:</span>
                <span class="result-value ${numberMatches ? 'highlight-match' : ''}">${combination.number}</span>
            </div>
        `;
        
        resultsContainer.appendChild(card);
    });
}

function findMatchingValues(combinations) {
    // Count occurrences of each value
    const bigSmallCount = new Map();
    const colourCount = new Map();
    const numberCount = new Map();
    
    combinations.forEach(combo => {
        // Count Big/Small
        const bigSmall = String(combo.bigSmall).trim();
        if (bigSmall !== '-') {
            bigSmallCount.set(bigSmall, (bigSmallCount.get(bigSmall) || 0) + 1);
        }
        
        // Count Colour
        const colour = String(combo.colour).trim();
        if (colour !== '-') {
            colourCount.set(colour, (colourCount.get(colour) || 0) + 1);
        }
        
        // Count Number
        const number = String(combo.number).trim();
        if (number !== '-') {
            numberCount.set(number, (numberCount.get(number) || 0) + 1);
        }
    });
    
    // Find values that appear more than once (matching values)
    const matchingBigSmall = new Set();
    const matchingColour = new Set();
    const matchingNumber = new Set();
    
    bigSmallCount.forEach((count, value) => {
        if (count > 1) {
            matchingBigSmall.add(value);
        }
    });
    
    colourCount.forEach((count, value) => {
        if (count > 1) {
            matchingColour.add(value);
        }
    });
    
    numberCount.forEach((count, value) => {
        if (count > 1) {
            matchingNumber.add(value);
        }
    });
    
    return {
        bigSmall: matchingBigSmall,
        colour: matchingColour,
        number: matchingNumber
    };
}

function extractCombinationsForMatch(row, keys, matchColumnIndex, searchNumber) {
    // When we find the search number in a column, we need to find ALL sets in this row
    // Each set has: Big/Small, Colour, Number
    // The "Number" in the result should be from a DIFFERENT Number column (not the search number)
    
    const combinations = [];
    const seen = new Set();
    
    // Strategy 1: Find all valid sets in the row (Big/Small, Colour, Number)
    // Try different column groupings
    for (let startIdx = 0; startIdx < keys.length - 2; startIdx++) {
        // Try groups of 3 consecutive columns
        const val1 = row[keys[startIdx]];
        const val2 = row[keys[startIdx + 1]];
        const val3 = row[keys[startIdx + 2]];
        
        if (val1 != null && val2 != null && val3 != null) {
            const str1 = String(val1).toLowerCase().trim();
            const str2 = String(val2).toLowerCase().trim();
            const str3 = String(val3).trim();
            
            // Pattern: Big/Small, Colour, Number
            if ((str1 === 'big' || str1 === 'small') && 
                !str2.match(/^\d+$/) && str2 !== 'big' && str2 !== 'small' && str2.length > 0 &&
                !isNaN(parseFloat(str3)) && parseFloat(str3) !== searchNumber) {
                
                const comboKey = `${val1}|${val2}|${val3}`;
                if (!seen.has(comboKey)) {
                    seen.add(comboKey);
                    combinations.push({
                        bigSmall: val1,
                        colour: val2,
                        number: val3
                    });
                }
            }
        }
    }
    
    // Strategy 2: Try non-consecutive patterns
    // Look for Big/Small values and find their corresponding Colour and Number
    for (let i = 0; i < keys.length; i++) {
        const value = row[keys[i]];
        if (value != null) {
            const str = String(value).toLowerCase().trim();
            if (str === 'big' || str === 'small') {
                // Found a Big/Small, try to find Colour and Number nearby
                for (let offset = 1; offset <= 3; offset++) {
                    if (i + offset < keys.length) {
                        const colourCandidate = row[keys[i + offset]];
                        if (colourCandidate != null) {
                            const colourStr = String(colourCandidate).toLowerCase().trim();
                            if (colourStr !== 'big' && colourStr !== 'small' && 
                                !colourStr.match(/^\d+$/) && colourStr.length > 0) {
                                
                                // Found a potential colour, look for number
                                for (let numOffset = 1; numOffset <= 3; numOffset++) {
                                    if (i + offset + numOffset < keys.length) {
                                        const numCandidate = row[keys[i + offset + numOffset]];
                                        if (numCandidate != null) {
                                            const numStr = String(numCandidate).trim();
                                            if (!isNaN(parseFloat(numStr)) && parseFloat(numStr) !== searchNumber) {
                                                const comboKey = `${value}|${colourCandidate}|${numCandidate}`;
                                                if (!seen.has(comboKey)) {
                                                    seen.add(comboKey);
                                                    combinations.push({
                                                        bigSmall: value,
                                                        colour: colourCandidate,
                                                        number: numCandidate
                                                    });
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    // Strategy 3: Find all Number columns (excluding the match) and try to get their sets
    for (let i = 0; i < keys.length; i++) {
        if (i === matchColumnIndex) continue;
        
        const value = row[keys[i]];
        if (value != null) {
            const numStr = String(value).trim();
            if (!isNaN(parseFloat(numStr)) && parseFloat(numStr) !== searchNumber) {
                // This is a Number column, try to find Big/Small and Colour
                const combo = findSetForNumberColumn(row, keys, i);
                if (combo && combo.bigSmall !== '-' && combo.colour !== '-') {
                    const comboKey = `${combo.bigSmall}|${combo.colour}|${combo.number}`;
                    if (!seen.has(comboKey)) {
                        seen.add(comboKey);
                        combinations.push(combo);
                    }
                }
            }
        }
    }
    
    return combinations.length > 0 ? combinations : [];
}

function findSetForNumberColumn(row, keys, numberColumnIndex) {
    // Try to find Big/Small and Colour for a Number column
    let bigSmall = '-';
    let colour = '-';
    let number = row[keys[numberColumnIndex]];
    
    // Check columns before and after
    for (let offset = -3; offset <= 3; offset++) {
        if (offset === 0) continue;
        
        const idx = numberColumnIndex + offset;
        if (idx >= 0 && idx < keys.length) {
            const value = row[keys[idx]];
            if (value != null) {
                const str = String(value).toLowerCase().trim();
                if ((str === 'big' || str === 'small') && bigSmall === '-') {
                    bigSmall = value;
                } else if (str !== 'big' && str !== 'small' && !str.match(/^\d+$/) && 
                          str.length > 0 && colour === '-') {
                    colour = value;
                }
            }
        }
    }
    
    return { bigSmall, colour, number };
}


function clearResults() {
    document.getElementById('results').innerHTML = '';
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
}

