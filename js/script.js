// Fetching sensor data
async function fetchSensorData() {
    try {
        const response = await fetch('http://127.0.0.1:5000/senzory');
        if (!response.ok) {
            throw new Error('Failed to fetch sensor data');
        }
        const sensorData = await response.json();
        return sensorData;
    } catch (error) {
        console.error('Error fetching sensor data:', error);
        return []; // Return empty array if there's an error
    }
}

// Fetching total number of sensors
async function fetchSensorCount() {
    try {
        const response = await fetch('http://127.0.0.1:5000/pocetsenzoru');
        if (!response.ok) {
            throw new Error('Failed to fetch sensor count');
        }
        const countData = await response.json();
        return countData.count;
    } catch (error) {
        console.error('Error fetching sensor count:', error);
        return 0; // Return 0 if there's an error
    }
}

// Fetching number of records in the last minute
async function fetchRecordsInLastMinute() {
    try {
        const response = await fetch('http://127.0.0.1:5000/pocetzaminutu');
        if (!response.ok) {
            throw new Error('Failed to fetch records in the last minute');
        }
        const countData = await response.json();
        return countData.count;
    } catch (error) {
        console.error('Error fetching records in the last minute:', error);
        return 0; // Return 0 if there's an error
    }
}

// Function to generate sensor cards using fetched data
async function generateSensorCards() {
    const sensors = await fetchSensorData();
    const sensorCount = await fetchSensorCount();
    const recordsInLastMinute = await fetchRecordsInLastMinute();

    const sensorsContainer = document.getElementById('sensors').querySelector('.row');
    sensorsContainer.innerHTML = ''; // Clear existing cards

    // Display summary of total counts
    const summaryContainer = document.getElementById('summary');
    summaryContainer.innerHTML = `
        <h5>Celkový počet senzorů: ${sensorCount}</h5>
        <h5>Počet záznamů za poslední minutu: ${recordsInLastMinute}</h5>
    `;

    let delay = 0;
    sensors.forEach((sensor) => {
        setTimeout(() => {
            const card = document.createElement('div');
            card.className = 'card p-3 rounded-3 shadow';
            card.style.borderColor = sensor.stav;
            card.innerHTML = `
                <div class="row sensor-details">
                    <div class="col-md-10 sensor-info">
                        <h5 class="card-title">${sensor.nazev}</h5>
                        <p class="card-text">
                            ID: ${sensor.id} | Počet Zápisů: ${sensor.count_records} | Typ: ${sensor.typ} | Místo: ${sensor.misto} | Frekvence: ${sensor.frekvence} | Počasí: ${sensor.weather || 'N/A'}
                        </p>
                    </div>
                    <div class="col-md-2 d-flex align-items-center">
                        <div class="status-circle" style="background-color: ${sensor.stav};"></div>
                    </div>
                </div>
            `;
            card.addEventListener('click', function() {
                showModal(sensor);
            });
            sensorsContainer.appendChild(card);
        }, delay);
        delay += 20; // Adjust this value to control the staggering delay
    });
}

// Refresh sensor cards every 1 minute
setInterval(generateSensorCards, 60000); // 60000 milliseconds = 1 minute

// Function to update Plotly theme
function updatePlotlyTheme(theme) {
    const layout = theme === 'light' 
        ? { paper_bgcolor: '#ffffff', plot_bgcolor: '#ffffff', font: { color: '#000000' } } 
        : { paper_bgcolor: '#121212', plot_bgcolor: '#121212', font: { color: '#ffffff' } };

    Plotly.relayout('graph1', layout);
    const sensorGraphElement = document.getElementById('sensorGraph');
    if (sensorGraphElement.data) {
        Plotly.relayout(sensorGraphElement, layout);
    }
}

// Set initial Plotly theme and logo based on the current stylesheet
window.addEventListener('DOMContentLoaded', async (event) => {
    const currentTheme = 'dark';
    updatePlotlyTheme(currentTheme);
    updateNavbarLogo(currentTheme);
    await generateSensorCards(); // Generate initial sensor cards
});

// Update navbar logo based on the current theme
function updateNavbarLogo(theme) {
    const logo = document.getElementById('navbar-logo');
    logo.src = theme === 'light' ? 'images/Scenix.png' : 'images/ScenixDarkTheme.png';
}

// Theme toggle button
const themeToggleBtn = document.getElementById('theme-toggle');
const themeStyle = document.getElementById('theme-style');

themeToggleBtn.addEventListener('click', () => {
    const currentTheme = themeStyle.getAttribute('href').includes('dark') ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    themeStyle.setAttribute('href', `css/${newTheme}-theme.css`);
    updatePlotlyTheme(newTheme);
    updateNavbarLogo(newTheme);
});

// Placeholder data for Plotly graph on homepage
var graph1Data = [
    {
        x: ['2021-01-01', '2021-01-02', '2021-01-03'],
        y: [10, 15, 13],
        type: 'scatter'
    }
];
Plotly.newPlot('graph1', graph1Data, { title: 'Počet funkčních sensorů historicky' });

// Modal handling
const modal = document.getElementById('modal');
const span = document.getElementsByClassName('close')[0];

function showModal(sensor) {
    modal.style.display = 'flex';
    const sensorGraphData = [
        {
            x: ['2021-01-01', '2021-01-02', '2021-01-03'],
            y: sensor.delayData,
            type: 'scatter'
        }
    ];
    Plotly.newPlot('sensorGraph', sensorGraphData, { title: `Historický delay pro sensor ${sensor.nazev}` });
}

span.onclick = function() {
    modal.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Navbar links
const homepageLink = document.getElementById('nav-homepage');
const sensorsLink = document.getElementById('nav-sensors');

homepageLink.addEventListener('click', function() {
    document.getElementById('homepage').classList.remove('hidden');
    document.getElementById('sensors').classList.add('hidden');
    this.classList.add('active');
    sensorsLink.classList.remove('active');
});

sensorsLink.addEventListener('click', function() {
    document.getElementById('homepage').classList.add('hidden');
    document.getElementById('sensors').classList.remove('hidden');
    this.classList.add('active');
    homepageLink.classList.remove('active');
});

// Function to filter sensor cards based on search query by "typ"
function filterSensorCardsByTyp(query) {
    const sensorsContainer = document.getElementById('sensors').querySelector('.row');
    const cards = sensorsContainer.querySelectorAll('.card');

    cards.forEach(card => {
        const sensorTyp = card.querySelector('.card-text').textContent.toLowerCase(); // Assuming typ is displayed in the card text
        card.style.display = sensorTyp.includes(query.toLowerCase()) ? 'block' : 'none';
    });
}

// Event listener for input in search bar
const sensorSearchInput = document.getElementById('sensor-search');
sensorSearchInput.addEventListener('input', function() {
    const query = this.value.trim();
    filterSensorCardsByTyp(query);
});
