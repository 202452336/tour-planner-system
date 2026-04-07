// BLACK BOX TESTING - Destination API endpoints
const request = require('supertest');
const app = require('../server');

describe('Destination API - Black Box Tests', () => {
    let adminToken;

    beforeAll(async () => {
        // Register an admin user
        await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'AdminPass123',
                role: 'admin'
            });

        // Login to get token
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'admin@example.com',
                password: 'AdminPass123'
            });
        adminToken = loginRes.body.token;
    });
    
    describe('GET /api/destinations', () => {
        test('Should return all destinations with 200 status', async () => {
            const res = await request(app)
                .get('/api/destinations');
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });

        test('Should return destinations with proper structure', async () => {
            const res = await request(app)
                .get('/api/destinations');
            if (res.body.length > 0) {
                expect(res.body[0]).toHaveProperty('id');
                expect(res.body[0]).toHaveProperty('name');
                expect(res.body[0]).toHaveProperty('location');
            }
        });
    });

    describe('GET /api/destinations/:id', () => {
        test('Should return destination for valid ID', async () => {
            const res = await request(app)
                .get('/api/destinations/1');
            expect([200, 404]).toContain(res.status);
            if (res.status === 200) {
                expect(res.body).toHaveProperty('id');
                expect(res.body).toHaveProperty('name');
            }
        });

        test('Should return 404 for non-existent destination', async () => {
            const res = await request(app)
                .get('/api/destinations/99999');
            expect(res.status).toBe(404);
        });
    });

    describe('POST /api/destinations', () => {
        test('Should create destination with valid data', async () => {
            const res = await request(app)
                .post('/api/destinations')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Test Destination',
                    location: 'Test Location',
                    description: 'A test destination',
                    estimated_days: 3,
                    image_url: 'https://example.com/image.jpg'
                });
            expect(res.status).toBe(201);
            expect(res.body.message).toContain('successfully');
        });

        test('Should fail without name', async () => {
            const res = await request(app)
                .post('/api/destinations')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    location: 'Test Location',
                    description: 'A test destination'
                });
            expect(res.status).toBe(400);
            expect(res.body.message).toContain('required');
        });

        test('Should fail without location', async () => {
            const res = await request(app)
                .post('/api/destinations')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Test Destination',
                    description: 'A test destination'
                });
            expect(res.status).toBe(400);
            expect(res.body.message).toContain('required');
        });
    });
});
