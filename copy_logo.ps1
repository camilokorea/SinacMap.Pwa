$source = "C:\Users\camil\.gemini\antigravity\brain\44a56eeb-4309-4d95-acd3-52c06b13204c\sinacmap_logo_final_1778548742614.png"
$destDir = "public\icons"
$sizes = @(72, 96, 128, 144, 152, 192, 384, 512)

foreach ($size in $sizes) {
    Copy-Item -Path $source -Destination "$destDir\icon-${size}x${size}.png" -Force
}
Copy-Item -Path $source -Destination "public\favicon.ico" -Force
