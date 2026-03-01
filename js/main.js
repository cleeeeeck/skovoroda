document.addEventListener('DOMContentLoaded', () => {
    // Таймер акції
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 5);
    endDate.setHours(23, 59, 59, 999);

    const timerElement = document.getElementById('action-timer');
    if (timerElement) {
        function updateTimer() {
            const now = new Date();
            const timeLeft = endDate - now;
            if (timeLeft > 0) {
                const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
                timerElement.textContent = `До кінця акції: ${days} днів ${hours} год ${minutes} хв ${seconds} сек`;
            } else {
                timerElement.textContent = 'Акція завершена!';
            }
        }
        updateTimer();
        setInterval(updateTimer, 1000);
    }

    // Залишок товару
    const startDate = new Date('2026-02-28');
    const now = new Date();
    const daysPassed = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
    let remaining = 24 - daysPassed;
    if (remaining < 0) remaining = 0;
    if (remaining === 1) remaining = '1 штуку';

    const stockElement = document.getElementById('remaining-stock');
    if (stockElement) stockElement.textContent = `За акційною ціною залишилось ${remaining} штук!`;

    // Динамічна ціна
    const basePrices = {40: 1630, 50: 1850, 60: 2435};

    let currentSize = 40;
    let basePrice = basePrices[40];

    const sizeBtns = document.querySelectorAll('.size-btn');
    const checkboxes = document.querySelectorAll('.addon-checkbox');
    const totalEl = document.getElementById('total');
    const orderBtn = document.getElementById('order-btn');
    const nameInput = document.getElementById('user-name');
    const phoneInput = document.getElementById('user-phone');
    const thankYouModal = document.getElementById('thank-you');

    function updatePrice() {
        let addonsTotal = 0;
        let selectedAddons = [];

        checkboxes.forEach(cb => {
            if (cb.checked) {
                const name = cb.dataset.name;
                const priceAttr = cb.dataset.price;
                const sizesAttr = cb.dataset.sizes;
                let price = parseInt(priceAttr) || 0;

                if (sizesAttr) {
                    const prices = JSON.parse(sizesAttr);
                    price = prices[currentSize] || 280;
                }

                addonsTotal += price;
                selectedAddons.push(`${name} — ${price} грн`);
            }
        });

        const finalPrice = Math.round(basePrice + addonsTotal);

        totalEl.textContent = finalPrice;

        // Зберігаємо дані
        orderBtn.dataset.size = currentSize + ' см';
        orderBtn.dataset.price = finalPrice;
        orderBtn.dataset.addons = selectedAddons.join(', ') || 'без допів';
    }

    sizeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            sizeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSize = parseInt(btn.dataset.size);
            basePrice = parseInt(btn.dataset.basePrice);
            updatePrice();
        });
    });

    checkboxes.forEach(cb => cb.addEventListener('change', updatePrice));
    updatePrice();

    // Кнопка "Замовити" — відправка в Telegram без відкриття вікна
    orderBtn.addEventListener('click', async () => {
        const name = nameInput.value.trim();
        const phone = phoneInput.value.trim();

        if (!name || !phone) {
            alert('Вкажіть ім\'я та номер телефону');
            return;
        }

        const size = orderBtn.dataset.size;
        const price = orderBtn.dataset.price;
        const addons = orderBtn.dataset.addons;

        // Твій бот і чат ID (заміни!)
        const BOT_TOKEN = '123456789:AAF...'; // ← ТВІЙ ТОКЕН БОТА
        const CHAT_ID = '123456789';          // ← ТВІЙ CHAT ID (твій особистий або групи)

        const message = `Нове замовлення!\n\nІм'я: ${name}\nТелефон: ${phone}\nСковорода: ${size}\nДопи: ${addons}\nСума: ${price} грн`;

        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(message)}`;

        try {
            const response = await fetch(url);
            if (response.ok) {
                // Успіх — показуємо подяку
                document.getElementById('thank-name').textContent = name;
                document.getElementById('thank-phone').textContent = phone;
                document.getElementById('thank-sum').textContent = price;
                thankYouModal.style.display = 'flex';
            } else {
                alert('Помилка відправки. Спробуйте ще раз або напишіть нам напряму.');
            }
        } catch (error) {
            console.error('Помилка відправки:', error);
            alert('Не вдалося відправити замовлення. Перевірте інтернет або напишіть нам напряму.');
        }
    });
});