# Quick Git Commit and Push Script
# Usage: ./commit.ps1 "your commit message" "version"

param(
    [Parameter(Mandatory=$true)]
    [string]$Message,
    
    [Parameter(Mandatory=$false)]
    [string]$Version = ""
)

# Add all changes
git add .

# Create commit with version tag if provided
if ($Version) {
    git commit -m "v$Version : $Message"
    git tag -a "v$Version" -m "Version $Version"
} else {
    git commit -m "$Message"
}

# Push to GitHub
git push origin main

# Push tags if version was provided
if ($Version) {
    git push origin --tags
    Write-Host "✅ Pushed v$Version to GitHub!" -ForegroundColor Green
} else {
    Write-Host "✅ Changes pushed to GitHub!" -ForegroundColor Green
}
