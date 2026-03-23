import { useEffect, useRef } from 'preact/hooks';
import './ElevationProfile.css';

export const ElevationProfile = ({ elevationData, stats, onClose }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!elevationData || elevationData.length === 0) return;
    drawProfile();
  }, [elevationData]);

  const drawProfile = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const padding = { top: 20, right: 20, bottom: 40, left: 50 };

    ctx.clearRect(0, 0, width, height);

    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const maxElevation = Math.max(...elevationData.map(d => d.elevation));
    const minElevation = Math.min(...elevationData.map(d => d.elevation));
    const maxDistance = elevationData[elevationData.length - 1].distance;

    const scaleX = chartWidth / maxDistance;
    const scaleY = chartHeight / (maxElevation - minElevation);

    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(padding.left, padding.top, chartWidth, chartHeight);

    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + chartHeight);

    elevationData.forEach((point) => {
      const x = padding.left + point.distance * scaleX;
      const y = padding.top + chartHeight - (point.elevation - minElevation) * scaleY;
      ctx.lineTo(x, y);
    });

    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
    gradient.addColorStop(0, 'rgba(34, 197, 94, 0.6)');
    gradient.addColorStop(1, 'rgba(34, 197, 94, 0.1)');
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();

      const elevation = Math.round(maxElevation - ((maxElevation - minElevation) / 4) * i);
      ctx.fillStyle = '#6b7280';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${elevation}m`, padding.left - 10, y + 4);
    }

    ctx.fillStyle = '#6b7280';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    for (let i = 0; i <= 4; i++) {
      const x = padding.left + (chartWidth / 4) * i;
      const distance = ((maxDistance / 1000) / 4) * i;
      ctx.fillText(`${distance.toFixed(1)}km`, x, height - 10);
    }
  };

  return (
    <div className="elevation-overlay" onClick={onClose}>
      <div className="elevation-panel" onClick={(e) => e.stopPropagation()}>
        <div className="elevation-header">
          <h2>Perfil de elevación</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <canvas 
          ref={canvasRef}
          width={800}
          height={300}
          className="elevation-canvas"
        />

        {stats && (
          <div className="elevation-stats">
            <div className="stat-item">
              <div className="stat-label">Distancia</div>
              <div className="stat-value">{stats.totalDistance} km</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Ascenso</div>
              <div className="stat-value">↗ {stats.totalAscent} m</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Descenso</div>
              <div className="stat-value">↘ {stats.totalDescent} m</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Máx</div>
              <div className="stat-value">{stats.maxElevation} m</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Mín</div>
              <div className="stat-value">{stats.minElevation} m</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
