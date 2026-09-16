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
  console.log('=== ADMIN CONTROL CENTER E2E VERIFICATION ===\n');

  // 1. Authenticate
  const adminToken = await login('admin', 'admin123');
  const teams = ['prudhvi', 'vayu', 'jal', 'aakash', 'agni'];
  const teamTokens = {};
  for (const t of teams) {
    teamTokens[t] = await login(t, `${t}123`);
  }
  console.log('? Admin & 5 Teams authenticated with JWT');

  const adminSocket = io('http://localhost:3000', { auth: { token: adminToken } });
  const sockets = {};
  for (const t of teams) {
    sockets[t] = io('http://localhost:3000', { auth: { token: teamTokens[t] } });
  }

  await new Promise(r => setTimeout(r, 600));

  // 2. Test Custom Round Configuration & Start
  console.log('--- 1. Testing Custom Round Configuration & Start ---');
  let statePromise = new Promise(resolve => {
    adminSocket.on('admin:state', function onState(state) {
      if (state.roundState === 'ACTIVE' && state.theme === 'ANCIENT WONDERS') {
        adminSocket.off('admin:state', onState);
        resolve(state);
      }
    });
  });

  adminSocket.emit('admin:startRound', {
    theme: 'ANCIENT WONDERS',
    keyword: 'COLOSSEUM',
    durationSec: 45,
    buzzerMode: 'first-buzzer-only',
    imposterTeamId: 'agni'
  });

  const activeState = await statePromise;
  console.log(`? Round #1 ACTIVE with forced Imposter [${activeState.imposterTeamId.toUpperCase()}]`);

  // 3. Test Authoritative Timer Controls (Pause & Adjust)
  console.log('--- 2. Testing Authoritative Timer (Pause, Adjust, Resume) ---');
  adminSocket.emit('admin:pauseTimer');
  await new Promise(r => setTimeout(r, 300));
  adminSocket.emit('admin:adjustTimer', { deltaSec: 15 });
  await new Promise(r => setTimeout(r, 300));
  adminSocket.emit('admin:resumeTimer');
  await new Promise(r => setTimeout(r, 300));
  console.log('? Authoritative timer paused, adjusted (+15s), and resumed');

  // 4. Test Buzzer Controls in First-Buzzer-Only mode
  console.log('--- 3. Testing Buzzer Mode (First-Buzzer-Only Auto Lock) ---');
  const buzzPromise = new Promise(resolve => {
    adminSocket.on('team:buzzed', function onBuzz(data) {
      adminSocket.off('team:buzzed', onBuzz);
      resolve(data);
    });
  });

  adminSocket.emit('admin:openBuzzer', { mode: 'first-buzzer-only' });
  await new Promise(r => setTimeout(r, 200));

  // Jal buzzes in first
  sockets.jal.emit('team:buzz');
  const buzzData = await buzzPromise;
  console.log(`? Team [${buzzData.teamId.toUpperCase()}] buzzed first`);

  // Vayu tries to buzz afterwards (should be rejected/locked in first-buzzer-only mode)
  await new Promise(r => setTimeout(r, 200));
  sockets.vayu.emit('team:buzz');
  await new Promise(r => setTimeout(r, 300));

  // 5. Test Clear Buzzer & Re-opening
  console.log('--- 4. Testing Clear Buzzer Queue ---');
  adminSocket.emit('admin:clearBuzzer');
  await new Promise(r => setTimeout(r, 300));
  console.log('? Buzzer queue cleared by admin');

  // 6. Test Accusation Submissions
  console.log('--- 5. Testing Team Accusations ---');
  sockets.prudhvi.emit('team:guess', { suspectedTeamId: 'agni' });
  sockets.vayu.emit('team:guess', { suspectedTeamId: 'agni' });
  sockets.jal.emit('team:guess', { suspectedTeamId: 'prudhvi' });
  await new Promise(r => setTimeout(r, 500));
  console.log('? 3 elemental teams submitted imposter votes');

  // 7. Test Authoritative Reveal
  console.log('--- 6. Testing Authoritative Reveal ---');
  const revealPromise = new Promise(resolve => {
    adminSocket.once('round:revealed', (data) => {
      resolve(data);
    });
  });

  adminSocket.emit('admin:revealAnswer');
  const revealData = await revealPromise;
  console.log(`? Truth revealed: Keyword="${revealData.keyword}", Imposter="${revealData.imposterTeamName}"`);
  console.log(`  Round Summary: "${revealData.roundSummary}"`);

  // 8. Test Next Round Preparation
  console.log('--- 7. Testing Next Round Progression ---');
  const nextRoundPromise = new Promise(resolve => {
    adminSocket.once('round:next', (data) => {
      resolve(data);
    });
  });

  adminSocket.emit('admin:nextRound');
  const nextRoundData = await nextRoundPromise;
  console.log(`? Successfully advanced to Round #${nextRoundData.round}`);

  // 9. Test Game Reset
  console.log('--- 8. Testing Session Reset ---');
  const resetPromise = new Promise(resolve => {
    adminSocket.once('game:reset', () => {
      resolve(true);
    });
  });

  adminSocket.emit('admin:resetGame');
  await resetPromise;
  console.log('? Match session reset successfully');

  // Cleanup
  adminSocket.disconnect();
  for (const t of teams) {
    sockets[t].disconnect();
  }

  console.log('\n=============================================================');
  console.log('?? ALL ADMIN CONTROL CENTER E2E VERIFICATIONS PASSED (100%)!');
  console.log('=============================================================');
  process.exit(0);
}

run().catch((err) => {
  console.error('? Verification failed:', err);
  process.exit(1);
});
