import React, { useState, useEffect, useRef } from 'react';
import './index.css';

function App() {
  const [gameState, setGameState] = useState('start');
  const [reactionTimes, setReactionTimes] = useState([]);
  const [currentTime, setCurrentTime] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const timeoutRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Draw chart whenever reactionTimes changes
  useEffect(() => {
    drawChart();
  }, [reactionTimes]);

  const drawChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Generate distribution data
    const bins = {};
    const binSize = 20;
    for (let i = 0; i <= 500; i += binSize) {
      bins[i] = 0;
    }

    if (reactionTimes.length === 0) {
      // Default bell curve
      for (let i = 0; i <= 500; i += binSize) {
        const x = i + binSize / 2;
        const mean = 273;
        const stdDev = 50;
        const y = Math.exp(-Math.pow(x - mean, 2) / (2 * stdDev * stdDev));
        bins[i] = y * 100;
      }
    } else {
      // User data distribution
      reactionTimes.forEach(time => {
        const bin = Math.floor(time / binSize) * binSize;
        if (bins[bin] !== undefined) {
          bins[bin]++;
        }
      });
    }

    const data = Object.entries(bins).map(([time, count]) => ({
      time: parseInt(time),
      value: count
    }));

    // Find max value for scaling
    const maxValue = Math.max(...data.map(d => d.value), 1);

    // Draw axes
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 10);
    ctx.lineTo(40, height - 30);
    ctx.lineTo(width - 10, height - 30);
    ctx.stroke();

    // Draw grid lines
    ctx.strokeStyle = '#f3f4f6';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 5; i++) {
      const y = 10 + (height - 40) * (i / 5);
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(width - 10, y);
      ctx.stroke();
    }

    // Draw area chart
    const chartWidth = width - 50;
    const chartHeight = height - 40;
    const stepX = chartWidth / (data.length - 1);

    ctx.fillStyle = 'rgba(59, 156, 235, 0.2)';
    ctx.strokeStyle = '#3b9ceb';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(40, height - 30);

    data.forEach((point, index) => {
      const x = 40 + index * stepX;
      const y = height - 30 - (point.value / maxValue) * chartHeight;
      
      if (index === 0) {
        ctx.lineTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.lineTo(40 + (data.length - 1) * stepX, height - 30);
    ctx.closePath();
    ctx.fill();

    // Draw line
    ctx.beginPath();
    data.forEach((point, index) => {
      const x = 40 + index * stepX;
      const y = height - 30 - (point.value / maxValue) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw X-axis labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    
    for (let i = 0; i < data.length; i += 3) {
      const x = 40 + i * stepX;
      ctx.save();
      ctx.translate(x, height - 15);
      ctx.rotate(-Math.PI / 4);
      ctx.fillText(data[i].time + 'ms', 0, 0);
      ctx.restore();
    }

    // Draw Y-axis labels
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = 0; i <= 4; i++) {
      const y = 10 + (chartHeight) * (i / 4);
      const value = Math.round(maxValue * (1 - i / 4));
      ctx.fillText(value.toString(), 35, y);
    }
  };

  const startTest = () => {
    if (gameState === 'start' || gameState === 'result' || gameState === 'tooSoon') {
      setGameState('waiting');
      const randomDelay = Math.random() * 3000 + 2000;
      timeoutRef.current = setTimeout(() => {
        setStartTime(performance.now());
        setGameState('ready');
      }, randomDelay);
    }
  };

  const handleClick = () => {
    if (gameState === 'waiting') {
      clearTimeout(timeoutRef.current);
      setGameState('tooSoon');
    } else if (gameState === 'ready') {
      const endTime = performance.now();
      const reactionTime = Math.round(endTime - startTime);
      setCurrentTime(reactionTime);
      setReactionTimes([...reactionTimes, reactionTime]);
      setGameState('result');
    } else if (gameState === 'start' || gameState === 'result' || gameState === 'tooSoon') {
      startTest();
    }
  };

  const getTestAreaClass = () => {
    switch (gameState) {
      case 'waiting':
        return 'test-area red';
      case 'ready':
        return 'test-area green';
      default:
        return 'test-area blue';
    }
  };

  const getAverage = () => {
    if (reactionTimes.length === 0) return 0;
    const sum = reactionTimes.reduce((a, b) => a + b, 0);
    return Math.round(sum / reactionTimes.length);
  };

  const getBest = () => {
    if (reactionTimes.length === 0) return 0;
    return Math.min(...reactionTimes);
  };

  const renderMainContent = () => {
    switch (gameState) {
      case 'start':
        return (
          <div className="test-content">
            <div className="icon-lightning">⚡</div>
            <h1 className="test-title">Reaction Time Test</h1>
            <p className="test-subtitle">When the red box turns green, click as quickly as you can.</p>
            <p className="test-subtitle">Click anywhere to start.</p>
          </div>
        );
      case 'waiting':
        return (
          <div className="test-content">
            <div className="dots-indicator">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
            <h1 className="test-title">Wait for green</h1>
          </div>
        );
      case 'ready':
        return (
          <div className="test-content">
            <div className="dots-indicator">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
            <h1 className="test-title">Click!</h1>
          </div>
        );
      case 'tooSoon':
        return (
          <div className="test-content">
            <div className="icon-alert">⚠️</div>
            <h1 className="test-title">Too soon!</h1>
            <p className="test-subtitle">Click to try again.</p>
          </div>
        );
      case 'result':
        return (
          <div className="test-content">
            <h1 className="test-title">{currentTime} ms</h1>
            <p className="test-subtitle">Click to keep going</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-left">
          <div className="navbar-brand">
            <span className="logo">⚡</span>
            <span>HUMAN BENCHMARK</span>
          </div>
          <a href="#">DASHBOARD</a>
        </div>
        <div className="navbar-right">
          <a href="#">SIGN UP</a>
          <a href="#">LOGIN</a>
        </div>
      </nav>

      <div className={getTestAreaClass()} onClick={handleClick}>
        {renderMainContent()}
      </div>

      <div className="content-area">
        <div className="content-grid">
          <div className="card">
            <h2 className="card-title">Statistics</h2>
            
            <div className="chart-wrapper">
              <canvas 
                ref={canvasRef} 
                width={400} 
                height={240}
                className="chart-canvas"
              />
            </div>

            <div className="stats-box">
              <div className="stat-item">
                <div className="stat-label">Attempts</div>
                <div className="stat-value">{reactionTimes.length}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Average</div>
                <div className="stat-value">{getAverage()} ms</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Best</div>
                <div className="stat-value">{getBest()} ms</div>
              </div>
            </div>
            
            {reactionTimes.length > 0 && (
              <div className="attempts-list">
                <h3>Recent Attempts:</h3>
                <ul>
                  {reactionTimes.slice(-5).reverse().map((time, index) => (
                    <li key={index}>
                      Attempt {reactionTimes.length - index}: <strong>{time} ms</strong>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="card-title">About the test</h2>
            <div className="about-content">
              <p>This is a simple tool to measure your reaction time.</p>
              
              <p>
                The average (median) reaction time is 273 milliseconds, according to the data collected so far.
              </p>

              <p>
                In addition to measuring your reaction time, this test is affected by the latency of your computer and monitor. 
                Using a fast computer and low latency / high framerate monitor will improve your score.
              </p>

              <p>
                Scores in this test are faster than the aim trainer test, 
                because you can react instantly without moving the cursor.
              </p>

              <p>
                While an average human reaction time may fall between 200-250ms, your computer could be adding 
                10-50ms on top. Some modern TVs add as much as 150ms!
              </p>

              <p>
                If you want, you can keep track of your scores, and see your full history of reaction times.
              </p>
              
              <p className="note">
                Just perform at least 5 clicks and then save.
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-content">
          <p>Copyright 2007-2025 Human Benchmark</p>
          <div className="footer-links">
            <a href="#">contact@humanbenchmark.com</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Licensing</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;