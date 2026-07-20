import './mock-database';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AiController (e2e)', () => {
  let app: INestApplication;
  
  const uniqueId = Date.now().toString();
  const testAdmin = {
    email: `e2e_admin_${uniqueId}@thedabbacompany.com`,
    phone: `+91${Math.floor(7000000000 + Math.random() * 2999999999)}`,
    password: 'Password123!',
    firstName: 'E2E',
    lastName: 'Admin',
    userType: 'admin',
  };

  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    // Register and login admin dynamically
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(testAdmin);

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: testAdmin.email,
        password: testAdmin.password,
      });

    adminToken = loginRes.body.token || loginRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/ai/admin/churn-prediction (GET) - Success as Admin', () => {
    return request(app.getHttpServer())
      .get('/api/ai/admin/churn-prediction')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect((res: any) => {
        expect(res.body.totalCustomersAnalyzed).toBeDefined();
        expect(res.body.highRiskCustomers).toBeDefined();
        expect(Array.isArray(res.body.highRiskCustomers)).toBe(true);
      });
  });

  it('/api/ai/admin/churn-prediction (GET) - Forbidden without Token', () => {
    return request(app.getHttpServer())
      .get('/api/ai/admin/churn-prediction')
      .expect(401);
  });

  it('/api/ai/providers/prov-123/forecast (GET) - Not Found for invalid provider', () => {
    return request(app.getHttpServer())
      .get('/api/ai/providers/prov-123/forecast?days=5')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
  });

  it('/api/ai/customers/cust-123/recommendations (GET) - Not Found for invalid customer', () => {
    return request(app.getHttpServer())
      .get('/api/ai/customers/cust-123/recommendations')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
  });
});
