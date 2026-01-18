const axios = require('axios');

async function testDuplicateId() {
    const id = 'dup-' + Date.now();
    try {
        const task = { id, name: 'Task 1', priority: 'High' };
        await axios.post('http://localhost:5000/api/tasks', task);
        console.log('Task 1 added.');

        await axios.post('http://localhost:5000/api/tasks', task);
        console.log('Task 2 added (should not happen).');
    } catch (err) {
        console.log('Caught expected error:', err.response.status, err.response.data);
    }
}

testDuplicateId();
