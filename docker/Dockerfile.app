# Image for the Django site builder (builder/): only Python and the packages live in it.
# docker-compose.yml mounts the code at /app and the client files (MEDIA_DIR) at /app/media,
# and runs docker/app-start.sh. Settings come from .env.
FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
COPY requirements-server.txt /tmp/requirements-server.txt
RUN pip install --no-cache-dir --timeout 120 --retries 10 -r /tmp/requirements-server.txt
EXPOSE 8000
CMD ["sh", "-c", "sed 's/\r$//' /app/docker/app-start.sh | sh"]
