// Reports and Certificates Exporter for Khmer & English Typing Master

const Exporter = {
  // Export active student's typing history to CSV
  async exportHistoryCSV(profile) {
    if (!profile || profile.history.length === 0) {
      alert("No typing history records to export!");
      return;
    }

    const headers = ["ID", "Date", "Language", "Mode", "Lesson Title", "WPM", "Accuracy (%)", "Time Spent (s)", "Score"];
    const rows = profile.history.map(h => [
      h.id,
      new Date(h.date).toLocaleString(),
      h.language === "en" ? "English" : "Khmer",
      h.mode.toUpperCase(),
      `"${h.lessonTitle.replace(/"/g, '""')}"`,
      h.wpm,
      h.accuracy,
      h.timeSpent,
      h.score
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const filename = `typing_master_report_${profile.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.csv`;

    if (window.electronAPI && window.electronAPI.isElectron) {
      const res = await window.electronAPI.exportCSV(csvContent, filename);
      if (res.success) {
        alert(`Report successfully exported to: ${res.filePath}`);
      } else {
        alert(`Failed to export report: ${res.error}`);
      }
    } else {
      // Browser fallback download
      const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  },

  // Export a student progress report to PDF (via print view)
  async exportReportPDF(profile, stats) {
    if (!profile) return;

    // Create styled HTML report
    const htmlReport = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Student Progress Report - ${profile.name}</title>
        <style>
          body { font-family: sans-serif; padding: 30px; color: #1e293b; }
          h1 { color: #4f46e5; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 20px; }
          .meta-info { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 14px; }
          .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
          .stat-card { border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; text-align: center; background: #f8fafc; }
          .stat-val { font-size: 24px; font-weight: bold; color: #4f46e5; margin-top: 5px; }
          .stat-lbl { font-size: 11px; text-transform: uppercase; color: #64748b; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
          th { background: #f1f5f9; padding: 10px; border: 1px solid #cbd5e1; text-align: left; }
          td { padding: 10px; border: 1px solid #cbd5e1; }
          tr:nth-child(even) { background: #f8fafc; }
        </style>
      </head>
      <body>
        <h1>Typing Progress Report</h1>
        <div class="meta-info">
          <div><strong>Student Name:</strong> ${profile.name} (${profile.role.toUpperCase()})</div>
          <div><strong>Report Generated:</strong> ${new Date().toLocaleString()}</div>
        </div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-lbl">Total Lessons</div>
            <div class="stat-val">${stats.totalGames}</div>
          </div>
          <div class="stat-card">
            <div class="stat-lbl">Best Speed</div>
            <div class="stat-val">${stats.bestWpm} WPM</div>
          </div>
          <div class="stat-card">
            <div class="stat-lbl">Avg Accuracy</div>
            <div class="stat-val">${stats.avgAccuracy}%</div>
          </div>
          <div class="stat-card">
            <div class="stat-lbl">Practice Hours</div>
            <div class="stat-val">${stats.totalHours} hrs</div>
          </div>
        </div>
        <h3>Recent Score History</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Language</th>
              <th>Mode</th>
              <th>Lesson Title</th>
              <th>WPM</th>
              <th>Accuracy</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            ${profile.history.slice(-15).reverse().map(h => `
              <tr>
                <td>${new Date(h.date).toLocaleDateString()}</td>
                <td>${h.language === "en" ? "English" : "Khmer"}</td>
                <td>${h.mode.toUpperCase()}</td>
                <td>${h.lessonTitle}</td>
                <td><strong>${h.wpm}</strong></td>
                <td>${h.accuracy}%</td>
                <td>${h.score}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const filename = `report_${profile.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`;

    if (window.electronAPI && window.electronAPI.isElectron) {
      const res = await window.electronAPI.exportPDF(htmlReport, filename);
      if (res.success) {
        alert(`PDF Report successfully exported to: ${res.filePath}`);
      } else {
        alert(`Failed to export PDF: ${res.error}`);
      }
    } else {
      // Open print window in browser context
      const printWin = window.open("", "_blank");
      printWin.document.write(htmlReport);
      printWin.document.close();
      printWin.focus();
      setTimeout(() => {
        printWin.print();
        printWin.close();
      }, 500);
    }
  },

  // Save the gorgeous Certificate of Completion
  async saveCertificate(studentName, examWPM, examAccuracy, dateStr) {
    const certHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Khmer Unicode Exam Certificate</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;700&family=Inter:wght@400;700&display=swap');
          body { margin: 0; padding: 0; background: #fff; }
          .cert-container {
            font-family: 'Kantumruy Pro', 'Inter', sans-serif;
            background: #fff;
            color: #1e293b;
            padding: 40px;
            border: 15px double #6366f1;
            text-align: center;
            box-sizing: border-box;
            width: 100%;
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .cert-header { font-size: 26px; font-weight: 700; text-transform: uppercase; color: #1e1b4b; margin-bottom: 5px; }
          .cert-subheader { font-size: 14px; color: #4f46e5; letter-spacing: 2px; margin-bottom: 30px; text-transform: uppercase; }
          .cert-title { font-size: 32px; font-weight: 700; color: #6366f1; margin-bottom: 10px; }
          .cert-body { font-size: 16px; line-height: 1.8; margin-bottom: 30px; }
          .cert-name { font-size: 28px; font-weight: 700; color: #0f172a; border-bottom: 2px solid #cbd5e1; display: inline-block; padding: 0 30px 5px 30px; margin: 10px 0; }
          .cert-metrics { display: flex; justify-content: center; gap: 40px; margin-bottom: 30px; }
          .cert-metric-box { border: 1px solid #cbd5e1; padding: 10px 20px; border-radius: 8px; background: #f8fafc; }
          .cert-metric-val { font-size: 20px; font-weight: 700; color: #4f46e5; }
          .cert-metric-lbl { font-size: 11px; color: #64748b; text-transform: uppercase; }
          .cert-footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; padding: 0 40px; }
          .cert-signature-line { border-top: 1px solid #94a3b8; width: 180px; padding-top: 5px; font-size: 12px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="cert-container">
          <div class="cert-header">Khmer & English Typing Master</div>
          <div class="cert-subheader">Certificate of Proficiency</div>
          <div class="cert-title">CERTIFICATE OF COMPLETION</div>
          <div class="cert-body">
            This is to certify that student
            <br>
            <span class="cert-name">${studentName}</span>
            <br>
            has successfully passed the <strong>Khmer Unicode Typing Exam Mode</strong>
            <br>
            demonstrating high typing speed and accuracy.
          </div>
          <div class="cert-metrics">
            <div class="cert-metric-box">
              <div class="cert-metric-val">${examWPM} WPM</div>
              <div class="cert-metric-lbl">Speed</div>
            </div>
            <div class="cert-metric-box">
              <div class="cert-metric-val">${examAccuracy}%</div>
              <div class="cert-metric-lbl">Accuracy</div>
            </div>
            <div class="cert-metric-box">
              <div class="cert-metric-val">${dateStr}</div>
              <div class="cert-metric-lbl">Date Issued</div>
            </div>
          </div>
          <div class="cert-footer">
            <div>
              <div class="cert-signature-line">Typing Instructor</div>
            </div>
            <div>
              <div class="cert-signature-line">Program Director</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    if (window.electronAPI && window.electronAPI.isElectron) {
      const res = await window.electronAPI.saveCertificate(certHtml, studentName);
      if (res.success) {
        alert(`Certificate successfully saved to PDF at: ${res.filePath}`);
      } else {
        alert(`Failed to save Certificate: ${res.error}`);
      }
    } else {
      // Browser fallback print
      const printWin = window.open("", "_blank");
      printWin.document.write(certHtml);
      printWin.document.close();
      printWin.focus();
      setTimeout(() => {
        printWin.print();
        printWin.close();
      }, 500);
    }
  }
};

window.Exporter = Exporter;
