$paths = @(
  'E:\IIT-H hackathon\frontend\src\components\CodeViewer.tsx',
  'E:\IIT-H hackathon\frontend\src\components\ManifestViewer.tsx'
)
foreach ($path in $paths) {
  $bytes = [System.IO.File]::ReadAllBytes($path)
  $mis = [System.Text.Encoding]::UTF8.GetString($bytes)   # currently double-decoded
  $latin1Bytes = [System.Text.Encoding]::GetEncoding(1252).GetBytes($mis)
  $fixed = [System.Text.Encoding]::UTF8.GetString($latin1Bytes)
  $enc = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($path, $fixed, $enc)
}
