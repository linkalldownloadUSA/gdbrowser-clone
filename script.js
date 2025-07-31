const api = "https://gdbrowser.com/api";

document.getElementById('tabRecent').onclick = () => switchTab('recent');
document.getElementById('tabDownload').onclick = () => switchTab('downloads');
document.getElementById('btnSearch').onclick = search;

let currentTab = 'recent';

function switchTab(tab) {
  currentTab = tab;
  document.getElementById('tabRecent').classList.toggle('active', tab === 'recent');
  document.getElementById('tabDownload').classList.toggle('active', tab === 'downloads');
  document.getElementById('profileSection').classList.add('hidden');
  loadLevels();
}

async function loadLevels() {
  const list = document.getElementById('levelList');
  list.innerHTML = 'Loading...';
  const res = await fetch(`${api}/levels/${currentTab}`);
  const data = await res.json();
  list.innerHTML = '';
  data.forEach(level => {
    const li = document.createElement('li');
    li.textContent = `${level.name} by ${level.author} (ID: ${level.id})`;
    li.onclick = () => showLevel(level.id);
    list.appendChild(li);
  });
}

async function showLevel(levelId) {
  const level = await (await fetch(`${api}/level/${levelId}`)).json();
  showProfile(level.authorId);
}

async function showProfile(playerId) {
  const prof = await (await fetch(`${api}/profile/${playerId}`)).json();
  const created = await (await fetch(`${api}/search/${playerId}`)).json();

  document.getElementById('profileName').textContent = prof.name;
  document.getElementById('profileId').textContent = prof.playerID;
  document.getElementById('stars').textContent = prof.stars;
  document.getElementById('coins').textContent = prof.coins;
  document.getElementById('cp').textContent = prof.creatorPoints;
  document.getElementById('profileIcon').src = `${api.replace('/api', '')}/icon/${prof.name}`;

  const list = document.getElementById('createdLevels');
  list.innerHTML = '';
  created.forEach(level => {
    const li = document.createElement('li');
    li.textContent = `${level.name} (ID: ${level.id})`;
    li.onclick = () => showLevel(level.id);
    list.appendChild(li);
  });

  loadComments(playerId, 0);
  document.getElementById('profileSection').classList.remove('hidden');
}

async function loadComments(id, page) {
  const res = await fetch(`${api}/comments/${id}?page=${page}`);
  const data = await res.json();
  const list = document.getElementById('commentsList');
  const pager = document.getElementById('commentPager');

  list.innerHTML = '';
  pager.innerHTML = '';

  data.forEach(comment => {
    const li = document.createElement('li');
    li.textContent = `${comment.username}: ${comment.comment}`;
    list.appendChild(li);
  });

  for (let i = 0; i < 5; i++) {
    const btn = document.createElement('button');
    btn.textContent = i + 1;
    btn.disabled = i === page;
    btn.onclick = () => loadComments(id, i);
    pager.appendChild(btn);
  }
}

function search() {
  const lvl = document.getElementById('searchLevelID').value.trim();
  const player = document.getElementById('searchPlayerID').value.trim();

  if (lvl) showLevel(lvl);
  else if (player) showProfile(player);
}

// Initial load
switchTab('recent');
