import json, threading, queue, time, os
import paho.mqtt.client as mqtt
from typing import Callable

class MQTTBus:
  def __init__(self, url: str, client_id: str = "ses-backend"):
    assert url.startswith("mqtt://")
    hostport = url[7:]
    host, port = (hostport.split(":")[0], int(hostport.split(":")[1])) if ":" in hostport else (hostport, 1883)
    
    self.client = mqtt.Client(client_id=client_id, clean_session=True)
    
    mqtt_user = os.getenv("MQTT_USER")
    mqtt_pass = os.getenv("MQTT_PASS")
    if mqtt_user and mqtt_pass:
      self.client.username_pw_set(mqtt_user, mqtt_pass)
      print(f"MQTT using credentials: {mqtt_user}")
    
    self.client.on_connect = self._on_connect
    self.client.on_message = self._on_message
    self.client.connect(host, port, keepalive=60)
    self.handlers = []
    self.outbox = queue.Queue()
    threading.Thread(target=self._loop_forever, daemon=True).start()

  def _loop_forever(self):
    while True:
      try:
        self.client.loop(timeout=1.0)
        while not self.outbox.empty():
          topic, payload, retain = self.outbox.get_nowait()
          self.client.publish(topic, payload, qos=1, retain=retain)
      except Exception as e:
        print(f"MQTT loop error: {e}")
        time.sleep(1)

  def _on_connect(self, client, userdata, flags, rc):
    if rc == 0:
      print("MQTT connected successfully - subscribing to topics")
      # Konkrétní subscription témata (ne patterns)
      client.subscribe("shellypro1pm-ec6260828c90/status", qos=1)
      client.subscribe("shellypro2-2cbcbb9e7908/status", qos=1) 
      client.subscribe("shellypro3em63-2cbcbbb8318c/status/em:0", qos=1)
      client.subscribe("shellypro1pm-ec6260828c90/status", qos=1)
      client.subscribe("shellypro2-2cbcbb9e7908/status", qos=1)
      client.subscribe("home/tele/#", qos=1)
      client.subscribe("home/plan/#", qos=1)
      client.publish("home/status/backend", "online", qos=1, retain=True)
      print("MQTT subscriptions completed")
    else:
      print(f"MQTT connection failed with code {rc}")

  def _on_message(self, client, userdata, msg):
    print(f"MQTT message: {msg.topic}")
    try: 
      payload = json.loads(msg.payload.decode("utf-8"))
    except Exception: 
      payload = msg.payload.decode("utf-8")
    
    for h in self.handlers:
      try: 
        h(msg.topic, payload)
      except Exception as e:
        print(f"MQTT handler error: {e}")

  def on(self, handler: Callable[[str, dict], None]): self.handlers.append(handler)
  def pub(self, topic: str, obj, retain: bool = False):
    self.outbox.put((topic, json.dumps(obj), retain))
