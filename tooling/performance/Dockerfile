FROM mcr.microsoft.com/dotnet/sdk:8.0

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl ca-certificates python3 python3-pip python3-venv \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

COPY . .

RUN npm ci --prefix demo-apps/demoapp001-typescript-cypress \
    && python3 -m pip install --break-system-packages -e "demo-apps/demoapp002-python-pytest[test]" \
    && dotnet restore demo-apps/demoapp003-csharp-specflow/DemoApp003.CSharp.SpecFlow.sln

CMD ["bash", "-lc", "cd demo-apps/demoapp001-typescript-cypress && npm run benchmark && cd ../demoapp002-python-pytest && python3 -m tooling.performance.benchmark && cd /workspace && dotnet run --project demo-apps/demoapp003-csharp-specflow/tooling/performance/DemoApp003.Performance.csproj --configuration Release"]
