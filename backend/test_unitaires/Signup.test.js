import request from 'supertest';
import express from 'express';
import sinon from 'sinon';
import bcrypt from 'bcryptjs';
import { signUp } from '../controllers/auth.js';
import { bd } from '../bd.js';

const app = express();
app.use(express.json());
app.post('/signup', signUp);


//les cas passant
//le cas error 400: les cas d'error sur le test 401: appel de route sans autentifier 403: forbidden 404:not disponible
describe('POST /signup', () => {
  
  
  let queryStub;
  let bcryptStub;

  beforeEach(() => {
    queryStub = sinon.stub(bd, 'query');
    bcryptStub = sinon.stub(bcrypt, 'hash')
  });

  afterEach(() => {
    sinon.restore();
    bcryptStub.restore();
  });

  it('should return an error if fields are missing', async () => {
    const res = await request(app)
      .post('/signup')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!',
        confirmPassword: ''
      });
    expect(res.body).toEqual({ Error: "All fields are required" });
  });

  it('should return an error if passwords do not match', async () => {
    const res = await request(app)
      .post('/signup')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123'
      });
    expect(res.body).toEqual({ Error: "Passwords do not match" });
  });

  it('should return an error if password does not meet criteria', async () => {
    const res = await request(app)
      .post('/signup')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password',
        confirmPassword: 'password'
      });
    expect(res.body).toEqual({ Error: "Password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, and one special character." });
  });

  it('should hash the password and insert the user', async () => {
    bcryptStub.yields(null, 'hashedPassword');
    queryStub.onFirstCall().yields(null, { insertId: 1 });

    const res = await request(app)
      .post('/signup')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!'
      });

    expect(bcryptStub.calledOnce).toBe(true);
    expect(queryStub.calledTwice).toBe(true);
    expect(res.body).toEqual({ Status: "Success" });
  });

it('should handle errors during email validation', async () => {
  const res = await request(app)
    .post('/signup')
    .send({
      firstName: 'John',
      lastName: 'Doe',
      email: 'invalid-email',
      password: 'Password123!',
      confirmPassword: 'Password123!'
    });

  expect(res.body).toEqual({ Error: "Invalid email address" });
});

  it('should handle errors during user insertion', async () => {
    bcryptStub.yields(null, 'hashedPassword');
    queryStub.onFirstCall().yields(new Error('DB error'));

    const res = await request(app)
      .post('/signup')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!'
      });

    expect(res.body).toEqual({ Error: "The email already exists; you need to try a different one." });
  });

    it('should return an error if email is invalid', async () => {
    const res = await request(app)
      .post('/signup')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe',
        password: 'Password123!',
        confirmPassword: 'Password123!'
      });
    expect(res.body).toEqual({ Error: "Invalid email address" });
  });
});