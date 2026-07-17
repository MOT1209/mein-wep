document.addEventListener('DOMContentLoaded', () => {

    // 1. تعريف أسعار الصرف مع المزيد من العملات
    const exchangeRates = {
        USD: { EUR: 0.92, GBP: 0.79, JPY: 149.50, SAR: 3.75, CAD: 1.36, AUD: 1.52, CHF: 0.91, CNY: 7.24, USD: 1 },
        EUR: { USD: 1.09, GBP: 0.86, JPY: 162.89, SAR: 4.08, CAD: 1.48, AUD: 1.66, CHF: 0.99, CNY: 7.89, EUR: 1 },
        GBP: { USD: 1.27, EUR: 1.16, JPY: 189.44, SAR: 4.75, CAD: 1.72, AUD: 1.93, CHF: 1.15, CNY: 9.18, GBP: 1 },
        JPY: { USD: 0.0067, EUR: 0.0061, GBP: 0.0053, SAR: 0.025, CAD: 0.0091, AUD: 0.010, CHF: 0.0061, CNY: 0.048, JPY: 1 },
        SAR: { USD: 0.27, EUR: 0.25, GBP: 0.21, JPY: 39.86, CAD: 0.36, AUD: 0.41, CHF: 0.24, CNY: 1.93, SAR: 1 },
        CAD: { USD: 0.74, EUR: 0.68, GBP: 0.58, JPY: 110.11, SAR: 2.76, AUD: 1.12, CHF: 0.67, CNY: 5.33, CAD: 1 },
        AUD: { USD: 0.66, EUR: 0.60, GBP: 0.52, JPY: 98.36, SAR: 2.47, CAD: 0.89, CHF: 0.60, CNY: 4.76, AUD: 1 },
        CHF: { USD: 1.10, EUR: 1.01, GBP: 0.87, JPY: 164.35, SAR: 4.12, CAD: 1.49, AUD: 1.67, CNY: 7.96, CHF: 1 },
        CNY: { USD: 0.14, EUR: 0.13, GBP: 0.11, JPY: 20.65, SAR: 0.52, CAD: 0.19, AUD: 0.21, CHF: 0.13, CNY: 1 }
    };

    // 2. جلب العناصر من الـ DOM
    const amountInput = document.getElementById('amount');
    const fromCurrencySelect = document.getElementById('from-currency');
    const toCurrencySelect = document.getElementById('to-currency');
    const convertButton = document.getElementById('convert-btn');
    const resultDiv = document.getElementById('result');
    const swapIcon = document.getElementById('swap-btn');
    const dateDisplay = document.getElementById('date-display');

    // 3. دالة لعرض تاريخ اليوم
    function displayDate() {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const today = new Date().toLocaleDateString('ar-SA', options);
        dateDisplay.textContent = `أسعار الصرف ليوم ${today}`;
    }

    // 4. ملء القوائم المنسدلة بالعملات ديناميكيًا
    function populateCurrencies() {
        const currencies = Object.keys(exchangeRates);
        currencies.forEach(currency => {
            const fromOption = document.createElement('option');
            fromOption.value = currency;
            fromOption.textContent = currency;
            fromCurrencySelect.appendChild(fromOption);

            const toOption = document.createElement('option');
            toOption.value = currency;
            toOption.textContent = currency;
            toCurrencySelect.appendChild(toOption);
        });
        
        // تعيين عملات افتراضية
        fromCurrencySelect.value = 'USD';
        toCurrencySelect.value = 'EUR';
    }

    // 5. دالة حساب وعرض النتيجة
    function calculateResult() {
        const amount = parseFloat(amountInput.value);
        const fromCurrency = fromCurrencySelect.value;
        const toCurrency = toCurrencySelect.value;

        if (isNaN(amount) || amount <= 0) {
            resultDiv.innerHTML = '<span class="result-text">الرجاء إدخال مبلغ صحيح</span>';
            return;
        }

        const rate = exchangeRates[fromCurrency][toCurrency];
        
        if (fromCurrency === toCurrency) {
            resultDiv.innerHTML = `<span class="result-text">${amount.toFixed(2)} ${fromCurrency} = ${amount.toFixed(2)} ${toCurrency}</span>`;
            return;
        }

        const result = amount * rate;
        resultDiv.innerHTML = `<span class="result-text">${amount.toFixed(2)} ${fromCurrency} = ${result.toFixed(2)} ${toCurrency}</span>`;
    }

    // 6. إضافة مستمعي الأحداث (Event Listeners)
    convertButton.addEventListener('click', (e) => {
        e.preventDefault();
        calculateResult();
    });

    swapIcon.addEventListener('click', () => {
        const temp = fromCurrencySelect.value;
        fromCurrencySelect.value = toCurrencySelect.value;
        toCurrencySelect.value = temp;
        calculateResult();
    });

    // استدعاء الدوال عند تحميل الصفحة
    displayDate();
    populateCurrencies();
    calculateResult();

});

