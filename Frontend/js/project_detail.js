/**
 * project_detail.js — Investor project detail view
 * Reads ?id= from URL, fetches project, renders data or shows unlock flow.
 */

document.addEventListener('DOMContentLoaded', async function () {
  if (!requireAuth('investor')) return;

  var params = new URLSearchParams(window.location.search);
  var projectId = params.get('id');

  if (!projectId) {
    showToast('No project ID specified', 'error');
    return;
  }

  /* Try to fetch full project details */
  try {
    var result = await apiGet('/api/projects/' + projectId);

    if (result.status === 200) {
      renderDetail(result.data, true);
    } else if (result.status === 403) {
      /* Not unlocked yet — show limited data from feed */
      var feedResult = await apiGet('/api/projects/feed');
      if (feedResult.status === 200) {
        var project = feedResult.data.feed.find(function (p) { return p.id == projectId; });
        if (project) {
          renderDetail(project, false);
        } else {
          showToast('Project not found', 'error');
        }
      }
    } else {
      showToast('Could not load project', 'error');
    }
  } catch (e) {
    showToast('Network error loading project', 'error');
  }

  /* ─── Unlock / Invest button ─── */
  var investBtn = document.getElementById('invest-btn');
  if (investBtn) {
    investBtn.addEventListener('click', async function () {
      investBtn.disabled = true;
      investBtn.textContent = 'Processing…';

      try {
        var payResult = await apiPost('/api/payments/unlock/' + projectId, {});
        if (payResult.status === 200) {
          showToast('Project unlocked! Loading full details…', 'success');
          setTimeout(function () { window.location.reload(); }, 1000);
        } else {
          showToast(payResult.data.message || payResult.data.error || 'Unlock failed', 'error');
          investBtn.disabled = false;
          investBtn.textContent = 'Invest Now';
        }
      } catch (err) {
        showToast('Network error', 'error');
        investBtn.disabled = false;
        investBtn.textContent = 'Invest Now';
      }
    });
  }

  var contactBtn = document.getElementById('contact-btn');
  if (contactBtn) {
    contactBtn.addEventListener('click', async function () {
      var res = await apiGet('/api/projects/' + projectId);
      if (res.status === 200 && res.data.promoter_contact) {
        var c = res.data.promoter_contact;
        var msg = 'Contact Info:\\n';
        if (c.email) msg += 'Email: ' + c.email + '\\n';
        if (c.phone) msg += 'Phone: ' + c.phone + '\\n';
        if (c.whatsapp) msg += 'WhatsApp: ' + c.whatsapp + '\\n';
        alert(msg);
      } else {
        showToast('Please unlock this project first to view contact info', 'error');
      }
    });
  }
});

function renderDetail(data, isUnlocked) {
  /* Title */
  var titleEl = document.getElementById('detail-title');
  if (titleEl) titleEl.innerHTML = 'Détails du Projet : <br><span class="text-on-primary-container">' + (data.company_name || data.title || '') + '</span>';

  /* Score */
  var scoreEl = document.getElementById('detail-score');
  if (scoreEl) scoreEl.innerHTML = (data.score || 0) + '<span class="text-2xl text-on-tertiary-container">/100</span>';

  /* Summary */
  var summaryEl = document.getElementById('detail-summary');
  if (summaryEl) summaryEl.textContent = data.summary || 'No summary available.';

  /* Industry chip */
  var industryEl = document.getElementById('detail-industry');
  if (industryEl) industryEl.textContent = data.industry || 'Tech';

  if (isUnlocked && data.eval_summary) {
    /* AI Market Intelligence */
    var aiSummaryEl = document.getElementById('detail-ai-summary');
    if (aiSummaryEl) aiSummaryEl.textContent = data.eval_summary.overall_summary || data.summary || '';

    /* Recommendation */
    var recEl = document.getElementById('detail-recommendation');
    if (recEl) recEl.textContent = data.eval_summary.investor_recommendation || 'N/A';

    /* Score ring */
    var ring = document.getElementById('detail-ring');
    if (ring) {
      var pct = (data.score || 0) / 100;
      ring.setAttribute('stroke-dasharray', (pct * 100) + ', 100');
    }
    var ringText = document.getElementById('detail-ring-text');
    if (ringText) ringText.textContent = (data.score || 0) + '%';

    /* Funding */
    var fundEl = document.getElementById('detail-funding');
    if (fundEl) fundEl.textContent = data.funding_amount || 'N/A';

    /* Stage */
    var stageEl = document.getElementById('detail-stage');
    if (stageEl) stageEl.textContent = data.stage || 'N/A';

    /* Contact section */
    if (data.promoter_contact) {
      var contactBtn = document.getElementById('contact-btn');
      if (contactBtn) contactBtn.textContent = 'Contact: ' + data.promoter_contact.email;
    }

    /* Invest button → already unlocked */
    var investBtn = document.getElementById('invest-btn');
    if (investBtn) {
      investBtn.textContent = '✓ Project Unlocked';
      investBtn.disabled = true;
      investBtn.style.opacity = '0.6';
    }
  }
}
