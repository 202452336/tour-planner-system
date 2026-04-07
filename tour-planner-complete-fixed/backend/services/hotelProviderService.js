// Generates city-specific realistic hotel data instantly — no external API needed.

const seededRand = (seed) => {
    let s = seed;
    return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
};
const hashStr = (str) => {
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = ((h << 5) + h) ^ str.charCodeAt(i);
    return Math.abs(h);
};

const prefixes = ['Grand', 'Royal', 'The', 'Hotel', 'Luxury', 'Classic', 'Elite', 'Prime', 'Golden', 'Silver'];
const suffixes = ['Palace', 'Residency', 'Suites', 'Inn', 'Lodge', 'Haven', 'Retreat', 'Plaza', 'Court', 'Manor'];
const categories = ['Hotel', 'Boutique Hotel', 'Guest House', 'Resort', 'Inn', 'Serviced Apartment'];
const streets = ['MG Road', 'Park Street', 'Central Avenue', 'Station Road', 'Market Road', 'Lake View Road', 'Hill Street', 'Beach Road', 'Palace Road', 'Garden Lane'];
const areas = ['City Centre', 'Old Town', 'New District', 'Lake Side', 'Hill Top', 'Airport Zone', 'Beach Front', 'Heritage Quarter'];

const cache = {};

const searchHotels = async(cityName, checkInDate, checkOutDate, adults = 1) => {
    console.log('=== HOTEL SEARCH (city-specific) === City:', cityName);
    const city = cityName.split(',')[0].trim();
    const key = city.toLowerCase();

    if (cache[key]) {
        console.log('Hotels from cache:', cache[key].length);
        return cache[key].map(h => ({...h, checkInDate, checkOutDate, adults }));
    }

    const rand = seededRand(hashStr(key));
    const count = 10 + Math.floor(rand() * 5); // 10–14 hotels
    const hotels = [];

    for (let i = 0; i < count; i++) {
        const prefix = prefixes[Math.floor(rand() * prefixes.length)];
        const suffix = suffixes[Math.floor(rand() * suffixes.length)];
        const street = streets[Math.floor(rand() * streets.length)];
        const area = areas[Math.floor(rand() * areas.length)];
        const stars = 2 + Math.floor(rand() * 4); // 2–5 stars
        const houseNo = 1 + Math.floor(rand() * 300);

        // Hotel name always includes the city name — feels location-specific
        const namePatterns = [
            `${prefix} ${city} ${suffix}`,
            `${city} ${suffix}`,
            `${prefix} ${suffix} ${city}`,
            `The ${city} ${suffix}`,
            `${city} ${prefix} ${suffix}`,
        ];
        const name = namePatterns[Math.floor(rand() * namePatterns.length)];

        hotels.push({
            name,
            category: categories[Math.floor(rand() * categories.length)],
            address: `${houseNo}, ${street}, ${area}, ${city}`,
            locality: `${area}, ${city}`,
            rating: String(stars),
            phone: `+${Math.floor(rand()*90+10)}-${Math.floor(rand()*9000+1000)}-${Math.floor(rand()*900000+100000)}`,
            website: null,
            hours: 'Check-in: 2:00 PM | Check-out: 11:00 AM',
            checkInDate,
            checkOutDate,
            adults,
            source: 'generated',
        });
    }

    // Cache without date fields (dates change per request)
    cache[key] = hotels.map(({ checkInDate: _, checkOutDate: __, adults: ___, ...h }) => h);
    console.log('Hotels generated:', hotels.length);
    return hotels;
};

module.exports = { searchHotels };