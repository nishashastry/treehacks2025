import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
import tensorflow as tf
import pandas as pd
import random


# In another Python script (e.g., `another_script.py`)
# from my_functions import bg_denormalize
import numpy as np
# Call the function

# print(test_data)
# # Load the model
model = tf.keras.models.load_model("models/lstm_2h_Glucose_Rapid Insulin IOB_Carbohydrates.keras")
# # Use it for predictions
# input_data = test_data

# print("shape")
# print(test_data_df.shape)

# import pandas as pd
# import numpy as np
MMOL_TO_MGDL = 18.016

# Load the CSV
df = pd.read_csv("all_test_data.csv")

# Create a dictionary to store reshaped examples
reshaped_data = {}
def bg_denormalize(norm_val, unit_to="mgdl"):
    orig = norm_val * 23.979
    if unit_to == "mgdl":
        orig *= MMOL_TO_MGDL
    return orig


random_number = random.randint(0, 10)
# Extract data for each Example_ID and reshape
for example_id in df["Example_ID"].unique():
    example_data = df[df["Example_ID"] == example_id].drop(columns=["Example_ID"]).values  # Remove ID column
    reshaped_data[example_id] = example_data.reshape(1, 20, 3)  # Reshape to (1, 20, 3)

# Example: Predict using the first example
inputs = reshaped_data[random_number]  # Select Example_ID = 1
lstm_predictions = model.predict(inputs)

print("Prediction for Example 1:", (lstm_predictions)[0][0])
print(bg_denormalize(lstm_predictions)[0][0])
