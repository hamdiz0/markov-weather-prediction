import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Cloud, Sun, CloudRain, Wind, CloudLightning, CloudDrizzle } from 'lucide-react';
import { styled, createGlobalStyle } from 'styled-components';

export default function PredictionResults({ predictionData }) {

  if (!predictionData || !predictionData.predictions || predictionData.predictions.length === 0) {
    return (
        <Section className="section prediction_results" id="prediction_results"></Section>
    )
  }

  const predictions = predictionData.predictions;
  
  // Show only first 10 days in table for overview
  const tableDaysToShow = Math.min(10, predictions.length);
  const tableData = predictions.slice(0, tableDaysToShow).map((pred, idx) => ({
    day: idx + 1,
    dayName: idx === 0 ? 'Today' : idx === 1 ? 'Tomorrow' : `Day ${idx + 1}`,
    state: pred.mostLikelyState,
    ...pred.probabilities
  }));

  // Use all data for charts but sample if too many days
  let chartData = predictions;
  if (predictions.length > 30) {
    const step = Math.ceil(predictions.length / 30);
    chartData = predictions.filter((_, idx) => idx % step === 0);
  }

  const evolutionData = chartData.map((pred, idx) => ({
    day: `Day ${pred.day}`,
    ...pred.probabilities
  }));

  const mostLikelyState = tableData[0].state;

  // Calculate average probabilities across all predictions
  const avgProbs = {};
  Object.keys(STATE_COLORS).forEach(state => {
    avgProbs[state] = (
      predictions.reduce((sum, pred) => sum + (pred.probabilities[state] || 0), 0) / predictions.length
    ).toFixed(3);
  });

  const pieData = Object.entries(avgProbs).map(([state, prob]) => ({
    name: state,
    value: parseFloat(prob)
  }));

  return (
    <>
      <GlobalStyle />
      <Section className="section prediction_results" id="prediction_results">
        <div className="prediction-container">
          <h1 className="prediction-title">🌤️ Weather Forecast</h1>
          <p className="prediction-subtitle">Markov chain predictions for the next {predictions.length} days</p>

          <div className="predictions-grid">
            {/* Evolution Chart */}
            <div className="prediction-card">
              <div className="card-title">📈 Probability Evolution</div>
              <p className="card-description">
                How state probabilities change over time
              </p>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={evolutionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => (value * 100).toFixed(1) + '%'} />
                    <Legend />
                    {Object.keys(STATE_COLORS).map(state => (
                      <Line
                        key={state}
                        type="monotone"
                        dataKey={state}
                        stroke={STATE_COLORS[state]}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Average Distribution Pie Chart */}
            <div className="prediction-card">
              <div className="card-title">🥧 Average Distribution</div>
              <p className="card-description">
                Overall probability across all {predictions.length} days
              </p>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${(value * 100).toFixed(0)}%`}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={STATE_COLORS[entry.name]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => (value * 100).toFixed(1) + '%'} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
                        {/* Forecast Table Overview */}
            <div className="prediction-card">
              <div className="card-title">📊 Overview</div>
              <p className="card-description">
                Forecast for the first {tableDaysToShow} days
              </p>
              <table className="forecast-table">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>State</th>
                    <th>Probability</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((day, idx) => {
                    const Icon = STATE_ICONS[day.state] || Sun;
                    return (
                      <tr key={idx}>
                        <td>{day.dayName}</td>
                        <td>
                          <div className="state-indicator">
                            <Icon size={16} color={STATE_COLORS[day.state]} />
                            {day.state}
                          </div>
                        </td>
                        <td>{(day[day.state] * 100).toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="summary-stats">
                <div className="stat-box">
                  <div className="stat-label">Most Likely</div>
                  <div className="stat-value">{mostLikelyState}</div>
                </div>
                <div className="stat-box">
                  <div className="stat-label">Total Days</div>
                  <div className="stat-value">{predictions.length}</div>
                </div>
                <div className="stat-box">
                  <div className="stat-label">Confidence</div>
                  <div className="stat-value">High</div>
                </div>
              </div>
            </div>

            {/* Daily Breakdown Bar Chart */}
            <div className="prediction-card">
              <div className="card-title">📊 State Distribution</div>
              <p className="card-description">
                Stacked probabilities for first {tableDaysToShow} days
              </p>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tableData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dayName" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => (value * 100).toFixed(1) + '%'} />
                    {Object.keys(STATE_COLORS).map(state => (
                      <Bar
                        key={state}
                        dataKey={state}
                        fill={STATE_COLORS[state]}
                        stackId="a"
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

const Section = styled.section`
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
`;

const STATE_COLORS = {
  Sunny: '#FFD700',
  PartlyCloudy: '#B0C4DE',
  Cloudy: '#A9A9A9',
  Windy: '#87CEEB',
  Rainy: '#4169E1',
  ThunderStorm: '#2C3E50'
};

const STATE_ICONS = {
  Sunny: Sun,
  PartlyCloudy: Cloud,
  Cloudy: CloudDrizzle,
  Windy: Wind,
  Rainy: CloudRain,
  ThunderStorm: CloudLightning
};

const GlobalStyle = createGlobalStyle`
  .prediction-container {
    width: 90%;
    height: inherit;
    padding: 40px 20px;
    background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%);
    border-radius: 8px;
  }

  .prediction-title {
    text-align: center;
    font-size: 28px;
    font-weight: 700;
    color: white;
    margin-bottom: 10px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .prediction-subtitle {
    text-align: center;
    color: rgba(255, 255, 255, 0.9);
    font-size: 14px;
    margin-bottom: 40px;
  }

  .predictions-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin: 0 auto;
  }

  .prediction-card {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 12px;
    padding: 25px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  }

  .card-title {
    font-size: 18px;
    font-weight: 700;
    color: #0052a3;
    margin-bottom: 15px;
  }

  .card-description {
    color: #666;
    margin-bottom: 15px;
    font-size: 13px;
  }

  .forecast-table {
    width: 100%;
    border-collapse: collapse;
  }

  .forecast-table th {
    background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%);
    color: white;
    padding: 12px;
    text-align: left;
    font-weight: 600;
    font-size: 13px;
  }

  .forecast-table td {
    padding: 10px 12px;
    border-bottom: 1px solid #e0e0e0;
    font-size: 13px;
  }

  .forecast-table tr:hover {
    background-color: #f5f5f5;
  }

  .forecast-table td:last-child {
    text-align: right;
    font-weight: 600;
    color: #0066cc;
  }

  .summary-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 12px;
    margin-top: 20px;
  }

  .stat-box {
    background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%);
    color: white;
    padding: 15px;
    border-radius: 8px;
    text-align: center;
  }

  .stat-label {
    font-size: 11px;
    opacity: 0.9;
    margin-bottom: 6px;
  }

  .stat-value {
    font-size: 18px;
    font-weight: 700;
  }

  .chart-wrapper {
    width: 100%;
    height: 280px;
  }

  .state-indicator {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    background: #f0f0f0;
    border-radius: 16px;
    font-weight: 600;
    color: #0052a3;
    font-size: 13px;
  }

  .loading {
    background: transparent;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    color: white;
    margin: 50px;
  }

  .loading-spinner-container {
    position: relative;
    width: 60px;
    height: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .loading-spinner {
    position: absolute;
    width: 60px;
    height: 60px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top: 4px solid #1e90ff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .loading-text {
    margin-top: 20px;
    font-size: 18px;
    font-weight: 500;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 768px) {
    .predictions-grid {
      grid-template-columns: 1fr;
    }

    .chart-wrapper {
      height: 250px;
    }
  }
`;