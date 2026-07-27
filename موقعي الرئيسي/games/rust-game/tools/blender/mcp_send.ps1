# Drive the running Blender through the BlenderMCP addon's socket.
#
# The addon listens on 127.0.0.1:9876 and accepts newline-free JSON of the
# form {"type": "<command>", "params": {...}}. This sends an `execute_code`
# command whose payload runs one of the pipeline scripts inside the user's
# live Blender session.
#
#   powershell -File tools/blender/mcp_send.ps1 -ScriptPath tools/blender/build_assets.py
#
# A long render can outrun the socket's response wait; the caller should
# verify the expected output files rather than trusting a timeout as failure.

param(
    [Parameter(Mandatory = $true)][string]$ScriptPath,
    [int]$Port = 9876,
    [int]$TimeoutMs = 600000
)

$ErrorActionPreference = "Stop"

$full = (Resolve-Path $ScriptPath).Path
# Run the file inside Blender rather than inlining it, so the addon's
# namespace stays clean and __file__ resolves for the script's own paths.
$code = @"
import runpy
runpy.run_path(r'$full', run_name='__main__')
"@

$payload = @{ type = "execute_code"; params = @{ code = $code } } | ConvertTo-Json -Compress -Depth 5

$client = New-Object System.Net.Sockets.TcpClient
$client.ReceiveTimeout = $TimeoutMs
$client.SendTimeout = 60000
$client.Connect("127.0.0.1", $Port)
$stream = $client.GetStream()

$bytes = [System.Text.Encoding]::UTF8.GetBytes($payload)
$stream.Write($bytes, 0, $bytes.Length)
$stream.Flush()
Write-Output "SENT $($bytes.Length) bytes -> 127.0.0.1:$Port  ($ScriptPath)"

$buffer = New-Object byte[] 65536
$sb = New-Object System.Text.StringBuilder
try {
    while ($true) {
        $read = $stream.Read($buffer, 0, $buffer.Length)
        if ($read -le 0) { break }
        [void]$sb.Append([System.Text.Encoding]::UTF8.GetString($buffer, 0, $read))
        # The addon sends one complete JSON object per command
        try {
            $null = $sb.ToString() | ConvertFrom-Json
            break
        } catch { }
    }
} catch {
    Write-Output "RECV TIMEOUT/ERROR: $($_.Exception.Message.Split([char]10)[0])"
}
$client.Close()

$raw = $sb.ToString()
if ($raw.Length -eq 0) {
    Write-Output "NO RESPONSE (check the output files before assuming failure)"
    exit 2
}
try {
    $obj = $raw | ConvertFrom-Json
    Write-Output "STATUS: $($obj.status)"
    if ($obj.result.result) { Write-Output $obj.result.result }
    if ($obj.message) { Write-Output "MESSAGE: $($obj.message)" }
} catch {
    Write-Output $raw
}
