const http = require('http');

let cookie = '';

function makeRequest(options, data) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            // Save cookie from response
            const setCookie = res.headers['set-cookie'];
            if (setCookie) {
                cookie = setCookie[0].split(';')[0];
            }
            
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body }));
        });
        req.on('error', reject);
        if (data) {
            req.write(data);
        }
        req.end();
    });
}

async function register(username, email, password) {
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/register',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    const data = JSON.stringify({ username, email, password });
    return await makeRequest(options, data);
}

async function login(username, password) {
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    const data = JSON.stringify({ username, password });
    return await makeRequest(options, data);
}

async function addSubject(name) {
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/subjects',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': cookie
        }
    };
    const data = JSON.stringify({ name });
    return await makeRequest(options, data);
}

async function getSubjects() {
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/subjects',
        method: 'GET',
        headers: {
            'Cookie': cookie
        }
    };
    return await makeRequest(options);
}

async function test() {
    console.log('Registering user...');
    const regResult = await register('testuser', 'test@example.com', 'testpass123');
    console.log('Register:', regResult.status, regResult.body);
    
    console.log('\nLogging in...');
    const loginResult = await login('testuser', 'testpass123');
    console.log('Login:', loginResult.status, loginResult.body);
    
    console.log('\nAdding subjects...');
    const subjects = ['Mathematics', 'Science', 'English', 'History', 'Geography'];
    
    for (const subject of subjects) {
        const result = await addSubject(subject);
        console.log(`Added ${subject}:`, result.status, result.body);
    }
    
    console.log('\nFetching all subjects...');
    const allSubjects = await getSubjects();
    console.log('Subjects:', allSubjects.body);
}

test().catch(console.error);
