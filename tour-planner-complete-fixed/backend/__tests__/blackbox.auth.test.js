// BLACK BOX TESTING - Testing API endpoints without knowing internal implementation
// Focus on inputs, outputs, and expected behavior

const request = require('supertest');
const app = require('../server');

describe('Authentication API - Black Box Tests', () => {
    
    describe('POST /api/auth/register', () => {
        test('Should register user with valid data', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'John Doe',
                    email: 'john@example.com',
                    password: 'Password123',
                    phone: '1234567890'
                });
            expect(res.status).toBe(201);
            expect(res.body.message).toContain('registered successfully');
        });

        test('Should fail registration without email', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'John Doe',
                    password: 'Password123'
                });
            expect(res.status).toBe(400);
            expect(res.body.message).toContain('required');
        });

        test('Should fail registration without password', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Jane Doe',
                    email: 'jane@example.com'
                });
            expect(res.status).toBe(400);
            expect(res.body.message).toContain('required');
        });

        test('Should fail registration with duplicate email', async () => {
            await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: 'duplicate@example.com',
                    password: 'Password123'
                });

            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Another User',
                    email: 'duplicate@example.com',
                    password: 'Password456'
                });
            expect(res.status).toBe(400);
            expect(res.body.message).toContain('already exists');
        });
    });

    describe('POST /api/auth/login', () => {
        let testUserEmail, testUserPassword;

        beforeAll(async () => {
            testUserEmail = 'logintest@example.com';
            testUserPassword = 'LoginTest123';
            
            await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Login Test User',
                    email: testUserEmail,
                    password: testUserPassword
                });
        });

        test('Should login with valid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUserEmail,
                    password: testUserPassword
                });
            expect(res.status).toBe(200);
            expect(res.body.message).toContain('Login successful');
            expect(res.body.token).toBeDefined();
            expect(res.body.user).toBeDefined();
        });

        test('Should fail login with invalid password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUserEmail,
                    password: 'WrongPassword123'
                });
            expect(res.status).toBe(400);
            expect(res.body.message).toContain('Invalid password');
        });

        test('Should fail login with non-existent email', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'Password123'
                });
            expect(res.status).toBe(404);
            expect(res.body.message).toContain('not found');
        });

        test('Should fail login without email', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    password: testUserPassword
                });
            expect(res.status).toBe(400);
            expect(res.body.message).toContain('required');
        });
    });
});
