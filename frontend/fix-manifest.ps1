$path = 'E:\IIT-H hackathon\frontend\src\components\ManifestViewer.tsx'
$c = Get-Content $path -Raw
$c = $c -replace '#0f172a','#F6F8FA'
$c = $c -replace '#94a3b8','#5B6472'
[System.IO.File]::WriteAllText($path, $c)
