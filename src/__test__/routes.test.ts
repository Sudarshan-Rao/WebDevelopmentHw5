import app from '../server';
import supertest from 'supertest';

describe('Test the root path', () => {
    test('It should response the GET method', async () => {
        const response = await supertest(app).get('/');
        expect(response.statusCode).toBe(200);
    });
});