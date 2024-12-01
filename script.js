const cryptoListElement = document.getElementById('crypto-list');
const comparisonListElement = document.getElementById('comparison-list');
const clearComparisonButton = document.getElementById('clear-comparison');
const sortOptions = document.getElementById('sort-options');
const showPriceChangeCheckbox = document.getElementById('show-price-change');
const selectedCryptos = JSON.parse(localStorage.getItem('selectedCryptos')) || [];

// Store the full crypto data for comparison
let cryptoData = [];

// Fetch cryptocurrency data from CoinGecko API
async function fetchCryptos() {
    const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false');
    cryptoData = await response.json();
    displayCryptos(cryptoData);
    updateComparisonList(); // Update comparison list on initial fetch
}

// Display fetched cryptocurrencies
function displayCryptos(cryptos) {
    cryptoListElement.innerHTML = '';
    cryptos.forEach(crypto => {
        const box = document.createElement('div');
        box.classList.add('crypto-box');
        box.innerHTML = `
            <strong>${crypto.name} (${crypto.symbol.toUpperCase()})</strong><br>
            Price: $${crypto.current_price}<br>
            Market Cap: $${crypto.market_cap}<br>
            ${showPriceChangeCheckbox.checked ? `24h Change: ${crypto.price_change_percentage_24h.toFixed(2)}%` : ''}
        `;
        box.addEventListener('click', () => addToComparison(crypto));
        cryptoListElement.appendChild(box);
    });
}

// Sort cryptocurrencies based on selected criteria
function sortCryptos(criteria) {
    let sortedCryptos;
    switch (criteria) {
        case 'market_cap_desc':
            sortedCryptos = [...cryptoData].sort((a, b) => b.market_cap - a.market_cap);
            break;
        case 'market_cap_asc':
            sortedCryptos = [...cryptoData].sort((a, b) => a.market_cap - b.market_cap);
            break;
        case 'price_desc':
            sortedCryptos = [...cryptoData].sort((a, b) => b.current_price - a.current_price);
            break;
        case 'price_asc':
            sortedCryptos = [...cryptoData].sort((a, b) => a.current_price - b.current_price);
            break;
        case 'change_desc':
            sortedCryptos = [...cryptoData].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
            break;
        case 'change_asc':
            sortedCryptos = [...cryptoData].sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h);
            break;
        default:
            sortedCryptos = cryptoData;
    }
    displayCryptos(sortedCryptos);
}

// Add cryptocurrency to comparison
function addToComparison(crypto) {
    if (selectedCryptos.length < 5 && !selectedCryptos.includes(crypto.id)) {
        selectedCryptos.push(crypto.id);
        localStorage.setItem('selectedCryptos', JSON.stringify(selectedCryptos));
        updateComparisonList();
    } else {
        alert('You can only compare up to 5 cryptocurrencies or you have already selected this cryptocurrency.');
    }
}

// Update the comparison list display
function updateComparisonList() {
    comparisonListElement.innerHTML = '';
    selectedCryptos.forEach(id => {
        const crypto = cryptoData.find(c => c.id === id);
        if (crypto) {
            const box = document.createElement('div');
            box.classList.add('crypto-box');
            box.innerHTML = `
                <strong>${crypto.name} (${crypto.symbol.toUpperCase()})</strong><br>
                Price: $${crypto.current_price} 
                ${showPriceChangeCheckbox.checked ? `24h Change: ${crypto.price_change_percentage_24h.toFixed(2 )}%` : ''}
                <button class="delete-button" onclick="removeFromComparison('${id}')">Delete</button>
            `;
            comparisonListElement.appendChild(box);
        }
    });
}

// Remove cryptocurrency from comparison
function removeFromComparison(id) {
    const index = selectedCryptos.indexOf(id);
    if (index > -1) {
        selectedCryptos.splice(index, 1);
        localStorage.setItem('selectedCryptos', JSON.stringify(selectedCryptos));
        updateComparisonList();
    }
}

// Clear comparison list
clearComparisonButton.addEventListener('click', () => {
    selectedCryptos.length = 0;
    localStorage.removeItem('selectedCryptos');
    updateComparisonList();
});

// Event listener for sorting
sortOptions.addEventListener('change', (event) => {
    sortCryptos(event.target.value);
});

// Event listener for showing/hiding price change
showPriceChangeCheckbox.addEventListener('change', () => {
    displayCryptos(cryptoData); // Refresh display when checkbox state changes
});

// Initial fetch
fetchCryptos();