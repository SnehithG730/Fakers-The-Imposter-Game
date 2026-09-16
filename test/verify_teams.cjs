const { io } = require('socket.io-client');

async function login(username, password) {
  const res = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data.token;
}

async function run() {
  console.log('--- Starting Multi-Team Interface Verification ---');

  // 1. Log in admin and 5 teams
  const adminToken = await login('admin', 'Adm!N7308');
  const teamCreds = {
    prudhvi: 'PruD#v!236;',
    vayu: 'V@yU378',
    jal: 'J@L135',
    aakash: 'A@Ka$H124',
    agni: '@Gn!246'
  };
  const teams = Object.keys(teamCreds);
  const teamTokens = {};
  for (const t of teams) {
    teamTokens[t] = await login(t, teamCreds[t]);
  }
  console.log('✔ All 6 accounts authenticated successfully');

  // 2. Connect sockets
  const adminSocket = io('http://localhost:3000', { auth: { token: adminToken } });
  const sockets = {};
  for (const t of teams) {
    sockets[t] = io('http://localhost:3000', { auth: { token: teamTokens[t] } });
  }

  await new Promise((resolve) => setTimeout(resolve, 600));

  // 3. Admin starts round
  console.log('--- Starting Round with Theme & Keyword ---');
  let roundStartedPromise = new Promise((resolve) => {
    let count = 0;
    const teamPayloads = {};
    for (const t of teams) {
      sockets[t].on('team:state', (payload) => {
        if (payload.roundState === 'ACTIVE' && !teamPayloads[t]) {
          teamPayloads[t] = payload;
          count++;
          if (count === 5) resolve(teamPayloads);
        }
      });
    }
  });

  adminSocket.emit('admin:startRound', {
    theme: 'MYTHOLOGY & ELEMENTS',
    keyword: 'PHOENIX',
    durationSec: 60
  });

  const payloads = await roundStartedPromise;
  console.log('? All 5 teams received synchronized team:state for ACTIVE round');

  // 4. Verify Role Projection & Zero Leakage
  let imposterCount = 0;
  let normalCount = 0;
  let detectedImposterTeam = null;

  for (const t of teams) {
    const p = payloads[t];
    if (p.role === 'IMPOSTER') {
      imposterCount++;
      detectedImposterTeam = t;
      if (p.ownKeyword !== null) {
        throw new Error(`SECURITY LEAK: Imposter ${t} received secret keyword: ${p.ownKeyword}`);
      }
      console.log(`? Team [${t.toUpperCase()}] is IMPOSTER -> ownKeyword is null (properly hidden)`);
    } else {
      normalCount++;
      if (p.ownKeyword !== 'PHOENIX') {
        throw new Error(`Normal team ${t} received wrong keyword: ${p.ownKeyword}`);
      }
      console.log(`? Team [${t.toUpperCase()}] is NORMAL -> ownKeyword is "${p.ownKeyword}"`);
    }
  }

  if (imposterCount !== 1 || normalCount !== 4) {
    throw new Error(`Expected exactly 1 imposter and 4 normal teams, got ${imposterCount} and ${normalCount}`);
  }

  // 5. Test Buzzer activation & press
  console.log('--- Testing Buzzer Open & Press ---');
  const buzzPromise = new Promise((resolve) => {
    sockets.prudhvi.once('buzzer:enabled', () => {
      // PRUDHVI buzzes in
      sockets.prudhvi.emit('team:buzz');
    });
    adminSocket.once('team:buzzed', (data) => {
      resolve(data);
    });
  });

  adminSocket.emit('admin:openBuzzer', { mode: 'all-teams-can-buzz' });
  const buzzData = await buzzPromise;
  console.log(`? Buzzer recorded: Team ${buzzData.teamId} at order ${buzzData.order}`);

  // 6. Test Accusation / Guess Submission
  console.log('--- Testing Imposter Guess ---');
  const guessPromise = new Promise((resolve) => {
    adminSocket.once('guess:submitted', (data) => {
      resolve(data);
    });
  });

  // PRUDHVI submits a guess suspecting detectedImposterTeam
  sockets.prudhvi.emit('team:guess', { suspectedTeamId: detectedImposterTeam });
  const guessData = await guessPromise;
  console.log(`? Guess registered: ${guessData.guessingTeamId} accused ${guessData.suspectedTeamId}`);

  // 7. Test Reveal
  console.log('--- Testing Reveal ---');
  const revealPromise = new Promise((resolve) => {
    let count = 0;
    for (const t of teams) {
      sockets[t].once('round:revealed', (revealData) => {
        count++;
        if (count === 5) resolve(revealData);
      });
    }
  });

  adminSocket.emit('admin:revealAnswer');
  const revealData = await revealPromise;
  console.log(`? Round revealed to all teams: Keyword="${revealData.keyword}", Imposter="${revealData.imposterTeamId}"`);

  // Cleanup
  adminSocket.disconnect();
  for (const t of teams) {
    sockets[t].disconnect();
  }

  console.log('\n======================================================');
  console.log('?? ALL MULTI-TEAM INTERFACE VERIFICATION CHECKS PASSED!');
  console.log('======================================================');
  process.exit(0);
}

run().catch((err) => {
  console.error('? Verification failed:', err);
  process.exit(1);
});
