Add-Type -AssemblyName System.Drawing

$imgDir = Join-Path $PSScriptRoot "..\public\assets\images"
$optDir = Join-Path $PSScriptRoot "..\public\assets\images_opt"

if (Test-Path $optDir) { Remove-Item -Recurse -Force $optDir }
New-Item -ItemType Directory -Path $optDir -Force | Out-Null

$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]76)

$files = Get-ChildItem -Path $imgDir -Filter "*.jpg"
Write-Host "Found $($files.Count) JPG images in $imgDir"

$results = @()

foreach ($file in $files) {
    $srcPath = $file.FullName
    $outPath = Join-Path $optDir $file.Name
    
    $bytes = [System.IO.File]::ReadAllBytes($srcPath)
    $ms = New-Object System.IO.MemoryStream(,$bytes)
    $srcImg = [System.Drawing.Image]::FromStream($ms)
    
    $maxWidth = 720
    if ($file.Name -like "hero*") {
        $maxWidth = 1200
    } elseif ($file.Name -like "logo*") {
        $maxWidth = 400
    }
    
    $newWidth = $srcImg.Width
    $newHeight = $srcImg.Height
    if ($srcImg.Width -gt $maxWidth) {
        $ratio = [double]$maxWidth / [double]$srcImg.Width
        $newWidth = [int]($srcImg.Width * $ratio)
        $newHeight = [int]($srcImg.Height * $ratio)
    }
    
    $destBitmap = New-Object System.Drawing.Bitmap($newWidth, $newHeight)
    $graphics = [System.Drawing.Graphics]::FromImage($destBitmap)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    $graphics.DrawImage($srcImg, 0, 0, $newWidth, $newHeight)
    $destBitmap.Save($outPath, $jpegCodec, $encoderParams)
    
    $graphics.Dispose()
    $destBitmap.Dispose()
    $srcImg.Dispose()
    $ms.Dispose()
    
    $oldLen = $file.Length
    $newLen = (Get-Item $outPath).Length
    
    $percent = [math]::Round((1.0 - ([double]$newLen / [double]$oldLen)) * 100)
    $results += [PSCustomObject]@{
        Name       = $file.Name
        OldSizeKB  = [math]::Round($oldLen / 1KB)
        NewSizeKB  = [math]::Round($newLen / 1KB)
        Savings    = "$percent%"
        Dimensions = "${newWidth}x${newHeight}"
    }
    Write-Host "Processed $($file.Name): $([math]::Round($oldLen/1KB))KB -> $([math]::Round($newLen/1KB))KB ($percent% saved)"
}

# Clean any leftover .tmp files
Get-ChildItem -Path $imgDir -Filter "*.tmp" | Remove-Item -Force -ErrorAction SilentlyContinue

# Overwrite original images with optimized ones
foreach ($optFile in (Get-ChildItem -Path $optDir)) {
    $targetPath = Join-Path $imgDir $optFile.Name
    Copy-Item -Path $optFile.FullName -Destination $targetPath -Force
}
Remove-Item -Recurse -Force $optDir

$results | Format-Table -AutoSize

