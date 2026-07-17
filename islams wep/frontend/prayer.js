let map;
let userMarker;
let mosqueMarkers = [];
let selectedLocation = JSON.parse(localStorage.getItem('selectedLocation')) || { lat: 21.4225, lng: 39.8262, name: "مكة المكرمة" };
let selectedMethod = localStorage.getItem('selectedMethod') || "3";
let mawaqitUrl = localStorage.getItem('mawaqitUrl') || "https://mawaqit.net/ar/widget/weimar-moschee";
let notificationsEnabled = localStorage.getItem('notificationsEnabled') === 'true';
let prayerTimings = null;
let countdownInterval;

document.addEventListener('DOMContentLoaded', () => {
    const methodSelect = document.getElementById('calc-method');
    if (methodSelect) methodSelect.value = selectedMethod;

    initMap();
    updateNotificationUI();

    if (mawaqitUrl) {
        renderMawaqitWidget(mawaqitUrl);
    }

    if (localStorage.getItem('selectedLocation')) {
        updateUIForLocation(selectedLocation.lat, selectedLocation.lng, selectedLocation.name);
    } else {
        detectLocation();
    }

    // Start countdown ticker
    setInterval(updateCountdown, 1000);
});

function saveMawaqitMosque() {
    const input = document.getElementById('mawaqit-url');
    let url = input.value.trim();
    if (url) {
        // تنقية الرابط لضمان أنه بصيغة iframe صحيحة
        if (!url.includes('widget')) {
            url = url.replace('mawaqit.net/', 'mawaqit.net/ar/widget/');
        }
        if (!url.startsWith('https://')) {
            url = 'https://' + url;
        }
        localStorage.setItem('mawaqitUrl', url);
        mawaqitUrl = url;
        renderMawaqitWidget(url);
    } else {
        localStorage.removeItem('mawaqitUrl');
        mawaqitUrl = "";
        const container = document.getElementById('times-container');
        container.innerHTML = ''; // سيتم إعادة جلب المواقيت العادية
        updateUIForLocation(selectedLocation.lat, selectedLocation.lng, selectedLocation.name);
    }
}

function renderMawaqitWidget(url) {
    const container = document.getElementById('times-container');
    container.style.display = 'block';
    container.style.maxWidth = '1000px';
    container.innerHTML = `
        <div class="glass-panel" style="padding: 10px; overflow: hidden; border: 2px solid var(--secondary-color);">
            <iframe src="${url}" width="100%" height="600" frameborder="0" style="border-radius: 12px; border: none;"></iframe>
            <div style="margin-top: 10px; text-align: center;">
                <button class="btn btn-secondary" onclick="clearMawaqit()" style="font-size: 0.8rem;">
                    <i class="fa-solid fa-trash"></i> إزالة ربط المسجد والعودة للمواقيت التقديرية
                </button>
            </div>
        </div>
    `;
    // إخفاء الـ Loader إن وجد
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';
}

function clearMawaqit() {
    localStorage.removeItem('mawaqitUrl');
    location.reload();
}

function handleMethodChange() {
    const methodSelect = document.getElementById('calc-method');
    if (methodSelect) {
        selectedMethod = methodSelect.value;
        localStorage.setItem('selectedMethod', selectedMethod);
        updateUIForLocation(selectedLocation.lat, selectedLocation.lng, selectedLocation.name);
    }
}

function toggleNotifications() {
    if (!notificationsEnabled) {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                notificationsEnabled = true;
                localStorage.setItem('notificationsEnabled', 'true');
                updateNotificationUI();
                showNotification("نور الهدى", "تم تفعيل تنبيهات الأذان بنجاح!");
            }
        });
    } else {
        notificationsEnabled = false;
        localStorage.setItem('notificationsEnabled', 'false');
        updateNotificationUI();
    }
}

function updateNotificationUI() {
    const btn = document.getElementById('notif-toggle');
    if (btn) {
        btn.classList.toggle('active', notificationsEnabled);
        btn.querySelector('i').className = notificationsEnabled ? 'fa-solid fa-bell' : 'fa-solid fa-bell-slash';
    }
}

function showNotification(title, body) {
    if (notificationsEnabled && Notification.permission === "granted") {
        new Notification(title, {
            body: body,
            icon: 'assets/mosque-icon.png' // Ensure this exists or use a generic one
        });
    }
}

function initMap() {
    // طبقات الخريطة المختلفة
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    });

    const googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '&copy; Google Maps'
    });

    const terrain = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: '&copy; OpenTopoMap contributors'
    });

    map = L.map('map', {
        center: [selectedLocation.lat, selectedLocation.lng],
        zoom: 13,
        layers: [osm] // الطبقة الافتراضية
    });

    const baseMaps = {
        "الخريطة العادية": osm,
        "قمر اصطناعي": googleSat,
        "تضاريس": terrain
    };

    L.control.layers(baseMaps).addTo(map);
    L.control.scale({ imperial: false }).addTo(map);

    userMarker = L.marker([selectedLocation.lat, selectedLocation.lng], { draggable: true }).addTo(map);
    userMarker.bindPopup("موقعك الحالي").openPopup();

    userMarker.on('dragend', function (e) {
        const position = userMarker.getLatLng();
        handleLocationChange(position.lat, position.lng);
    });

    map.on('click', function (e) {
        userMarker.setLatLng(e.latlng);
        handleLocationChange(e.latlng.lat, e.latlng.lng);
    });
}

function handleLocationChange(lat, lng) {
    selectedLocation = { lat, lng, name: "موقع مخصص" };
    localStorage.setItem('selectedLocation', JSON.stringify(selectedLocation));
    updateUIForLocation(lat, lng);
}

function updateUIForLocation(lat, lng, name = null) {
    fetchPrayerTimes(lat, lng, name);
    reverseGeocode(lat, lng);
    searchNearbyMosques(lat, lng);
}

function detectLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                map.setView([lat, lng], 15);
                userMarker.setLatLng([lat, lng]);
                handleLocationChange(lat, lng);
            },
            error => {
                console.warn("Geolocation rejected, using default.");
                updateUIForLocation(selectedLocation.lat, selectedLocation.lng, selectedLocation.name);
            }
        );
    }
}

async function reverseGeocode(lat, lng) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`);
        const data = await response.json();
        if (data && data.address) {
            const city = data.address.city || data.address.town || data.address.village || "";
            const country = data.address.country || "";
            document.getElementById('location-name').innerText = city || country || "موقع مخصص";
            document.getElementById('location-details').innerText = `${country} | إحداثيات: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        }
    } catch (err) {
        console.error("Geocoding error", err);
    }
}

async function searchNearbyMosques(lat, lng) {
    const listElement = document.getElementById('mosques-list');
    listElement.innerHTML = '<div style="padding:20px;"><i class="fa-solid fa-spinner fa-spin"></i> جاري البحث عن المساجد...</div>';

    // Clear old markers
    mosqueMarkers.forEach(m => map.removeLayer(m));
    mosqueMarkers = [];

    const query = `[out:json];node["amenity"="place_of_worship"]["religion"="muslim"](around:2000,${lat},${lng});out;`;
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.elements.length === 0) {
            listElement.innerHTML = '<div style="padding:20px;">لم يتم العثور على مساجد قريبة في نطاق 2 كم.</div>';
            return;
        }

        listElement.innerHTML = '';
        data.elements.forEach(node => {
            const name = node.tags.name || "مسجد بدون اسم";

            // Add marker to map
            const marker = L.marker([node.lat, node.lon], {
                icon: L.divIcon({
                    className: 'custom-div-icon',
                    html: "<div style='background-color:#0b7a75; color:white; border-radius:50%; width:30px; height:30px; display:flex; align-items:center; justify-content:center; border:2px solid white;'><i class='fa-solid fa-mosque' style='font-size:14px;'></i></div>",
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                })
            }).addTo(map);
            marker.bindPopup(`<b>${name}</b>`);
            mosqueMarkers.push(marker);

            // Add to side list
            const item = document.createElement('div');
            item.className = 'mosque-item';
            item.innerHTML = `
                <div style="font-weight:bold; color:var(--primary-color);">${name}</div>
                <div style="font-size:0.8rem; color:var(--text-muted);"><i class="fa-solid fa-location-dot"></i> انقر للتحديد</div>
            `;
            item.onclick = () => {
                map.setView([node.lat, node.lon], 17);
                marker.openPopup();

                // تحديث الموقع الأساسي عند اختيار المسجد
                userMarker.setLatLng([node.lat, node.lon]);

                // تحديث البيانات دون إعادة البحث عن مساجد لمنع الوميض
                selectedLocation = { lat: node.lat, lng: node.lon, name: name };
                localStorage.setItem('selectedLocation', JSON.stringify(selectedLocation));
                fetchPrayerTimes(node.lat, node.lon, name);
                reverseGeocode(node.lat, node.lon);

                // تمييز المسجد المختار بصرياً
                document.querySelectorAll('.mosque-item').forEach(el => el.classList.remove('favorite'));
                item.classList.add('favorite');
            };
            listElement.appendChild(item);
        });

    } catch (err) {
        listElement.innerHTML = '<div style="color:red; padding:20px;">فشل الاتصال بـ Overpass API.</div>';
    }
}

async function fetchPrayerTimes(lat, lng, defaultName = null) {
    const loader = document.getElementById('loader');
    const container = document.getElementById('times-container');
    const dateElement = document.getElementById('date-gregorian-hijri');

    loader.style.display = 'block';
    container.style.display = 'none';

    try {
        const url = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=${selectedMethod}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.code === 200) {
            prayerTimings = data.data.timings;
            const { timings, date } = data.data;
            dateElement.innerText = `${date.hijri.weekday.ar} ${date.hijri.day} ${date.hijri.month.ar} ${date.hijri.year} هـ  |  ${date.gregorian.date}`;

            const prayers = [
                { id: 'Fajr', name: 'الفجر', icon: 'fa-cloud-moon' },
                { id: 'Sunrise', name: 'الشروق', icon: 'fa-sun' },
                { id: 'Dhuhr', name: 'الظهر', icon: 'fa-sun' },
                { id: 'Asr', name: 'العصر', icon: 'fa-cloud-sun' },
                { id: 'Maghrib', name: 'المغرب', icon: 'fa-cloud-moon' },
                { id: 'Isha', name: 'العشاء', icon: 'fa-moon' }
            ];

            container.innerHTML = '';
            prayers.forEach(p => {
                const card = document.createElement('div');
                card.className = 'glass-panel time-card update-pulse';
                card.innerHTML = `
                    <div style="font-size: 2rem; color: var(--secondary-color); margin-bottom:10px;">
                        <i class="fa-solid ${p.icon}"></i>
                    </div>
                    <div class="prayer-name">${p.name}</div>
                    <div class="prayer-time">${formatTime(timings[p.id])}</div>
                `;
                container.appendChild(card);
            });

            loader.style.display = 'none';
            container.style.display = 'grid';

            updateCountdown(); // Trigger immediate update

            // Effect to show something updated
            setTimeout(() => {
                document.querySelectorAll('.time-card').forEach(c => c.classList.remove('update-pulse'));
            }, 1000);

            // Re-inject Knowledge Link if not present
            if (!document.querySelector('.knowledge-btn-container')) {
                const knowledgeBtn = document.createElement('div');
                knowledgeBtn.className = 'knowledge-btn-container';
                knowledgeBtn.style.marginTop = '40px';
                knowledgeBtn.innerHTML = `
                    <div class="info-alert" style="max-width:600px; margin: 0 auto 20px;">
                        <i class="fa-solid fa-circle-nodes"></i> هل تعلم؟ الصلاة هي الركن الثاني من أركان الإسلام، وقد وردت في القرآن الكريم في أكثر من 60 موضعاً.
                    </div>
                    <button class="btn btn-secondary" onclick="window.location.href='knowledge.html?topic=الصلاة'">
                        <i class="fa-solid fa-book-open"></i> استكشف الأدلة والمقالات المرتبطة بالصلاة
                    </button>
                `;
                document.querySelector('.page-wrapper').appendChild(knowledgeBtn);
            }
        }
    } catch (error) {
        loader.innerHTML = '<span style="color:red;">حدث خطأ أثناء جلب مواقيت الصلاة.</span>';
    }
}

function formatTime(time24) {
    let [hours, minutes] = time24.split(':');
    hours = parseInt(hours);
    const suffix = hours >= 12 ? 'م' : 'ص';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${suffix}`;
}

function updateCountdown() {
    if (!prayerTimings) return;

    const now = new Date();
    const prayerKeys = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const prayerNames = { 'Fajr': 'الفجر', 'Dhuhr': 'الظهر', 'Asr': 'العصر', 'Maghrib': 'المغرب', 'Isha': 'العشاء' };

    let nextPrayer = null;
    let diff = Infinity;

    prayerKeys.forEach(key => {
        const [h, m] = prayerTimings[key].split(':');
        const pTime = new Date();
        pTime.setHours(h, m, 0);

        if (pTime > now && (pTime - now) < diff) {
            diff = pTime - now;
            nextPrayer = key;
        }
    });

    // If all prayers passed today, next is tomorrow's Fajr
    if (!nextPrayer) {
        nextPrayer = 'Fajr';
        const [h, m] = prayerTimings['Fajr'].split(':');
        const pTime = new Date();
        pTime.setDate(now.getDate() + 1);
        pTime.setHours(h, m, 0);
        diff = pTime - now;
    }

    const countdownWrapper = document.getElementById('countdown-wrapper');
    const timerElement = document.getElementById('countdown-timer');
    const nameElement = document.getElementById('next-prayer-name');

    if (countdownWrapper && timerElement && nameElement) {
        countdownWrapper.style.display = 'flex';
        nameElement.innerText = prayerNames[nextPrayer];

        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        timerElement.innerText = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Trigger notification exactly at 0
        if (hours === 0 && minutes === 0 && seconds === 0) {
            showNotification("حان الآن موعد الأذان", `موعد صلاة ${prayerNames[nextPrayer]} حسب توقيت ${selectedLocation.name}`);
        }
    }
}
