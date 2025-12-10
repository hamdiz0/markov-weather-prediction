import { useState } from 'react';
import { Sun, Cloud, CloudRain, Wind, CloudLightning, CloudDrizzle } from 'lucide-react';
import {styled, createGlobalStyle }  from 'styled-components';
import axios from 'axios';


const WEATHER_STATES = [
  { id: 'Sunny', label: 'Sunny', icon: Sun, color: '#FFD700' },
  { id: 'PartlyCloudy', label: 'Partly Cloudy', icon: Cloud, color: '#B0C4DE' },
  { id: 'Cloudy', label: 'Cloudy', icon: CloudDrizzle, color: '#A9A9A9' },
  { id: 'Windy', label: 'Windy', icon: Wind, color: '#87CEEB' },
  { id: 'Rainy', label: 'Rainy', icon: CloudRain, color: '#0040ffff' },
  { id: 'ThunderStorm', label: 'Thunder Storm', icon: CloudLightning, color: '#2C3E50' }
];

export default function WeatherStateSelector({ onSelect, matrixData ,onPredictionDataReady}) {
    const [selectedState, setSelectedState] = useState(null);
    const [days, setDays] = useState(5);

    const handleSelectState = (stateId) => {
      setSelectedState(stateId);
      if (onSelect) {
        onSelect(stateId);
      }
    };

    const apiUrl = `${import.meta.env.VITE_API_URL}/api/predict`

    const  handlePredict = async () => {

    if (!selectedState || !matrixData) {
        alert('Please select a weather state and ensure matrix data is loaded');
        return;
    }

    const predictionData = {
      currentState: selectedState,
      days: parseInt(days),
      matrixData: matrixData
    }

    try {
        const response = await axios.post(apiUrl, predictionData);
        const result = response.data;
        onPredictionDataReady(result);
        document.getElementById("prediction_results").scrollIntoView({ behavior: "smooth" })
    }catch (error) {
      console.error("Error fetching prediction data:", error);
    }
    }
    return (
      <>
        <GlobalStyle />
        <Section className="section today" id="today" >
          {matrixData &&
            <div className="weather-selector-container">
            <h2 className="weather-selector-title">Today's Weather</h2>
            <p className="weather-selector-subtitle">Have a look outside the window and select today's weather state</p>

            <div className="weather-grid">
              {WEATHER_STATES.map((state) => {
                const IconComponent = state.icon;
                const IconColor = state.color;
                const isSelected = selectedState === state.id;

                return (
                  <div
                    key={state.id}
                    className={`weather-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectState(state.id)}
                  >
                    <div className="weather-icon">
                      <IconComponent size={48} color={IconColor} strokeWidth={1.5} />
                    </div>
                    <div className="weather-label">{state.label}</div>
                  </div>
                );
              })}
            </div>

            {selectedState && (
              <div className="weather-selected-info">
                <p>Selected Weather State:</p>
                <div className="weather-selected-state">
                  {WEATHER_STATES.find(s => s.id === selectedState)?.label}
                </div>
              </div>
            )}

            <div className="weather-prediction-section">
              <label className="prediction-label">
                Predict the next <input 
                  type="number" 
                  min="1" 
                  max="30"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  className="prediction-input"
                /> days
              </label>
              <button 
                onClick={handlePredict}
                className="prediction-button"
              >
                Predict
              </button>
            </div>
          </div>
          }
          </Section>
      </>
    );
};
const Section = styled.section`
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
`;

const GlobalStyle = createGlobalStyle`
  .weather-selector-container {
    padding: 40px 20px;
    width: 80%;
    background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }

  .weather-selector-title {
    text-align: center;
    color: white;
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 10px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .weather-selector-subtitle {
    text-align: center;
    color: rgba(255, 255, 255, 0.9);
    font-size: 14px;
    margin-bottom: 40px;
  }

  .weather-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    max-width: 900px;
    margin: 0 auto;
  }

  .weather-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: rgba(255, 255, 255, 0.15);
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    color: white;
    text-align: center;
  }

  .weather-card:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.6);
    transform: translateY(-4px);
  }

  .weather-card.selected {
    background: rgba(255, 255, 255, 0.35);
    border-color: white;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    transform: scale(1.05);
  }

  .weather-icon {
    font-size: 48px;
    margin-bottom: 12px;
    animation: float 3s ease-in-out infinite;
  }

  .weather-card.selected .weather-icon {
    animation: bounce 0.6s ease;
  }

  .weather-label {
    font-size: 14px;
    font-weight: 600;
    text-transform: capitalize;
  }

  .weather-selected-info {
    text-align: center;
    margin-top: 30px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: white;
  }

  .weather-selected-info p {
    margin: 0;
    font-size: 14px;
  }

  .weather-selected-state {
    font-size: 18px;
    font-weight: 700;
    margin-top: 8px;
    text-transform: capitalize;
  }

  .weather-prediction-section {
    margin-top: 30px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  .prediction-label {
    color: white;
    font-size: 16px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .prediction-input {
    width: 60px;
    padding: 8px 12px;
    font-size: 16px;
    border: 2px solid rgba(255, 255, 255, 0.5);
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.15);
    color: white;
    font-weight: 600;
    text-align: center;
    transition: all 0.3s ease;
  }

  .prediction-input:focus {
    outline: none;
    border-color: white;
    background: rgba(255, 255, 255, 0.25);
  }

  .prediction-input::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }

  .prediction-button {
    padding: 10px 32px;
    font-size: 16px;
    font-weight: 700;
    color: white;
    background-color: #1e90ff;
    border: 2px solid white;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .prediction-button:hover {
    background-color: #1873cc;
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(30, 144, 255, 0.4);
  }

  .prediction-button:active {
    transform: scale(0.98);
  }
`;