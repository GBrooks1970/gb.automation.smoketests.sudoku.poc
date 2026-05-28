FROM mcr.microsoft.com/dotnet/sdk:8.0

WORKDIR /workspace

COPY DemoApp003.CSharp.SpecFlow.sln ./
COPY app_src/*.csproj app_src/
COPY tests/*.csproj tests/
COPY tooling/performance/*.csproj tooling/performance/
RUN dotnet restore

COPY . .

CMD ["dotnet", "test", "--no-restore"]
