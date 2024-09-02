document.addEventListener('DOMContentLoaded', function() {
    const currentPage = document.body.dataset.page;

    if (currentPage === 'register') {
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

            fetch('http://localhost:3000/submit', {
                method: 'POST',
                body: JSON.stringify(formObject),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Team details submitted successfully!');
                    document.getElementById('teamForm').reset();
                    document.getElementById('players').innerHTML = '';
                    playerCount = 0;
                } else {
                    alert('Failed to submit team details.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while submitting the form.');
            });
        });

        document.getElementById('viewTeamsBtn').addEventListener('click', function() {
            window.location.href = 'view.html';
        });
    } else if (currentPage === 'view') {
        function loadTeams() {
            fetch('http://localhost:3000/teams')
                .then(response => response.json())
                .then(data => {
                    const teamsList = document.getElementById('teamsList');
                    if (data.length === 0) {
                        teamsList.innerHTML = 'No teams found.';
                    } else {
                        teamsList.innerHTML = data.map(team => `
                            <div>
                                <h3>${team.teamName}</h3>
                                <ul>
                                    ${team.players.map(player => {
                                        if (!player) {
                                            console.warn('Invalid player:', player);
                                            return '';
                                        }
                                        return `
                                            <li>
                                                <strong>${player.playerName || 'Unknown'}</strong>
                                                <ul>
                                                    <li>Batting Order: ${player.battingOrder !== undefined ? player.battingOrder : 'N/A'}</li>
                                                    <li>Batting Style: ${player.battingStyle || 'N/A'}</li>
                                                    <li>Bowling Style: ${player.bowlingStyle || 'N/A'}</li>
                                                    <li>Responsibility: ${player.responsibility || 'None'}</li>
                                                </ul>
                                            </li>
                                        `;
                                    }).join('')}
                                </ul>
                            </div>
                        `).join('');
                    }
                })
                .catch(error => {
                    console.error('Error loading teams:', error);
                    document.getElementById('teamsList').innerText = 'Error loading teams.';
                });
        }

        loadTeams();

        document.getElementById('registerTeamBtn').addEventListener('click', function() {
            window.location.href = 'register.html';
        });
    }
});
