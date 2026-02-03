document.addEventListener('DOMContentLoaded', () => {
    // ИНИЦИАЛИЗАЦИЯ ТЕМЫ
    initTheme();

    const modal = document.getElementById('quizModal');
    const openBtn = document.getElementById('openQuizBtn');
    const closeBtn = document.querySelector('.close-btn');
    const quizForm = document.getElementById('tourForm');
    const aiResult = document.getElementById('ai-result');

    // Открытие модалки
    openBtn.onclick = () => { modal.style.display = 'block'; if (aiResult) aiResult.style.display = 'none'; };
    
    // Закрытие
    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

    // "ИИ" Логика подбора
    quizForm.onsubmit = (e) => {
        e.preventDefault();
        const pref = document.getElementById('pref').value;
        const company = document.getElementById('company-type').value;
        
        let recommendation = "";

        if (pref === 'warm') {
            recommendation = company === 'family' ? "Турция или Египет (всё включено)" : "Мальдивы или Сейшелы";
        } else if (pref === 'culture') {
            recommendation = "Рим (Италия) или Прага (Чехия)";
        } else if (pref === 'party') {
            recommendation = "Ибица (Испания) или ночной Токио";
        } else {
            recommendation = "Исландия (гейзеры) или Швейцарские Альпы";
        }

        if (aiResult) {
            aiResult.innerHTML = `✨ ИИ рекомендует: ${recommendation}! Наш менеджер свяжется с вами для уточнения деталей.`;
            aiResult.style.display = 'block';
        }
    };

    // Обработчик формы бронирования
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.onsubmit = (e) => {
            e.preventDefault();
            const email = document.getElementById('bookingEmail').value.trim();
            const date = document.getElementById('flightDate').value;
            const plane = document.getElementById('planeSelect').value;
            if (!email || !date) {
                alert('Пожалуйста, заполните e‑mail и дату вылета.');
                return;
            }
            const subject = 'Бронирование Go&Fly';
            const body = 'мы случайно пропили ваши места, спасибо что воспользовались нами';
            const mailto = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

            // Открыть почтовый клиент пользователя
            window.location.href = mailto;

            const result = document.getElementById('bookingResult');
            if (result) {
                result.textContent = `Письмо подготовлено и откроется в вашем почтовом клиенте (адрес: ${email}). Спасибо!`;
                result.style.display = 'block';
            }
            bookingForm.reset();
        };
    }

    // Обновление времени последнего обновления валют
    updateCurrencyTime();
});

// ===== ФУНКЦИИ ТЕМЫ =====
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    
    // Получаем сохраненную тему из localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
    
    // Обработчик клика на кнопку переключения
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            applyTheme(newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
}

function applyTheme(theme) {
    const themeToggle = document.getElementById('themeToggle');
    
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        if (themeToggle) themeToggle.classList.add('dark');
    } else {
        document.body.classList.remove('dark-theme');
        if (themeToggle) themeToggle.classList.remove('dark');
    }
}

// Функция для обновления времени
function updateCurrencyTime() {
    const now = new Date();
    const time = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('currency-time').textContent = time;
}

// ФУНКЦИИ БРОНИРОВАНИЯ ОТЕЛЯ
function openHotelBooking(hotelName) {
    document.getElementById('hotelName').value = hotelName;
    document.getElementById('hotelBookingModal').style.display = 'block';
}

function closeHotelBooking() {
    document.getElementById('hotelBookingModal').style.display = 'none';
}

window.onclick = function(event) {
    const hotelModal = document.getElementById('hotelBookingModal');
    const flightModal = document.getElementById('flightBookingModal');
    
    if (event.target === hotelModal) {
        hotelModal.style.display = 'none';
    }
    if (event.target === flightModal) {
        flightModal.style.display = 'none';
    }
};

// Обработчик формы бронирования отеля
const hotelForm = document.getElementById('hotelForm');
if (hotelForm) {
    hotelForm.onsubmit = (e) => {
        e.preventDefault();
        
        const hotelName = document.getElementById('hotelName').value;
        const guestName = document.getElementById('guestName').value;
        const hotelEmail = document.getElementById('hotelEmail').value;
        const checkIn = document.getElementById('checkInDate').value;
        const checkOut = document.getElementById('checkOutDate').value;
        const nights = document.getElementById('nights').value;
        const currency = document.getElementById('hotelCurrency').value;
        
        if (!guestName || !hotelEmail || !checkIn || !checkOut) {
            alert('Пожалуйста, заполните все поля');
            return;
        }
        
        // Расчет стоимости (примерные цены)
        const prices = {
            'Paradise Resort': { usd: 299, kzt: 128570, rub: 28400 },
            'Bali Sunset': { usd: 89, kzt: 38270, rub: 8455 },
            'Paris Elegance': { usd: 199, kzt: 85570, rub: 18905 },
            'Dubai Luxury': { usd: 449, kzt: 193170, rub: 42655 }
        };
        
        const basePrice = prices[hotelName][currency] || 100;
        const totalPrice = basePrice * nights;
        const currencySymbol = { usd: '$', kzt: '₸', rub: '₽' }[currency];
        
        const result = document.getElementById('hotelBookingResult');
        result.innerHTML = `✅ Успешно! Бронирование отеля "${hotelName}" на ${nights} ночей (${checkIn} - ${checkOut}). Сумма: ${totalPrice}${currencySymbol}. Письмо отправлено на ${hotelEmail}`;
        result.style.display = 'block';
        
        // Имитация отправки письма
        setTimeout(() => {
            hotelForm.reset();
            document.getElementById('hotelBookingModal').style.display = 'none';
            result.style.display = 'none';
        }, 3000);
    };
}

// ФУНКЦИИ ПОКУПКИ АВИАБИЛЕТА
function openFlightBooking(flightRoute) {
    document.getElementById('flightRoute').value = flightRoute;
    document.getElementById('flightBookingModal').style.display = 'block';
}

function closeFlightBooking() {
    document.getElementById('flightBookingModal').style.display = 'none';
}

// Обработчик формы покупки билета
const flightForm = document.getElementById('flightForm');
if (flightForm) {
    flightForm.onsubmit = (e) => {
        e.preventDefault();
        
        const flightRoute = document.getElementById('flightRoute').value;
        const passengerName = document.getElementById('passengerName').value;
        const passport = document.getElementById('passportNumber').value;
        const flightEmail = document.getElementById('flightEmail').value;
        const departure = document.getElementById('departureDate').value;
        const seatClass = document.getElementById('seatClass').value;
        const currency = document.getElementById('flightCurrency').value;
        
        if (!passengerName || !passport || !flightEmail || !departure) {
            alert('Пожалуйста, заполните все поля');
            return;
        }
        
        // Расчет цены билета
        const prices = {
            'Алматы → Куала-Лумпур': { usd: 199, kzt: 85570, rub: 18905 },
            'Нур-Султан → Дубай': { usd: 89, kzt: 38270, rub: 8455 },
            'Алматы → Бангкок': { usd: 149, kzt: 64070, rub: 14155 },
            'Алматы → Денпасар': { usd: 229, kzt: 98470, rub: 21755 }
        };
        
        const seatMultiplier = { economy: 1, business: 2.5, first: 4 }[seatClass];
        const basePrice = prices[flightRoute][currency] || 150;
        const totalPrice = Math.round(basePrice * seatMultiplier);
        const currencySymbol = { usd: '$', kzt: '₸', rub: '₽' }[currency];
        
        const result = document.getElementById('flightBookingResult');
        result.innerHTML = `✅ Билет забронирован! Маршрут: ${flightRoute}, Класс: ${seatClass}, Цена: ${totalPrice}${currencySymbol}. Билет отправлен на ${flightEmail}`;
        result.style.display = 'block';
        
        // Имитация отправки письма
        setTimeout(() => {
            flightForm.reset();
            document.getElementById('flightBookingModal').style.display = 'none';
            result.style.display = 'none';
        }, 3000);
    };
}