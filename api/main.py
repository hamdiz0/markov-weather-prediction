from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv ; load_dotenv()

import os

from matrix import generate_matrix
from predict import generate_prediction

class DateRange(BaseModel):
    year: int
    month: int
    day: int

class UserData(BaseModel):
    station: str
    fromDate: DateRange
    toDate: DateRange

class NextStates(BaseModel): 
    Sunny : float
    PartlyCloudy : float
    Cloudy : float
    Windy : float
    Rainy : float
    ThunderStorm : float

class StatesData(BaseModel): 
    Sunny : NextStates
    PartlyCloudy : NextStates
    Cloudy : NextStates
    Windy : NextStates
    Rainy : NextStates
    ThunderStorm : NextStates   

class PredictionData(BaseModel):
    currentState : str
    days : int
    matrixData : StatesData


import warnings
warnings.filterwarnings('ignore')

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL")],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)


@app.get("/api")
def read_root():
    return {"Message": "Markov API is running"}

@app.post("/api/matrix")
async def matrix (body : UserData):
    station = body.station
    from_year = body.fromDate.year
    from_year_month = body.fromDate.month
    from_year_day = body.fromDate.day
    to_year = body.toDate.year
    to_year_month = body.toDate.month
    to_year_day = body.toDate.day
    print(body)
    return generate_matrix(station, from_year, from_year_month, from_year_day, to_year, to_year_month, to_year_day)

@app.post("/api/predict")
async def predict(body: PredictionData):
    current_state = body.currentState
    days = body.days
    matrix_data = body.matrixData
    result = generate_prediction(current_state, days, matrix_data)
    
    return result