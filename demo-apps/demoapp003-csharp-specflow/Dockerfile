FROM mcr.microsoft.com/dotnet/sdk:10.0

WORKDIR /workspace

COPY DemoApp003.CSharp.SpecFlow.sln ./
COPY app_src/*.csproj app_src/
COPY app_src/packages.lock.json app_src/
COPY tests/*.csproj tests/
COPY tests/packages.lock.json tests/
COPY tooling/performance/*.csproj tooling/performance/
COPY tooling/performance/packages.lock.json tooling/performance/
RUN dotnet restore --locked-mode

COPY . .

CMD ["dotnet", "test", "--no-restore"]
