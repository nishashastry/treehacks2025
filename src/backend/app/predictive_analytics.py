import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
import tensorflow as tf
import pandas as pd
import random

class GlucosePredictor:
    def __init__(self):
        """
        Initializes the Glucose Predictor by loading the trained LSTM model.
        """
        self.base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # Move out of src/
        self.model_path = os.path.join(self.base_dir, "models", "lstm_2h_Glucose_Rapid Insulin IOB_Carbohydrates.keras")
        self.model = load_model(self.model_path)  # Load the LSTM model
        self.test = pd.read_csv("all_test_data.csv")

    def predict_next_2h(self, input_data):
        """
        Predicts glucose levels 2 hours ahead based on input data.

        :param input_data: List of past glucose readings.
        :return: Predicted glucose level.
        """
        MMOL_TO_MGDL = 18.016
        reshaped_data = {}
        def bg_denormalize(norm_val, unit_to="mgdl"):
            orig = norm_val * 23.979
            if unit_to == "mgdl":
                orig *= MMOL_TO_MGDL
            return orig


        random_number = random.randint(0, 10)
        # Extract data for each Example_ID and reshape
        for example_id in self.test["Example_ID"].unique():
            example_data = self.test[self.test["Example_ID"] == example_id].drop(columns=["Example_ID"]).values  # Remove ID column
            reshaped_data[example_id] = example_data.reshape(1, 20, 3)  # Reshape to (1, 20, 3)

        inputs = reshaped_data[random_number]  # Select Example_ID = 1
        lstm_predictions = self.model.predict(inputs)
        converted_pred = bg_denormalize(lstm_predictions)[0][0]

        def generate_action_suggestion(self, predicted_value):
            """
            Provides action recommendations based on glucose levels
            Source for info: https://www.mayoclinic.org/diseases-conditions/hyperglycemia/symptoms-causes/syc-20373631
            
            """
            if predicted_value < 70:
                return "Low glucose detected! Consider having a small snack with carbohydrates."
            elif 70 <= predicted_value <= 180:
                return "Glucose level is stable. Maintain normal dietary and exercise routines."
            else:
                return "High glucose alert! Consider insulin intake or consulting a doctor."

        action = generate_action_suggestion(converted_pred)
        return {"predicted_glucose": float(converted_pred), "action": action}

    