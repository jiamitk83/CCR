// ============================================
// COMPREHENSIVE TEST SUITE FOR CCR APPLICATION
// ============================================

const http = require('http');

let cookie = '';
let testResults = {
    passed: 0,
    failed: 0,
    tests: []
};

function logTest(module, testName, status, message) {
    const result = { module, testName, status, message };
    testResults.tests.push(result);
    if (status === 'PASS') {
        testResults.passed++;
        console.log(`✅ [${module}] ${testName}: ${message}`);
    } else {
        testResults.failed++;
        console.log(`❌ [${module}] ${testName}: ${message}`);
    }
}

function makeRequest(options, data) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            const setCookie = res.headers['set-cookie'];
            if (setCookie) {
                cookie = setCookie[0].split(';')[0];
            }
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                let parsedBody = body;
                try {
                    parsedBody = JSON.parse(body);
                } catch (e) {
                    // If not JSON, keep as string (for HTML responses)
                    parsedBody = body;
                }
                resolve({ status: res.statusCode, body: parsedBody });
            });
        });
        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

// ==================== AUTH MODULE TESTS ====================
async function testAuthModule() {
    console.log('\n========== TESTING AUTH MODULE ==========\n');
    
    // Test 1: Register new user
    const registerResult = await makeRequest({
        hostname: 'localhost', port: 3000, path: '/api/register',
        method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, JSON.stringify({ 
        username: 'tester_' + Date.now(), 
        email: 'tester' + Date.now() + '@example.com', 
        password: 'TestPass123!' 
    }));
    logTest('AUTH', 'User Registration', 
        registerResult.status === 200 ? 'PASS' : 'FAIL',
        `Status: ${registerResult.status}, ${registerResult.body.message || ''}`);

    // Test 2: Register with duplicate email
    const dupResult = await makeRequest({
        hostname: 'localhost', port: 3000, path: '/api/register',
        method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, JSON.stringify({ 
        username: 'duplicate', 
        email: 'duplicate@test.com', 
        password: 'password123' 
    }));
    // First registration
    await makeRequest({
        hostname: 'localhost', port: 3000, path: '/api/register',
        method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, JSON.stringify({ username: 'dupuser', email: 'duplicate@test.com', password: 'password123' }));
    
    logTest('AUTH', 'Register Duplicate Email', 
        dupResult.status === 400 ? 'PASS' : 'FAIL',
        `Status: ${dupResult.status}, Expected 400 for duplicate`);

    // Test 3: Register with missing fields
    const missingFieldsResult = await makeRequest({
        hostname: 'localhost', port: 3000, path: '/api/register',
        method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, JSON.stringify({ username: 'test' }));
    
    logTest('AUTH', 'Register Missing Fields', 
        missingFieldsResult.status === 400 ? 'PASS' : 'FAIL',
        `Status: ${missingFieldsResult.status}, Expected 400`);

    // Test 4: Login with valid credentials
    const loginUser = 'logintest_' + Date.now();
    await makeRequest({
        hostname: 'localhost', port: 3000, path: '/api/register',
        method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, JSON.stringify({ username: loginUser, email: loginUser + '@test.com', password: 'Password123!' }));
    
    const loginResult = await makeRequest({
        hostname: 'localhost', port: 3000, path: '/api/auth/login',
        method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, JSON.stringify({ username: loginUser, password: 'Password123!' }));
    
    logTest('AUTH', 'Login Valid Credentials', 
        loginResult.status === 200 ? 'PASS' : 'FAIL',
        `Status: ${loginResult.status}, ${loginResult.body.message || ''}`);

    // Test 5: Login with invalid password
    const badLoginResult = await makeRequest({
        hostname: 'localhost', port: 3000, path: '/api/auth/login',
        method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, JSON.stringify({ username: loginUser, password: 'WrongPassword!' }));
    
    logTest('AUTH', 'Login Invalid Password', 
        badLoginResult.status === 401 ? 'PASS' : 'FAIL',
        `Status: ${badLoginResult.status}, Expected 401`);

    // Test 6: Login with non-existent user
    const noUserResult = await makeRequest({
        hostname: 'localhost', port: 3000, path: '/api/auth/login',
        method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, JSON.stringify({ username: 'nonexistent_user_12345', password: 'password' }));
    
    logTest('AUTH', 'Login Non-existent User', 
        noUserResult.status === 401 ? 'PASS' : 'FAIL',
        `Status: ${noUserResult.status}, Expected 401`);

    return { loginUser, password: 'Password123!' };
}

// ==================== SUBJECTS MODULE TESTS ====================
async function testSubjectsModule(credentials) {
    console.log('\n========== TESTING SUBJECTS MODULE ==========\n');
    
    // Setup: Login first
    await makeRequest({
        hostname: 'localhost', port: 3000, path: '/api/auth/login',
        method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, JSON.stringify(credentials));

    // Test 1: Get all subjects (unauthenticated)
    const unauthSubjects = await makeRequest({
        hostname: 'localhost', port: 3000, path: '/api/subjects', method: 'GET'
    });
    logTest('SUBJECTS', 'Get Subjects Unauthenticated', 
        unauthSubjects.status === 401 ? 'PASS' : 'FAIL',
        `Status: ${unauthSubjects.status}, Expected 401`);

    // Test 2: Create new subject
    const newSubject = 'TestSubject_' + Date.now();
    const createResult = await makeRequest({
        hostname: 'localhost', port: 3000, path: '/api/subjects',
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Cookie': cookie }
    }, JSON.stringify({ name: newSubject }));
    
    logTest('SUBJECTS', 'Create Subject', 
        createResult.status === 201 ? 'PASS' : 'FAIL',
        `Status: ${createResult.status}, ${createResult.body.message || ''}`);

    // Test 3: Create duplicate subject
    const dupSubjectResult = await makeRequest({
        hostname: 'localhost', port: 3000, path: '/api/subjects',
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Cookie': cookie }
    }, JSON.stringify({ name: 'MATHEMATICS' }));
    
    logTest('SUBJECTS', 'Create Duplicate Subject', 
        dupSubjectResult.status === 409 ? 'PASS' : 'FAIL',
        `Status: ${dupSubjectResult.status}, Expected 409`);

    // Test 4: Get all subjects (authenticated)
    const getResult = await makeRequest({
        hostname: 'localhost', port: 3000, path: '/api/subjects',
        method: 'GET', headers: { 'Cookie': cookie }
    });
    
    logTest('SUBJECTS', 'Get Subjects Authenticated', 
        getResult.status === 200 && Array.isArray(getResult.body) ? 'PASS' : 'FAIL',
        `Status: ${getResult.status}, Count: ${getResult.body.length}`);

    // Test 5: Update subject
    const updateResult = await makeRequest({
        hostname: 'localhost', port: 3000, path: `/api/subjects/${newSubject}`,
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Cookie': cookie }
    }, JSON.stringify({ name: 'UpdatedSubject' }));
    
    logTest('SUBJECTS', 'Update Subject', 
        updateResult.status === 200 ? 'PASS' : 'FAIL',
        `Status: ${updateResult.status}, ${updateResult.body.message || ''}`);

    // Test 6: Delete subject
    const deleteResult = await makeRequest({
        hostname: 'localhost', port: 3000, path: '/api/subjects/UpdatedSubject',
        method: 'DELETE', headers: { 'Cookie': cookie }
    });
    
    logTest('SUBJECTS', 'Delete Subject', 
        deleteResult.status === 200 ? 'PASS' : 'FAIL',
        `Status: ${deleteResult.status}, ${deleteResult.body.message || ''}`);
}

// ==================== CLASSES MODULE TESTS ====================
async function testClassesModule(credentials) {
    console.log('\n========== TESTING CLASSES MODULE ==========\n');
    
    // Setup: Login first
    await makeRequest({
        hostname: 'localhost', port: 3000, path: '/api/auth/login',
        method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, JSON.stringify(credentials));

    // Test 1: Get all classes (unauthenticated)
    const unauthClasses = await makeRequest({
        hostname: 'localhost', port: 3000, path: '/api/classes', method: 'GET'
    });
    logTest('CLASSES', 'Get Classes Unauthenticated', 
        unauthClasses.status === 401 ? 'PASS' : 'FAIL',
        `Status: ${unauthClasses.status}, Expected 401`);

    // Test 2: Create new class without subjects
    const newClass = 'TestClass_' + Date.now();
    const createResult = await makeRequest({
        hostname: 'localhost', port: 3000, path: '/api/classes',
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Cookie': cookie }
    }, JSON.stringify({ name: newClass }));
    
    logTest('CLASSES', 'Create Class Without Subjects', 
        createResult.status === 201 ? 'PASS' : 'FAIL',
        `Status: ${createResult.status}, ${createResult.body.message || ''}`);

    // Test 3: Create class with subjects
    const classWithSubjects = 'TestClassWithSubjects_' + Date.now();
    const createWithSubsResult = await makeRequest({
        hostname: 'localhost', port: 3000, path: '/api/classes',
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Cookie': cookie }
    }, JSON.stringify({ name: classWithSubjects, subjects: ['Mathematics', 'Science'] }));
    
    logTest('CLASSES', 'Create Class With Subjects', 
        createWithSubsResult.status === 201 ? 'PASS' : 'FAIL',
        `Status: ${createWithSubsResult.status}, ${createWithSubsResult.body.message || ''}`);

    // Test 4: Get all classes
    const getResult = await makeRequest({
        hostname: 'localhost', port: 3000, path: '/api/classes',
        method: 'GET', headers: { 'Cookie': cookie }
    });
    
    const hasSubjects = getResult.body.some(c => c.subjects && c.subjects.length > 0);
    logTest('CLASSES', 'Get Classes With Subjects', 
        getResult.status === 200 && hasSubjects ? 'PASS' : 'FAIL',
        `Status: ${getResult.status}, Has subjects: ${hasSubjects}`);

    // Test 5: Update class
    const updateResult = await makeRequest({
        hostname: 'localhost', port: 3000, path: `/api/classes/${newClass}`,
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Cookie': cookie }
    }, JSON.stringify({ name: 'UpdatedClass', subjects: ['English'] }));
    
    logTest('CLASSES', 'Update Class', 
        updateResult.status === 200 ? 'PASS' : 'FAIL',
        `Status: ${updateResult.status}, ${updateResult.body.message || ''}`);

    // Test 6: Delete class
    const deleteResult = await makeRequest({
        hostname: 'localhost', port: 3000, path: '/api/classes/UpdatedClass',
        method: 'DELETE', headers: { 'Cookie': cookie }
    });
    
    logTest('CLASSES', 'Delete Class', 
        deleteResult.status === 200 ? 'PASS' : 'FAIL',
        `Status: ${deleteResult.status}, ${deleteResult.body.message || ''}`);
}

// ==================== CHAPTERS MODULE TESTS ====================
async function testChaptersModule(credentials) {
    console.log('\n========== TESTING CHAPTERS MODULE ==========\n');
    
    // Setup: Login first
    await makeRequest({
        hostname: 'localhost', port: 3000, path: '/api/auth/login',
        method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, JSON.stringify(credentials));

    // Test 1: Get all chapters (unauthenticated)
    const unauthChapters = await makeRequest({
        hostname: 'localhost', port: 3000, path: '/api/chapters', method: 'GET'
    });
    logTest('CHAPTERS', 'Get Chapters Unauthenticated', 
        unauthChapters.status === 401 ? 'PASS' : 'FAIL',
        `Status: ${unauthChapters.status}, Expected 401`);

    // Test 2: Create new chapter
    const newChapter = 'TestChapter_' + Date.now();
    const createResult = await makeRequest({
        hostname: 'localhost', port: 3000, path: '/api/chapters',
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Cookie': cookie }
    }, JSON.stringify({ 
        name: newChapter, 
        className: 'CLASS 1', 
        subjectName: 'Mathematics',
        chapterNumber: 1
    }));
    
    logTest('CHAPTERS', 'Create Chapter', 
        createResult.status === 201 ? 'PASS' : 'FAIL',
        `Status: ${createResult.status}, ${createResult.body.message || ''}`);

    // Test 3: Create chapter with missing fields
    const missingFieldsResult = await makeRequest({
        hostname: 'localhost', port: 3000, path: '/api/chapters',
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Cookie': cookie }
    }, JSON.stringify({ name: 'Chapter1' }));
    
    logTest('CHAPTERS', 'Create Chapter Missing Fields', 
        missingFieldsResult.status === 400 ? 'PASS' : 'FAIL',
        `Status: ${missingFieldsResult.status}, Expected 400`);

    // Test 4: Get all chapters
    const getResult = await makeRequest({
        hostname: 'localhost', port: 3000, path: '/api/chapters',
        method: 'GET', headers: { 'Cookie': cookie }
    });
    
    logTest('CHAPTERS', 'Get Chapters Authenticated', 
        getResult.status === 200 && Array.isArray(getResult.body) ? 'PASS' : 'FAIL',
        `Status: ${getResult.status}, Count: ${getResult.body.length}`);

    // Test 5: Update chapter
    const updateResult = await makeRequest({
        hostname: 'localhost', port: 3000, path: `/api/chapters/${newChapter}`,
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Cookie': cookie }
    }, JSON.stringify({ name: 'UpdatedChapter', totalLessons: 15 }));
    
    logTest('CHAPTERS', 'Update Chapter', 
        updateResult.status === 200 ? 'PASS' : 'FAIL',
        `Status: ${updateResult.status}, ${updateResult.body.message || ''}`);

    // Test 6: Delete chapter
    const deleteResult = await makeRequest({
        hostname: 'localhost', port: 3000, path: '/api/chapters/UpdatedChapter',
        method: 'DELETE', headers: { 'Cookie': cookie }
    });
    
    logTest('CHAPTERS', 'Delete Chapter', 
        deleteResult.status === 200 ? 'PASS' : 'FAIL',
        `Status: ${deleteResult.status}, ${deleteResult.body.message || ''}`);
}

// ==================== STATUS MODULE TESTS ====================
async function testStatusModule(credentials) {
    console.log('\n========== TESTING STATUS MODULE ==========\n');
    
    // Setup: Login first
    await makeRequest({
        hostname: 'localhost', port: 3000, path: '/api/auth/login',
        method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, JSON.stringify(credentials));

    // Test 1: Get status (unauthenticated)
    const unauthStatus = await makeRequest({
        hostname: 'localhost', port: 3000, path: '/api/status', method: 'GET'
    });
    logTest('STATUS', 'Get Status Unauthenticated', 
        unauthStatus.status === 401 ? 'PASS' : 'FAIL',
        `Status: ${unauthStatus.status}, Expected 401`);

    // Test 2: Get all statuses
    const getResult = await makeRequest({
        hostname: 'localhost', port: 3000, path: '/api/status',
        method: 'GET', headers: { 'Cookie': cookie }
    });
    
    logTest('STATUS', 'Get All Statuses', 
        getResult.status === 200 && Array.isArray(getResult.body) ? 'PASS' : 'FAIL',
        `Status: ${getResult.status}, Count: ${getResult.body.length}`);

    // Test 3: Create status entry
    const createResult = await makeRequest({
        hostname: 'localhost', port: 3000, path: '/api/status',
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Cookie': cookie }
    }, JSON.stringify({ 
        className: 'CLASS 1', 
        subject: 'Mathematics',
        chapter: 'Chapter 1',
        completedLessons: 5
    }));
    
    logTest('STATUS', 'Create Status Entry', 
        createResult.status === 201 ? 'PASS' : 'FAIL',
        `Status: ${createResult.status}, ${createResult.body.message || ''}`);
}

// ==================== TEACHERS MODULE TESTS ====================
async function testTeachersModule(credentials) {
    console.log('\n========== TESTING TEACHERS MODULE ==========\n');
    
    // Setup: Login first
    await makeRequest({
        hostname: 'localhost', port: 3000, path: '/api/auth/login',
        method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, JSON.stringify(credentials));

    // Test 1: Get teachers (unauthenticated)
    const unauthTeachers = await makeRequest({
        hostname: 'localhost', port: 3000, path: '/api/teachers', method: 'GET'
    });
    logTest('TEACHERS', 'Get Teachers Unauthenticated', 
        unauthTeachers.status === 401 ? 'PASS' : 'FAIL',
        `Status: ${unauthTeachers.status}, Expected 401`);

    // Test 2: Get all teachers
    const getResult = await makeRequest({
        hostname: 'localhost', port: 3000, path: '/api/teachers',
        method: 'GET', headers: { 'Cookie': cookie }
    });
    
    logTest('TEACHERS', 'Get All Teachers', 
        getResult.status === 200 && Array.isArray(getResult.body) ? 'PASS' : 'FAIL',
        `Status: ${getResult.status}, Count: ${getResult.body.length}`);

    // Test 3: Create teacher
    const newTeacher = 'TestTeacher_' + Date.now();
    const createResult = await makeRequest({
        hostname: 'localhost', port: 3000, path: '/api/teachers',
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Cookie': cookie }
    }, JSON.stringify({ 
        name: newTeacher, 
        email: newTeacher + '@test.com',
        subjects: ['Mathematics', 'Science']
    }));
    
    logTest('TEACHERS', 'Create Teacher', 
        createResult.status === 201 ? 'PASS' : 'FAIL',
        `Status: ${createResult.status}, ${createResult.body.message || ''}`);
}

// ==================== STATS MODULE TESTS ====================
async function testStatsModule(credentials) {
    console.log('\n========== TESTING STATS MODULE ==========\n');
    
    // Setup: Login first
    await makeRequest({
        hostname: 'localhost', port: 3000, path: '/api/auth/login',
        method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, JSON.stringify(credentials));

    // Test 1: Get stats (unauthenticated)
    const unauthStats = await makeRequest({
        hostname: 'localhost', port: 3000, path: '/api/stats', method: 'GET'
    });
    logTest('STATS', 'Get Stats Unauthenticated', 
        unauthStats.status === 401 ? 'PASS' : 'FAIL',
        `Status: ${unauthStats.status}, Expected 401`);

    // Test 2: Get all stats
    const getResult = await makeRequest({
        hostname: 'localhost', port: 3000, path: '/api/stats',
        method: 'GET', headers: { 'Cookie': cookie }
    });
    
    logTest('STATS', 'Get All Stats', 
        getResult.status === 200 && (Array.isArray(getResult.body) || typeof getResult.body === 'object') ? 'PASS' : 'FAIL',
        `Status: ${getResult.status}, Response: ${JSON.stringify(getResult.body).substring(0, 100)}`);
}

// ==================== FRONTEND PAGES TEST ====================
async function testFrontendPages() {
    console.log('\n========== TESTING FRONTEND PAGES ==========\n');
    
    const pages = [
        '/index.html',
        '/login.html',
        '/register.html',
        '/subject-management.html',
        '/class-management.html',
        '/chapter-management.html',
        '/current-status.html',
        '/teacher-management.html'
    ];

    for (const page of pages) {
        const result = await makeRequest({
            hostname: 'localhost', port: 3000, path: page, method: 'GET'
        });
        
        const hasTitle = result.body && result.body.includes && (result.body.includes('<title>') || result.body.includes('<!DOCTYPE'));
        logTest('FRONTEND', `Page: ${page}`, 
            result.status === 200 ? 'PASS' : 'FAIL',
            `Status: ${result.status}`);
    }
}

// ==================== RUN ALL TESTS ====================
async function runAllTests() {
    console.log('============================================');
    console.log('   CCR APPLICATION COMPREHENSIVE TEST SUITE');
    console.log('============================================\n');

    try {
        // Run all module tests
        const authResult = await testAuthModule();
        await testSubjectsModule({ username: authResult.loginUser, password: authResult.password });
        await testClassesModule({ username: authResult.loginUser, password: authResult.password });
        await testChaptersModule({ username: authResult.loginUser, password: authResult.password });
        await testStatusModule({ username: authResult.loginUser, password: authResult.password });
        await testTeachersModule({ username: authResult.loginUser, password: authResult.password });
        await testStatsModule({ username: authResult.loginUser, password: authResult.password });
        await testFrontendPages();

        // Print summary
        console.log('\n============================================');
        console.log('                  TEST SUMMARY');
        console.log('============================================');
        console.log(`Total Tests: ${testResults.passed + testResults.failed}`);
        console.log(`✅ Passed: ${testResults.passed}`);
        console.log(`❌ Failed: ${testResults.failed}`);
        console.log(`Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(2)}%`);
        console.log('============================================\n');

        // Print failed tests
        if (testResults.failed > 0) {
            console.log('FAILED TESTS:');
            testResults.tests.filter(t => t.status === 'FAIL').forEach(t => {
                console.log(`  - [${t.module}] ${t.testName}: ${t.message}`);
            });
        }

    } catch (error) {
        console.error('Test execution error:', error);
    }
}

runAllTests();
