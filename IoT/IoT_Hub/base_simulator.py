import os, json, time, logging, threading
from datetime import datetime
from jsonschema import validate, ValidationError
from azure.iot.device import IoTHubDeviceClient, Message

# Configure module logger from LOG_LEVEL environment variable (default INFO)
log_level_name = os.getenv("LOG_LEVEL", "INFO").upper()
log_level = getattr(logging, log_level_name, logging.INFO)
logger = logging.getLogger(__name__)
logger.setLevel(log_level)

# JSON Schema for validating simulator configuration files
CONFIG_SCHEMA = {
    "type": "object",
    "properties": {
        "connection_string": {"type": "string", "minLength": 1},
        "sensor_id": {"type": "string", "minLength": 1}
    },
    "required": ["connection_string", "sensor_id"]
}

# Base class for IoT sensor simulators
# Handles configuration loading/validation, client setup, messaging, and retries
class BaseSimulator:

    # Initialize simulator with a path to its JSON config file
    def __init__(self, config_path: str):
        # Load and validate JSON configuration
        try:
            with open(config_path, 'r') as f:
                cfg = json.load(f)
            validate(instance=cfg, schema=CONFIG_SCHEMA)
        except FileNotFoundError:
            logger.error(f"Config file not found: {config_path}")
            raise
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in config {config_path}: {e}")
            raise
        except ValidationError as e:
            logger.error(f"Config validation error in {config_path}: {e.message}")
            raise

        # Assign configuration values
        self.config = cfg
        self.connection_string = cfg["connection_string"]
        self.sensor_id = cfg["sensor_id"]
        # Optional timing parameters with defaults
        self.interval = cfg.get("interval_seconds", 10)
        self.heartbeat = cfg.get("heartbeat_seconds", 300)
        self._running = True

        # Create IoT Hub client from the connection string
        self.client = IoTHubDeviceClient.create_from_connection_string(
            self.connection_string
        )
        logger.info(f"[{self.sensor_id}] Simulator initialized")

    # Internal send method with exponential backoff retry
    def _send(self, payload: dict, props: dict):
        if not self._running:
            return

        # Construct IoT Hub message
        msg = Message(json.dumps(payload))
        msg.content_type = "application/json"
        msg.content_encoding = "utf-8"
        msg.custom_properties["sensor_id"] = self.sensor_id
        for key, value in props.items():
            msg.custom_properties[key] = str(value)

        # Retry on failure with exponential backoff
        max_retries = 5
        delay = 1
        for attempt in range(1, max_retries + 1):
            try:
                self.client.send_message(msg)
                logger.info(f"[{self.sensor_id}] Sent {props.get('type')} (attempt {attempt})")
                break
            except Exception as e:
                logger.warning(f"[{self.sensor_id}] Send failed (attempt {attempt}): {e}")
                if attempt == max_retries:
                    logger.error(f"[{self.sensor_id}] Max retries reached, aborting send")
                else:
                    time.sleep(delay)
                    delay = min(delay * 2, 30)

    # Start a background thread to send heartbeat messages periodically
    def start_heartbeat(self):
        def heartbeat_loop():
            while self._running:
                timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                payload = {
                    "sensor_id": self.sensor_id,
                    "type": "heartbeat",
                    "timestamp": timestamp
                }
                logger.debug(f"[{self.sensor_id}] Sending heartbeat: {json.dumps(payload)}")
                self._send(payload, {"type": "heartbeat"})
                time.sleep(self.heartbeat)

        thread = threading.Thread(target=heartbeat_loop, daemon=True)
        thread.start()
        logger.info(f"[{self.sensor_id}] Heartbeat thread started")

    # Main run loop: start heartbeat and send data messages at regular intervals
    def run(self):
        self.start_heartbeat()
        try:
            while self._running:
                data = self.generate_payload()
                self._send(data, {"type": "data"})
                time.sleep(self.interval)
        except KeyboardInterrupt:
            logger.info(f"[{self.sensor_id}] Keyboard interrupt received, stopping")
        finally:
            self._running = False
            try:
                self.client.shutdown()
                logger.info(f"[{self.sensor_id}] Client shutdown complete")
            except Exception:
                logger.warning(f"[{self.sensor_id}] Error during client shutdown")

    # Abstract method to be overridden by subclasses for sensor-specific payloads
    def generate_payload(self) -> dict:
        raise NotImplementedError
