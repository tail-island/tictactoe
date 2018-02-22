import I        from 'immutable';
import process  from 'process';
import readline from 'readline';

class GameState extends I.Record({board: I.List.of(0, 0, 0, 0, 0, 0, 0, 0, 0)}) {
  get vacantCellCount() {
    let vacantCellCount = 0;

    for (const cell of this.board) {
      if (cell == 0) {
        vacantCellCount++;
      }
    }

    return vacantCellCount;
  }

  get winner() {
    const winningLines = I.List.of(I.List.of(0, 3, 6), I.List.of(1, 4, 7), I.List.of(2, 5, 8),  // 縦
                                   I.List.of(0, 1, 2), I.List.of(3, 4, 5), I.List.of(6, 7, 8),  // 横
                                   I.List.of(0, 4, 8), I.List.of(2, 4, 6));                     // 斜め

    for (const winningLine of winningLines) {
      const playerCellCounts = [0, 0];

      for (const winningLineCell of winningLine) {
        const cell = this.board.get(winningLineCell);
        if (cell > 0) {
          playerCellCounts[cell - 1]++;
        }
      }

      if (playerCellCounts[0] == winningLine.size) {
        return 1;
      }

      if (playerCellCounts[1] == winningLine.size) {
        return 2;
      }
    }

    return this.vacantCellCount == 0 ? 0 : -1;
  }

  get nextPlayer() {
    return this.vacantCellCount % 2 == 1 ? 1 : 2;
  }

  get nextGameStates() {
    const nextGameStates = [];

    for (let i = 0; i < this.board.size; ++i) {
      if (this.board.get(i) == 0) {
        nextGameStates.push(this.setIn(I.List.of('board', i), this.nextPlayer));
      }
    }

    return I.List(nextGameStates);
  }

  draw() {
    for (let i = 0; i < 3; ++i) {
      let lineString = '';

      for (let j = 0; j < 3; ++j) {
        if (j != 0) {
          lineString += ' ';
        }
        lineString += ['-', 'O', 'X'][this.board.get(i * 3 + j)];
      }

      console.log(lineString);
    }

    console.log();
  }
}

class ComputerPlayer extends I.Record({gameState: null}) {
  getNextScoreAndGameState(gameState, alpha, beta) {
    let nextScoreAndGameState = I.List.of(alpha, null);

    for (const nextGameState of gameState.nextGameStates) {
      const score = -this.getScore(nextGameState, -beta, -nextScoreAndGameState.get(0));
      if (score > nextScoreAndGameState.get(0)) {
        nextScoreAndGameState = I.List.of(score, nextGameState);
      }

      // 枝刈り
      if (nextScoreAndGameState.get(0) >= beta) {
        return nextScoreAndGameState;
      }
    }

    return nextScoreAndGameState;
  };

  getScore(gameState, alpha, beta) {
    const winner = gameState.winner;
    if (winner >= 0) {
      return winner == 0 ? 0 : (winner == gameState.nextPlayer ? 1 : -1);
    }

    return this.getNextScoreAndGameState(gameState, alpha, beta).get(0);
  };

  async getNextGameState() {
    return this.getNextScoreAndGameState(this.gameState, -Infinity, Infinity).get(1);
  }
}

class HumanPlayer extends I.Record({gameState: null}) {
  async getNextGameState() {
    console.log(`You are player ${ this.gameState.nextPlayer }. Game is below.`);
    this.gameState.draw();

    const nextGameStates = this.gameState.nextGameStates;

    for (let i = 0; i < nextGameStates.size; ++i) {
      console.log(`No. ${ i }`);
      nextGameStates.get(i).draw();
    }

    return await new Promise(resolve => {
      const readlineInterface = readline.createInterface({ input: process.stdin, output: process.stdout });

      readlineInterface.question('Which do you select? ', answer => {
        resolve(nextGameStates.get(answer));
        readlineInterface.close();
      });
    });
  }
}

export default class TicTacToe {
  constructor() {
    this.gameState = new GameState();
  }

  drawWinner() {
    const winner = this.gameState.winner;
    if (winner < 0) {
      return false;
    }

    console.log(`Player ${ ['-', '1', '2'][winner] } win!`);
    this.gameState.draw();

    return true;
  }

  async start() {
    while (true) {
      if (this.drawWinner()) {
        break;
      }
      this.gameState = await new HumanPlayer({gameState: this.gameState}).getNextGameState();

      if (this.drawWinner()) {
        break;
      }
      this.gameState = await new ComputerPlayer({gameState: this.gameState}).getNextGameState();
    }
  }
}
