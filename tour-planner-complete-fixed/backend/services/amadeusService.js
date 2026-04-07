const axios = require('axios');

class AmadeusService {
    constructor() {
        this.apiKey = process.env.AMADEUS_API_KEY;
        this.apiSecret = process.env.AMADEUS_API_SECRET;
        this.baseURL = 'https://test.api.amadeus.com';
        this.accessToken = null;
        this.tokenExpiry = null;
    }

    async getAccessToken() {
        if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return this.accessToken;
        }

        try {
            const response = await axios.post(`${this.baseURL}/v1/security/oauth2/token`, {
                grant_type: 'client_credentials',
                client_id: this.apiKey,
                client_secret: this.apiSecret
            }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            this.accessToken = response.data.access_token;
            this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
            return this.accessToken;
        } catch (error) {
            console.error('Error getting Amadeus access token:', error);
            throw error;
        }
    }

    async getCityCode(cityName) {
        const token = await this.getAccessToken();

        try {
            const response = await axios.get(`${this.baseURL}/v1/reference-data/locations`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                params: {
                    keyword: cityName,
                    subType: 'CITY'
                }
            });

            if (response.data.data.length > 0) {
                return response.data.data[0].iataCode;
            }
            return null;
        } catch (error) {
            console.error('Error getting city code:', error);
            throw error;
        }
    }

    async searchHotels(cityCode, checkInDate, checkOutDate, adults = 1) {
        const token = await this.getAccessToken();

        try {
            const response = await axios.get(`${this.baseURL}/v1/reference-data/locations/hotels/by-city`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                params: {
                    cityCode: cityCode,
                    radius: 5,
                    radiusUnit: 'KM',
                    hotelSource: 'ALL'
                }
            });

            // Get hotel offers for the first few hotels
            const hotelIds = response.data.data.slice(0, 5).map(hotel => hotel.hotelId);

            if (hotelIds.length === 0) return [];

            const offersResponse = await axios.get(`${this.baseURL}/v2/shopping/hotel-offers`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                params: {
                    hotelIds: hotelIds.join(','),
                    checkInDate: checkInDate,
                    checkOutDate: checkOutDate,
                    adults: adults,
                    roomQuantity: 1
                }
            });

            return offersResponse.data.data;
        } catch (error) {
            console.error('Error searching hotels:', error);
            throw error;
        }
    }

    async searchFlights(origin, destination, departureDate, returnDate, adults = 1) {
        const token = await this.getAccessToken();

        try {
            const response = await axios.get(`${this.baseURL}/v2/shopping/flight-offers`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                params: {
                    originLocationCode: origin,
                    destinationLocationCode: destination,
                    departureDate: departureDate,
                    returnDate: returnDate,
                    adults: adults,
                    currencyCode: 'USD'
                }
            });

            return response.data.data;
        } catch (error) {
            console.error('Error searching flights:', error);
            throw error;
        }
    }
}

module.exports = new AmadeusService();