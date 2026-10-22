# Local Docker image for the Django site builder (builder/). The code is mounted at /app by
# docker-compose.yml, so edits show after a refresh; only the Python packages live in the image.
# Settings come from .env (mounted with the code); see docker-compose.yml.
FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
COPY requirements-server.txt /tmp/requirements-server.txt
RUN pip install --no-cache-dir --timeout 120 --retries 10 -r /tmp/requirements-server.txt
EXPOSE 8000
# Runs the mounted docker/app-start.sh (CRLF-safe), so edits to it apply on the next restart
CMD ["sh", "-c", "sed 's/\r$//' /app/docker/app-start.sh | sh"]
