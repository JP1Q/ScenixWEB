import paho.mqtt.client as mqtt
import json

# MQTT broker details
broker_address = "Mqtt.portabo.cz"
broker_port = 8883
mqtt_user = "hackithon"
mqtt_password = "zuk8uy9aZXU2wM9trqqA"

# Callback when connected to MQTT broker
def on_connect(client, userdata, flags, rc):
    print("Connected with result code " + str(rc))
    # Subscribe to topics
    client.subscribe("#")

# Callback when a message is received from MQTT broker
def on_message(client, userdata, msg):
    print("Received message from topic:", msg.topic)
    try:
        # Decode JSON data
        data = json.loads(msg.payload.decode("utf-8"))
        # Print decoded data
        print(json.dumps(data, indent=4))
    except Exception as e:
        print("Error decoding JSON:", e)

# Create MQTT client
client = mqtt.Client()
client.username_pw_set(username=mqtt_user, password=mqtt_password)

# Assign callbacks
client.on_connect = on_connect
client.on_message = on_message

# Connect to broker
client.connect(broker_address, broker_port, 60)

# Loop forever to handle incoming messages
client.loop_forever()
