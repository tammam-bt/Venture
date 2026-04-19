/**
 * submit.js — Step 3: Review AI evaluation + mock payment
 * Reads project_id from URL, fetches project data, and renders results.
 */

document.addEventListener('DOMContentLoaded', async function () {
  if (!requireAuth('promoter')) return;

  var params = new URLSearchParams(window.location.search);
  var projectId = params.get('project_id');

  if (!projectId) {
    showToast('No project ID found. Please submit a project first.', 'error');
    return;
  }

  /* ─── Fetch project data ─── */
  try {
    var result = await apiGet('/api/projects/' + projectId);

    if (result.status === 200) {
      renderProjectData(result.data);
    } else if (result.status === 403) {
      /* Promoter owns this, but let's use the feed data as fallback */
      var feedResult = await apiGet('/api/projects/feed');
      if (feedResult.status === 200) {
        var project = feedResult.data.feed.find(function (p) { return p.id == projectId; });
        if (project) renderFeedData(project);
      }
    } else {
      showToast('Could not load project data', 'error');
    }
  } catch (e) {
    showToast('Network error fetching project', 'error');
  }

  /* ─── Payment button ─── */
  var payBtn = document.getElementById('pay-submit-btn');
  if (payBtn) {
    payBtn.addEventListener('click', async function (e) {
      e.preventDefault();
      payBtn.disabled = true;
      payBtn.textContent = 'Processing payment…';

      try {
        var payResult = await apiPost('/api/payments/unlock/' + projectId, {});
        if (payResult.status === 200) {
          showToast('Payment successful! Project listed.', 'success');
          setTimeout(function () {
            window.location.href = '../tableau_de_bord_investisseur_catalogue/code.html';
          }, 1200);
        } else {
          showToast(payResult.data.error || 'Payment failed', 'error');
          payBtn.disabled = false;
          payBtn.textContent = 'Submit & Pay $49';
        }
      } catch (err) {
        showToast('Network error during payment', 'error');
        payBtn.disabled = false;
        payBtn.textContent = 'Submit & Pay $49';
      }
    });
  }
});

function renderProjectData(data) {
  /* Company name */
  var companyEl = document.getElementById('review-company-name');
  if (companyEl) companyEl.textContent = data.company_name || '';

  /* Summary / description */
  var descEl = document.getElementById('review-description');
  if (descEl) descEl.textContent = data.summary || '';

  /* AI Total Score */
  var scoreEl = document.getElementById('review-total-score');
  if (scoreEl) scoreEl.innerHTML = (data.score || 0) + ' <span class="text-xl text-tertiary-fixed-dim">/ 100</span>';

  /* Score circle (SVG dashoffset) */
  var circle = document.getElementById('score-circle');
  if (circle) {
    var pct = (data.score || 0) / 100;
    var circumference = 2 * Math.PI * 88; // r=88
    circle.setAttribute('stroke-dasharray', circumference);
    circle.setAttribute('stroke-dashoffset', circumference * (1 - pct));
  }

  /* Recommendation badge */
  var recEl = document.getElementById('review-recommendation');
  if (recEl && data.eval_summary) {
    recEl.textContent = data.eval_summary.investor_recommendation || 'PENDING';
  }

  /* Benchmark */
  var benchEl = document.getElementById('review-benchmark');
  if (benchEl && data.eval_summary && data.eval_summary.sector_benchmark) {
    var bench = data.eval_summary.sector_benchmark;
    benchEl.innerHTML = '<span class="text-white font-bold">' +
      (bench.difference > 0 ? '+' : '') + bench.difference + ' pts</span> ' +
      '<span class="text-tertiary-fixed-dim text-sm">' + bench.comparison + '</span>';
  }

  /* Summary quote */
  var summaryEl = document.getElementById('review-ai-summary');
  if (summaryEl) summaryEl.textContent = '"' + (data.summary || 'N/A') + '"';

  /* Red flag */
  var flagEl = document.getElementById('review-red-flag');
  if (flagEl && data.eval_summary) {
    flagEl.textContent = data.eval_summary.biggest_red_flag || 'None identified';
  }

  /* Funding amount */
  var fundEl = document.getElementById('review-funding');
  if (fundEl) fundEl.textContent = data.funding_amount || '';

  /* Stage */
  var stageEl = document.getElementById('review-stage');
  if (stageEl) stageEl.textContent = data.stage || '';

  /* Industry tag */
  var tagEl = document.getElementById('review-industry-tag');
  if (tagEl) tagEl.textContent = data.industry || '';

  /* Sidebar mini score */
  var miniScoreEl = document.getElementById('review-mini-score');
  if (miniScoreEl) miniScoreEl.textContent = data.score || 0;

  var miniRecEl = document.getElementById('review-mini-rec');
  if (miniRecEl && data.eval_summary) {
    miniRecEl.textContent = data.eval_summary.investor_recommendation || 'PENDING';
  }
}

function renderFeedData(data) {
  var companyEl = document.getElementById('review-company-name');
  if (companyEl) companyEl.textContent = data.company_name || '';
  var descEl = document.getElementById('review-description');
  if (descEl) descEl.textContent = data.summary || '';
  var scoreEl = document.getElementById('review-total-score');
  if (scoreEl) scoreEl.innerHTML = (data.score || 0) + ' <span class="text-xl text-tertiary-fixed-dim">/ 100</span>';
}
