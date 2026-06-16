Set-Location -LiteralPath "C:\Users\ampoy\Downloads\BethelWebAppDemo"
if (-not (Test-Path "node_modules")) {
    npm install
}
npm run dev
