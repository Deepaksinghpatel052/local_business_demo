# Local Docker image for the Django site builder (builder/). The code is mounted at /app by
# docker-compose.yml, so edits show after a refresh; only the Python packages live in the image.
FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
COPY requirements-server.txt /tmp/requirements-server.txt
RUN pip install --no-cache-dir -r /tmp/requirements-server.txt
COPY docker/app-start.sh /usr/local/bin/app-start.sh
RUN sed -i 's/\r$//' /usr/local/bin/app-start.sh && chmod +x /usr/local/bin/app-start.sh
EXPOSE 8000
CMD ["app-start.sh"]
