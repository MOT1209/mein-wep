let goldPrice21 = 0;

document.addEventListener('DOMContentLoaded', () => {
    fetchGoldPrice();
});

async function fetchGoldPrice() {
    const display = document.getElementById('gold-price-display');
    try {
        const response = await fetch('https://api.gold-api.com/price/XAU');
        const data = await response.json();
        const pricePerGram24 = data.price / 31.1035;
        goldPrice21 = pricePerGram24 * 0.875 * 3.75;
        display.innerText = `${goldPrice21.toFixed(2)} ريال`;
    } catch (error) {
        goldPrice21 = 280; // Fallback
        display.innerText = `${goldPrice21} ريال (تقديري)`;
    }
}

function calculateZakatSimple() {
    const wealthInput = document.getElementById('total-wealth').value;
    const resultBox = document.getElementById('simple-result');
    const zakatDisplay = document.getElementById('zakat-amount');
    const nisabAlert = document.getElementById('nisab-alert');

    if (wealthInput === '' || isNaN(wealthInput) || wealthInput <= 0) {
        alert("الرجاء إدخال مبلغ صحيح.");
        return;
    }

    const wealth = parseFloat(wealthInput);
    const nisabLimit = 85 * goldPrice21;

    resultBox.style.display = 'block';
    resultBox.style.animation = 'fadeIn 0.5s ease';

    if (wealth >= nisabLimit) {
        const zakat = wealth * 0.025;
        zakatDisplay.innerText = zakat.toLocaleString();
        nisabAlert.className = 'nisab-alert success';
        nisabAlert.innerHTML = '<i class="fa-solid fa-check-circle"></i> أموالك بلغت النصاب، الزكاة واجبة.';
    } else {
        zakatDisplay.innerText = "0.00";
        nisabAlert.className = 'nisab-alert warning';
        nisabAlert.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> عذراً، لم تبلغ النصاب الشرعي حالياً.';
    }
}
