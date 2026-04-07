const db = require('../config/db');

afterAll(async() => {
    await db.end();
});