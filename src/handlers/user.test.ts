import * as user from './user';

describe('User', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  describe('loginUserHandler', () => {
    it('should return 200', async () => {
      const req = {
        body: {
          email: 'Testuser',
          password: 'Testuser@123',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        cookie: jest.fn().mockReturnThis(),
        setHeader: jest.fn(),
      };
      const next = jest.fn();
      await user.loginUserHandler(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200 || 201);
      expect(res.json).toHaveBeenCalledWith({
        accessToken: expect.any(String),
      });
      expect(res.cookie).toHaveBeenCalledWith(
        'refreshToken',
        expect.any(String),
        {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        }
      );
    });
  });

  //   it('should be able to create a new user', async () => {
  //     const req = {
  //       body: {
  //         email: '',
  //         password: '',
  //       },
  //     };
  //     const res = {
  //       status: jest.fn().mockReturnThis(),
  //       json: jest.fn().mockReturnThis(),
  //     };
  //     const next = jest.fn();
  //     await user.registerUserHandler(req, res, next);
  //     expect(res.status).toHaveBeenCalledWith(200);
  //     expect(res.json).toHaveBeenCalledWith({
  //       token: expect.any(String),
  //     });
  //   });
  //   it('should be able to login', async () => {
  //     const req = {
  //       body: {
  //         email: '',
  //         password: '',
  //       },
  //     };
  //     const res = {
  //       status: jest.fn().mockReturnThis(),
  //       json: jest.fn().mockReturnThis(),
  //     };
  //     const next = jest.fn();
  //     await user.loginUserHandler(req, res, next);
  //     expect(res.status).toHaveBeenCalledWith(200);
  //     expect(res.json).toHaveBeenCalledWith({
  //       token: expect.any(String),
  //     });
  //   });
});
