import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
import os

class GlucosePredictor:
    def __init__(self):
        """
        Initializes the Glucose Predictor by loading the trained LSTM model.
        """
        #self.base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # Move out of src/
        #self.model_path = os.path.join(self.base_dir, "models", "lstm_2h_Glucose_Rapid Insulin IOB_Carbohydrates.keras")
        #self.model = load_model(self.model_path)  # Load the LSTM model
    
    def predict_next_2h(self, input_data):
        """
        Predicts glucose levels 2 hours ahead based on input data.

        :param input_data: List of past glucose readings.
        :return: Predicted glucose level.
        """
        return #{"predicted_glucose": float(prediction), "action": action}

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
