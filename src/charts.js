// Custom HTML5 Canvas Charting Engine for Khmer & English Typing Master

const Charts = {
  renderLineChart(canvasId, dataPoints, labels, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    
    // Fit canvas to parent container sizing
    const rect = canvas.parentElement.getBoundingClientRect();
    const width = rect.width - 40; // padding
    const height = rect.height - 40;
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    if (dataPoints.length === 0) {
      this.drawEmptyState(ctx, width, height, "No progress history yet");
      return;
    }

    const padding = { top: 30, right: 20, bottom: 40, left: 45 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Find min and max bounds
    const maxVal = Math.max(...dataPoints, 40); // cap min upper bound at 40
    const minVal = Math.min(...dataPoints, 0);
    const range = maxVal - minVal;

    // Is light mode active?
    const isLightMode = document.body.classList.contains("light-mode");
    const textColor = isLightMode ? "#64748b" : "#94a3b8";
    const gridColor = isLightMode ? "rgba(0, 0, 0, 0.05)" : "rgba(255, 255, 255, 0.05)";
    const lineColor = options.lineColor || "#6366f1"; // primary accent
    const fillGradientStart = options.fillColorStart || "rgba(99, 102, 241, 0.25)";
    const fillGradientStop = options.fillColorStop || "rgba(99, 102, 241, 0.0)";

    // Draw horizontal grid lines and Y-axis labels
    const gridLines = 4;
    ctx.font = "10px sans-serif";
    ctx.fillStyle = textColor;
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    for (let i = 0; i <= gridLines; i++) {
      const val = Math.round(minVal + (range * i) / gridLines);
      const y = padding.top + chartHeight - (chartHeight * i) / gridLines;

      // Draw Grid Line
      ctx.beginPath();
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();

      // Draw Label
      ctx.fillText(val, padding.left - 10, y);
    }

    // Map points to canvas coordinates
    const points = dataPoints.map((val, idx) => {
      const x = padding.left + (chartWidth * idx) / (dataPoints.length - 1 || 1);
      const y = padding.top + chartHeight - ((val - minVal) / (range || 1)) * chartHeight;
      return { x, y, value: val };
    });

    // Draw area fill under the line
    if (points.length > 0) {
      ctx.beginPath();
      const grad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
      grad.addColorStop(0, fillGradientStart);
      grad.addColorStop(1, fillGradientStop);
      ctx.fillStyle = grad;

      ctx.moveTo(points[0].x, padding.top + chartHeight);
      points.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.lineTo(points[points.length - 1].x, padding.top + chartHeight);
      ctx.closePath();
      ctx.fill();
    }

    // Draw line connecting points
    ctx.beginPath();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    points.forEach((p, idx) => {
      if (idx === 0) {
        ctx.moveTo(p.x, p.y);
      } else {
        // Curve fit
        const prev = points[idx - 1];
        const cpX1 = prev.x + (p.x - prev.x) / 2;
        const cpY1 = prev.y;
        const cpX2 = prev.x + (p.x - prev.x) / 2;
        const cpY2 = p.y;
        ctx.bezierCurveTo(cpX1, cpY1, cpX2, cpY2, p.x, p.y);
      }
    });
    ctx.stroke();

    // Draw dots and WPM text overlays on top of points
    points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = lineColor;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Value label on top of dot
      ctx.font = "bold 9px sans-serif";
      ctx.fillStyle = isLightMode ? "#0f172a" : "#fff";
      ctx.textAlign = "center";
      ctx.fillText(p.value, p.x, p.y - 10);
    });

    // Draw X-axis Labels (Dates / Attempts)
    ctx.font = "9px sans-serif";
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    
    const labelStep = Math.max(1, Math.floor(labels.length / 5)); // show at most 5 labels
    labels.forEach((lbl, idx) => {
      if (idx % labelStep === 0) {
        const x = padding.left + (chartWidth * idx) / (labels.length - 1 || 1);
        ctx.fillText(lbl, x, padding.top + chartHeight + 10);
      }
    });
  },

  renderBarChart(canvasId, dataPoints, labels, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    
    const rect = canvas.parentElement.getBoundingClientRect();
    const width = rect.width - 40;
    const height = rect.height - 40;
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    if (dataPoints.length === 0) {
      this.drawEmptyState(ctx, width, height, "No scores recorded yet");
      return;
    }

    const padding = { top: 30, right: 20, bottom: 40, left: 45 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const maxVal = Math.max(...dataPoints, 100); // default grid height is 100 for accuracy
    const minVal = 0;
    const range = maxVal - minVal;

    const isLightMode = document.body.classList.contains("light-mode");
    const textColor = isLightMode ? "#64748b" : "#94a3b8";
    const gridColor = isLightMode ? "rgba(0, 0, 0, 0.05)" : "rgba(255, 255, 255, 0.05)";
    const barColor = options.barColor || "#06b6d4";

    // Draw horizontal grid lines
    const gridLines = 4;
    ctx.font = "10px sans-serif";
    ctx.fillStyle = textColor;
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    for (let i = 0; i <= gridLines; i++) {
      const val = Math.round(minVal + (range * i) / gridLines);
      const y = padding.top + chartHeight - (chartHeight * i) / gridLines;

      ctx.beginPath();
      ctx.strokeStyle = gridColor;
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();

      ctx.fillText(`${val}%`, padding.left - 10, y);
    }

    // Draw Bars
    const barGap = 16;
    const numBars = dataPoints.length;
    const totalGapWidth = barGap * (numBars - 1);
    const barWidth = Math.max(12, (chartWidth - totalGapWidth) / numBars);

    dataPoints.forEach((val, idx) => {
      const x = padding.left + idx * (barWidth + barGap) + (chartWidth - (numBars * barWidth + totalGapWidth)) / 2;
      const barHeight = (val / range) * chartHeight;
      const y = padding.top + chartHeight - barHeight;

      // Draw rounded rectangle
      ctx.beginPath();
      const radius = Math.min(6, barHeight);
      ctx.moveTo(x, y + barHeight);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.lineTo(x + barWidth - radius, y);
      ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
      ctx.lineTo(x + barWidth, y + barHeight);
      ctx.closePath();

      // Create glowing bar gradient
      const grad = ctx.createLinearGradient(x, y, x, y + barHeight);
      grad.addColorStop(0, barColor);
      grad.addColorStop(1, "rgba(6, 182, 212, 0.15)");
      ctx.fillStyle = grad;
      ctx.fill();

      // Write values above bars
      ctx.font = "bold 9px sans-serif";
      ctx.fillStyle = isLightMode ? "#0f172a" : "#fff";
      ctx.textAlign = "center";
      ctx.fillText(`${val}%`, x + barWidth / 2, y - 8);

      // Write X Labels
      ctx.font = "9px sans-serif";
      ctx.fillStyle = textColor;
      ctx.fillText(labels[idx] || "", x + barWidth / 2, padding.top + chartHeight + 12);
    });
  },

  drawEmptyState(ctx, width, height, message) {
    const isLightMode = document.body.classList.contains("light-mode");
    ctx.font = "13px sans-serif";
    ctx.fillStyle = isLightMode ? "#64748b" : "#64748b";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(message, width / 2, height / 2);
  }
};

window.Charts = Charts;
