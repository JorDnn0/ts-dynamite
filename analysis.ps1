param (
    [Parameter(Mandatory = $true)]
    [string]$bot1,

    [Parameter(Mandatory = $true)]
    [string]$bot2
)

$command = ".\battle.ps1 $bot1 $bot2"
$iterations = 10
$totalPlayer2Score = 0
$player2Scores = @()

for ($i = 1; $i -le $iterations; $i++) {
    Write-Host "Running iteration $i"
    $output = Invoke-Expression $command

    # Extract the score from the output
    $scoreRegex = "Score: \d+ - (\d+)"
    $match = $output | Select-String -Pattern $scoreRegex
    $player2Score = $match.Matches.Groups[1].Value

    # Convert the score to an integer and accumulate the total
    $totalPlayer2Score += [int]$player2Score

    # Store the player 2 score in the array
    $player2Scores += [int]$player2Score

    # Display the score
    Write-Host "Player 2's Score: $player2Score"
}

# Calculate the average Player 2 score
$averagePlayer2Score = $totalPlayer2Score / $iterations

# Calculate the best and worst Player 2 scores
$bestPlayer2Score = $player2Scores | Measure-Object -Maximum | Select-Object -ExpandProperty Maximum
$worstPlayer2Score = $player2Scores | Measure-Object -Minimum | Select-Object -ExpandProperty Minimum

# Calculate the standard deviation of the Player 2 scores
$stdDevPlayer2Score = if ($iterations -gt 1) {
    $mean = $player2Scores | Measure-Object -Average | Select-Object -ExpandProperty Average
    $sumOfSquares = ($player2Scores | ForEach-Object { ($_ - $mean) * ($_ - $mean) } | Measure-Object -Sum).Sum
    [Math]::Sqrt($sumOfSquares / ($iterations - 1))
} else {
    0
}

# Output the results
Write-Host "Average Player 2's score: $averagePlayer2Score"
Write-Host "Best Player 2's score: $bestPlayer2Score"
Write-Host "Worst Player 2's score: $worstPlayer2Score"
Write-Host "Standard Deviation of Player 2's scores: $stdDevPlayer2Score"
