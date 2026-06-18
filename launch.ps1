Set-Location -LiteralPath "C:\Users\ampoy\Downloads\BethelWebAppDemo"
if (-not (Test-Path "node_modules")) {
    npm install
}

$openRouterKeyPath = "C:\Users\ampoy\Downloads\OpenrouerKey.txt"
if (-not $env:OPENROUTER_API_KEY -and (Test-Path $openRouterKeyPath)) {
    $env:OPENROUTER_API_KEY = (Get-Content -Raw $openRouterKeyPath).Trim()
}

if (-not $env:OPENROUTER_MODEL) {
    $env:OPENROUTER_MODEL = "google/gemini-2.5-flash"
}

if ($env:NODE_OPTIONS -notmatch "--use-system-ca") {
    $env:NODE_OPTIONS = (($env:NODE_OPTIONS, "--use-system-ca") -join " ").Trim()
}

npm run dev
