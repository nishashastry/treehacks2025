import os
import pandas as pd
import numpy as np
import json

def load_reader_dataset():
    reader_data = "data/reader_data"
    exports = [os.path.join(reader_data, export) for export in os.listdir(reader_data)]
    exports.sort(reverse=False)

    df = pd.read_csv(exports[0], sep="\t")
    for export in exports[1:]:
        df = pd.concat([df, pd.read_csv(export, sep="\t")])

    # Exports usually overlap, so drop the duplicates
    df.drop_duplicates(inplace=True)

    # Dropping column which aren't used
    df.drop(['Non-numeric Food', 'Non-numeric Long-Acting Insulin', 'Non-numeric Rapid-Acting Insulin',
             'Notes', 'Ketone (mmol/L)', 'User Change Insulin (units)', 'Correction Insulin (units)', 'ID', 'Meal Insulin (units)'],
            axis=1, inplace=True)

    df.rename(columns={'Rapid-Acting Insulin (units)': 'Rapid Insulin',
                       'Carbohydrates (grams)': 'Carbohydrates',
                       'Long-Acting Insulin (units)': 'Long Insulin'},
              inplace=True)

    df['Time'] = pd.to_datetime(df['Time'], format="%Y/%m/%d %H:%M")
    df.sort_values(by='Time', inplace=True)

    # Only considering Historical Glucose (reliable 15min measurements) - we're not using Scan Glucose column
    df.rename(columns={'Historic Glucose (mmol/L)': 'Glucose'}, inplace=True)

    # Since 2022/01/09 00:00 we use mySugr to keep track of insulin and Carbohydrates, so drop any data after this date
    df.loc[df['Time'] >= "2022/01/09 00:00", ['Rapid Insulin', 'Long Insulin', 'Carbohydrates']] = np.nan

    return df


def load_mySugr_dataset():
    mySugr_data = "data/mySugr_data/2022_01_09-2022_04_25_export.csv"
    mysugr_df = pd.read_csv(mySugr_data, sep=",")

    # Keeping only the relevant columns
    mysugr_df = mysugr_df[['Date', 'Time', 'Tags', 'Basal Injection Units', 'Insulin (Meal)', 'Insulin (Correction)',
                           'Meal Carbohydrates (Grams, Factor 1)', 'Meal Descriptions', 'Body weight (kg)', 'Food type']]

    mysugr_df["Rapid Insulin"] = mysugr_df[["Insulin (Meal)", "Insulin (Correction)"]].apply(
        lambda x: x["Insulin (Correction)"] if np.isnan(x["Insulin (Meal)"]) else x["Insulin (Meal)"], axis=1
    )

    mysugr_df.rename(columns={'Basal Injection Units': 'Long Insulin',
                              'Meal Carbohydrates (Grams, Factor 1)': 'Carbohydrates',
                              'Meal Descriptions': 'GI'},
                     inplace=True)

    mysugr_df["Time"] = pd.to_datetime(mysugr_df["Date"] + " " + mysugr_df["Time"], format="%b %d, %Y %I:%M:%S %p")
    mysugr_df.sort_values(by='Time', inplace=True)
    return mysugr_df


def read_fitbit_json_export(export_file, export_type):
    with open(export_file, "r") as f:
        j = json.load(f)
    df_read = pd.json_normalize(j)
    df_read["dateTime"] = pd.to_datetime(df_read["dateTime"], format="%m/%d/%y %H:%M:%S")

    if export_type == "heart":
        df_read.rename(columns={"value.bpm": "bpm"}, inplace=True)
        df_read.drop("value.confidence", axis=1, inplace=True)
    elif export_type == "calories":
        df_read.rename(columns={"value": "calories"}, inplace=True)
        df_read["calories"] = df_read["calories"].astype(float)
    elif export_type == "distance":
        df_read.rename(columns={"value": "distance"}, inplace=True)
        df_read["distance"] = df_read["distance"].astype(int)
        # Convert from centimeters to meters
        df_read["distance"] = df_read["distance"] / 100
    else:
        raise Exception("Export type not recognized")
    return df_read


def load_fitbit_dataset():
    fitbit_data = "data/fitbit_data/2022_04_25_all_time_export/Physical Activity/"
    calories_exports = sorted([os.path.join(fitbit_data, export) for export in os.listdir(fitbit_data) if "calories" in export])

    distance_exports = sorted([os.path.join(fitbit_data, export) for export in os.listdir(fitbit_data) if "distance" in export])

    heart_rate_exports = sorted([os.path.join(fitbit_data, export) for export in os.listdir(fitbit_data)
                                 if "heart_rate-" in export and not "resting" in export])

    df_fitbit = read_fitbit_json_export(calories_exports[0], "calories")
    for export in calories_exports[1:]:
        df_fitbit = pd.concat([df_fitbit, read_fitbit_json_export(export, "calories")], ignore_index=True)
    for export in distance_exports:
        df_fitbit = pd.concat([df_fitbit, read_fitbit_json_export(export, "distance")], ignore_index=True)
    for export in heart_rate_exports:
        df_fitbit = pd.concat([df_fitbit, read_fitbit_json_export(export, "heart")], ignore_index=True)

    # Change to 1 minute frequency, to lower amount of rows
    df_fitbit = df_fitbit.set_index('dateTime').resample('1T').agg(
        {
            'bpm': pd.Series.mean,
            'distance': pd.Series.sum,
            'calories': pd.Series.sum
        }
    ).reset_index()

    df_fitbit.rename(columns={"dateTime": "Time"}, inplace=True)
    df_fitbit.sort_values(by='Time', inplace=True)
    return df_fitbit
import os
import pandas as pd
