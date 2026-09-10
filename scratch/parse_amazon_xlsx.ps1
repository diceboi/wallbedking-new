Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead('amazon-bedframe-classic-fr-fullcontent-processing-summary.xlsx')
$entry = $zip.GetEntry('xl/worksheets/sheet3.xml')
$reader = New-Object System.IO.StreamReader($entry.Open())
[xml]$xml = $reader.ReadToEnd()
$reader.Dispose()
$zip.Dispose()

$rows = $xml.worksheet.sheetData.row
Write-Output "Total rows: $($rows.Count)"

for ($rIdx = 0; $rIdx -lt [Math]::Min(5, $rows.Count); $rIdx++) {
    $row = $rows[$rIdx]
    $cells = @()
    foreach ($c in $row.c) {
        $val = ''
        if ($c.is.t) { $val = $c.is.t }
        elseif ($c.v) { $val = $c.v }
        $cells += "$($c.r): $val"
    }
    Write-Output "=== ROW $($row.r) (cells: $($cells.Count)) ==="
    Write-Output ($cells[0..9] -join ' | ')
}
