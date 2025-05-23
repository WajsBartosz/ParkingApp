import os, sys, json, random, logging, argparse
from datetime import datetime

# Ensure project root is on PYTHONPATH for base_simulator import
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from base_simulator import BaseSimulator

# Read global LOG_LEVEL environment variable (default INFO)
log_level_name = os.getenv("LOG_LEVEL", "INFO").upper()
log_level = getattr(logging, log_level_name, logging.INFO)

# Configure this module’s logger at the resolved level
logger = logging.getLogger(__name__)
logger.setLevel(log_level)

# Infrared (IR) parking-spot simulator implementation
class IRSimulator(BaseSimulator):

    # Initialize base behavior and IR-specific parameters
    def __init__(self, config_path):
        super().__init__(config_path)
        cfg = self.config

        # Total number of IR beams in the sensor
        self.beam_count = cfg.get("beam_count", 8)
        # Minimum beam hits to consider spot occupied
        self.occupancy_threshold = cfg.get("occupancy_threshold", 6)

        # Time intervals (seconds) for free vs occupied sampling
        self.free_interval = cfg.get("free_interval", 5 * 60)
        self.occupied_interval = cfg.get("occupied_interval", 15 * 60)

        # Number of consecutive confirmations required to change state
        self.confirm_count = cfg.get("confirm_count", 3)

        # Initial sensor state and confirmation counter
        self.state = "FREE"
        self._consec = 0

        # Start sampling at free interval
        self.interval = self.free_interval

    # Generate and return a payload indicating current occupancy state
    def generate_payload(self) -> dict:
        # Simulate random beam hits (0 or 1) across beam_count beams
        hits = sum(random.choice([0, 1]) for _ in range(self.beam_count))

        # Transition logic: FREE -> OCCUPIED
        if self.state == "FREE":
            if hits >= self.occupancy_threshold:
                self._consec += 1
                logger.debug(f"FREE: hits={hits}, confirms={self._consec}/{self.confirm_count}")
                if self._consec >= self.confirm_count:
                    self.state = "OCCUPIED"
                    occupied = True
                    self._consec = 0
                    logger.info(f"[{self.sensor_id}] → OCCUPIED")
                else:
                    occupied = False
            else:
                # Reset confirmation counter on insufficient hits
                if self._consec:
                    logger.debug(f"FREE: reset confirms (hits={hits})")
                self._consec = 0
                occupied = False

        # Transition logic: OCCUPIED -> FREE
        else:
            if hits < self.occupancy_threshold:
                self._consec += 1
                logger.debug(f"OCCUPIED: hits={hits}, confirms_free={self._consec}/{self.confirm_count}")
                if self._consec >= self.confirm_count and hits == 0:
                    self.state = "FREE"
                    occupied = False
                    self._consec = 0
                    logger.info(f"[{self.sensor_id}] → FREE")
                else:
                    occupied = True
            else:
                # Reset confirmation counter on excessive hits
                if self._consec:
                    logger.debug(f"OCCUPIED: reset confirms_free (hits={hits})")
                self._consec = 0
                occupied = True

        # Adjust next sampling interval based on updated state
        self.interval = self.occupied_interval if self.state == "OCCUPIED" else self.free_interval

        # Prepare timestamp in local time
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # Construct message payload
        payload = {
            "spot_id": self.sensor_id,
            "occupied": occupied,
            "timestamp": now
        }

        # Log state and payload at appropriate levels
        logger.info(f"[{self.sensor_id}] State={self.state}, occupied={occupied}")
        logger.debug(f"[{self.sensor_id}] Payload: {json.dumps(payload)}")

        return payload

# Entry point: parse arguments, instantiate simulator, and run
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="IR parking-spot simulator")
    parser.add_argument("--config", required=True, help="Path to simulator config.json")
    args = parser.parse_args()

    simulator = IRSimulator(args.config)
    simulator.run()
