import * as user from './user';

describe('User', () => {
    beforeEach(() => {
        jest.resetModules();
    });
    it('should be able to create a new user', async () => {
        const req = {
            body: {
                email: '',
                password: ''
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        const next = jest.fn();
        await user.registerUserHandler(req, res, next);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ token: expect.any(String) });
    });
    it('should be able to login', async () => {
        const req = {
            body: {
                email: '',
                password: ''
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        const next = jest.fn();
        await user.loginUserHandler(req, res, next);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ token: expect.any(String) });
    });
});
