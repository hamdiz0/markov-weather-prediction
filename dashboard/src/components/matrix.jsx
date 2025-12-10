import React, { useState, useEffect } from 'react';
import {styled, createGlobalStyle }  from 'styled-components';
import axios from 'axios';

import fullBackData from "../data/matrix.json";
import MatrixForm from './matrixForm.jsx';

const states = ['Sunny' , 'PartlyCloudy', 'Cloudy', 'Windy' , 'Rainy' , 'ThunderStorm'];

function Loading() {
  return (
    <div className="loading">
      <div className="loading-spinner-container">
        <div className="loading-spinner"></div>
      </div>
      <p className="loading-text">Loading ...</p>
    </div>
  );
}
export default function Matrix({ onDataReady }) {
    const [showTable, setShowTable] = useState("request");
    const [Data, setData] = useState(null);

    const handleGenerate = async (userData) => {
      setShowTable("loading");
      try {
        const apiUrl = `${import.meta.env.VITE_API_URL}/api/matrix`
        const response = await axios.post(apiUrl, userData);
        const data = response.data;
        setData(data);
        onDataReady(data);
        setShowTable("ready");
      } catch (error) {
        setData(fullBackData)
        onDataReady(fullBackData);
        setShowTable("ready");
      }
    }
    return (
        <Section className="section matrix" id="matrix" >
            <div className='matrix_options'></div>
            <MatrixForm onSubmit={handleGenerate} />
            {showTable == "loading" && <Loading />}
            {showTable == "ready" && <Table className="matrix-container">
              <Cell style={{backgroundColor:"#242424e3", color: "#dddddd"}}>Matrix</Cell>
              {
                states.map((key) => ( <Cell key={key}>{key}</Cell> ))
              }
              {
                Object.entries(Data).flatMap(([key, sub_data]) => (
                  <React.Fragment key={key}>
                    <Cell key={key}>{key}</Cell>
                    {Object.entries(sub_data).map(([sub_key, value]) => (
                      <Cell key={`${key}-${sub_key}`}>{value}</Cell>
                    ))}
                  </React.Fragment>
                ))
              }
            </Table>}
          <GlobalStyle />
        </Section>
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

const Table = styled.div`
  width: 80%;
  min-height: 450px;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(7, 1fr);
  background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%);
  gap: 8px;
  border-radius: 12px;
  padding: 25px;
  margin: 30px;
  box-shadow: 0 8px 32px rgba(0, 102, 204, 0.2);
`;

const Cell = styled.div`
  background-color: rgba(255, 255, 255, 0.95);
  color: #0052a3;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 102, 204, 0.2);
    background-color: white;
  }
`;

const GlobalStyle = createGlobalStyle`
  .matrix_container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .loading {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    color: white;
    margin: 50px;
    padding: 40px;
    border-radius: 12px;
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
    font-weight: 600;
    letter-spacing: 1px;
  }
  
  @keyframes spin {
    0% { 
      transform: rotate(0deg); 
    }
    100% { 
      transform: rotate(360deg); 
    }
  }
`;

