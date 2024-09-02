document.addEventListener('DOMContentLoaded', function() {
    let playerCount = 0;

    document.getElementById('addPlayerBtn').addEventListener('click', function() {
        playerCount++;
        const playerDiv = document.createElement('div');
        playerDiv.classList.add('form-group');
        playerDiv.innerHTML = `
            <h4>Player ${playerCount}</h4>
            <label for="playerName${playerCount}">Player Name</label>
            <input type="text" id="playerName${playerCount}" name="playerName${playerCount}" required>
            
            <label for="battingOrder${playerCount}">Batting Order</label>
            <input type="number" id="battingOrder${playerCount}" name="battingOrder${playerCount}" required>
            
            <label for="battingStyle${playerCount}">Batting Style</label>
            <select id="battingStyle${playerCount}" name="battingStyle${playerCount}" required>
                <option value="Right-hand bat">Right-hand bat</option>
                <option value="Left-hand bat">Left-hand bat</option>
            </select>

            <label for="bowlingStyle${playerCount}">Bowling Style</label>
            <select id="bowlingStyle${playerCount}" name="bowlingStyle${playerCount}" required>
                <option value="Right-arm fast">Right-arm fast</option>
                <option value="Left-arm fast">Left-arm fast</option>
                <option value="Right-arm spin">Right-arm spin</option>
                <option value="Left-arm spin">Left-arm spin</option>
            </select>

            <label for="responsibility${playerCount}">Additional Responsibility</label>
            <input type="text" id="responsibility${playerCount}" name="responsibility${playerCount}">
        `;
        document.getElementById('players').appendChild(playerDiv);
    });

    document.getElementById('teamForm').addEventListener('submit', function(event) {
        event.preventDefault();
        
        const formData = new FormData(this);
        const formObject = { players: [] };

        formData.forEach((value, key) => {
            const match = key.match(/(\d+)/);
            if (match) {
                const index = match[1];
                if (!formObject.players[index]) {
                    formObject.players[index] = {};
                }
                const baseKey = key.replace(index, '');
                formObject.players[index][baseKey] = value;
            } else {
                formObject[key] = value;
            }
        });

        formObject.teamName = formData.get('teamName');

        fetch('/api/submit', {
            method: 'POST',
            body: JSON.stringify(formObject),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text(); // Get response as text first
        })
        .then(text => {
            try {
                const data = JSON.parse(text); // Attempt to parse as JSON
                if (data.success) {
                    alert('Team details submitted successfully!');
                    document.getElementById('teamForm').reset();
                    document.getElementById('players').innerHTML = '';
                    playerCount = 0;
                    loadTeams(); // Reload teams after submission
                } else {
                    alert('Failed to submit team details: ' + data.error);
                }
            } catch (error) {
                console.error('Error parsing JSON:', error);
                alert('An error occurred while submitting the form: ' + error.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while submitting the form: ' + error.message);
        });
    });

    function loadTeams() {
        fetch('/api/teams')
            .then(response => response.json())
            .then(teams => {
                const teamsListDiv = document.getElementById('teamsList');
                teamsListDiv.innerHTML = ''; // Clear the list
                teams.forEach(team => {
                    const teamDiv = document.createElement('div');
                    teamDiv.classList.add('team');
                    teamDiv.innerHTML = `<h3>${team.teamName}</h3>`;
                    team.players.forEach(player => {
                        const playerDiv = document.createElement('div');
                        playerDiv.classList.add('player');
                        playerDiv.innerHTML = `
                            <p><strong>Name:</strong> ${player.playerName}</p>
                            <p><strong>Batting Order:</strong> ${player.battingOrder}</p>
                            <p><strong>Batting Style:</strong> ${player.battingStyle}</p>
                            <p><strong>Bowling Style:</strong> ${player.bowlingStyle}</p>
                            <p><strong>Responsibility:</strong> ${player.responsibility || 'None'}</p>
                        `;
                        teamDiv.appendChild(playerDiv);
                    });
                    teamsListDiv.appendChild(teamDiv);
                });
            })
            .catch(error => {
                console.error('Error loading teams:', error);
                alert('Error loading teams: ' + error.message);
            });
    }

    loadTeams(); // Load teams on page load
});
