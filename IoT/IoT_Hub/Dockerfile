# Use the official slim Python 3.13 image as a lightweight, secure base
FROM python:3.13-slim

# Set working directory inside container
WORKDIR /IoT_Hub

# Suppress interactive prompts during APT operations
ENV DEBIAN_FRONTEND=noninteractive

# Ensure Python logs are immediately flushed (unbuffered mode)
ENV PYTHONUNBUFFERED=1

# Define default application log level (DEBUG, INFO, WARNING, ERROR)
ENV LOG_LEVEL=INFO

# Configure system timezone to Europe/Warsaw
ENV TZ=Europe/Warsaw

# Install only required system packages and tzdata, then configure timezone
RUN apt-get update && \
    apt-get install -y --no-install-recommends bash jq tzdata && \
    # Link timezone file and record timezone name
    ln -fs /usr/share/zoneinfo/${TZ} /etc/localtime && \
    echo "${TZ}" > /etc/timezone && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install Python dependencies without caching
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Copy all application source files into the container
COPY . .

# Define a basic health check to verify the simulator process is running
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD pgrep -f run_simulators.py > /dev/null || exit 1

# Launch the simulator via entrypoint script
ENTRYPOINT ["python", "./entrypoint.py"]
