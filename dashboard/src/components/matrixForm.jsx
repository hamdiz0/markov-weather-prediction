import { useState } from 'react';
import { createGlobalStyle } from 'styled-components';

const STATIONS = {
  "DTKA": "Tabarka",
  "DTMB": "Monastir",
  "DTNH": "Enfidha",
  "DTTA": "Tunis",
  "DTTB": "Bizerte",
  "DTTF": "Gafsa",
  "DTTJ": "Djerba",
  "DTTK": "Kairouan",
  "DTTL": "Kelibia",
  "DTTN": "Jendouba",
  "DTTR": "El Borma",
  "DTTX": "Sfax",
  "DTTZ": "Tozeur"
};


export default function MatrixForm({ onSubmit }) {
  const [station, setStation] = useState("DTTA");
  const [fromDate, setFromDate] = useState("2020-01-01");
  const [toDate, setToDate] = useState("2025-12-01");

  const handleSubmit = () => {
    const [fromYear, fromMonth, fromDay] = fromDate.split('-');
    const [toYear, toMonth, toDay] = toDate.split('-');

    const userData = {
      station,
      fromDate: {
        year: parseInt(fromYear),
        month: parseInt(fromMonth),
        day: parseInt(fromDay)
      },
      toDate: {
        year: parseInt(toYear),
        month: parseInt(toMonth),
        day: parseInt(toDay)
      }
    };

    onSubmit(userData);
  };

  return (
    <>
      <GlobalStyle />
      <div className="matrix-form-container">
        <h2 className="matrix-form-title">Matrix Generator</h2>
        <div className="matrix-form">
          
          <div className="matrix-form-group">
            <label className="matrix-form-label">Station</label>
            <select 
              value={station} 
              onChange={(e) => setStation(e.target.value)}
              className="matrix-form-select"
            >
              {Object.entries(STATIONS).map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="matrix-form-group">
            <label className="matrix-form-label">Start Date</label>
            <input 
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="matrix-form-input"
            />
          </div>

          <div className="matrix-form-group">
            <label className="matrix-form-label">End Date</label>
            <input 
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="matrix-form-input"
            />
          </div>

          <button onClick={handleSubmit} className="matrix-form-button">
            Generate Matrix
          </button>
        </div>
      </div>
    </>
  );
}

const GlobalStyle = createGlobalStyle`
  .matrix-form-container {
    width: 80%;
    padding: 40px 20px;
    background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }

  .matrix-form-title {
    text-align: center;
    color: white;
    margin-bottom: 30px;
    font-size: 28px;
    font-weight: 700;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .matrix-form {
    display: flex;
    flex-direction: row;
    gap: 20px;
    flex-wrap: wrap;
    align-items: flex-end;
    max-width: 900px;
    margin: 0 auto;
  }

  .matrix-form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
    min-width: 150px;
  }

  .matrix-form-label {
    font-weight: 600;
    color: white;
    font-size: 14px;
  }

  .matrix-form-select {
    padding: 10px;
    font-size: 14px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 6px;
    background-color: rgba(255, 255, 255, 0.15);
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s ease;
    color: rgb(30,30,30);
  }

  .matrix-form-select:hover {
    background-color: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.6);
  }

  .matrix-form-select:focus {
    outline: none;
    background-color: rgba(255, 255, 255, 0.35);
    border-color: white;
  }

  .matrix-form-input {
    padding: 10px;
    font-size: 14px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 6px;
    background-color: rgba(255, 255, 255, 0.15);
    cursor: pointer;
    color: white;
    font-weight: 500;
    transition: all 0.3s ease;
  }

  .matrix-form-input:hover {
    background-color: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.6);
  }

  .matrix-form-input:focus {
    outline: none;
    background-color: rgba(255, 255, 255, 0.35);
    border-color: white;
  }

  .matrix-form-button {
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
    margin-right: 35%;
    margin-left: 35%;
    margin-top: 25px;
    width: 30%;
  }

  .matrix-form-button:hover {
    background-color: #1873cc;
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(30, 144, 255, 0.4);
  }

  .matrix-form-button:active {
    transform: scale(0.98);
  }
`;