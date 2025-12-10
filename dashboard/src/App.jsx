import { useState , useEffect } from 'react'
import './App.css'

import Matrix from './components/matrix.jsx'
import Today from './components/today.jsx'
import PredictionResults from './components/graph.jsx'

function App() {
  const [MatrixData , setMatrixData] = useState(null);
  const [PredictionData, setPredictionData] = useState(null);

  const handleMatrixData = (data) => {
    setMatrixData(data);
  }

  const handlePredictionData = (data) => {
    setPredictionData(data);
  }

  return (
    <div className="main">
      <Matrix onDataReady={handleMatrixData} />
      <Today matrixData={MatrixData} onPredictionDataReady={handlePredictionData} />
      <PredictionResults predictionData={PredictionData} />
    </div>
  )
}

export default App
