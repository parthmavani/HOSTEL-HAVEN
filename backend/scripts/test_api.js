const http = require('http');
// Using native fetch if on Node 18+, otherwise need to ensure it works.
// Let's assume Node 18+ for now or use http module if strict.
// Note: 'node-fetch' requires installation. I'll use standard http/https or simple fetch if available.
// Actually, simple way: use a small script with standard http.



const postData = (path, data, token) => {
    return new Promise((resolve, reject) => {
        const dataString = JSON.stringify(data);
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': dataString.length,
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                resolve({ status: res.statusCode, body: JSON.parse(body || '{}') });
            });
        });

        req.on('error', (e) => reject(e));
        req.write(dataString);
        req.end();
    });
};

const getData = (path, token) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                resolve({ status: res.statusCode, body: JSON.parse(body || '{}') });
            });
        });

        req.on('error', (e) => reject(e));
        req.end();
    });
};

async function runTests() {
    console.log('--- Starting API Tests ---');

    const testUser = {
        full_name: 'Test Student',
        email: `student_${Date.now()}@example.com`,
        password: 'password123',
        role: 'student',
        enrollment_number: `EN${Date.now()}`,
        room_number: '101',
        department: 'CS',
        year_of_study: 2
    };

    try {
        // 1. Register
        console.log('1. Testing Registration...');
        const regRes = await postData('/api/auth/register', testUser);
        console.log(`   Status: ${regRes.status}`, regRes.body.token ? 'Success' : 'Failed');

        if (!regRes.body.token) {
            console.error('Registration failed, aborting tests.');
            return;
        }
        const token = regRes.body.token;

        // 2. Login
        console.log('2. Testing Login...');
        const loginRes = await postData('/api/auth/login', { email: testUser.email, password: testUser.password });
        console.log(`   Status: ${loginRes.status}`, loginRes.body.token ? 'Success' : 'Failed');

        // 3. Get Profile
        console.log('3. Testing Profile...');
        const profileRes = await getData('/api/auth/profile', token);
        console.log(`   Status: ${profileRes.status}`, profileRes.body.email === testUser.email ? 'Success' : 'Failed');

        // 4. Create Leave Request
        console.log('4. Testing Create Leave...');
        const leaveData = {
            from_date: '2025-01-01',
            to_date: '2025-01-05',
            leave_type: 'HOME',
            description: 'Going home for vacation',
            out_time: '10:00:00',
            expected_return_time: '18:00:00'
        };
        const leaveRes = await postData('/api/leaves', leaveData, token);
        console.log(`   Status: ${leaveRes.status}`, leaveRes.status === 201 ? 'Success' : 'Failed');

        // 5. Get Leaves
        console.log('5. Testing Get Leaves...');
        const getLeavesRes = await getData('/api/leaves', token);
        console.log(`   Status: ${getLeavesRes.status}`, Array.isArray(getLeavesRes.body) && getLeavesRes.body.length > 0 ? 'Success' : 'Failed');

        console.log('--- Tests Completed ---');

    } catch (error) {
        console.error('Test Error:', error);
    }
}

runTests();
