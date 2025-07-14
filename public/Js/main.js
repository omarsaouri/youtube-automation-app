// Auto-refresh every 30 seconds
setInterval(refreshAll, 30000);

async function refreshAll() {
  await Promise.all([
    refreshStatus(),
    refreshStats(),
    refreshSchedule(),
    refreshRecentUploads(),
  ]);
}

async function refreshStatus() {
  try {
    const response = await fetch("/health");
    const data = await response.json();

    const statusHtml = `
              <div>
                  <span class="status-indicator status-healthy"></span>
                  <strong>Service Status:</strong> ${data.status}
              </div>
              <div><strong>Uptime:</strong> ${Math.round(
                data.uptime / 60
              )} minutes</div>
              <div><strong>Last Activity:</strong> ${new Date(
                data.lastActivity
              ).toLocaleString()}</div>
              <div><strong>Production Mode:</strong> ${
                data.isProduction ? "Yes" : "No"
              }</div>
              <div><strong>Cron Jobs Active:</strong> ${
                data.shouldRunCronJobs ? "Yes" : "No"
              }</div>
          `;

    document.getElementById("status-content").innerHTML = statusHtml;
  } catch (error) {
    document.getElementById("status-content").innerHTML = `
              <div>
                  <span class="status-indicator status-error"></span>
                  <strong>Error:</strong> ${error.message}
              </div>
          `;
  }
}

async function refreshStats() {
  try {
    const response = await fetch("/status");
    const data = await response.json();

    const statsHtml = `
              <div class="stats-grid">
                  <div class="stat-item">
                      <div class="stat-value">${data.stats.total}</div>
                      <div class="stat-label">Total Uploads</div>
                  </div>
                  <div class="stat-item">
                      <div class="stat-value">${data.stats.successful}</div>
                      <div class="stat-label">Successful</div>
                  </div>
                  <div class="stat-item">
                      <div class="stat-value">${data.stats.failed}</div>
                      <div class="stat-label">Failed</div>
                  </div>
                  <div class="stat-item">
                      <div class="stat-value">${data.stats.successRate}%</div>
                      <div class="stat-label">Success Rate</div>
                  </div>
              </div>
          `;

    document.getElementById("stats-content").innerHTML = statsHtml;
  } catch (error) {
    document.getElementById(
      "stats-content"
    ).innerHTML = `<div style="color: red;">Error: ${error.message}</div>`;
  }
}

async function refreshSchedule() {
  try {
    const response = await fetch("/schedule");
    const data = await response.json();

    document.getElementById("schedule-content").innerHTML = `
              <pre style="background: #f8f9fa; padding: 10px; border-radius: 5px; overflow-x: auto;">${data.schedule}</pre>
          `;
  } catch (error) {
    document.getElementById(
      "schedule-content"
    ).innerHTML = `<div style="color: red;">Error: ${error.message}</div>`;
  }
}

async function refreshRecentUploads() {
  try {
    const response = await fetch("/status");
    const data = await response.json();

    if (data.recentUploads && data.recentUploads.length > 0) {
      // Sort uploads by timestamp descending (most recent first)
      const sortedUploads = data.recentUploads
        .slice()
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      const uploadsHtml = sortedUploads
        .map(
          (upload) => `
                  <div class="upload-item">
                      <div><strong>${upload.title}</strong></div>
                      <div><a href="${upload.youtubeUrl}" target="_blank">${
            upload.youtubeUrl
          }</a></div>
                      <div style="font-size: 12px; color: #666;">${new Date(
                        upload.timestamp
                      ).toLocaleString()}</div>
                  </div>
              `
        )
        .join("");

      document.getElementById("recent-uploads").innerHTML = uploadsHtml;
    } else {
      document.getElementById("recent-uploads").innerHTML =
        '<div style="text-align: center; color: #666;">No recent uploads</div>';
    }
  } catch (error) {
    document.getElementById(
      "recent-uploads"
    ).innerHTML = `<div style="color: red;">Error: ${error.message}</div>`;
  }
}

async function triggerAutomation() {
  const btn = document.getElementById("trigger-btn");
  const resultDiv = document.getElementById("trigger-result");

  btn.disabled = true;
  btn.textContent = "🔄 Running...";
  resultDiv.innerHTML =
    '<div style="color: #FF9800;">Starting automation...</div>';

  try {
    const response = await fetch("/trigger", { method: "POST" });
    const data = await response.json();

    if (data.success) {
      resultDiv.innerHTML = `
                  <div style="color: #4CAF50; margin-top: 10px;">
                      ✅ Automation completed successfully!<br>
                      Video ID: ${data.data.videoId}<br>
                      URL: <a href="${data.data.youtubeUrl}" target="_blank">${data.data.youtubeUrl}</a>
                  </div>
              `;
    } else {
      resultDiv.innerHTML = `<div style="color: #F44336; margin-top: 10px;">❌ Automation failed: ${data.error}</div>`;
    }
  } catch (error) {
    resultDiv.innerHTML = `<div style="color: #F44336; margin-top: 10px;">❌ Error: ${error.message}</div>`;
  } finally {
    btn.disabled = false;
    btn.textContent = "🚀 Run Automation";

    // Refresh stats after automation
    setTimeout(refreshStats, 2000);
  }
}

// Initial load
refreshAll();
