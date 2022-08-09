from distutils.command.build_scripts import first_line_re
import pandas as pd
import requests
import json
import io
import pandas as pd

def get_circuits(first_year, last_year):
    for year in range(first_year, last_year):
        url = f"http://ergast.com/api/f1/{year}/circuits.json"

        payload={}
        headers = {}

        response = requests.request("GET", url, headers=headers, data=payload)
        data = response.json()["MRData"]["CircuitTable"]["Circuits"]

        data_dict = {}
        for d in data:
            data_dict[d['Location']['country']] = [year, d['Location']['locality'], d['Location']['long'], d['Location']['lat']]
        df_year = pd.DataFrame.from_dict(data_dict, orient = 'index', columns= ['year', 'locality', 'long', 'lat'])
        if year == first_year:
            df = df_year
        else:
            df = pd.concat([df, df_year])

        return df

if __name__ == '__main__':
    df = get_circuits(1950, 2022)
    df.groupby(df.index).agg({'year': 'count', 'locality': 'nunique'}).to_json('circuits.json')
    # df.to_excel('circuits.xlsx')