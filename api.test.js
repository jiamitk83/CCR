const request = require('supertest');
const app = require('./server');
const { MongoClient } = require('mongodb');

jest.setTimeout(30000);

describe('API Endpoints', () => {
    let client;
    let db;
    let agent;

    beforeAll(async () => {
        // Connect to the same DB as the app (or a test one if we could configure it)
        // For now, we assume the app connects to 'courseCompletionDB'
        // We'll just wait a bit for the app to connect internally or we can connect ourselves to clean up
        const uri = 'mongodb://localhost:27017';
        client = new MongoClient(uri);
        await client.connect();
        db = client.db('courseCompletionDB');

        // Login as admin to maintain session
        agent = request.agent(app);
        await agent
            .post('/api/auth/login')
            .send({ username: 'admin', password: 'admin123' });
    });

    afterAll(async () => {
        await client.close();
    });

    describe('Authentication Tests', () => {
        it('should return 401 for a protected route if not logged in', async () => {
            const res = await request(app).get('/api/classes');
            expect(res.statusCode).toEqual(401);
        });
    });

    describe('Class Management', () => {
        let createdClass = 'Test Class ' + Date.now();

        it('should create a new class', async () => {
            const res = await agent
                .post('/api/classes')
                .send({ name: createdClass });
            expect(res.statusCode).toEqual(201);
            expect(res.body.success).toBe(true);
        });

        it('should return 409 if creating a class that already exists', async () => {
            // First time should succeed
            await agent.post('/api/classes').send({ name: 'duplicate-class' });
            // Second time should fail
            const res = await agent.post('/api/classes').send({ name: 'duplicate-class' });
            expect(res.statusCode).toEqual(409);
        });

        it('should get all classes', async () => {
            const res = await agent.get('/api/classes');
            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            const foundClass = res.body.find(c => c.name === createdClass);
            expect(foundClass).toBeDefined();
        });

        it('should delete the class', async () => {
            const res = await agent.delete(`/api/classes/${createdClass}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
        });

        it('should return 400 if creating a class with no name', async () => {
            const res = await agent
                .post('/api/classes')
                .send({ name: null });
            expect(res.statusCode).toEqual(400);
        });

        it('should return 404 if deleting a class that does not exist', async () => {
            const res = await agent.delete('/api/classes/nonexistentclass12345');
            expect(res.statusCode).toEqual(404);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Class not found');
        });
    });

    describe('Subject Management', () => {
        let createdSubject = 'Test Subject ' + Date.now();

        it('should create a new subject', async () => {
            const res = await agent
                .post('/api/subjects')
                .send({ name: createdSubject });
            expect(res.statusCode).toEqual(201);
            expect(res.body.success).toBe(true);
        });

        it('should return 409 if creating a subject that already exists', async () => {
            // First time should succeed
            await agent.post('/api/subjects').send({ name: 'duplicate-subject' });
            // Second time should fail
            const res = await agent.post('/api/subjects').send({ name: 'duplicate-subject' });
            expect(res.statusCode).toEqual(409);
        });

        it('should get all subjects', async () => {
            const res = await agent.get('/api/subjects');
            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body).toContain(createdSubject);
        });

        it('should delete the subject', async () => {
            const res = await agent.delete(`/api/subjects/${createdSubject}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
        });

        it('should return 400 if creating a subject with no name', async () => {
            const res = await agent
                .post('/api/subjects')
                .send({ name: null });
            expect(res.statusCode).toEqual(400);
        });

        it('should return 404 if deleting a subject that does not exist', async () => {
            const res = await agent.delete('/api/subjects/nonexistentsubject12345');
            expect(res.statusCode).toEqual(404);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Subject not found');
        });
    });

    describe('Chapter Management', () => {
        const className = 'Test Class For Chapter';
        const subjectName = 'Test Subject For Chapter';
        let chapterId;

        beforeAll(async () => {
            // Ensure class and subject exist? The app doesn't strictly enforce FKs in the code I saw, 
            // but let's just use strings.
        });

        it('should create a new chapter', async () => {
            const res = await agent
                .post('/api/chapters')
                .send({
                    className,
                    subjectName,
                    chapterNumber: 1,
                    name: 'Test Chapter 1'
                });
            expect(res.statusCode).toEqual(201);
            expect(res.body.success).toBe(true);
        });

        it('should get chapters for class/subject', async () => {
            const res = await agent.get(`/api/chapters/${className}/${subjectName}`);
            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
            chapterId = res.body[0]._id;
        });

        it('should delete the chapter', async () => {
            expect(chapterId).toBeDefined();
            const res = await agent.delete(`/api/chapters/${chapterId}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
        });

        it('should return 400 if creating a chapter with missing data', async () => {
            const res = await agent
                .post('/api/chapters')
                .send({
                    className: 'Test Class',
                    subjectName: 'Test Subject'
                    // Missing chapterNumber and name
                });
            expect(res.statusCode).toEqual(400);
        });

        it('should return 400 if deleting a chapter with an invalid id', async () => {
            const res = await agent.delete('/api/chapters/nonexistentchapter12345');
            expect(res.statusCode).toEqual(400);
        });

        it('should return 404 if deleting a chapter that does not exist', async () => {
            const validNonExistentId = '605cde1f2f3e4b1e9c8b4567'; // Example of a valid ObjectId that likely doesn't exist
            const res = await agent.delete(`/api/chapters/${validNonExistentId}`);
            expect(res.statusCode).toEqual(404);
        });
    });

    describe('Teachers Management', () => {
        let teacherId;
        const teacherData = {
            name: 'Test Teacher ' + Date.now(),
            className: 'Test Class For Teacher',
            subjectName: 'Test Subject For Teacher'
        };

        it('should create a new teacher', async () => {
            const res = await agent
                .post('/api/teachers')
                .send(teacherData);
            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
        });

        it('should get all teachers', async () => {
            const res = await agent.get('/api/teachers');
            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            const teacher = res.body.find(t => t.name === teacherData.name);
            expect(teacher).toBeDefined();
            teacherId = teacher._id;
        });

        it('should update a teacher', async () => {
            expect(teacherId).toBeDefined();
            const updatedData = { ...teacherData, name: teacherData.name + ' Updated' };
            const res = await agent
                .put(`/api/teachers/${teacherId}`)
                .send(updatedData);
            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
        });

        it('should delete the teacher', async () => {
            expect(teacherId).toBeDefined();
            const res = await agent.delete(`/api/teachers/${teacherId}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
        });

        it('should return 200 if creating a teacher with missing data', async () => {
            const res = await agent
                .post('/api/teachers')
                .send({
                    // Missing name, className, subjectName
                });
            expect(res.statusCode).toEqual(200);
        });

        it('should return 500 if deleting a teacher that does not exist', async () => {
            const res = await agent.delete('/api/teachers/nonexistentteacher12345');
            expect(res.statusCode).toEqual(500);
        });
    });

    describe('Status Management', () => {
        const className = 'Test Class For Status';
        const subjectName = 'Test Subject For Status';
        const chapterNumber = 999;
        const statusData = {
            chapterCompleted: true,
            notebookCompleted: false,
            worksheetCompleted: true
        };

        it('should update status', async () => {
            const res = await agent
                .put(`/api/status/${className}/${subjectName}/${chapterNumber}`)
                .send(statusData);
            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
        });

        it('should get status', async () => {
            const res = await agent.get(`/api/status/${className}/${subjectName}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body[chapterNumber]).toBeDefined();
            expect(res.body[chapterNumber].chapterCompleted).toBe(true);
        });

        it('should delete status', async () => {
            const res = await agent.delete(`/api/status/${className}/${subjectName}/${chapterNumber}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
        });

        it('should return 200 if updating status with invalid data', async () => {
            const res = await agent
                .put(`/api/status/someclass/somesubject/1`)
                .send("this is not valid data");
            expect(res.statusCode).toEqual(200);
        });

        it('should return 200 even if deleting a status that does not exist', async () => {
            const res = await agent.delete('/api/status/nonexistent/status/123');
            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
        });
    });

    describe('Stats Endpoint', () => {
        it('should get statistics', async () => {
            const res = await agent.get('/api/stats');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('users');
            expect(res.body).toHaveProperty('classes');
            expect(res.body).toHaveProperty('teachers');
            expect(res.body).toHaveProperty('subjects');
            expect(typeof res.body.users).toBe('number');
            expect(typeof res.body.classes).toBe('number');
            expect(typeof res.body.teachers).toBe('number');
            expect(typeof res.body.subjects).toBe('number');
        });
    });
});
