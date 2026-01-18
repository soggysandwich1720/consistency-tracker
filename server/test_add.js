const axios = require('axios');

async function testAddTask() {
    try {
        const newTask = {
            id: 'test-' + Date.now(),
            name: 'Test Task from Script',
            priority: 'High',
            hasTimer: false,
            scheduledTime: '10:00'
        };

        console.log('Sending POST to /api/tasks...');
        const res = await axios.post('http://localhost:5000/api/tasks', newTask);
        console.log('Task added:', res.data);

        console.log('Initializing history...');
        const res2 = await axios.post('http://localhost:5000/api/history/init', {
            date: new Date().toISOString().split('T')[0],
            activeTaskIds: [res.data.id]
        });
        console.log('History init:', res2.data);

    } catch (err) {
        console.error('Error adding task:', err.response ? err.response.data : err.message);
    }
}

testAddTask();
