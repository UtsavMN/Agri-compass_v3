$r = Invoke-RestMethod -Uri 'http://localhost:8080/api/crops?page=0&size=100'
Write-Host "Total crops in DB:" $r.totalElements
Write-Host "Total pages:" $r.totalPages
Write-Host "Content count:" $r.content.Count
Write-Host ""
Write-Host "Crops loaded:"
$r.content | ForEach-Object {
    $inv = if ($_.investmentPerAcre) { $_.investmentPerAcre } else { "EMPTY" }
    $ret = if ($_.expectedReturns) { $_.expectedReturns } else { "EMPTY" }
    $img = if ($_.imageUrl) { "YES" } else { "NO" }
    $sci = if ($_.scientificName) { "YES" } else { "NO" }
    $ai = if ($_.aiScore) { "YES" } else { "NO" }
    Write-Host "$($_.id): $($_.name) | Season=$($_.season) | Invest=$inv | Returns=$ret | Image=$img | SciName=$sci | AI=$ai"
}
