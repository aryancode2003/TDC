import './mock-database';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  
  const uniqueId = Date.now().toString();
  const testUser = {
    email: `e2e_test_${uniqueId}@thedabbacompany.com`,
    phone: `+91${Math.floor(6000000000 + Math.random() * 3999999999)}`,
    password: 'Password123!',
    firstName: 'E2E',
    lastName: 'Tester',
    userType: 'customer',
  };

  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/auth/register (POST) - Success', () => {
    return request(app.getHttpServer())
      .post('/api/auth/register')
      .send(testUser)
      .expect((res: any) => {
        console.log('Register Response Body:', res.body);
      })
      .expect(201)
      .expect((res: any) => {
        expect(res.body.token || res.body.accessToken).toBeDefined();
        expect(res.body.user).toBeDefined();
        expect(res.body.user.email).toBe(testUser.email);
      });
  });

  it('/api/auth/register (POST) - Conflict Duplicate User', () => {
    return request(app.getHttpServer())
      .post('/api/auth/register')
      .send(testUser)
      .expect(409);
  });

  it('/api/auth/login (POST) - Success', () => {
    return request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      })
      .expect(200)
      .expect((res: any) => {
        const token = res.body.token || res.body.accessToken;
        expect(token).toBeDefined();
        accessToken = token;
      });
  });

  it('/api/auth/login (POST) - Unauthorized', () => {
    return request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'wrongpassword',
      })
      .expect(401);
  });

  it('/api/auth/me (GET) - Unauthorized without token', () => {
    return request(app.getHttpServer())
      .get('/api/auth/me')
      .expect(401);
  });

  it('/api/auth/me (GET) - Success with bearer token', () => {
    return request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res: any) => {
        expect(res.body.email).toBe(testUser.email);
        expect(res.body.userType).toBe('customer');
      });
  });
});
