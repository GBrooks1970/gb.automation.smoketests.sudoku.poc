FROM python:3.13-slim@sha256:e48f59cdba69a3cbd9ed2cf0f348d90d45a8d350d98134cf1070bc106ee9ed90

WORKDIR /workspace

RUN useradd -m -u 1000 appuser

COPY pyproject.toml ./
COPY requirements-test.lock ./
COPY app_src ./app_src
RUN python -m pip install --upgrade pip && python -m pip install -c requirements-test.lock -e ".[test]"

COPY . .
RUN chown -R appuser:appuser /workspace

USER appuser

CMD ["python", "-m", "tooling.verify"]
