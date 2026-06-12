$pattern = 'rgba\(255,255,255|rgba\(0,0,0|#0[0-9A-Fa-f]{5}|#1[0-9A-Fa-f]{5}|#2[0-9A-Fa-f]{5}|#a8b1c2|#4CAF50|9D6EFA|C49BFF|00D9FF|FF4D4D|FFD60A|2ECC71|FF6B35'
Get-ChildItem 'E:\IIT-H hackathon\frontend\src\components\*.tsx' | ForEach-Object {
  $f = $_.FullName
  $m = Select-String -Path $f -Pattern $pattern -AllMatches
  if ($m) {
    Write-Output "== $f =="
    $m | ForEach-Object { Write-Output $_.LineNumber }
  }
}
