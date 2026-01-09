# Weather-Markov

A probabilistic weather forecasting model using Markov Chains. This full-stack web application provides advanced weather state prediction for Tunisian meteorological stations by leveraging mathematical modeling with real-world ASOS data.

## Features

- **Dynamic Transition Matrix Generation**: Calculate weather transition probabilities from user-defined historical date ranges
- **Multi-Day Forecasting**: Predict weather state probabilities for up to 30 days
- **Interactive Visualizations**: View forecasts through area charts, pie charts, bar charts, and detailed tables
- **Real-Time Data**: Fetches live meteorological data from the ASOS API (Iowa State University)
- **Tunisian Station Support**: Works with stations like DTTA (Tunis-Carthage), DTMB (Monastir), and more

## Tech Stack

### Frontend
- **React.js**
- **Recharts**
- **Axios**

### Backend
- **FastAPI**
- **Pandas**
- **NumPy**
- **Pydantic**

## Mathematical Model

### Discrete Time Markov Chain (DTMC)

The core technology uses a stochastic model that predicts future weather states based only on the current state:

```
P(Xn+1 = j | Xn = i)
```

This represents the conditional probability of transitioning from state `i` to state `j`.

### Weather States (6 States)

| State | Description |
|-------|-------------|
| Sunny | Clear skies |
| PartlyCloudy | Scattered clouds (SCT) |
| Cloudy | Broken/Overcast clouds (BKN/OVC) |
| Windy | Wind speed >= 20kt or gusts >= 25kt |
| Rainy | Rain present (RA in wx codes) |
| ThunderStorm | Thunderstorm activity (TS in wx codes) |

### Transition Matrix (P)

The 6x6 stochastic transition matrix where each element `Pij` quantifies the probability of transitioning from state `i` to state `j`:

```
Pij = (number of transitions from state i to state j) / (total transitions from state i)
```

### Forecasting Formula

```
πn = π0 · P^n
```

Where:
- `π0`: Initial state probability vector (1x6)
- `P`: Transition matrix (6x6)
- `n`: Number of days into the future
- `πn`: Probability distribution for Day n

## Data Processing

### Data Source
Weather data is sourced from the **ASOS API** maintained by Iowa State University's Iowa Environmental Mesonet.

### Daily State Classification
Since ASOS provides half-hourly observations but our model requires daily states, the system applies priority-based discretization:

1. **ThunderStorm**: >= 1 hour of TS observations
2. **Rainy**: >= 1.5 hours of rain
3. **Windy**: >= 1.5 hours of high winds
4. **Other states**: Most frequent occurrence

The data contains mostly clear skies, so these values ensure significant weather events are prioritized.

## API Endpoints

### `POST /api/matrix`
Generate a transition matrix from historical weather data.

**Request Body:**
```json
{
  "station": "DTTA",
  "fromDate": { "year": 2020, "month": 1, "day": 1 },
  "toDate": { "year": 2024, "month": 12, "day": 31 }
}
```
Sending this request will return the transition matrix probabilities based on the specified date range for the selected station.

### `POST /api/predict`
Generate weather predictions based on current state and transition matrix.

**Request Body:**
```json
{
  "currentState": "Sunny",
  "days": 7,
  "matrixData": { ... }
}
```

This request will respond with the probabilistic weather forecast for the next specified number of days.

## Usage and execution steps

1. **Generate Matrix**: Select a weather station and date range to compute the transition matrix from historical data
2. **Select Current Weather**: Choose today's weather condition from the 6 available states
3. **View Forecast**: Analyze the probabilistic predictions through interactive charts and tables

## Key Achievements

- Successful integration of real-world meteorological data with mathematical modeling
- Implementation of a full-stack web architecture using React.js and FastAPI
- Dynamic calculation of the Transition Matrix (P) from user-defined historical data
- Adaptation to localized climatic tendencies for Tunisian weather stations

