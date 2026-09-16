const { io } = require('socket.io-client');
const assert = require('assert');

const BASE_URL = 'http://localhost:3000';

async function postLogin(username, password) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function getGameState(token) {
  const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
  const res = await fetch(`${BASE_URL}/api/game/state`, { headers });
  const data = await res.json();
  return { status: res.status, data };
}

async function runAudit() {
  console.log('===============================================================');
  console.log('?? FULL COMPREHENSIVE PRODUCTION AUDIT & VERIFICATION BATTERY');
  console.log('===============================================================\n');

  let passedChecks = 0;
  let totalChecks = 0;

  function check(name, condition, details = '') {
    totalChecks++;
    if (condition) {
      passedChecks++;
      console.log(`  ? [PASS] ${name} ${details ? '(' + details + ')' : ''}`);
    } else {
      console.error(`  ? [FAIL] ${name} ${details ? '(' + details + ')' : ''}`);
      throw new Error(`Audit check failed: ${name}`);
    }
  }

  // ==========================================
  // SECTION 1: AUTHENTICATION & AUTHORIZATION
  // ==========================================
  console.log('--- 1. AUTHENTICATION & AUTHORIZATION AUDIT ---');

  // 1.1 Admin login
  const adminAuth = await postLogin('admin', 'admin123');
  check('Admin authentication with valid credentials', adminAuth.status === 200 && !!adminAuth.data.token);
  const adminToken = adminAuth.data.token;

  // 1.2 All 5 Teams login
  const teams = ['prudhvi', 'vayu', 'jal', 'aakash', 'agni'];
  const teamTokens = {};
  for (const t of teams) {
    const res = await postLogin(t, `${t}123`);
    check(`Team [${t.toUpperCase()}] authentication`, res.status === 200 && !!res.data.token);
    teamTokens[t] = res.data.token;
  }

  // 1.3 Invalid credentials rejection
  const invalidAuth = await postLogin('admin', 'wrongpassword');
  check('Reject invalid password with 401', invalidAuth.status === 401);

  const unknownUser = await postLogin('hacker', 'password123');
  check('Reject unknown username with 401', unknownUser.status === 401);

  // 1.4 Unauthenticated request rejection
  const unauthGameState = await getGameState(null);
  check('Reject unauthenticated request to /api/game/state with 401', unauthGameState.status === 401);

  // 1.5 Admin endpoint returns completeRoundState
  const authAdminState = await getGameState(adminToken);
  check(
    'Admin token receives completeRoundState with full admin projection',
    authAdminState.status === 200 &&
    authAdminState.data.role === 'ADMIN' &&
    !!authAdminState.data.completeRoundState
  );

  // 1.6 Team token receives strictly role-isolated payload (no completeRoundState)
  const teamStateRes = await getGameState(teamTokens.prudhvi);
  check(
    'Team token receives role-isolated team payload and NO completeRoundState',
    teamStateRes.status === 200 &&
    teamStateRes.data.teamId === 'prudhvi' &&
    teamStateRes.data.completeRoundState === undefined
  );

  // 1.7 Socket authentication rejection
  const unauthSocket = io(BASE_URL, { auth: { token: 'invalid.jwt.token' } });
  const socketErrorPromise = new Promise(resolve => {
    unauthSocket.on('connect_error', err => {
      resolve(err.message);
    });
  });
  const socketErrMsg = await socketErrorPromise;
  check('Reject socket connection with invalid JWT', socketErrMsg.includes('Invalid') || socketErrMsg.includes('token'));
  unauthSocket.disconnect();

  // ==========================================
  // SECTION 2: SECRET ISOLATION & ZERO LEAKAGE
  // ==========================================
  console.log('\n--- 2. SECRET ISOLATION & DATA PROJECTION AUDIT ---');

  const adminSocket = io(BASE_URL, { auth: { token: adminToken } });
  const teamSockets = {};
  for (const t of teams) {
    teamSockets[t] = io(BASE_URL, { auth: { token: teamTokens[t] } });
  }

  await new Promise(r => setTimeout(r, 600));

  // Start round with forced theme and keyword
  const secretKeyword = 'QUANTUM ENTANGLEMENT';
  const publicTheme = 'PHYSICS & COSMOS';

  let roundStartSync = new Promise(resolve => {
    let count = 0;
    const teamStates = {};
    for (const t of teams) {
      teamSockets[t].on('team:state', function onState(p) {
        if (p.roundState === 'ACTIVE' && p.theme === publicTheme) {
          teamSockets[t].off('team:state', onState);
          teamStates[t] = p;
          count++;
          if (count === 5) resolve(teamStates);
        }
      });
    }
  });

  adminSocket.emit('admin:startRound', {
    theme: publicTheme,
    keyword: secretKeyword,
    durationSec: 60,
    buzzerMode: 'all-teams-can-buzz'
  });

  const activePayloads = await roundStartSync;

  let normalCount = 0;
  let imposterCount = 0;
  let imposterTeam = null;

  for (const t of teams) {
    const p = activePayloads[t];
    if (p.role === 'IMPOSTER') {
      imposterCount++;
      imposterTeam = t;
      check(
        `Imposter [${t.toUpperCase()}] receives role "IMPOSTER" and NO keyword`,
        p.role === 'IMPOSTER' && p.keyword === null && p.ownKeyword === null
      );
    } else {
      normalCount++;
      check(
        `Normal team [${t.toUpperCase()}] receives role "TEAM" and secret keyword`,
        p.role === 'TEAM' && p.ownKeyword === secretKeyword && p.keyword === secretKeyword
      );
    }

    // Verify unrevealed payload does NOT leak imposter identity to teams
    check(
      `Team [${t.toUpperCase()}] payload does NOT contain revealData or imposter identity`,
      p.revealData === null && p.imposterTeamId === undefined
    );
  }

  check('Exactly 1 imposter assigned across 5 teams', imposterCount === 1);
  check('Exactly 4 normal teams assigned across 5 teams', normalCount === 4);

  // ==========================================
  // SECTION 3: ROUND STATE MACHINE & TRANSITIONS
  // ==========================================
  console.log('\n--- 3. ROUND STATE MACHINE & TRANSITION AUDIT ---');

  // Test non-admin cannot trigger admin actions
  teamSockets.prudhvi.emit('admin:startRound', { theme: 'HACKED', keyword: 'HACKED' });
  await new Promise(r => setTimeout(r, 200));
  const currentState = (await getGameState(adminToken)).data.completeRoundState;
  check('Non-admin socket cannot trigger admin:startRound', currentState.theme === publicTheme);

  // Test Buzzer Arming & Opening
  let buzzerEnabledPromise = new Promise(resolve => {
    teamSockets.prudhvi.once('buzzer:enabled', (data) => resolve(data));
  });

  adminSocket.emit('admin:openBuzzer', { mode: 'all-teams-can-buzz' });
  const buzzerEnabledData = await buzzerEnabledPromise;
  check('All teams receive buzzer:enabled event', buzzerEnabledData.mode === 'all-teams-can-buzz');

  // ==========================================
  // SECTION 4: BUZZER CONCURRENCY & ORDERING
  // ==========================================
  console.log('\n--- 4. BUZZER CONCURRENCY & DETERMINISM AUDIT ---');

  // Concurrent buzz simulation from 3 teams
  teamSockets.jal.emit('team:buzz');
  teamSockets.vayu.emit('team:buzz');
  teamSockets.prudhvi.emit('team:buzz');

  await new Promise(r => setTimeout(r, 400));

  const buzzerState = (await getGameState(adminToken)).data.completeRoundState.buzzerState;
  check('Buzzer queue recorded all 3 buzzing teams', buzzerState.queue.length === 3);
  check('Buzzer queue maintains strictly monotonic order', (
    buzzerState.queue[0].order === 1 &&
    buzzerState.queue[1].order === 2 &&
    buzzerState.queue[2].order === 3
  ));

  // Duplicate buzz test
  const duplicateBuzzTeam = buzzerState.queue[0].teamId;
  teamSockets[duplicateBuzzTeam].emit('team:buzz');
  await new Promise(r => setTimeout(r, 200));
  const stateAfterDup = (await getGameState(adminToken)).data.completeRoundState.buzzerState;
  check('Duplicate buzz from same team is rejected', stateAfterDup.queue.length === 3);

  // Lock buzzer & test late buzz rejection
  adminSocket.emit('admin:lockBuzzer');
  await new Promise(r => setTimeout(r, 200));
  teamSockets.agni.emit('team:buzz');
  await new Promise(r => setTimeout(r, 200));
  const stateAfterLock = (await getGameState(adminToken)).data.completeRoundState.buzzerState;
  check('Late buzz after buzzer locked is rejected', stateAfterLock.queue.length === 3);

  // ==========================================
  // SECTION 5: GUESSING & ACCUSATION VALIDATION
  // ==========================================
  console.log('\n--- 5. GUESSING & ACCUSATION AUDIT ---');

  // Valid guess submission
  teamSockets.prudhvi.emit('team:guess', { suspectedTeamId: imposterTeam });
  teamSockets.vayu.emit('team:guess', { suspectedTeamId: imposterTeam });
  teamSockets.jal.emit('team:guess', { suspectedTeamId: 'agni' });

  // Invalid guess submission (invalid teamId)
  teamSockets.aakash.emit('team:guess', { suspectedTeamId: 'invalid_team' });

  await new Promise(r => setTimeout(r, 300));
  const stateWithGuesses = (await getGameState(adminToken)).data.completeRoundState.guesses;
  check('Valid guess recorded for Prudhvi', stateWithGuesses.prudhvi?.suspectedTeamId === imposterTeam);
  check('Valid guess recorded for Vayu', stateWithGuesses.vayu?.suspectedTeamId === imposterTeam);
  check('Invalid guess rejected for Aakash', stateWithGuesses.aakash === undefined);

  // ==========================================
  // SECTION 6: AUTHORITATIVE REVEAL & SCORING
  // ==========================================
  console.log('\n--- 6. AUTHORITATIVE REVEAL & SCORING AUDIT ---');

  // Non-admin attempt to reveal
  teamSockets.prudhvi.emit('admin:revealAnswer');
  await new Promise(r => setTimeout(r, 200));
  const stateBeforeReveal = (await getGameState(adminToken)).data.completeRoundState;
  check('Non-admin cannot trigger admin:revealAnswer', stateBeforeReveal.roundState !== 'REVEALED');

  // Admin triggers authoritative reveal
  let revealEventPromise = new Promise(resolve => {
    let count = 0;
    const revealPayloads = {};
    for (const t of teams) {
      teamSockets[t].once('round:revealed', (data) => {
        revealPayloads[t] = data;
        count++;
        if (count === 5) resolve(revealPayloads);
      });
    }
  });

  adminSocket.emit('admin:revealAnswer');
  const reveals = await revealEventPromise;
  check('All 5 teams receive synchronous round:revealed event', Object.keys(reveals).length === 5);

  const firstReveal = reveals.prudhvi;
  check('Reveal payload contains true keyword', firstReveal.keyword === secretKeyword);
  check('Reveal payload contains true imposter', firstReveal.imposterTeamId === imposterTeam);
  check('Reveal payload contains scored guess outcomes', firstReveal.guesses.length === 3);

  // Attempt guess after reveal
  teamSockets.agni.emit('team:guess', { suspectedTeamId: 'jal' });
  await new Promise(r => setTimeout(r, 200));
  const stateAfterRevealGuess = (await getGameState(adminToken)).data.completeRoundState.guesses;
  check('Guess submission after reveal is rejected', stateAfterRevealGuess.agni === undefined);

  // ==========================================
  // SECTION 7: RECONNECTING CLIENT RE-SYNC
  // ==========================================
  console.log('\n--- 7. RECONNECTION & STATE RESILIENCE AUDIT ---');

  // Simulate a team client disconnecting and reconnecting during REVEALED state
  teamSockets.jal.disconnect();
  await new Promise(r => setTimeout(r, 300));

  const reconnectedJal = io(BASE_URL, { auth: { token: teamTokens.jal } });
  const syncStatePromise = new Promise(resolve => {
    reconnectedJal.once('team:state', (state) => resolve(state));
  });

  const syncedState = await syncStatePromise;
  check('Reconnecting client receives current state without reload', syncedState.roundState === 'REVEALED');
  check('Reconnecting client receives revealed keyword', syncedState.keyword === secretKeyword);
  check('Reconnecting client receives revealData', syncedState.revealData !== null);

  // ==========================================
  // CLEANUP & FINAL REPORT
  // ==========================================
  adminSocket.disconnect();
  reconnectedJal.disconnect();
  for (const t of teams) {
    if (teamSockets[t].connected) teamSockets[t].disconnect();
  }

  console.log('\n===============================================================');
  console.log(`?? AUDIT COMPLETE: ${passedChecks}/${totalChecks} CHECKS PASSED (100% SUCCESS)`);
  console.log('===============================================================');
  process.exit(0);
}

runAudit().catch(err => {
  console.error('\n? AUDIT ENCOUNTERED UNHANDLED ERROR:', err);
  process.exit(1);
});
