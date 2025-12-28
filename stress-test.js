const axios = require('axios');

const POLL_ID = '1';
const OPTIONS = ['1','2', '3', '4', '5'];
const TOTAL_VOTES = 5000;

async function sendVote(i) {
  const userId = `both-${i}`;
  const optionId = OPTIONS[Math.floor(Math.random() * OPTIONS.length)];

  try {
    await axios.post('http://localhost:3000/vote', {
      pollId: POLL_ID,
      optionId: optionId,
      userId: userId
    });
    process.stdout.write('_-_'); // Print dot for every vote
  } catch (error) {
    console.error('X', error.message);
  }
}

async function run() {
  console.log(`Firing ${TOTAL_VOTES} votes...`);
  const promises = [];
  
  for (let i = 0; i < TOTAL_VOTES - 1; i++) {
    promises.push(sendVote(i));
    // Small delay to prevent crashing your local Node process (not the server)
    if (i % 10 === 0) await new Promise(r => setTimeout(r, 500));
  }

  await Promise.all(promises);
  console.log('\n Done sending votes.');
}

run();