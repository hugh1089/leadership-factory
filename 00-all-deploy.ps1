param(
    [string]$EnvFile = ".deploy.env"
)

$ErrorActionPreference = "Stop"

function Load-EnvFile {
    param([string]$Path)

    if (-not (Test-Path $Path)) {
        Write-Host "Env file not found: $Path, using built-in defaults."
        return
    }

    Get-Content $Path | ForEach-Object {
        $line = $_.Trim()
        if (-not $line -or $line.StartsWith("#")) { return }
        $parts = $line -split "=", 2
        if ($parts.Count -ne 2) { return }
        $name = $parts[0].Trim()
        $value = $parts[1].Trim()
        [System.Environment]::SetEnvironmentVariable($name, $value)
    }
}

Load-EnvFile -Path $EnvFile

$hostAlias = [System.Environment]::GetEnvironmentVariable("DEPLOY_SSH_HOST")
$sshUser = [System.Environment]::GetEnvironmentVariable("DEPLOY_SSH_USER")
$serverDir = [System.Environment]::GetEnvironmentVariable("DEPLOY_SERVER_DIR")
$deployBranch = "main"

if ([string]::IsNullOrWhiteSpace($hostAlias)) { $hostAlias = "aliyun" }
if ([string]::IsNullOrWhiteSpace($serverDir)) { $serverDir = "/opt/assessment-platform" }

$sshTarget = if ([string]::IsNullOrWhiteSpace($sshUser)) { $hostAlias } else { "$sshUser@$hostAlias" }

Write-Host "== Deploy target =="
Write-Host "SSH target: $sshTarget"
Write-Host "Server dir: $serverDir"
Write-Host "Branch: $deployBranch"

$commonPrefix = "set -e; cd $serverDir; if [ ! -f .env ]; then echo 'ERROR: .env missing on server'; exit 1; fi; sed -i.bak 's/^DEPLOY_BRANCH=.*/DEPLOY_BRANCH=$deployBranch/' .env || true"
$cmd = "$commonPrefix; bash ./00-all-deploy.sh"

Write-Host "== Running remote deploy =="
ssh $sshTarget $cmd

Write-Host "== Done =="
