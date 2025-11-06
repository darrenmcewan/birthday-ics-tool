// Global variables
let csvData = null;
let headers = [];
let previewVisible = true;

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('csvFile');
const csvPreviewSection = document.getElementById('csvPreviewSection');
const togglePreviewBtn = document.getElementById('togglePreviewBtn');

// Initialize event listeners
function initializeEventListeners() {
    // Upload area interactions
    uploadArea.addEventListener('click', () => fileInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            handleFileUpload(e.dataTransfer.files[0]);
        }
    });
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFileUpload(e.target.files[0]);
        }
    });
    
    // Delimiter change handler
    document.getElementById('delimiter').addEventListener('change', () => {
        if (fileInput.files.length) {
            handleFileUpload(fileInput.files[0]);
        }
    });
    
    // Column mapping change handlers
    ['nameColumn', 'dateColumn', 'noteColumn'].forEach(selectId => {
        const element = document.getElementById(selectId);
        if (element) {
            element.addEventListener('change', updatePreview);
        }
    });
    
    // Toggle preview button
    togglePreviewBtn.addEventListener('click', togglePreview);
    
    // Convert button
    document.getElementById('convertBtn').addEventListener('click', convertToICS);
}

// Handle file upload
function handleFileUpload(file) {
    const delimiter = document.getElementById('delimiter').value;
    document.getElementById('fileInfo').textContent = `Loading ${file.name}...`;
    
    Papa.parse(file, {
        delimiter: delimiter,
        complete: function(results) {
            csvData = results.data;
            headers = results.data[0];
            
            document.getElementById('fileInfo').textContent = `✓ Loaded ${file.name} (${csvData.length - 1} rows)`;
            displayCSVPreview();
            csvPreviewSection.style.display = 'block';
            populateColumnSelects();
            showMappingSections();
            updatePreview();
        },
        error: function(error) {
            alert('Error parsing CSV: ' + error.message);
        }
    });
}

// Display CSV preview table
function displayCSVPreview() {
    const previewContainer = document.getElementById('csvPreview');
    const maxRows = 10;
    const rowsToShow = Math.min(maxRows + 1, csvData.length);
    
    let tableHTML = '<table class="csv-table"><thead><tr>';
    
    // Add headers
    headers.forEach(header => {
        tableHTML += `<th>${header}</th>`;
    });
    tableHTML += '</tr></thead><tbody>';
    
    // Add data rows
    for (let i = 1; i < rowsToShow; i++) {
        tableHTML += '<tr>';
        csvData[i].forEach(cell => {
            tableHTML += `<td>${cell || '<em>empty</em>'}</td>`;
        });
        tableHTML += '</tr>';
    }
    
    tableHTML += '</tbody></table>';
    
    if (csvData.length > maxRows + 1) {
        tableHTML += `<div class="csv-info">Showing first ${maxRows} rows of ${csvData.length - 1} total rows</div>`;
    } else {
        tableHTML += `<div class="csv-info">Showing all ${csvData.length - 1} rows</div>`;
    }
    
    previewContainer.innerHTML = tableHTML;
}

// Toggle preview visibility
function togglePreview() {
    const previewContainer = document.getElementById('csvPreview');
    previewVisible = !previewVisible;
    
    if (previewVisible) {
        previewContainer.style.display = 'block';
        togglePreviewBtn.textContent = 'Hide Preview';
    } else {
        previewContainer.style.display = 'none';
        togglePreviewBtn.textContent = 'Show Preview';
    }
}

// Populate column select dropdowns
function populateColumnSelects() {
    const selects = ['nameColumn', 'dateColumn', 'noteColumn'];
    
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        select.innerHTML = '';
        
        if (selectId === 'noteColumn') {
            const noneOption = document.createElement('option');
            noneOption.value = '';
            noneOption.textContent = 'None (Optional)';
            select.appendChild(noneOption);
        }
        
        headers.forEach((header, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = header;
            select.appendChild(option);
        });
    });
}

// Show mapping sections
function showMappingSections() {
    document.querySelectorAll('.mapping-section').forEach(section => {
        section.style.display = 'block';
    });
}

// Update preview of mapped data
function updatePreview() {
    const preview = document.getElementById('preview');
    const nameCol = document.getElementById('nameColumn').value;
    const dateCol = document.getElementById('dateColumn').value;
    const noteCol = document.getElementById('noteColumn').value;
    
    if (!nameCol || !dateCol) {
        preview.innerHTML = '<p style="color: #999;">Select columns to see preview</p>';
        return;
    }
    
    let html = '<strong>Preview (first 5 rows):</strong><br><br>';
    const rowsToShow = Math.min(6, csvData.length);
    
    for (let i = 1; i < rowsToShow; i++) {
        const row = csvData[i];
        const name = row[nameCol] || '';
        const date = row[dateCol] || '';
        const note = noteCol ? (row[noteCol] || '') : '';
        
        html += `<div class="preview-row">
            <strong>${name}</strong> - ${date}${note ? ' (' + note + ')' : ''}
        </div>`;
    }
    
    preview.innerHTML = html;
}

// Parse date based on format
function parseDate(dateStr, format) {
    const formatUpper = format.toUpperCase();
    const parts = dateStr.split(/[\/\-\.]/);
    
    let day, month, year;
    
    if (formatUpper.includes('DD/MM/YYYY') || formatUpper.includes('DD-MM-YYYY')) {
        day = parseInt(parts[0]);
        month = parseInt(parts[1]);
        year = parseInt(parts[2]);
    } else if (formatUpper.includes('MM/DD/YYYY') || formatUpper.includes('MM-DD-YYYY')) {
        month = parseInt(parts[0]);
        day = parseInt(parts[1]);
        year = parseInt(parts[2]);
    } else if (formatUpper.includes('YYYY/MM/DD') || formatUpper.includes('YYYY-MM-DD')) {
        year = parseInt(parts[0]);
        month = parseInt(parts[1]);
        day = parseInt(parts[2]);
    } else {
        throw new Error('Unsupported date format');
    }
    
    return new Date(year, month - 1, day);
}

// Format date for ICS
function formatICSDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

// Convert CSV to ICS
function convertToICS() {
    const nameCol = document.getElementById('nameColumn').value;
    const dateCol = document.getElementById('dateColumn').value;
    const noteCol = document.getElementById('noteColumn').value;
    const maxAge = parseInt(document.getElementById('maxAge').value);
    const dateFormat = document.getElementById('dateFormat').value;
    
    const errorMsg = document.getElementById('errorMsg');
    const successMsg = document.getElementById('successMsg');
    
    errorMsg.style.display = 'none';
    successMsg.style.display = 'none';
    
    try {
        let icsContent = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//CSV to ICS Converter//EN\r\n';
        
        for (let i = 1; i < csvData.length; i++) {
            const row = csvData[i];
            if (!row[nameCol] || !row[dateCol]) continue;
            
            const name = row[nameCol];
            const birthdate = parseDate(row[dateCol], dateFormat);
            const note = noteCol ? (row[noteCol] || '') : '';
            
            for (let age = 0; age <= maxAge; age++) {
                const eventDate = new Date(birthdate);
                eventDate.setFullYear(birthdate.getFullYear() + age);
                
                const title = age === 0 ? `${name} was born today` : `${name} turns ${age} today`;
                const dateStr = formatICSDate(eventDate);
                
                icsContent += 'BEGIN:VEVENT\r\n';
                icsContent += `DTSTART;VALUE=DATE:${dateStr}\r\n`;
                icsContent += `DTEND;VALUE=DATE:${dateStr}\r\n`;
                icsContent += `SUMMARY:${title}\r\n`;
                if (note) {
                    icsContent += `DESCRIPTION:${note}\r\n`;
                }
                icsContent += `UID:${Date.now()}-${i}-${age}@csvtoics\r\n`;
                icsContent += 'END:VEVENT\r\n';
            }
        }
        
        icsContent += 'END:VCALENDAR\r\n';
        
        // Download the file
        const blob = new Blob([icsContent], { type: 'text/calendar' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'birthdays.ics';
        a.click();
        window.URL.revokeObjectURL(url);
        
        successMsg.textContent = '✓ Successfully created ICS file! Download should start automatically.';
        successMsg.style.display = 'block';
        
    } catch (error) {
        errorMsg.textContent = '✗ Error: ' + error.message;
        errorMsg.style.display = 'block';
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', initializeEventListeners);