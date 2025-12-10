import numpy as np

def generate_prediction(current_state, days, matrix_data):
    state_order = ['Sunny', 'PartlyCloudy', 'Cloudy', 'Windy', 'Rainy', 'ThunderStorm']
    Pi_0 = np.array([1 if s == current_state else 0 for s in state_order], dtype=float)
    
    transition_matrix = np.zeros((6, 6))
    for i, state in enumerate(state_order):
        nstates = getattr(matrix_data, state)
        for j, nstate in enumerate(state_order):
            prob = getattr(nstates, nstate)
            transition_matrix[i][j] = prob
    
    predictions = []
    for day in range(days):
        Pi_day = Pi_0 @ np.linalg.matrix_power(transition_matrix, day + 1)
        Pi_day = Pi_day / np.sum(Pi_day)
        
        most_likely_idx = np.random.choice(len(state_order), p=Pi_day)
        most_likely_state = state_order[most_likely_idx]
        
        predictions.append({
            "day": day + 1,
            "mostLikelyState": most_likely_state,
            "probabilities": {state: float(prob) for state, prob in zip(state_order, Pi_day)}
        })
    
    return {"predictions": predictions}