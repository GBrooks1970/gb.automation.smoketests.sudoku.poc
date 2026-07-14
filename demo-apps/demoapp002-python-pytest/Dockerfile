FROM python:3.13-slim

WORKDIR /workspace

COPY pyproject.toml ./
COPY requirements-test.lock ./
COPY app_src ./app_src
RUN python -m pip install --upgrade pip && python -m pip install -c requirements-test.lock -e ".[test]"

COPY . .

CMD ["python", "-m", "pytest"]
