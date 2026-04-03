import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import Feedback from '../models/feedback.model';
import User from '../models/user.model';
import jwt from 'jsonwebtoken';

// ─── DATABASE SETUP ────────────────────────────────────────────

// Connect to the database ONCE before all tests run
beforeAll(async () => {
  const testUri = process.env.MONGO_URI || 'mongodb://localhost:27017/feedpulse_test';
  await mongoose.connect(testUri);
});


// This ensures each test starts with a clean slate
afterEach(async () => {
  await Feedback.deleteMany({});
  await User.deleteMany({});
});

// After ALL tests finish, drop the test database and disconnect
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});


// ─── HELPER FUNCTION ───────────────────────────────────────────

// This creates a real admin user in the test database
// and returns a valid JWT token for that user
// Tests that need admin access use this helper
const getAdminToken = async (): Promise<string> => {
  const user = await User.create({
    email: `admin_${Date.now()}@test.com`, 
    password: 'test123',
    name: 'Test Admin',
    role: 'admin',
  });

  return jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
};

// ─── TEST SUITE 1: POST /api/feedback ──────────────────────────

describe('POST /api/feedback', () => {

  it('should save valid feedback to the database and return 201', async () => {
    const feedbackData = {
      title: 'Add dark mode to the settings panel',
      description: 'It would be really helpful to have a dark mode option in the settings panel for better usability at night.',
      category: 'Feature Request',
    };

    const response = await request(app)
      .post('/api/feedback')
      .send(feedbackData)
      .expect(201); 

    // Check the response body
    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe(feedbackData.title);
    expect(response.body.data.status).toBe('New');
    expect(response.body.data.ai_processed).toBe(false);

    // Verify the document was actually saved in the database
    const saved = await Feedback.findById(response.body.data._id);
    expect(saved).not.toBeNull();
    expect(saved?.title).toBe(feedbackData.title);
  });

  it('should reject feedback with an empty title and return 400', async () => {
    const response = await request(app)
      .post('/api/feedback')
      .send({
        title: '',   
        description: 'This is a valid description that is long enough to pass validation.',
        category: 'Bug',
      })
      .expect(400); 

    expect(response.body.success).toBe(false);
  });

  it('should reject feedback with description shorter than 20 characters', async () => {
    const response = await request(app)
      .post('/api/feedback')
      .send({
        title: 'Valid title here',
        description: 'Too short', 
        category: 'Bug',
      })
      .expect(400);

    expect(response.body.success).toBe(false);
  });

  it('should reject feedback with an invalid category', async () => {
    const response = await request(app)
      .post('/api/feedback')
      .send({
        title: 'Valid title here',
        description: 'This description is definitely long enough to pass the validation check.',
        category: 'InvalidCategory', 
      })
      .expect(400);

    expect(response.body.success).toBe(false);
  });
});

// ─── TEST SUITE 2: PATCH /api/feedback/:id ─────────────────────

describe('PATCH /api/feedback/:id', () => {

  it('should update feedback status when admin is authenticated', async () => {
    const token = await getAdminToken();

    // Create a feedback document directly in the database
    const feedback = await Feedback.create({
      title: 'Test feedback for status update',
      description: 'This description is long enough for the validation to pass.',
      category: 'Bug',
    });

    // Send the PATCH request WITH the auth token
    const response = await request(app)
      .patch(`/api/feedback/${feedback._id}`)
      .set('Authorization', `Bearer ${token}`)  // Set the auth header
      .send({ status: 'In Review' })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('In Review');
  });

  it('should reject invalid status values', async () => {
    const token = await getAdminToken();

    const feedback = await Feedback.create({
      title: 'Test feedback',
      description: 'This description is long enough for validation to pass.',
      category: 'Bug',
    });

    const response = await request(app)
      .patch(`/api/feedback/${feedback._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'InvalidStatus' }) 
      .expect(400);

    expect(response.body.success).toBe(false);
  });
});

// ─── TEST SUITE 3: Auth Middleware ─────────────────────────────

describe('Auth Middleware', () => {

  it('should reject requests without a token with 401', async () => {
    // Send request with NO Authorization header
    const response = await request(app)
      .get('/api/feedback')
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Access denied');
  });

  it('should reject requests with an invalid token with 401', async () => {
    const response = await request(app)
      .get('/api/feedback')
      .set('Authorization', 'Bearer this-is-not-a-valid-jwt-token')
      .expect(401);

    expect(response.body.success).toBe(false);
  });

  it('should allow requests with a valid token', async () => {
    const token = await getAdminToken();

    const response = await request(app)
      .get('/api/feedback')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.success).toBe(true);
  });
});