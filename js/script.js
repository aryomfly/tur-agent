document.addEventListener('DOMContentLoaded', () => {
    // ===== МОБИЛЬНОЕ МЕНЮ =====
    initMobileMenu();
    initMobileMenu();

    // ИНИЦИАЛИЗАЦИЯ ТЕМЫ
    initTheme();

    const modal = document.getElementById('quizModal');
    const openBtn = document.getElementById('openQuizBtn');
    const closeBtn = document.querySelector('.close-btn');
    const quizForm = document.getElementById('tourForm');
    const aiResult = document.getElementById('ai-result');

    // Открытие модалки
    if (openBtn && modal) {
        openBtn.addEventListener('click', () => {
            modal.style.display = 'block';
            // hide previous search results and clear highlights
            const resultsDiv = document.getElementById('tourResults');
            if (resultsDiv) resultsDiv.style.display = 'none';
            document.querySelectorAll('.card.highlighted').forEach(c => c.classList.remove('highlighted'));
            if (aiResult) aiResult.style.display = 'none';
        });
    }
    
    // Закрытие
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => modal.style.display = 'none');
    }
    window.addEventListener('click', (e) => { if (modal && e.target === modal) modal.style.display = 'none'; });

    // "ИИ" Логика подбора / Поиск туров
    if (quizForm) {
        quizForm.onsubmit = (e) => {
            e.preventDefault();
            try {
                const destination = document.getElementById('destination') ? document.getElementById('destination').value : '';
                const stars = document.querySelector('input[name="stars"]:checked') ? document.querySelector('input[name="stars"]:checked').value : '';
                const budget = document.getElementById('budgetRange') ? Number(document.getElementById('budgetRange').value) : 0;

                const keywords = {
                    sea: ['Бали'],
                    mountains: [],
                    city: ['Париж'],
                    exotic: ['Бали', 'Дубай']
                };

                const cards = document.querySelectorAll('.cards-grid .card');
                let found = 0;
                cards.forEach(card => {
                    const titleEl = card.querySelector('.card-info h3');
                    const title = titleEl ? titleEl.textContent : '';
                    const matches = (keywords[destination] || []).some(k => title.includes(k));
                    if (matches) {
                        card.classList.add('highlighted');
                        found++;
                    } else {
                        card.classList.remove('highlighted');
                    }
                });

                const resultsDiv = document.getElementById('tourResults');
                if (resultsDiv) {
                    if (found > 0) {
                        resultsDiv.textContent = `Найдено ${found} тур(ов) по вашим критериям.`;
                        resultsDiv.style.display = 'block';
                        const first = document.querySelector('.card.highlighted');
                        if (first) first.scrollIntoView({behavior: 'smooth', block: 'center'});
                    } else {
                        resultsDiv.textContent = 'К сожалению, туры по заданным критериям не найдены.';
                        resultsDiv.style.display = 'block';
                    }
                }
            } catch (err) {
                console.error('quizForm submit error:', err);
            }
        };
    }

    // Обработчик формы бронирования
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.onsubmit = async (e) => {
            e.preventDefault();
            const result = document.getElementById('bookingResult');
            try {
                const emailEl = document.getElementById('bookingEmail');
                const dateEl = document.getElementById('flightDate');
                const planeEl = document.getElementById('planeSelect');
                const email = emailEl ? emailEl.value.trim() : '';
                const date = dateEl ? dateEl.value : '';
                const plane = planeEl ? planeEl.value : '';

                if (!email || !date) {
                    alert('Пожалуйста, заполните e‑mail и дату вылета.');
                    return;
                }

                // Отправляем на серверный скрипт (XAMPP)
                const payload = { type: 'booking', email, date, plane };
                const resp = await fetch('./send_mail.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const json = await resp.json();
                if (json.success) {
                    if (result) {
                        result.textContent = '✅ Запрос на бронирование отправлен. Мы свяжемся с вами.';
                        result.style.display = 'block';
                    }
                    bookingForm.reset();
                } else {
                    if (result) {
                        result.textContent = '❌ Не удалось отправить запрос: ' + (json.message || 'ошибка сервера');
                        result.style.display = 'block';
                    }
                }
            } catch (err) {
                console.error('bookingForm submit error:', err);
                if (result) {
                    result.textContent = '❌ Ошибка при отправке запроса. Проверьте конфигурацию сервера.';
                    result.style.display = 'block';
                }
            }
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
    const el = document.getElementById('currency-time');
    if (el) el.textContent = time;
}

// ФУНКЦИИ БРОНИРОВАНИЯ ОТЕЛЯ
function openHotelBooking(hotelName) {
    const hotelNameEl = document.getElementById('hotelName');
    const hotelModal = document.getElementById('hotelBookingModal');
    if (hotelNameEl) hotelNameEl.value = hotelName;
    if (hotelModal) hotelModal.style.display = 'block';
}

function closeHotelBooking() {
    const hotelModal = document.getElementById('hotelBookingModal');
    if (hotelModal) hotelModal.style.display = 'none';
}

window.addEventListener('click', function(event) {
    const hotelModal = document.getElementById('hotelBookingModal');
    const flightModal = document.getElementById('flightBookingModal');
    
    if (hotelModal && event.target === hotelModal) {
        hotelModal.style.display = 'none';
    }
    if (flightModal && event.target === flightModal) {
        flightModal.style.display = 'none';
    }
});

// Обработчик формы бронирования отеля
const hotelForm = document.getElementById('hotelForm');
if (hotelForm) {
    hotelForm.onsubmit = (e) => {
        e.preventDefault();
        try {
            const hotelNameEl = document.getElementById('hotelName');
            const guestNameEl = document.getElementById('guestName');
            const hotelEmailEl = document.getElementById('hotelEmail');
            const checkInEl = document.getElementById('checkInDate');
            const checkOutEl = document.getElementById('checkOutDate');
            const nightsEl = document.getElementById('nights');
            const currencyEl = document.getElementById('hotelCurrency');

            const hotelName = hotelNameEl ? hotelNameEl.value : '';
            const guestName = guestNameEl ? guestNameEl.value : '';
            const hotelEmail = hotelEmailEl ? hotelEmailEl.value : '';
            const checkIn = checkInEl ? checkInEl.value : '';
            const checkOut = checkOutEl ? checkOutEl.value : '';
            const nights = nightsEl ? Number(nightsEl.value) || 1 : 1;
            const currency = currencyEl ? currencyEl.value : 'usd';

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
            
            const basePrice = (prices[hotelName] && prices[hotelName][currency]) || 100;
            const totalPrice = basePrice * nights;
            const currencySymbol = { usd: '$', kzt: '₸', rub: '₽' }[currency] || '$';
            
            const result = document.getElementById('hotelBookingResult');
            if (result) {
                result.innerHTML = `✅ Успешно! Бронирование отеля "${hotelName}" на ${nights} ночей (${checkIn} - ${checkOut}). Сумма: ${totalPrice}${currencySymbol}. Письмо отправлено на ${hotelEmail}`;
                result.style.display = 'block';
            }
            
            // Имитация отправки письма
            setTimeout(() => {
                hotelForm.reset();
                const modal = document.getElementById('hotelBookingModal');
                if (modal) modal.style.display = 'none';
                if (result) result.style.display = 'none';
            }, 3000);
        } catch (err) {
            console.error('hotelForm submit error:', err);
        }
    };
} 

// ФУНКЦИИ ПОКУПКИ АВИАБИЛЕТА
function openFlightBooking(flightRoute) {
    const flightRouteEl = document.getElementById('flightRoute');
    const flightModal = document.getElementById('flightBookingModal');
    if (flightRouteEl) flightRouteEl.value = flightRoute;
    if (flightModal) flightModal.style.display = 'block';
}

function closeFlightBooking() {
    const flightModal = document.getElementById('flightBookingModal');
    if (flightModal) flightModal.style.display = 'none';
}

// Обработчик формы покупки билета
const flightForm = document.getElementById('flightForm');
if (flightForm) {
    flightForm.onsubmit = (e) => {
        e.preventDefault();
        try {
            const flightRouteEl = document.getElementById('flightRoute');
            const passengerNameEl = document.getElementById('passengerName');
            const passportEl = document.getElementById('passportNumber');
            const flightEmailEl = document.getElementById('flightEmail');
            const departureEl = document.getElementById('departureDate');
            const seatClassEl = document.getElementById('seatClass');
            const currencyEl = document.getElementById('flightCurrency');

            const flightRoute = flightRouteEl ? flightRouteEl.value : '';
            const passengerName = passengerNameEl ? passengerNameEl.value : '';
            const passport = passportEl ? passportEl.value : '';
            const flightEmail = flightEmailEl ? flightEmailEl.value : '';
            const departure = departureEl ? departureEl.value : '';
            const seatClass = seatClassEl ? seatClassEl.value : 'economy';
            const currency = currencyEl ? currencyEl.value : 'usd';

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
            
            const seatMultiplier = { economy: 1, business: 2.5, first: 4 }[seatClass] || 1;
            const basePrice = (prices[flightRoute] && prices[flightRoute][currency]) || 150;
            const totalPrice = Math.round(basePrice * seatMultiplier);
            const currencySymbol = { usd: '$', kzt: '₸', rub: '₽' }[currency] || '$';
            
            const result = document.getElementById('flightBookingResult');
            if (result) {
                result.innerHTML = `✅ Билет забронирован! Маршрут: ${flightRoute}, Класс: ${seatClass}, Цена: ${totalPrice}${currencySymbol}. Билет отправлен на ${flightEmail}`;
                result.style.display = 'block';
            }
            
            // Имитация отправки письма
            setTimeout(() => {
                flightForm.reset();
                const modal = document.getElementById('flightBookingModal');
                if (modal) modal.style.display = 'none';
                if (result) result.style.display = 'none';
            }, 3000);
        } catch (err) {
            console.error('flightForm submit error:', err);
        }
    };
}

// ===== CAPTCHA VERIFICATION FUNCTION =====
function initCaptcha() {
    try {
        const captchaModal = document.getElementById('captchaModal');
        if (!captchaModal) return; // No captcha on this page

        const captchaCheckbox = document.getElementById('captchaCheckbox');
        const captchaSubmit = document.getElementById('captchaSubmit');
        
        // Проверяем был ли пользователь уже верифицирован
        if (localStorage.getItem('captchaVerified') === 'true') {
            captchaModal.style.display = 'none';
            return;
        }
        
        // Обработчик чекбокса
        if (captchaCheckbox && captchaSubmit) {
            captchaCheckbox.addEventListener('change', (e) => {
                try {
                    captchaSubmit.disabled = !e.target.checked;
                } catch (err) {
                    console.error('captcha change handler error:', err);
                }
            });
            
            // Обработчик кнопки "Продолжить"
            captchaSubmit.addEventListener('click', () => {
                try {
                    if (captchaCheckbox.checked) {
                        // Имитация проверки CAPTCHA (в реальности используется reCAPTCHA)
                        captchaSubmit.disabled = true;
                        captchaSubmit.textContent = 'Проверка...';
                        
                        // Имитируем задержку проверки
                        setTimeout(() => {
                            localStorage.setItem('captchaVerified', 'true');
                            captchaModal.style.display = 'none';
                            captchaCheckbox.checked = false;
                            captchaSubmit.disabled = false;
                            captchaSubmit.textContent = 'Продолжить';
                        }, 800);
                    }
                } catch (err) {
                    console.error('captcha submit handler error:', err);
                }
            });
        }
        
        // Запрет закрытия модали кликом вне
        captchaModal.addEventListener('click', (e) => {
            if (e.target === captchaModal) {
                e.preventDefault();
            }
        });
    } catch (err) {
        console.error('initCaptcha error:', err);
    }
}

// ===== MOBILE MENU FUNCTION =====
function initMobileMenu() {
    // Создаем кнопку меню если её нет
    const header = document.querySelector('.header-container, .header, .header-content');
    const nav = document.querySelector('nav');
    
    if (!document.getElementById('mobileMenuBtn')) {
        const menuBtn = document.createElement('button');
        menuBtn.id = 'mobileMenuBtn';
        menuBtn.className = 'mobile-menu-btn';
        menuBtn.innerHTML = '☰';
        menuBtn.setAttribute('aria-label', 'Toggle menu');
        if (header) header.appendChild(menuBtn);
        
        // Обработчик клика
        menuBtn.addEventListener('click', () => {
            const navList = document.querySelector('.nav-list');
            if (navList) navList.classList.toggle('active');
            menuBtn.classList.toggle('active');
        });
    }
    
    // Закрываем меню при клике на ссылку
    const navLinks = document.querySelectorAll('.nav-list a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const navList = document.querySelector('.nav-list');
            const menuBtn = document.getElementById('mobileMenuBtn');
            if (navList) navList.classList.remove('active');
            if (menuBtn) menuBtn.classList.remove('active');
        });
    });
    
    // Обработчик dropdown меню
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        const dropbtn = dropdown.querySelector('.dropbtn');
        const dropContent = dropdown.querySelector('.dropdown-content');
        
        if (dropbtn && dropContent) {
            dropbtn.addEventListener('click', (e) => {
                e.preventDefault();
                dropContent.classList.toggle('show');
            });
        }
    });
    
    // Закрыть dropdown при клике вне
    document.addEventListener('click', (e) => {
        dropdowns.forEach(dropdown => {
            const dropContent = dropdown.querySelector('.dropdown-content');
            if (!dropdown.contains(e.target) && dropContent) {
                dropContent.classList.remove('show');
            }
        });
    });
}

// ==============================
// ========== ADMIN ============
// ==============================
(function () {
	'use strict';

	const STORAGE_KEY = 'siteContent_v1';

	// карта: ключ -> селектор (используется и на index.html и на admin.html)
	const editableMap = {
		'logo': '.logo',
		'nav.tours': '.nav-list a[href="#tours"]',
		'nav.currency': '.nav-list a[href="#currency"]',
		'nav.hotels': '.nav-list a[href="#hotels"]',
		'nav.flights': '.nav-list a[href="#flights"]',
		'nav.clients': '.dropbtn',
		'nav.contact': '.nav-list a[href="#contact"]',
		'hero.title': '.hero h1',
		'hero.subtitle': '.hero p',
		'hero.cta': '#openQuizBtn',
		'tours.title': '#tours .section-title',
		'tour1.title': '#tours .cards-grid .card:nth-child(1) h3',
		'tour1.desc': '#tours .cards-grid .card:nth-child(1) p',
		'tour2.title': '#tours .cards-grid .card:nth-child(2) h3',
		'tour2.desc': '#tours .cards-grid .card:nth-child(2) p',
		'tour3.title': '#tours .cards-grid .card:nth-child(3) h3',
		'tour3.desc': '#tours .cards-grid .card:nth-child(3) p',
		'hotTours.title': '#hot-tours .section-title',
		'hotTours.note': '#hot-tours p',
		'currency.title': '#currency .section-title',
		'usd.rate': '#usd-rate',
		'usd.rub': '#usd-rub',
		'rub.rate': '#rub-rate',
		'kzt.rub': '#kzt-rub',
		'hotels.title': '#hotels .section-title',
		'hotel1.name': '#hotels .hotel-card:nth-child(1) h3',
		'flights.title': '#flights .section-title',
		'about.title': '#about-us h2',
		'about.text': '#about-us .text-block p',
		'company.title': '#company h2',
		'company.text': '#company p',
		'footer.name': '.footer-content h3',
		'footer.addr': '.footer-content p:nth-child(2)',
		'footer.phone': '.footer-content div:nth-child(2) p:nth-child(1)',
		'footer.email': '.footer-content div:nth-child(2) p:nth-child(2)'
	};

	// получить текущие значения с DOM (по селекторам)
	function getDefaults() {
		const defaults = {};
		Object.keys(editableMap).forEach(key => {
			const sel = editableMap[key];
			const el = document.querySelector(sel);
			defaults[key] = el ? (el.textContent || '') : '';
		});
		return defaults;
	}

	// сохранить объект в localStorage
	function saveContent(obj) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
	}

	// прочитать объект из localStorage
	function readContent() {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			return raw ? JSON.parse(raw) : null;
		} catch (e) {
			return null;
		}
	}

	// применить значения на текущую страницу, используем textContent — теги не выполняются
	function applyContent(obj) {
		Object.keys(editableMap).forEach(key => {
			const sel = editableMap[key];
			const el = document.querySelector(sel);
			if (!el) return;
			const value = (obj && obj[key] !== undefined) ? obj[key] : el.textContent;
			el.textContent = value;
		});
	}

	// Инициализация на публичной странице
	if (!/\/admin\.html$/i.test(window.location.pathname)) {
		// При загрузке страницы применяем сохранённые значения (если есть)
		document.addEventListener('DOMContentLoaded', () => {
			const saved = readContent();
			if (saved) {
				applyContent(saved);
			}
		});
		return;
	}

	// ------------------------------
	// Admin page logic (admin.html)
	// ------------------------------
	document.addEventListener('DOMContentLoaded', () => {
		const container = document.getElementById('adminRoot');
		const defaults = getDefaults();
		const saved = readContent() || {};
		const current = Object.assign({}, defaults, saved);

		// header
		const h = document.createElement('h1');
		h.textContent = 'Admin: Редактирование текстов сайта';
		container.appendChild(h);

		const info = document.createElement('p');
		info.textContent = 'Изменения сохраняются в localStorage. HTML-теги в тексте отображаются как обычный текст (без выполнения).';
		container.appendChild(info);

		// form
		const form = document.createElement('form');
		form.id = 'adminForm';
		form.style.display = 'grid';
		form.style.gridTemplateColumns = '1fr 1fr';
		form.style.gap = '10px';

		Object.keys(editableMap).forEach(key => {
			const wrapper = document.createElement('div');
			wrapper.style.display = 'flex';
			wrapper.style.flexDirection = 'column';

			const label = document.createElement('label');
			label.textContent = key;
			label.style.fontWeight = '600';
			label.htmlFor = 'f_' + key;

			const textarea = document.createElement('textarea');
			textarea.id = 'f_' + key;
			textarea.rows = 2;
			textarea.value = current[key] || '';
			textarea.dataset.key = key;
			textarea.style.width = '100%';
			textarea.style.boxSizing = 'border-box';

			wrapper.appendChild(label);
			wrapper.appendChild(textarea);
			form.appendChild(wrapper);
		});

		container.appendChild(form);

		// actions
		const actions = document.createElement('div');
		actions.style.marginTop = '12px';

		const saveBtn = document.createElement('button');
		saveBtn.type = 'button';
		saveBtn.textContent = 'Сохранить';
		saveBtn.style.marginRight = '8px';
		saveBtn.onclick = () => {
			const nodes = form.querySelectorAll('textarea[data-key]');
			const toSave = {};
			nodes.forEach(n => toSave[n.dataset.key] = n.value);
			saveContent(toSave);
			// обновить iframe preview
			const iframe = document.getElementById('previewFrame');
			if (iframe) {
				iframe.contentWindow.location.reload();
			}
			alert('Сохранено. Перегружен предпросмотр.');
		};

		const resetBtn = document.createElement('button');
		resetBtn.type = 'button';
		resetBtn.textContent = 'Сбросить к значениям по умолчанию';
		resetBtn.style.marginRight = '8px';
		resetBtn.onclick = () => {
			if (!confirm('Сбросить все изменения и удалить сохранённые тексты?')) return;
			localStorage.removeItem(STORAGE_KEY);
			// сброс формы к дефолтам
			Object.keys(editableMap).forEach(key => {
				const t = document.getElementById('f_' + key);
				if (t) t.value = defaults[key] || '';
			});
			const iframe = document.getElementById('previewFrame');
			if (iframe) iframe.contentWindow.location.reload();
			alert('Сброшено.');
		};

		const openSiteBtn = document.createElement('button');
		openSiteBtn.type = 'button';
		openSiteBtn.textContent = 'Открыть сайт в новой вкладке';
		openSiteBtn.onclick = () => {
			window.open('index.html', '_blank');
		};

		actions.appendChild(saveBtn);
		actions.appendChild(resetBtn);
		actions.appendChild(openSiteBtn);
		container.appendChild(actions);

		// iframe preview
		const previewWrap = document.createElement('div');
		previewWrap.style.marginTop = '16px';
		const previewTitle = document.createElement('h3');
		previewTitle.textContent = 'Предпросмотр (iframe):';
		previewWrap.appendChild(previewTitle);
		const iframe = document.createElement('iframe');
		iframe.id = 'previewFrame';
		iframe.src = 'index.html';
		iframe.style.width = '100%';
		iframe.style.height = '600px';
		iframe.style.border = '1px solid #ccc';
		previewWrap.appendChild(iframe);
		container.appendChild(previewWrap);
	});
})();