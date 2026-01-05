import pandas as pandas
import json
import requests
import io


def generate_matrix(station, from_year, from_year_month, from_year_day, to_year, to_year_month, to_year_day):
    try:
        url = (
            "https://mesonet.agron.iastate.edu/cgi-bin/request/asos.py?"
            f"network=TN__ASOS&station={station}&data=all&"
            f"year1={from_year}&month1={from_year_month}&day1={from_year_day}&"
            f"year2={to_year}&month2={to_year_month}&day2={to_year_day}&"
            "tz=Etc%2FUTC&format=onlycomma&latlon=no&elev=no&"
            "missing=null&trace=null&direct=no&report_type=3&report_type=4"
        )

        print("requesting data ...")

        response = requests.get(url)
        response.raise_for_status()
        df = pandas.read_csv(io.StringIO(response.text))
    except Exception as e:
        return {"error": str(e)}
    
    def is_windy(s,g):
        windy = False
        if s and s >= 20 : 
            windy = True
        elif g and g >= 25 :
            windy = True
        return windy

    def state(row):
        skyc_layers = [str(row[skyc]) for skyc in ['skyc1', 'skyc2', 'skyc3' , 'skyc4']]
        wx_code = str(row['wxcodes'])
        sknt = row['sknt']
        gust = row['gust']
        state = ""

        if "TS" in wx_code:
            state = "ThunderStorm" 
        elif "RA" in wx_code:
            state = "Rainy" 
        elif is_windy(sknt,gust):
            state = "Windy"
        elif any(x in skyc_layers for x in ["BKN","OVC"]):
            state = "Cloudy"
        elif any(x in skyc_layers for x in ["SCT"]):
            state = "PartlyCloudy"
        else:
            state = "Sunny"
        return state

    df_state = df.copy()
    df_state["state"] = df_state.apply(state , axis=1)

    # Convert form half-hourly to daily states
    print("Processing daily states ...")
    df_state['valid'] = pandas.to_datetime(df_state['valid'])
    df_state_indexed = df_state.set_index('valid')

    def get_daily_state(group):
        state_counts = group.value_counts()

        if 'ThunderStorm' in state_counts.index and state_counts['ThunderStorm'] >= 2: #1hour
            return 'ThunderStorm'

        if 'Rainy' in state_counts.index and state_counts['Rainy'] >= 3: #1.5 hours
            return 'Rainy'

        if 'Windy' in state_counts.index and state_counts['Windy'] >= 3: #1.5 hours
            return 'Windy'

        # For all other states, use most frequent
        return state_counts.index[0] if len(state_counts) > 0 else None

    df_state_daily = df_state_indexed['state'].resample('D').apply(get_daily_state)
    df_state_daily = df_state_daily.reset_index()
    df_state_daily.columns = ['date', 'state']
    df_state_daily = df_state_daily[df_state_daily['state'].notna()]


    print("Calculating transitions ...")

    # Transition from state_x to state_y counts
    df_state_daily['next_state'] = df_state_daily['state'].shift(-1)
    def transition_count(row,state,nstate):
        current_state = row['state']
        next_state = row['next_state']

        if (state == current_state) and (nstate == next_state): 
            return 1
        return 0

    transitions_dict={}

    states = df_state_daily['state'].unique()

    for state in states:
        sub_dict = {nstate: 0 for nstate in states} 
        for nstate in states:
            count=df_state_daily.apply(transition_count, args=(state,nstate), axis=1).sum()
            sub_dict[nstate] = int(count)
        transitions_dict[f"{state}"] = sub_dict

    # Total transitions from each state same as total occurrences of a state
    total_transitions_dict = df_state_daily['state'].value_counts().to_dict()

    print("Calculating transition probabilities ...")
    
    state_order = ['Sunny' , 'PartlyCloudy', 'Cloudy', 'Windy' , 'Rainy' , 'ThunderStorm']
    prob=0
    transition_prob_dict = {}
    sub_dict={}

    for s , total in total_transitions_dict.items():
        for state , transitions  in transitions_dict.items():
            if state == s:
                row_sum=0
                for nstate , count in transitions.items():
                    prob = round(count / total, 4)
                    sub_dict[nstate] = prob
                    row_sum += prob
                sub_dict["prob_sum"] = round(row_sum,4)
                transition_prob_dict[state] = sub_dict
            sub_dict={}

    #transition_matrix = pandas.DataFrame(transition_prob_dict).T
    #transition_matrix = transition_matrix.loc[state_order, state_order]
    #transition_matrix["prob_sum"] = transition_matrix.sum(axis=1)
    #print("\nTransition Matrix:")
    #print(transition_matrix)

    sorted_transition_dict = {key : {sub_key :transition_prob_dict[key][sub_key] for sub_key in state_order} for key in state_order}
    
    print("Done.")

    return sorted_transition_dict