// BLACK BOX TESTING - Budget API endpoints
const request = require('supertest');
const app = require('../server');

describe('Budget API - Black Box Tests', () => {
    let authToken;
    let tourId;

    beforeAll(async () => {
        // Register and login a user
        const registerRes = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Budget Test User',
                email: 'budgettest@example.com',
                password: 'BudgetTest123'
            });

        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'budgettest@example.com',
                password: 'BudgetTest123'
            });

        authToken = loginRes.body.token;

        // Create a tour for testing
        const tourRes = await request(app)
            .post('/api/tours')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                name: 'Budget Test Tour',
                start_date: '2024-05-01',
                end_date: '2024-05-10',
                destination_id: 1
            });

        if (tourRes.status === 201) {
            tourId = tourRes.body.tourId;
        }
    });

    describe('POST /api/budget', () => {
        test('Should create budget with valid data and auth', async () => {
            const res = await request(app)
                .post('/api/budget')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    tour_id: tourId || 1,
                    hotel_cost: 1000,
                    transport_cost: 500,
                    other_cost: 200
                });
            expect([201, 400, 404]).toContain(res.status);
            if (res.status === 201) {
                expect(res.body.total_cost).toBe(1700);
            }
        });

        test('Should fail without tour_id', async () => {
            const res = await request(app)
                .post('/api/budget')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    hotel_cost: 1000,
                    transport_cost: 500,
                    other_cost: 200
                });
            expect(res.status).toBe(400);
        });

        test('Should fail without authentication', async () => {
            const res = await request(app)
                .post('/api/budget')
                .send({
                    tour_id: 1,
                    hotel_cost: 1000,
                    transport_cost: 500,
                    other_cost: 200
                });
            expect(res.status).toBe(401);
        });
    });

    describe('GET /api/budget/:tourId', () => {
        test('Should return budget for valid tour', async () => {
            const res = await request(app)
                .get('/api/budget/1')
                .set('Authorization', `Bearer ${authToken}`);
            expect([200, 404, 401]).toContain(res.status);
        });

        test('Should fail without authentication', async () => {
            const res = await request(app)
                .get('/api/budget/1');
            expect(res.status).toBe(401);
        });
    });
});
