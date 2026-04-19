/**
 * dashboard.js — Investor dashboard: Fetches project feed, renders cards
 * Works with tableau_de_bord_investisseur_catalogue/code.html
 */

document.addEventListener('DOMContentLoaded', async function () {
  if (!requireAuth('investor')) return;

  /* ─── Load project feed ─── */
  var grid = document.getElementById('project-grid');
  if (!grid) return;

  try {
    var result = await apiGet('/api/projects/feed');
    if (result.status === 200 && result.data.feed.length > 0) {
      grid.innerHTML = '';
      result.data.feed.forEach(function (project) {
        grid.innerHTML += buildCard(project);
      });
    } else if (result.data.feed.length === 0) {
      grid.innerHTML =
        '<div class="col-span-full text-center py-20">' +
        '<span class="material-symbols-outlined text-6xl text-outline-variant mb-4">inventory_2</span>' +
        '<p class="text-secondary text-lg">No projects listed yet. Check back soon.</p>' +
        '</div>';
    }
  } catch (e) {
    showToast('Could not load project feed', 'error');
  }

  /* ─── Search filter ─── */
  var searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      var q = searchInput.value.toLowerCase();
      var cards = grid.querySelectorAll('.project-card');
      cards.forEach(function (card) {
        var text = card.textContent.toLowerCase();
        card.style.display = text.includes(q) ? '' : 'none';
      });
    });
  }

  /* ─── Logout ─── */
  var logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function (e) {
      e.preventDefault();
      logout();
    });
  }
});

function buildCard(project) {
  var score = project.score || 0;
  var colors = [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD3rT2nQy5T1bRKh2_gA4AUWqho639_HAICCWfdaGz1bncoLdNib-B7GfqXwx1GLMAb4DFz32P2sqI8m8Zj1AiFCmsc6nygFeWboqJOer4Q3kOqwDGE6jjd7XEm5j7S8s8zL8wF3LMIhpTLjLO0elyJN7JyBPl7bH4kswsOMvfgvnSxeYBMp82OqVy7SkdhcCbSxwRDz68SzWGpk5-2L0_yR-GmzJ55CeWt0hug9q8D57dDNrAIjkiCwmTy9KKFGq8Cl_Zcx_ptcgOq',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuA4g3Ri5fvL5Z9VReViuIygWNxtfoGutoDCrasFppxGwIMFFlgIjLAmyugI_iVWLXjg-lo_645jztSvwK3z1AKF8kB9xxOslWrFJX4OJ9wRm3n7ZgE8JPvcKmsfE5PMyBSpbG_OrQwWnomt2fbFwjKOC24JjddgljwU4MwYdiEMVuaYMno3hHh0i42Cw4nHVtKyn8O4tnBKkwKZPCpjxYpgNtWaOj1DPWteHMAg06g-6PLxOEOBTBbTIhzgKS6vnQtsDnO040Ho2v3j',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuA1OMy8nPUGe8zPB5PedtxX1Dq5PcTTXM25cYEDhlxpAkBYpIRo4zT8WR-MtSIKA_eH_01GDydVse_3yp7IlreayuzOgPBxdvq3JT_5Z7bW7zRlA-4LnCCBXPItTw_icvNoaVzA3c7pR1FQD389QGwVEL8mzUx6uCfqTxJVqXpi-Q59X2L3BjgsvDO9FqLCYnuMDExv-HZfEX7Hwj6INU5DPz9yUkXBP9hBK036R_Ic0IqtZAJuPFKxWummrJolFf6Eca6l7G8qvUYp'
  ];
  var img = colors[project.id % colors.length];

  return '' +
    '<div class="project-card bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">' +
      '<div class="h-48 w-full bg-slate-200 relative">' +
        '<img class="w-full h-full object-cover" src="' + img + '">' +
        '<div class="absolute top-4 right-4 bg-white/90 backdrop-blur p-3 rounded-full flex flex-col items-center justify-center w-16 h-16 shadow-lg">' +
          '<span class="text-xl font-black text-primary leading-none">' + score + '</span>' +
          '<span class="text-[8px] uppercase tracking-tighter font-bold text-secondary">IA Score</span>' +
        '</div>' +
      '</div>' +
      '<div class="p-6">' +
        '<div class="flex gap-2 mb-4">' +
          '<span class="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded">' + (project.industry || 'Tech') + '</span>' +
        '</div>' +
        '<h3 class="text-xl font-bold mb-2">' + (project.title || project.company_name) + '</h3>' +
        '<p class="text-sm text-secondary mb-6 leading-relaxed line-clamp-3">' + (project.summary || 'No summary available.') + '</p>' +
        '<button class="w-full py-4 bg-primary text-on-primary text-xs font-bold uppercase tracking-widest rounded-md hover:scale-[0.98] transition-transform" ' +
          'onclick="window.location.href=\'../d_tails_du_projet_vue_investisseur/code.html?id=' + project.id + '\'">' +
          'Voir les Détails' +
        '</button>' +
      '</div>' +
    '</div>';
}
