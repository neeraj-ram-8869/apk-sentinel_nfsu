$path = 'E:\IIT-H hackathon\frontend\src\components\CodeViewer.tsx'
$c = Get-Content $path -Raw
$c = $c -replace '#0f172a','#F6F8FA'
$c = $c -replace '#94a3b8','#5B6472'
$c = $c -replace '#475569','#A1A8B3'
$c = $c -replace '#64748b','#9AA1AC'
$c = $c -replace '#fbbf24','#B9770E'
$c = $c -replace '#f87171','#D14343'
$c = $c -replace '#fb923c','#C8631E'
$c = $c -replace '#7dd3fc','#0E9CA8'
[System.IO.File]::WriteAllText($path, $c)
