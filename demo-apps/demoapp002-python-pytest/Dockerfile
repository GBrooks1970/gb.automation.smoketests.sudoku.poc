FROM python:3.13-slim

WORKDIR /workspace

COPY pyproject.toml ./
COPY app_src ./app_src
RUN python -m pip install --upgrade pip && python -m pip install -e ".[test]"

COPY . .

CMD ["python", "-m", "pytest"]
