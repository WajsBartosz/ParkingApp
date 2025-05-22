import os, sys, json
from pathlib import Path

# Terminate execution with an error message
def die(msg):
    print(f"ERROR: {msg}", file=sys.stderr)
    sys.exit(1)

# Parse devices.conf into a mapping of sensor types to connection strings
def load_devices(conf_path: Path):
    # Ensure the configuration file exists
    if not conf_path.is_file():
        die(f"devices.conf not found at {conf_path}")

    device_map = {}
    # Read each line, skipping blanks and comments
    for raw in conf_path.read_text().splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        # Require a key=value format
        if "=" not in line:
            print(f"Skipping invalid line: {raw}")
            continue

        key, val = line.split("=", 1)
        typ = key.strip()
        cs = val.strip().strip('"')

        # Skip entries missing type or connection string
        if not typ or not cs:
            print(f"Skipping incomplete line: {raw}")
            continue

        # Group connection strings by sensor type
        device_map.setdefault(typ, []).append(cs)

    # Abort if no valid entries found
    if not device_map:
        die("No valid entries in devices.conf")

    return device_map

# Generate individual config-*.json files for each sensor directory
def generate_configs(base: Path, device_map):
    # Iterate over sensor directories named sensor_*
    for sensor_dir in sorted(base.glob("sensor_*")):
        # Extract sensor type from directory name
        typ = sensor_dir.name.split("_", 1)[1]
        conns = device_map.get(typ, [])

        # Require at least one connection string
        if not conns:
            die(f"No connection strings for sensor type '{typ}'")

        tpl = sensor_dir / "config.json"
        # Ensure the template file exists
        if not tpl.is_file():
            die(f"Template missing: {tpl}")

        # Remove any previously generated config files
        for old in sensor_dir.glob("config-*.json"):
            old.unlink()

        # Create a new config file for each connection string
        for idx, cs in enumerate(conns, start=1):
            num = f"{idx:02d}"
            out = sensor_dir / f"config-{num}.json"

            # Load and update the template
            data = json.loads(tpl.read_text())
            data["connection_string"] = cs
            data["sensor_id"] = f"{typ}-{num}"

            # Write the updated configuration
            out.write_text(json.dumps(data, indent=2))
            print(f"→ Generated {out.relative_to(base)} for {typ}")

def main():
    # Use the current working directory as the base path
    base = Path.cwd()
    # Expect devices.conf under ./share/devices.conf
    conf = base / "share" / "devices.conf"
    print(f">>> BASE_DIR = {base}")

    # Load device connection mapping and report counts
    device_map = load_devices(conf)
    for typ, lst in device_map.items():
        print(f"   • {typ}: {len(lst)} entries")

    # Generate per-sensor configuration files
    generate_configs(base, device_map)

    # Identify the simulator runner script
    runner = base / "run_simulators.py"
    if not runner.is_file():
        die(f"run_simulators.py not found at {runner}")
    print(">>> Starting IoT simulators…")

    # Replace current process with the simulator runner
    try:
        os.execve(sys.executable, [sys.executable, str(runner)], os.environ.copy())
    except Exception as e:
        print(f"Failed to execute {runner}: {e}")
        sys.exit(1)

# Invoke main when executed as a script
if __name__ == "__main__":
    main()
