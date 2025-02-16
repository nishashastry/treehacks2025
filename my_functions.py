import os
import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'  # Disable oneDNN custom operations
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
import math
import pandas as pd
import numpy as np
import tensorflow as tf
import sklearn
from sklearn import preprocessing
from tensorflow.keras import layers
import keras
import seaborn as sns
import matplotlib.pyplot as plt

# Plotting style

from dataset import load_reader_dataset, load_mySugr_dataset, load_fitbit_dataset

# ## Load data from data sources

df = load_reader_dataset()

mysugr_df = load_mySugr_dataset()

fitbit_df = load_fitbit_dataset()
df = pd.concat([df, mysugr_df], ignore_index=True)

df = pd.concat([df, fitbit_df], ignore_index=True)

df.sort_values(by='Time', inplace=True)

# Keeping relevant features
using_features = ['Time', 'Glucose', 'Rapid Insulin', 'Long Insulin', 'Carbohydrates', 'GI', 'calories', 'bpm', 'distance']
glucose_df = df[using_features]
glucose_df = glucose_df.dropna(subset=using_features, how='all')

# Filtering date range
start_date = "2021/12/01 00:00"
end_date = "2022/04/08 00:00"
glucose_df = glucose_df[(glucose_df["Time"] <= end_date) & (glucose_df["Time"] >= start_date)]


glucose_only = glucose_df[["Glucose", "Time"]].dropna()
deltas = glucose_only['Time'].diff()
gaps = deltas[deltas > pd.Timedelta(minutes=20)]



ph_only = glucose_df[["Time", "distance", "calories", "bpm"]].copy().set_index('Time').resample('15T').agg(
    {
        'bpm':pd.Series.mean,
        'distance':pd.Series.mean,
        'calories':pd.Series.mean,
    }).reset_index()
total_ph_not_null = len(ph_only)
glucose_df["Hour"] = glucose_df.apply(lambda row: row["Time"].hour, axis=1)
using_features.append("Hour")

GI_valus = ["Low", "Medium", "High", "Very High"]
glucose_df["GI"] = glucose_df.apply(lambda row: row["GI"] if row["GI"] in GI_valus else np.nan, axis=1)

# Encode as ordinal features
enc = {
    "Low": 15,
    "Medium": 45,
    "High": 75,
    "Very High": 95,
    np.nan: 0
}
glucose_df["GI"] = glucose_df["GI"].map(enc)

# What we realy want to use is Glycemic load, calculated as (GI * grams_of_carbohydrates) / 100
glucose_df["Glycemic Load"] = glucose_df["GI"] * glucose_df["Carbohydrates"] / 100

using_features.remove("GI")
using_features.append("Glycemic Load")


def resample_data(in_df, min_freq=15):
    resampl_df = in_df.copy()
    resampl_df = resampl_df.set_index('Time').resample(f'{min_freq}T').agg(
        {
            'Glucose':pd.Series.mean,
            'Rapid Insulin':pd.Series.sum,
            'Long Insulin':pd.Series.sum,
            'Carbohydrates':pd.Series.sum,
            'Glycemic Load':pd.Series.sum,
            'bpm':pd.Series.mean,
            'distance':pd.Series.sum,
            'calories':pd.Series.sum,
            'Hour':pd.Series.mean
        }).reset_index()
    return resampl_df

ORIG_FREQ = 15
SAMPL_FREQ = 15
FREQ_CORRECTION = ORIG_FREQ // SAMPL_FREQ

glucose_df_resampled = resample_data(glucose_df, SAMPL_FREQ)

days = 6
roll_window_width = days * 24 * 60 // SAMPL_FREQ
glucose_df_resampled['Rapid Insulin 6d'] = (glucose_df_resampled['Rapid Insulin'].rolling(roll_window_width).sum() / days)
glucose_df_resampled['Rapid Insulin 6d'].replace(to_replace=np.nan, method='bfill', inplace=True)

using_features.append('Rapid Insulin 6d')

# Long insulin acts for approximately 24 hours, stretch the data across this period
glucose_df_resampled['Long Insulin'].replace(to_replace=0, method='ffill', inplace=True)


td = 5*60
# Peak activity time [minutes], 45-85 minutes
tp = 55
# Time constant of exponential decay
tau = tp*(1-tp/td)/(1-2*tp/td)
# Rise time factor
a = 2*tau/td
# Auxiliary scale factor
S = 1/(1-a+(1+a)*math.exp(-td/tau))

# Insulin activity function of time
# Ia(t) = (S/tau^2)*t*(1-t/td)*exp(-t/tau)
def insulin_activity(t):
    return (S/tau**2)*t*(1-t/td)*math.exp(-t/tau)

# Insulin on board function
# IOB(t) = 1-S*(1-a)*((t^2/(tau*td*(1-a)) - t/tau - 1)*exp(-t/tau)+1)
def insulin_on_board(t):
    return 1-S*(1-a)*( (t**2/(tau*td*(1-a)) - t/tau - 1)*math.exp(-t/tau)+1)

# 
iob = [insulin_on_board(x) for x in range(0, td)]
ia = [insulin_activity(x) for x in range(0, td)]


def insulin_on_board_vector(iob_window, dose):
    w_len = len(iob_window)
    result = [current_iob for current_iob in iob_window]
    for i in range(w_len):
        result[i] += dose * insulin_on_board(i * SAMPL_FREQ)
    return result

glucose_df_resampled["Rapid Insulin IOB"] = 0

max_n = len(glucose_df_resampled)

duration_samples = td // SAMPL_FREQ
for idx, data in glucose_df_resampled.iterrows():
    # Insulin injected
    if data["Rapid Insulin"] != 0:
        idx = int(idx)
        dur_end = int(min(idx + duration_samples, max_n))
        ins_dose = data["Rapid Insulin"]
        glucose_df_resampled.loc[slice(int(idx), dur_end), "Rapid Insulin IOB"] = \
            insulin_on_board_vector(glucose_df_resampled.loc[slice(int(idx), dur_end), "Rapid Insulin IOB"], ins_dose)

using_features.append("Rapid Insulin IOB")
MMOL_TO_MGDL = 18.016
def train_val_test_split(df_in):
    n = len(df_in)
    return df_in[0:int(n*0.7)].copy(), df_in[int(n*0.7):int(n*0.9)].copy(), df_in[int(n*0.9):].copy(), n

train_df, val_df, test_df, n = train_val_test_split(glucose_df_resampled)
num_features = glucose_df_resampled.shape[1]

def interpolate_gaps(in_df, method="linear"):
    if method in ["spline", "polynomial"]:
        in_df["Glucose"] = in_df["Glucose"].interpolate(method=method, order=2)
        if "bpm" in in_df.columns:
            in_df["bpm"] = in_df["bpm"].interpolate(method=method, order=2)
    else:
        in_df["Glucose"] = in_df["Glucose"].interpolate(method=method)
        if "bpm" in in_df.columns:
            in_df["bpm"] = in_df["bpm"].interpolate(method=method)

interpolate_gaps(train_df)
interpolate_gaps(val_df)

# Drop any nans from test dataset (we're not interpolating it to keep original data)
test_df = test_df.dropna(subset=["Glucose"])

def min_max_normalize(train_df, val_df, test_df, features):
    min_max_scaler = preprocessing.MinMaxScaler()
    train_df[features] = min_max_scaler.fit_transform(train_df[features])

    val_df[features] = min_max_scaler.transform(val_df[features])
    test_df[features] = min_max_scaler.transform(test_df[features])
    return min_max_scaler

min_max_scaler = min_max_normalize(train_df, val_df, test_df, [col for col in using_features if col != "Time"])


def bg_denormalize(norm_val, unit_to="mgdl"):
    orig = norm_val * 18.9
    if unit_to == "mgdl":
        orig *= MMOL_TO_MGDL
    return orig




