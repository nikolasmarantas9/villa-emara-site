document.addEventListener('DOMContentLoaded', () => {

    // Booking contact buttons: build a message from the actual booking form fields.
    const bookingWhatsappBtn = document.getElementById('btnWhatsapp');
    const bookingViberBtn = document.getElementById('btnViber');

    function buildBookingMessage() {
        const name = document.getElementById('custName')?.value.trim() || '';
        const phone = document.getElementById('custPhone')?.value.trim() || '';
        const dates = document.getElementById('dateRangePicker')?.value.trim() || '';
        const adults = document.getElementById('adultsVal')?.textContent.trim() || '2';
        const children = document.getElementById('childrenVal')?.textContent.trim() || '0';

        if (!name || !phone || !dates) {
            const lang = localStorage.getItem('villa_lang') || 'el';
            alert(lang === 'en'
                ? 'Please enter your name, phone number, and select your arrival/departure dates first.'
                : lang === 'bg'
                    ? 'Моля, въведете име, телефон и изберете дати на пристигане и заминаване.'
                    : 'Συμπλήρωσε ονοματεπώνυμο, τηλέφωνο και επίλεξε ημερομηνίες άφιξης και αναχώρησης.');
            return null;
        }

        const lang = localStorage.getItem('villa_lang') || 'el';
        const heading = lang === 'en' ? 'Booking request — Villa Emara'
            : lang === 'bg' ? 'Заявка за резервация — Villa Emara'
            : 'Αίτημα κράτησης — Villa Emara';
        const nameLabel = lang === 'en' ? 'Name' : lang === 'bg' ? 'Име' : 'Ονοματεπώνυμο';
        const phoneLabel = lang === 'en' ? 'Phone' : lang === 'bg' ? 'Телефон' : 'Τηλέφωνο';
        const datesLabel = lang === 'en' ? 'Dates' : lang === 'bg' ? 'Дати' : 'Ημερομηνίες';
        const adultsLabel = lang === 'en' ? 'Adults' : lang === 'bg' ? 'Възрастни' : 'Ενήλικες';
        const childrenLabel = lang === 'en' ? 'Children' : lang === 'bg' ? 'Деца' : 'Παιδιά';

        return `${heading}\n${nameLabel}: ${name}\n${phoneLabel}: ${phone}\n${datesLabel}: ${dates}\n${adultsLabel}: ${adults}\n${childrenLabel}: ${children}`;
    }

    bookingWhatsappBtn?.addEventListener('click', () => {
        const message = buildBookingMessage();
        if (!message) return;
        window.open('https://wa.me/306985841141?text=' + encodeURIComponent(message), '_blank', 'noopener,noreferrer');
    });

    bookingViberBtn?.addEventListener('click', () => {
        const message = buildBookingMessage();
        if (!message) return;
        window.location.href = 'viber://chat?number=%2B306985841141&draft=' + encodeURIComponent(message);
    });


    // ==========================================
    // 1. Quick Chat Drawer Widget
    // ==========================================

    const chatToggleBtn = document.getElementById('chatToggleBtn');
    const chatDrawer = document.getElementById('chatDrawer');
    const chatClose = document.getElementById('chatClose');

    chatToggleBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        chatDrawer?.classList.toggle('show');
    });

    chatClose?.addEventListener('click', () => {
        chatDrawer?.classList.remove('show');
    });

    window.addEventListener('click', (e) => {
        if (
            !chatDrawer?.contains(e.target) &&
            !chatToggleBtn?.contains(e.target)
        ) {
            chatDrawer?.classList.remove('show');
        }
    });

    // ==========================================
    // 2. Lightbox Modal για τη Γκαλερί
    // ==========================================

    const modal = document.getElementById('lightboxModal');
    const modalImg = document.getElementById('lightboxImg');
    const closeBtn = document.querySelector('.lightbox-close');
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');

    let currentGalleryImages = [];
    let currentIndex = 0;
    let currentImgSrc = '';

    function updateActiveImagesList() {
        const visibleItems = document.querySelectorAll('.gallery-item');

        currentGalleryImages = Array.from(visibleItems)
            .filter(item => item.style.display !== 'none')
            .map(item => item.querySelector('img')?.src)
            .filter(Boolean);
    }

    document.querySelectorAll('.gallery-item img').forEach((img) => {
        img.addEventListener('click', (e) => {
            updateActiveImagesList();

            currentImgSrc = e.target.src;
            currentIndex = currentGalleryImages.indexOf(currentImgSrc);

            if (currentIndex === -1) currentIndex = 0;
            if (!modal || !modalImg || !currentGalleryImages.length) return;

            modal.classList.add('active');
            modalImg.src = currentGalleryImages[currentIndex];
        });
    });

    closeBtn?.addEventListener('click', () => {
        modal?.classList.remove('active');
    });

    modal?.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    nextBtn?.addEventListener('click', () => {
        if (!currentGalleryImages.length || !modalImg) return;

        currentIndex = (currentIndex + 1) % currentGalleryImages.length;
        modalImg.src = currentGalleryImages[currentIndex];
    });

    prevBtn?.addEventListener('click', () => {
        if (!currentGalleryImages.length || !modalImg) return;

        currentIndex =
            (currentIndex - 1 + currentGalleryImages.length) %
            currentGalleryImages.length;

        modalImg.src = currentGalleryImages[currentIndex];
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modal?.classList.remove('active');
        }

        if (!modal?.classList.contains('active')) return;

        if (e.key === 'ArrowRight') {
            nextBtn?.click();
        } else if (e.key === 'ArrowLeft') {
            prevBtn?.click();
        }
    });

    // ==========================================
    // 3. Scroll Reveal Animations
    // ==========================================

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        document.querySelectorAll('section').forEach(sec => {
            sec.classList.add('animate-on-scroll');
            observer.observe(sec);
        });
    }

    // ==========================================
    // 4. Γλώσσα και ημερολόγιο κρατήσεων
    // ==========================================

    let currentLang = localStorage.getItem('villa_lang') || 'el';

    let datePicker = null;
    let selectedRangeStr = '';
    let disabledBookingDates = [];
    let selectedBookingDates = [];
    let calendarResizeTimeout;
    let calendarSyncState = 'loading'; // loading | ready | error

    const calendarSyncStatus = document.getElementById('calendarSyncStatus');
    const dateInputElement = document.getElementById('dateRangePicker');

    function setCalendarSyncState(state) {
        calendarSyncState = state;

        if (calendarSyncStatus) {
            const messages = {
                el: {
                    loading: 'Γίνεται έλεγχος διαθεσιμότητας από το Booking.com…',
                    ready: 'Το ημερολόγιο ενημερώθηκε από το Booking.com. Η τελική διαθεσιμότητα επιβεβαιώνεται από το κατάλυμα.',
                    error: 'Δεν ήταν δυνατός ο συγχρονισμός. Οι ημερομηνίες δεν είναι διαθέσιμες για επιλογή αυτή τη στιγμή. Δοκιμάστε ξανά αργότερα.'
                },
                en: {
                    loading: 'Checking availability from Booking.com…',
                    ready: 'Calendar updated from Booking.com. Final availability must be confirmed by the property.',
                    error: 'Calendar sync failed. Dates cannot be selected right now. Please try again later.'
                },
                bg: {
                    loading: 'Проверява се наличността в Booking.com…',
                    ready: 'Календарът е актуализиран от Booking.com. Окончателната наличност трябва да бъде потвърдена от мястото за настаняване.',
                    error: 'Синхронизирането не успя. В момента не могат да се избират дати. Моля, опитайте по-късно.'
                }
            };

            calendarSyncStatus.textContent =
                (messages[currentLang] || messages.el)[state];

            calendarSyncStatus.classList.toggle('is-ready', state === 'ready');
            calendarSyncStatus.classList.toggle('is-error', state === 'error');

            const calendarLegend = document.getElementById('calendarLegend');

            if (calendarLegend) {
                calendarLegend.hidden = state !== 'ready';
            }

            // Add a small retry control only when sync fails; remove it on the next attempt.
            const existingRetry = document.getElementById('calendarSyncRetry');
            if (existingRetry) existingRetry.remove();

            if (state === 'error') {
                const retry = document.createElement('button');
                retry.type = 'button';
                retry.id = 'calendarSyncRetry';
                retry.textContent =
                    currentLang === 'en'
                        ? 'Try again'
                        : currentLang === 'bg'
                            ? 'Опитай отново'
                            : 'Δοκιμή ξανά';

                retry.className = 'calendar-sync-retry';
                retry.addEventListener('click', syncBookingCalendar);
                calendarSyncStatus.insertAdjacentElement('afterend', retry);
            }
        }

        if (dateInputElement) {
            dateInputElement.disabled = state !== 'ready';
        }

        if (
            datePicker &&
            state !== 'ready' &&
            typeof datePicker.close === 'function'
        ) {
            datePicker.close();
        }
    }

    function getCalendarLocale(lang) {
        if (typeof flatpickr === 'undefined') return undefined;
        if (lang === 'el' && flatpickr.l10ns.gr) return flatpickr.l10ns.gr;
        if (lang === 'bg' && flatpickr.l10ns.bg) return flatpickr.l10ns.bg;
        if (lang === 'en' && flatpickr.l10ns.en) return flatpickr.l10ns.en;
        return flatpickr.l10ns.default;
    }

    function isBlockedDate(date) {
        const target = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        ).getTime();

        return disabledBookingDates.some(d =>
            new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() === target
        );
    }

    function rangeContainsBlockedDate(start, end) {
        const cursor = new Date(
            start.getFullYear(),
            start.getMonth(),
            start.getDate()
        );

        const checkout = new Date(
            end.getFullYear(),
            end.getMonth(),
            end.getDate()
        );

        while (cursor < checkout) {
            if (isBlockedDate(cursor)) return true;
            cursor.setDate(cursor.getDate() + 1);
        }

        return false;
    }

    function updateCalendarSelectionSummary(selectedDates = []) {
        const summary = document.getElementById('calendarSelectionSummary');

        if (!summary) return;

        if (selectedDates.length === 0) {
            summary.textContent =
                currentLang === 'en'
                    ? 'Choose arrival and departure dates.'
                    : currentLang === 'bg'
                        ? 'Изберете дата на пристигане и заминаване.'
                        : 'Επίλεξε ημερομηνία άφιξης και αναχώρησης.';
            return;
        }

        const locale =
            currentLang === 'en' ? 'en-GB' :
            currentLang === 'bg' ? 'bg-BG' :
            'el-GR';

        const formatDate = (date) =>
            date.toLocaleDateString(locale, {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });

        if (selectedDates.length === 1) {
            summary.textContent =
                currentLang === 'en'
                    ? `Arrival: ${formatDate(selectedDates[0])}. Choose departure.`
                    : currentLang === 'bg'
                        ? `Пристигане: ${formatDate(selectedDates[0])}. Изберете заминаване.`
                        : `Άφιξη: ${formatDate(selectedDates[0])}. Επίλεξε αναχώρηση.`;
            return;
        }

        const arrival = selectedDates[0];
        const departure = selectedDates[1];

        const start = Date.UTC(
            arrival.getFullYear(),
            arrival.getMonth(),
            arrival.getDate()
        );

        const end = Date.UTC(
            departure.getFullYear(),
            departure.getMonth(),
            departure.getDate()
        );

        const nights = Math.round((end - start) / 86400000);

        if (nights <= 0) {
            summary.textContent =
                currentLang === 'en'
                    ? 'Please choose a valid departure date.'
                    : currentLang === 'bg'
                        ? 'Моля, изберете валидна дата на заминаване.'
                        : 'Επίλεξε έγκυρη ημερομηνία αναχώρησης.';
            return;
        }

        summary.textContent =
            currentLang === 'en'
                ? `Stay: ${formatDate(arrival)} – ${formatDate(departure)} · ${nights} ${nights === 1 ? 'night' : 'nights'}`
                : currentLang === 'bg'
                    ? `Престой: ${formatDate(arrival)} – ${formatDate(departure)} · ${nights} ${nights === 1 ? 'нощувка' : 'нощувки'}`
                    : `Διαμονή: ${formatDate(arrival)} – ${formatDate(departure)} · ${nights} ${nights === 1 ? 'διανυκτέρευση' : 'διανυκτερεύσεις'}`;
    }
    function initDatePicker(lang = currentLang) {
        const dateInput = document.getElementById('dateRangePicker');
        if (!dateInput || typeof flatpickr === 'undefined') return;

        if (datePicker?.selectedDates) {
            selectedBookingDates = [...datePicker.selectedDates];
        }

        if (datePicker) {
            datePicker.destroy();
            datePicker = null;
        }

        dateInput.disabled = false;

        const monthsToShow = window.innerWidth <= 640 ? 1 : 2;

        datePicker = flatpickr(dateInput, {
            mode: 'range',
            showMonths: monthsToShow,
            minDate: 'today',
            maxDate: new Date(new Date().getFullYear() + 2, 11, 31),
            dateFormat: 'd/m/Y',
            locale: getCalendarLocale(lang),
            disable: disabledBookingDates,
            defaultDate: selectedBookingDates,
            clickOpens: true,
            allowInput: false,
            conjunction: ' έως ',

            onChange: function(selectedDates, dateStr) {
                if (
                    selectedDates.length === 2 &&
                    selectedDates[0].getTime() === selectedDates[1].getTime()
                ) {
                    alert(
                        currentLang === 'en'
                            ? 'Your departure date must be at least one day after arrival.'
                            : currentLang === 'bg'
                                ? 'Датата на заминаване трябва да е поне един ден след пристигането.'
                                : 'Η ημερομηνία αναχώρησης πρέπει να είναι τουλάχιστον μία ημέρα μετά την άφιξη.'
                    );

                    selectedBookingDates = [];
                    selectedRangeStr = '';
                    datePicker.clear();
                    updateCalendarSelectionSummary([]);
                    return;
                }

                if (
                    selectedDates.length === 2 &&
                    rangeContainsBlockedDate(selectedDates[0], selectedDates[1])
                ) {
                    alert(
                        currentLang === 'en'
                            ? 'This date range includes dates blocked in Booking.com. Please choose another range.'
                            : currentLang === 'bg'
                                ? 'Този период включва дати, блокирани в Booking.com. Моля, изберете друг период.'
                                : 'Το διάστημα περιλαμβάνει ημερομηνίες που είναι δεσμευμένες στο Booking.com. Επιλέξτε άλλο διάστημα.'
                    );

                    selectedBookingDates = [];
                    selectedRangeStr = '';
                    datePicker.clear();
                    updateCalendarSelectionSummary([]);
                    return;
                }

                selectedBookingDates = [...selectedDates];
                selectedRangeStr = dateStr;
                updateCalendarSelectionSummary(selectedDates);
            },

            onReady: function(selectedDates, dateStr, instance) {
                updateCalendarSelectionSummary(selectedDates);
                selectedBookingDates = [...selectedDates];
                selectedRangeStr = dateStr;

                const calendarElement = instance && instance.calendar
                    ? instance.calendar
                    : document.querySelector('.flatpickr-calendar');

                if (calendarElement && calendarElement.classList) {
                    calendarElement.classList.add('villa-emara-calendar');
                }
            }
        });

        setCalendarSyncState(calendarSyncState);
    }

    // Υποστηρίζει DTSTART/DTEND με VALUE=DATE ή ημερομηνία/ώρα, καθώς και folded iCal lines.
    function parseIcalDate(str) {
        if (!str) return null;

        const match = String(str).trim().match(/^(\d{4})(\d{2})(\d{2})/);
        if (!match) return null;

        const year = Number(match[1]);
        const month = Number(match[2]) - 1;
        const day = Number(match[3]);

        const date = new Date(year, month, day);

        return date.getFullYear() === year &&
            date.getMonth() === month &&
            date.getDate() === day
                ? date
                : null;
    }

    function parseIcalEvents(icalText) {
        const unfolded = icalText.replace(/\r?\n[ \t]/g, '').split(/\r?\n/);
        const blocked = new Map();

        let inEvent = false;
        let startDate = null;

        for (const rawLine of unfolded) {
            const line = rawLine.trim();

            if (line === 'BEGIN:VEVENT') {
                inEvent = true;
                startDate = null;
                continue;
            }

            if (line === 'END:VEVENT') {
                inEvent = false;
                startDate = null;
                continue;
            }

            if (!inEvent) continue;

            const colon = line.indexOf(':');
            if (colon < 0) continue;

            const property = line.slice(0, colon).split(';')[0].toUpperCase();
            const value = line.slice(colon + 1).trim();

            if (property === 'DTSTART') {
                startDate = parseIcalDate(value);
            }

            if (property === 'DTEND' && startDate) {
                const endDate = parseIcalDate(value);

                if (endDate && endDate > startDate) {
                    const cursor = new Date(startDate);

                    while (cursor < endDate) {
                        const day = new Date(
                            cursor.getFullYear(),
                            cursor.getMonth(),
                            cursor.getDate()
                        );

                        blocked.set(day.getTime(), day);
                        cursor.setDate(cursor.getDate() + 1);
                    }
                }

                startDate = null;
            }
        }

        return [...blocked.values()].sort((a, b) => a - b);
    }

    async function syncBookingCalendar() {
        const apiUrl =
            'https://villa-emara-calendar.nikolasmarantas9.workers.dev/api/calendar';

        const lastUpdatedElement = document.getElementById('calendarLastUpdated');

        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                cache: 'no-store'
            });

            if (!response.ok) {
                throw new Error(`Calendar API error: ${response.status}`);
            }

            const data = await response.json();

            if (data.ok !== true || !Array.isArray(data.blockedDates)) {
                throw new Error('Invalid calendar data');
            }

            if (lastUpdatedElement) {
                if (data.updatedAt) {
                    const updatedDate = new Date(data.updatedAt);

                    if (!Number.isNaN(updatedDate.getTime())) {
                        const locale =
                            currentLang === 'en' ? 'en-GB' :
                            currentLang === 'bg' ? 'bg-BG' :
                            'el-GR';

                        const formattedDate = updatedDate.toLocaleString(locale, {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        });

                        const message =
                            currentLang === 'en'
                                ? `Last successful sync: ${formattedDate}`
                                : currentLang === 'bg'
                                    ? `Последна успешна синхронизация: ${formattedDate}`
                                    : `Τελευταίος επιτυχημένος συγχρονισμός: ${formattedDate}`;

                        lastUpdatedElement.textContent = message;
                        lastUpdatedElement.hidden = false;
                    } else {
                        lastUpdatedElement.hidden = true;
                    }
                } else {
                    lastUpdatedElement.hidden = true;
                }
            }

            disabledBookingDates = data.blockedDates
                .map(dateString => {
                    const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);

                    if (!match) return null;

                    return new Date(
                        Number(match[1]),
                        Number(match[2]) - 1,
                        Number(match[3])
                    );
                })
                .filter(Boolean);

            initDatePicker(currentLang);
            setCalendarSyncState('ready');

            console.log(
                'Villa Emara calendar synced:',
                disabledBookingDates.length,
                'blocked dates'
            );

        } catch (error) {
            console.error('Booking calendar sync failed:', error);

            if (lastUpdatedElement) {
                lastUpdatedElement.hidden = true;
            }

            setCalendarSyncState('error');

            // Αποτυχία συγχρονισμού: δεν επιτρέπουμε
            // επιλογή ημερομηνιών με άγνωστη διαθεσιμότητα.
            disabledBookingDates = [
                date => true
            ];

            initDatePicker(currentLang);
        }
    }

    // Αρχικά κλειστό μέχρι να επιβεβαιωθεί ότι λήφθηκε έγκυρο iCal.
    setCalendarSyncState('loading');
    initDatePicker(currentLang);
    syncBookingCalendar();

    // Σε αλλαγή μεγέθους οθόνης, επαναδημιουργούμε το ημερολόγιο
    // για να εμφανίζει έναν μήνα στο κινητό και δύο σε μεγαλύτερες οθόνες.
    window.addEventListener('resize', () => {
        clearTimeout(calendarResizeTimeout);

        calendarResizeTimeout = setTimeout(() => {
            const desiredMonths = window.innerWidth <= 640 ? 1 : 2;

            if (
                datePicker &&
                datePicker.config.showMonths !== desiredMonths
            ) {
                selectedBookingDates = [...datePicker.selectedDates];
                initDatePicker(currentLang);
            }
        }, 200);
    });

    // ==========================================
    // 5. Μετρητές Ενηλίκων και Παιδιών
    // ==========================================

    let adults = 2;
    let children = 0;

    const adultsVal = document.getElementById('adultsVal');
    const childrenVal = document.getElementById('childrenVal');

    document.getElementById('incAdults')?.addEventListener('click', () => {
        adults++;
        if (adultsVal) adultsVal.textContent = adults;
    });

    document.getElementById('decAdults')?.addEventListener('click', () => {
        if (adults > 1) {
            adults--;
            if (adultsVal) adultsVal.textContent = adults;
        }
    });

    document.getElementById('incChildren')?.addEventListener('click', () => {
        children++;
        if (childrenVal) childrenVal.textContent = children;
    });

    document.getElementById('decChildren')?.addEventListener('click', () => {
        if (children > 0) {
            children--;
            if (childrenVal) childrenVal.textContent = children;
        }
    });

    // ==========================================
    // 6. Φιλτράρισμα Φωτογραφιών Γκαλερί
    // ==========================================

    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            galleryItems.forEach(item => {
                if (
                    filter === 'all' ||
                    item.getAttribute('data-category') === filter
                ) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });


    // ==========================================
    // 7. Κριτικές: φόρτωση από το Cloudflare Worker
    // ==========================================

    const REVIEWS_API = 'https://villa-emara-calendar.nikolasmarantas9.workers.dev/api/reviews';
    const reviewsList = document.getElementById('reviewsList');
    const reviewForm = document.getElementById('addReviewForm');
    const scoreSlider = document.getElementById('scoreSlider');
    const scoreVal = document.getElementById('scoreVal');
    const ratingStars = document.querySelectorAll('#interactiveStars .rating-star');

    function updateStarRating(value) {
        const rating = Math.max(1, Math.min(5, Number(value) || 5));
        if (scoreSlider) scoreSlider.value = String(rating);
        if (scoreVal) scoreVal.textContent = String(rating);
        ratingStars.forEach((star) => {
            const selected = Number(star.dataset.rating) <= rating;
            star.classList.toggle('is-selected', selected);
            star.setAttribute('aria-pressed', String(Number(star.dataset.rating) === rating));
        });
    }

    ratingStars.forEach((star) => {
        star.addEventListener('click', () => updateStarRating(star.dataset.rating));
        star.addEventListener('keydown', (event) => {
            const current = Number(scoreSlider?.value || 5);
            let next = current;
            if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = Math.min(5, current + 1);
            else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = Math.max(1, current - 1);
            else return;
            event.preventDefault();
            updateStarRating(next);
            document.querySelector(`#interactiveStars .rating-star[data-rating="${next}"]`)?.focus();
        });
    });
    updateStarRating(5);
    reviewForm?.addEventListener('reset', () => setTimeout(() => updateStarRating(5), 0));

    async function loadReviews() {
        if (!reviewsList) return;

        try {
            const response = await fetch(REVIEWS_API, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
                cache: 'no-store'
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const result = await response.json();
            if (!result.ok || !Array.isArray(result.reviews)) {
                throw new Error('Μη έγκυρη απάντηση από το API κριτικών');
            }

            reviewsList.replaceChildren();

            if (result.reviews.length === 0) {
                const empty = document.createElement('p');
                empty.className = 'reviews-empty';
                empty.textContent = currentLang === 'en'
                    ? 'There are no reviews yet.'
                    : currentLang === 'bg'
                        ? 'Все още няма отзиви.'
                        : 'Δεν υπάρχουν ακόμη κριτικές.';
                reviewsList.append(empty);
                return;
            }

            result.reviews.forEach((review) => {
                const card = document.createElement('article');
                card.className = 'review-card';

                const header = document.createElement('div');
                header.className = 'review-header';

                const userInfo = document.createElement('div');
                userInfo.className = 'review-user-info';

                const avatar = document.createElement('div');
                avatar.className = 'review-avatar';
                avatar.textContent = (review.guest_name || '?').trim().charAt(0).toUpperCase();

                const details = document.createElement('div');
                const author = document.createElement('h4');
                author.className = 'review-author';
                author.textContent = review.guest_name || 'Επισκέπτης';
                details.append(author);
                userInfo.append(avatar, details);

                const score = document.createElement('div');
                score.className = 'review-score';
                const rating = Math.max(1, Math.min(5, Number(review.rating) || 5));
                score.textContent = `${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}`;

                header.append(userInfo, score);

                const quote = document.createElement('blockquote');
                quote.className = 'review-text';
                quote.textContent = `“${review.comment || ''}”`;

                const date = document.createElement('span');
                date.className = 'review-date';
                if (review.created_at) {
                    const parsedDate = new Date(review.created_at);
                    if (!Number.isNaN(parsedDate.getTime())) {
                        date.textContent = parsedDate.toLocaleDateString(currentLang === 'bg' ? 'bg-BG' : currentLang === 'en' ? 'en-GB' : 'el-GR');
                    }
                }

                card.append(header, quote, date);
                reviewsList.append(card);
            });
        } catch (error) {
            console.error('Σφάλμα φόρτωσης κριτικών:', error);
            reviewsList.replaceChildren();
            const errorMessage = document.createElement('p');
            errorMessage.className = 'reviews-load-error';
            errorMessage.textContent = currentLang === 'en'
                ? 'Reviews could not be loaded. Please refresh the page.'
                : currentLang === 'bg'
                    ? 'Отзивите не можаха да се заредят. Моля, презаредете страницата.'
                    : 'Δεν ήταν δυνατή η φόρτωση των κριτικών. Ανανεώστε τη σελίδα.';
            reviewsList.append(errorMessage);
        }
    }

    reviewForm?.addEventListener('submit', async (event) => {
        event.preventDefault();

        const firstName = document.getElementById('revName')?.value.trim() || '';
        const surname = document.getElementById('revSurname')?.value.trim() || '';
        const name = `${firstName} ${surname}`.trim();
        const rating = Number(scoreSlider?.value || 5);
        const comment = document.getElementById('revComment')?.value.trim() || '';
        const submitButton = reviewForm.querySelector('button[type="submit"]');

        if (firstName.length < 2 || surname.length < 2 || comment.length < 5) {
            alert(currentLang === 'en'
                ? 'Please enter your first name and surname (at least 2 characters each), and a comment (at least 5 characters).'
                : currentLang === 'bg'
                    ? 'Въведете име и фамилия (поне 2 символа всяко) и коментар (поне 5 символа).'
                    : 'Συμπληρώστε όνομα και επώνυμο (τουλάχιστον 2 χαρακτήρες το καθένα) και σχόλιο (τουλάχιστον 5 χαρακτήρες).');
            return;
        }

        if (submitButton) submitButton.disabled = true;

        try {
            const response = await fetch(REVIEWS_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    guest_name: name,
                    rating,
                    comment
                })
            });

            let result;
            try {
                result = await response.json();
            } catch {
                result = {};
            }

            if (!response.ok || !result.ok) {
                throw new Error(result.message || `HTTP ${response.status}`);
            }

            reviewForm.reset();
            updateStarRating(5);

            await loadReviews();
            alert(currentLang === 'en'
                ? 'Your review was saved successfully.'
                : currentLang === 'bg'
                    ? 'Отзивът ви беше записан успешно.'
                    : 'Το σχόλιό σας αποθηκεύτηκε επιτυχώς!');
        } catch (error) {
            console.error('Σφάλμα αποθήκευσης κριτικής:', error);
            alert(currentLang === 'en'
                ? 'The review could not be saved. Please try again.'
                : currentLang === 'bg'
                    ? 'Отзивът не можа да бъде записан. Опитайте отново.'
                    : 'Δεν αποθηκεύτηκε το σχόλιο. Δοκιμάστε ξανά.');
        } finally {
            if (submitButton) submitButton.disabled = false;
        }
    });

    // Το script εκτελείται ήδη μέσα στο DOMContentLoaded, άρα η κλήση γίνεται απευθείας.
    loadReviews();

    // ==========================================
    // Villa Emara: πλήρης αλλαγή γλώσσας
    // ==========================================
    const villaTranslations = {
      en: {
        nav_about:'The Villa',nav_gallery:'Gallery',nav_amenities:'Amenities',nav_location:'Location',nav_host:'Your Host',nav_reviews:'Reviews',btn_booking:'Book Now',
        hero_title:'Villa Emara',hero_subtitle:'An elegant escape in the heart of Thrace',hero_desc:'Discover comfort, privacy and warm hospitality at Villa Emara.',rating_text:'Excellent · guest rating',btn_book_now:'Book Your Stay',btn_view_villa:'Explore the Villa',
        prop_welcome:'WELCOME',prop_main_title:'Comfort, privacy and contemporary style',prop_p1:'Welcome to Villa Emara, a relaxing retreat designed for comfort and privacy.',prop_p2:'Enjoy thoughtfully designed spaces and a peaceful setting for your stay.',stat_sqm:'SQUARE METERS (M²)',stat_rooms:'BEDROOMS',stat_guests:'GUESTS',stat_score:'GUEST RATING',
        gallery_title:'Discover Villa Emara',gallery_subtitle:'Explore the spaces of your next getaway',amen_title:'Amenities',amen_subtitle:'Everything you need for a comfortable stay',am_ac:'Air conditioning',am_garden:'Garden',am_kitchen:'Kitchen',am_parking:'Free parking',am_pets:'Pets allowed',am_rooms:'Bedrooms',am_tv:'TV',am_wifi:'Wi-Fi',
        loc_title:'Location',loc_address:'Maggana, Xanthi, Thrace',dist_1:'Beach',dist_2:'Local shops',dist_3:'Restaurants',dist_4:'Xanthi',dist_5:'Airport',host_quote:'We look forward to welcoming you to Villa Emara.',host_tag:'YOUR HOST',host_languages:'Languages spoken: Greek, English and Bulgarian',
        rev_form_title:'Leave a review',rev_form_sub:'Share your experience with future guests',rev_lbl_name:'Your name',rev_lbl_score:'Your rating: ',rev_lbl_comment:'Your comment',btn_submit_review:'Submit Review',
        book_title:'Book Your Stay',booking_subtitle:'Choose your dates and guest details',lbl_dates:'Dates',lbl_adults:'Adults',lbl_children:'Children',lbl_fullname:'Full name',lbl_phone:'Phone number',booking_footnote:'Your request will be confirmed by the property.',booking_pickDates:'Select your stay dates',ph_fullname:'Enter your full name',btn_booking:'Book Now',call_btn:'Call us',contact_notice:'Please check your details before sending.',
        chat_title:'Need help?',chat_desc:'Contact us and we will be happy to help.',f_all:'All',f_bath:'Bathroom',f_bedroom:'Bedroom',f_garden:'Garden',f_kitchen:'Kitchen',f_living:'Living room'
      },
      bg: {
        nav_about:'За вилата',nav_gallery:'Галерия',nav_amenities:'Удобства',nav_location:'Местоположение',nav_host:'Домакин',nav_reviews:'Отзиви',btn_booking:'Резервация',
        hero_title:'Villa Emara',hero_subtitle:'Елегантно бягство в сърцето на Тракия',hero_desc:'Открийте комфорт, уединение и гостоприемство във Villa Emara.',rating_text:'Отлично · оценка от гости',btn_book_now:'Резервирайте престоя си',btn_view_villa:'Разгледайте вилата',
        prop_welcome:'ДОБРЕ ДОШЛИ',prop_main_title:'Комфорт, уединение и съвременен стил',prop_p1:'Добре дошли във Villa Emara — спокойно място, създадено за комфорт и уединение.',prop_p2:'Насладете се на уютни пространства и спокойна атмосфера по време на престоя си.',stat_sqm:'КВАДРАТНИ МЕТРИ (М²)',stat_rooms:'СПАЛНИ',stat_guests:'ГОСТИ',stat_score:'ОЦЕНКА ОТ ГОСТИ',
        gallery_title:'Открийте Villa Emara',gallery_subtitle:'Разгледайте пространствата за следващата си почивка',amen_title:'Удобства',amen_subtitle:'Всичко необходимо за комфортен престой',am_ac:'Климатик',am_garden:'Градина',am_kitchen:'Кухня',am_parking:'Безплатен паркинг',am_pets:'Домашни любимци',am_rooms:'Спални',am_tv:'Телевизор',am_wifi:'Wi-Fi',
        loc_title:'Местоположение',loc_address:'Маггана, Ксанти, Тракия',dist_1:'Плаж',dist_2:'Местни магазини',dist_3:'Ресторанти',dist_4:'Ксанти',dist_5:'Летище',host_quote:'Очакваме с нетърпение да ви посрещнем във Villa Emara.',host_tag:'ВАШИЯТ ДОМАКИН',host_languages:'Говорими езици: гръцки, английски и български',
        rev_form_title:'Оставете отзив',rev_form_sub:'Споделете впечатленията си с бъдещите гости',rev_lbl_name:'Вашето име',rev_lbl_score:'Вашата оценка: ',rev_lbl_comment:'Вашият коментар',btn_submit_review:'Изпрати отзив',
        book_title:'Резервирайте престоя си',booking_subtitle:'Изберете дати и брой гости',lbl_dates:'Дати',lbl_adults:'Възрастни',lbl_children:'Деца',lbl_fullname:'Пълно име',lbl_phone:'Телефонен номер',booking_footnote:'Заявката ви ще бъде потвърдена от мястото за настаняване.',booking_pickDates:'Изберете дати за престоя',ph_fullname:'Въведете пълното си име',call_btn:'Обадете ни се',contact_notice:'Проверете данните си преди изпращане.',
        chat_title:'Нуждаете се от помощ?',chat_desc:'Свържете се с нас — ще се радваме да помогнем.',f_all:'Всички',f_bath:'Баня',f_bedroom:'Спалня',f_garden:'Градина',f_kitchen:'Кухня',f_living:'Всекидневна'
      },
      el: {}
    };
    // Τα ελληνικά παραμένουν το αρχικό κείμενο του HTML.
    function setLanguage(lang) {
      if (!['el','en','bg'].includes(lang)) lang = 'el';
      currentLang = lang;
      try { localStorage.setItem('villa_lang', lang); } catch (e) { console.warn('Δεν αποθηκεύτηκε η γλώσσα.', e); }
      document.documentElement.lang = lang;
      const dict = villaTranslations[lang] || {};
      document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        if (lang === 'el') {
          if (el.dataset.originalTranslation !== undefined) el.innerHTML = el.dataset.originalTranslation;
        } else if (dict[key] !== undefined) {
          if (el.dataset.originalTranslation === undefined) el.dataset.originalTranslation = el.innerHTML;
          // Keep nested score value live when translating its label.
          const score = el.querySelector('#scoreVal');
          if (score) { el.innerHTML = dict[key]; el.appendChild(score); }
          else el.textContent = dict[key];
        }
      });
      document.querySelectorAll('[data-translate-placeholder]').forEach(el => {
        const key = el.getAttribute('data-translate-placeholder');
        if (lang === 'el') { if (el.dataset.originalPlaceholder !== undefined) el.setAttribute('placeholder', el.dataset.originalPlaceholder); }
        else if (dict[key] !== undefined) { if (el.dataset.originalPlaceholder === undefined) el.dataset.originalPlaceholder = el.getAttribute('placeholder') || ''; el.setAttribute('placeholder', dict[key]); }
      });
      const code = document.getElementById('currentLangCode'); if (code) code.textContent = lang.toUpperCase();
      document.querySelectorAll('[data-lang]').forEach(el => { const active = el.getAttribute('data-lang') === lang; el.classList.toggle('active', active); el.setAttribute('aria-pressed', String(active)); });
      const menu = document.getElementById('langDropdownMenu'); if (menu) menu.classList.remove('show');
      if (typeof initDatePicker === 'function') { try { initDatePicker(lang); } catch (e) { console.warn('Calendar language update failed:', e); } }
      if (typeof setCalendarSyncState === 'function') setCalendarSyncState(calendarSyncState);
      if (typeof updateCalendarSelectionSummary === 'function') { try { updateCalendarSelectionSummary(); } catch (_) {} }
    }
    window.setLanguage = setLanguage;
    const langToggle = document.getElementById('langToggleBtn');
    const langMenu = document.getElementById('langDropdownMenu');
    if (langToggle && langMenu) {
      langToggle.setAttribute('type','button');
      langToggle.setAttribute('aria-expanded','false');
      langToggle.addEventListener('click', event => { event.preventDefault(); const open = !langMenu.classList.contains('show'); langMenu.classList.toggle('show', open); langToggle.setAttribute('aria-expanded', String(open)); });
      document.addEventListener('click', event => { if (!event.target.closest('#langDropdownContainer')) { langMenu.classList.remove('show'); langToggle.setAttribute('aria-expanded','false'); } });
      document.addEventListener('keydown', event => { if (event.key === 'Escape') { langMenu.classList.remove('show'); langToggle.setAttribute('aria-expanded','false'); } });
    }
    setLanguage(currentLang);

});
