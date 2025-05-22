import os, sys, json, signal, logging, subprocess
from pathlib import Path
from time import sleep

# Configure root logger using LOG_LEVEL environment variable (default INFO)
#  - Log format: timestamp, level, logger name, message
#  - Output directed to stdout for Docker compatibility
log_level_name = os.getenv("LOG_LEVEL", "INFO").upper()
log_level = getattr(logging, log_level_name, logging.INFO)
logging.basicConfig(
    level=log_level,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("run_simulators")

# Store active simulator processes:
#   key: instance name (e.g. "sensor_ir-01")
#   value: dict with keys "proc" (Popen), "script" (Path), "config" (Path)
processes = {}

# Validate that the given config file contains a non-empty connection_string
def validate_connection_string(cfg_path: Path):
    try:
        cfg = json.loads(cfg_path.read_text())
        if not cfg.get("connection_string", "").strip():
            logger.error(f"Invalid or missing connection_string in {cfg_path}")
            return False
        return True
    except Exception as e:
        logger.error(f"Failed to validate config {cfg_path}: {e}")
        return False

# Discover sensor simulator scripts and their config files under base directory
# Returns list of tuples: (instance_name, script_path, config_path)
def find_sensors(base: Path):
    result = []
    for folder in sorted(base.iterdir()):
        if not folder.is_dir() or not folder.name.startswith("sensor_"):
            continue

        # Expect a simulator script named <folder.name>_simulator.py
        script = folder / f"{folder.name}_simulator.py"
        if not script.exists():
            logger.warning(f"Missing script in {folder.name}, skipping")
            continue

        # Collect and validate each config-*.json file
        for cfg in sorted(folder.glob("config-*.json")):
            if not validate_connection_string(cfg):
                continue
            suffix = cfg.stem.split("-", 1)[-1]
            instance = f"{folder.name}-{suffix}"
            result.append((instance, script, cfg))
    return result

# Launch a simulator subprocess for the given instance
# - name: unique identifier for logging
# - script: path to the simulator Python file
# - cfg: path to its config JSON
def launch(name, script: Path, cfg: Path):
    cmd = [sys.executable, str(script), "--config", str(cfg)]
    logger.info(f"→ Launching {name}: {' '.join(cmd)}")
    p = subprocess.Popen(
        cmd,
        cwd=Path(__file__).parent,     # Set working directory to project root
        stdout=subprocess.PIPE,        # Capture stdout
        stderr=subprocess.STDOUT,      # Merge stderr into stdout
        text=True                      # Decode output as text
    )
    processes[name] = {"proc": p, "script": script, "config": cfg}

# Handle termination signals by shutting down all simulator processes
def shutdown(sig, frame):
    logger.info("Shutting down all simulators…")
    for name, entry in processes.items():
        p = entry["proc"]
        logger.info(f" - Terminating {name} (pid {p.pid})")
        p.terminate()

    # Wait up to 5 seconds for each to exit, else force kill
    for name, entry in processes.items():
        p = entry["proc"]
        try:
            p.wait(timeout=5)
            logger.info(f" - {name} exited ({p.returncode})")
        except subprocess.TimeoutExpired:
            logger.warning(f" - {name} did not exit, killing")
            p.kill()
    sys.exit(0)

# Monitor active processes: log output and restart if any exit unexpectedly
def monitor():
    while True:
        for name, entry in list(processes.items()):
            p = entry["proc"]
            # Read next line without blocking
            line = p.stdout.readline()
            if line:
                logger.info(f"[{name}] {line.rstrip()}")

            # If process has exited, log remaining output and restart
            if p.poll() is not None:
                remaining = p.stdout.read()
                if remaining:
                    logger.error(f"[{name} OUTPUT BEFORE CRASH]\n{remaining}")
                logger.warning(f"{name} died ({p.returncode}), restarting…")
                sleep(1)
                launch(name, entry["script"], entry["config"])
        sleep(0.1)

# Main orchestrator routine:
#   - Register shutdown handlers
#   - Discover and launch all sensor simulators
#   - Delay to allow backend subscriptions
#   - Enter monitoring loop
def main():
    base = Path(__file__).parent

    # Setup signal handlers for clean shutdown
    signal.signal(signal.SIGINT, shutdown)
    signal.signal(signal.SIGTERM, shutdown)

    # Discover sensor instances
    sensors = find_sensors(base)
    if not sensors:
        logger.error("No sensor_*/config-*.json found")
        sys.exit(1)

    # Launch all discovered simulators
    for name, script, cfg in sensors:
        launch(name, script, cfg)

    # Wait before starting monitor to ensure subscribers are ready
    INITIAL_SYNC_DELAY = 10
    logger.info(f"Waiting {INITIAL_SYNC_DELAY}s to subscribe...")
    sleep(INITIAL_SYNC_DELAY)

    # Begin continuous monitoring and restart loop
    monitor()

# Execute main() when invoked directly
if __name__ == "__main__":
    main()
