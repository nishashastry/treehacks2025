import tensorflow as tf

# Load the model
model = tf.keras.models.load_model("models/lstm_2h_Glucose_Rapid Insulin IOB_Carbohydrates")

# Use it for predictions
input_data = 
predictions = model.predict(input_data)
print(predictions)
