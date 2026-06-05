$ErrorActionPreference = "SilentlyContinue"

$root = Split-Path -Parent $PSScriptRoot
$url = "http://127.0.0.1:4173/"
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"

function Test-HonorLex {
  try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 2
    return $response.StatusCode -eq 200
  } catch {
    return $false
  }
}

if (-not (Test-HonorLex)) {
  Start-Process -WindowStyle Hidden -FilePath "cmd.exe" -ArgumentList "/c", "cd /d `"$root`" && npx vite --host 127.0.0.1 --port 4173 --strictPort"
  for ($i = 0; $i -lt 20; $i++) {
    Start-Sleep -Milliseconds 500
    if (Test-HonorLex) { break }
  }
}

if (Test-Path $chrome) {
  Start-Process -FilePath $chrome -ArgumentList "--new-window", $url
} else {
  Start-Process $url
}
