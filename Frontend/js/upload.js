/**
 * upload.js — Step 2: Project info + document upload
 * On "Next", submits everything to the backend and redirects to Step 3 with the result.
 */

document.addEventListener('DOMContentLoaded', function () {
  if (!requireAuth('promoter')) return;

  /* ─── Wire up file upload zones ─── */
  var zones = document.querySelectorAll('.upload-zone');
  zones.forEach(function (zone) {
    var fileKey = zone.getAttribute('data-file-key');
    var hiddenInput = document.getElementById('file-' + fileKey);
    if (!hiddenInput) return;

    var icon  = zone.querySelector('.material-symbols-outlined');
    var label = zone.querySelector('.upload-label');

    zone.addEventListener('click', function () { hiddenInput.click(); });

    zone.addEventListener('dragover', function (e) {
      e.preventDefault();
      zone.style.borderColor = '#0053db';
    });
    zone.addEventListener('dragleave', function () {
      zone.style.borderColor = 'transparent';
    });
    zone.addEventListener('drop', function (e) {
      e.preventDefault();
      zone.style.borderColor = 'transparent';
      if (e.dataTransfer.files.length) {
        hiddenInput.files = e.dataTransfer.files;
        markUploaded(zone, hiddenInput.files[0], icon, label);
      }
    });

    hiddenInput.addEventListener('change', function () {
      if (hiddenInput.files.length) {
        markUploaded(zone, hiddenInput.files[0], icon, label);
      }
    });
  });

  /* ─── Next Step: Validate + Submit ─── */
  var nextBtn = document.getElementById('next-step-btn');
  if (nextBtn) {
    nextBtn.addEventListener('click', async function (e) {
      e.preventDefault();

      var title         = document.getElementById('project-title').value.trim();
      var companyName   = document.getElementById('company-name').value.trim();
      var industry      = document.getElementById('industry').value;
      var fundingAmount = document.getElementById('funding-amount').value.trim();
      var stage         = document.getElementById('stage').value;
      var projectType   = document.getElementById('project-type').value;

      if (!title || !companyName || !industry || !fundingAmount || !stage) {
        showToast('Please fill in all project information fields', 'error');
        return;
      }

      var pitchInput      = document.getElementById('file-pitch_deck');
      var financialsInput = document.getElementById('file-financials');
      if (!pitchInput || !pitchInput.files.length || !financialsInput || !financialsInput.files.length) {
        showToast('Pitch Deck and Financial Model are required', 'error');
        return;
      }

      /* Build multipart form */
      var fd = new FormData();
      fd.append('title',          title);
      fd.append('company_name',   companyName);
      fd.append('industry',       industry);
      fd.append('funding_amount', fundingAmount);
      fd.append('stage',          stage);
      fd.append('project_type',   projectType);
      fd.append('pitch_deck',     pitchInput.files[0]);
      fd.append('financials',     financialsInput.files[0]);

      nextBtn.textContent = 'Submitting to AI…';
      nextBtn.style.opacity = '0.6';
      nextBtn.style.pointerEvents = 'none';

      try {
        var result = await apiFormPost('/api/projects/submit', fd);
        if (result.status === 201) {
          showToast('Project submitted! AI score: ' + result.data.score, 'success');
          /* Navigate to review page with the new project id */
          setTimeout(function () {
            window.location.href =
              '../fundbridge_step_3_review_ai_evaluation/code.html?project_id=' + result.data.project_id;
          }, 800);
        } else {
          showToast(result.data.error || 'Submission failed', 'error');
          nextBtn.textContent = 'Next Step';
          nextBtn.style.opacity = '1';
          nextBtn.style.pointerEvents = 'auto';
        }
      } catch (err) {
        showToast('Network error — is the server running?', 'error');
        nextBtn.textContent = 'Next Step';
        nextBtn.style.opacity = '1';
        nextBtn.style.pointerEvents = 'auto';
      }
    });
  }
});

function markUploaded(zone, file, icon, label) {
  if (icon) {
    icon.textContent = 'check_circle';
    icon.classList.add('text-on-tertiary-container');
  }
  if (label) {
    label.textContent = file.name;
    label.classList.add('font-bold');
  }
  zone.style.background = '#ffffff';
}
