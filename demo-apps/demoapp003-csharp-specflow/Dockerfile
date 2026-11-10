FROM mcr.microsoft.com/dotnet/sdk:10.0@sha256:212fe4cb74627d5adf9817a4088906ae3edff1bd853bb27565d4b46731efe61e

WORKDIR /workspace

RUN useradd -m -u 1000 appuser

COPY DemoApp003.CSharp.SpecFlow.sln ./
COPY app_src/*.csproj app_src/
COPY app_src/packages.lock.json app_src/
COPY tests/*.csproj tests/
COPY tests/packages.lock.json tests/
COPY tooling/performance/*.csproj tooling/performance/
COPY tooling/performance/packages.lock.json tooling/performance/
RUN dotnet restore --locked-mode

COPY . .
RUN chown -R appuser:appuser /workspace

USER appuser

CMD ["dotnet", "test", "--no-restore"]
