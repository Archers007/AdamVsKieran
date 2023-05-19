const fs = require('fs');
const fastify = require('fastify')();
const port = "3000"


const gameHistoryFilePath = 'gameHistory.json';
let gameHistory = [];

// Check if the game history JSON file exists
if (fs.existsSync(gameHistoryFilePath)) {
  // Read the game history JSON file and parse it into the gameHistory array
  const gameHistoryData = fs.readFileSync(gameHistoryFilePath, 'utf8');
  gameHistory = JSON.parse(gameHistoryData);
}

fastify.post('/:endpoint', (request, reply) => {
  const { endpoint } = request.params;
  console.log(endpoint);
  switch(endpoint){
    case "kieran" && "adam":{
        // Generate a unique serial number
        const serialNumber = generateSerialNumber();

        // Create a new game entry with the current date, time, selected game, and serial number
        const gameEntry = {
            date: request.body.date,
            time: request.body.time,
            selectedGame: request.body.selectedGame,
            serialNumber: serialNumber,
            winner: request.body.endpoint,
        };

        // Add the game entry to the game history
        gameHistory.push(gameEntry);

        // Save the updated game history to the JSON file
        saveGameHistoryToFile();

        // Send a response with a success message and the assigned serial number
        reply.send({ message: `Received ${endpoint} data`, serialNumber: serialNumber });
        break;
    }
    case "score":{
        let adamWins = 0;
        let kieranWins = 0;

        gameHistory.forEach((game) => {
            if (game.winner === 'Adam') {
                adamWins++;
            } else if (game.winner === 'Kieran') {
                kieranWins++;
            }
        });
        const response = {
          adamScore: score.adamScore,
          kieranScore: score.kieranScore
        };
        reply.send(response);
        break;
    }
  }

  
});

fastify.get('/', (request, reply) => {
  // Create the HTML content for the game history
  const htmlContent = generateGameHistoryHTML();

  // Send the HTML content as the response
  reply.type('text/html').send(htmlContent);
});

// Helper function to save the game history to the JSON file
function saveGameHistoryToFile() {
  fs.writeFile(gameHistoryFilePath, JSON.stringify(gameHistory), (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log('Game history saved to file.');
    }
  });
}

// Helper function to generate the HTML content for the game history
function generateGameHistoryHTML() {
    let html = `
    <html>
    <head>
       <title>Game History</title>
       <style>

          body {
          background-color: black;
          color: white;
          font-family: Arial, sans-serif;
          }
          h1 {
            font-size: 24px;
            font-weight: bold;
            color: white;
            text-align: center;
            margin-top: 20px;
          }
          .container {
          display: flex;
          align-items: flex-start;
          overflow: hidden;
          }
          .sidebar-container {
          text-align:center;
          width: 300px;
          background-color: gray;
          padding: 20px;
          border-radius: 10px;
          margin-right: 20px;
          overflow-y: auto;
          max-height: calc(100vh - 120px);
          flex-shrink: 0;
          position: fixed;
          }
          .sidebar {
          list-style-type: none;
          padding: 0;
          margin: 0;
          overflow-y: auto;
          max-height: 90%;
          }
          .game-entry {
          cursor: pointer;
          background-color: blue;
          color: white;
          padding: 10px;
          margin-bottom: 10px;
          border-radius: 5px;
          }
          .game-entry.red {
          background-color: red;
          }
          .details {
          text-align:center;
          flex: 1;
          padding: 20px;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          max-width: 70%;
          margin-left: 22%;
          }
          .details.blue {
          background-color: blue;
          color: white;
          }
          .details.red {
          background-color: red;
          color: white;
          }
          .winner {
          font-size: 40px;
          font-weight: bold;
          text-align: center;
          margin-top: 50px;
          }
       </style>
       <script>
          function showGameDetails(serialNumber, winner) {
            const detailsElement = document.getElementById('game-details-' + serialNumber);
            const detailsSections = document.getElementsByClassName('details-section');
          
          
            for (let i = 0; i < detailsSections.length; i++) {
              detailsSections[i].style.display = 'none';
            }
          
          
            detailsElement.style.display = 'block';
          
          
            const detailsPanel = document.getElementById('details-panel');
            detailsPanel.className = 'details ' + winner.toLowerCase();
          }
       </script>
    </head>
    <body>
       <h1>Game History</h1>
       <div>
       <div class="sidebar-container">
       <ul>
    `;
  
    gameHistory.forEach((game, index) => {
      const winnerClass = game.winner === 'Adam' ? 'blue' : 'red';
      html += `
                <li class="game-entry ${winnerClass}" onclick="showGameDetails('${game.serialNumber}', '${winnerClass}')">
                  Serial Number: ${game.serialNumber}<br>
                  Date: ${game.date}<br>
                  Time: ${game.time}<br>
                  Selected Game: ${game.selectedGame}<br>
                </li>
      `;
    });
  
    html += `
              </ul>
            </div>
            <div class="details" id="details-panel">
    `;
  
    gameHistory.forEach((game, index) => {
      const winnerClass = game.winner === 'Adam' ? 'blue' : 'red';
      html += `
            <div>
              <div id="game-details-${game.serialNumber}" class="details-section" style="display: none;">
                <h2>Game Details</h2>
                <strong>Serial Number:</strong> ${game.serialNumber}<br>
                <strong>Date:</strong> ${game.date}<br>
                <strong>Time:</strong> ${game.time}<br>
                <strong>Selected Game:</strong> ${game.selectedGame}<br>
                <strong>Winner:</strong> ${game.winner}<br>
              </div>
      `;
    });
  
    html += `
          </div>
          <div class="winner">
            ${getOverallWinner()}
          </div>
        </body>
      </html>
    `;
  
    return html;
  }
  
  function getOverallWinner() {
    let adamWins = 0;
    let kieranWins = 0;
  
    gameHistory.forEach((game) => {
      if (game.winner === 'Adam') {
        adamWins++;
      } else if (game.winner === 'Kieran') {
        kieranWins++;
      }
    });
  
    if (adamWins > kieranWins) {
      return `Adam is the overall winner! \n ${kieranWins} : ${adamWins}`;
    } else if (kieranWins > adamWins) {
      return `Kieran is the overall winner! \n ${kieranWins} : ${adamWins}`;
    } else {
      return `It\'s a tie! \n ${kieranWins} : ${adamWins}`;
    }
  }
  

// Helper function to generate a random serial number
function generateSerialNumber() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let serialNumber = '';

  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    serialNumber += characters.charAt(randomIndex);
  }

  return serialNumber;
}

fastify.listen({port, host: "0.0.0.0"}, (err, address) => {
    if (err) console.error(err);
    var time = new Date();
    console.log(`@ ${time} server started`);
    console.log(`Server is running on ${address}`);
});