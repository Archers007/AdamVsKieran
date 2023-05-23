const fs = require('fs');
const fastify = require('fastify')();
const port = "9000"


const gameHistoryFilePath = 'gameHistory.json';
let gameHistory = [];

// Check if the game history JSON file exists
if (fs.existsSync(gameHistoryFilePath)) {
  // Read the game history JSON file and parse it into the gameHistory array
  const gameHistoryData = fs.readFileSync(gameHistoryFilePath, 'utf8');
  gameHistory = JSON.parse(gameHistoryData);
}

fastify.post('/win', (request, reply) => {

  console.log(request.body.winner);
  console.log("Changing the Score!!!!");
    // Generate a unique serial number
  const serialNumber = generateSerialNumber();

        // Create a new game entry with the current date, time, selected game, and serial number
  const gameEntry = {
    date: request.body.date,
    time: request.body.time,
    selectedGame: request.body.game,
    serialNumber: serialNumber,
    winner: request.body.winner,
  };

        // Add the game entry to the game history
  gameHistory.push(gameEntry);

        // Save the updated game history to the JSON file
  saveGameHistoryToFile();

    // Send a response with a success message and the assigned serial number
  reply.send({ message: `Received winners data`, serialNumber: serialNumber });

  
});

fastify.post('/score', (request, reply) =>{
    console.log("/score was requested");
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
          adamScore: adamWins,
          kieranScore: kieranWins
        };
        console.log(response);
        reply.send(response);
})

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

fastify.post('/removeGame', (req, res) => {
    const serialNumber = req.body.serialNumber;
  
    // Find the index of the game with the matching serial number
    const gameIndex = gameHistory.findIndex((game) => game.serialNumber === serialNumber);
  
    if (gameIndex !== -1) {
      // Remove the game from the array
      gameHistory.splice(gameIndex, 1);
      res.status(200).json({ message: `Game with serial number ${serialNumber} has been removed.` });
    } else {
      res.status(404).json({ error: `Game with serial number ${serialNumber} not found.` });
    }
  });
  

// Helper function to generate the HTML content for the game history
function generateGameHistoryHTML() {
    let html = `
    <html>
    <title>Adam VS Kieran</title>
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
