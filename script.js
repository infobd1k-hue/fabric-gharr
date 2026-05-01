function updateClock() {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    const timeZones = {
        Dhaka: 'Asia/Dhaka',
        London: 'Europe/London',
        NewYork: 'America/New_York',
        Tokyo: 'Asia/Tokyo',
        Sydney: 'Australia/Sydney',
        Dubai: 'Asia/Dubai'
    };

    const clockContainer = document.getElementById('clock');
    clockContainer.innerHTML = ''; // clear previous content

    for (const [city, timeZone] of Object.entries(timeZones)) {
        const currentTime = new Intl.DateTimeFormat('en-US', { ...options, timeZone }).format(new Date());
        const cityElement = document.createElement('div');
        cityElement.textContent = `${city}: ${currentTime}`;
        clockContainer.appendChild(cityElement);
    }
}

setInterval(updateClock, 1000); // Update every second
// Initial call to display the time immediately
updateClock();