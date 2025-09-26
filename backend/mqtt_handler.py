def handle_mqtt_message(topic: str, payload):
    global power_data, shelly_data
    print(f"MQTT received: {topic}")
    
    # Zalogovat celý payload pro debugging
    if isinstance(payload, dict):
        print(f"Payload keys: {list(payload.keys())}")
        
        # Shelly3EM data
        if "shellypro3em63" in topic and "status" in topic:
            # Zkontrolovat všechny možné klíče
            for key in payload.keys():
                if key.startswith("em"):
                    em_data = payload[key]
                    if isinstance(em_data, dict) and "total_act_power" in em_data:
                        total_power = em_data["total_act_power"]
                        print(f"Found power data: {total_power}W")
                        
                        power_data.update({
                            "grid": total_power / 1000,  # kW
                            "pv": max(0, -total_power / 1000) if total_power < 0 else 0,
                            "timestamp": time.time(),
                            "raw_power": total_power
                        })
                        break
    
    shelly_data[topic] = payload
