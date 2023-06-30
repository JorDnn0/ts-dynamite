import { Gamestate, BotSelection } from '../models/gamestate';

class Bot {
    number = 0
    makeMove(gamestate: Gamestate): BotSelection {
        switch (this.number) {
            case (0):
                this.number +=1
                return 'R';
            case (1):
                this.number +=1
                return 'P';
            case (2):
                this.number =0
                return 'S';
        }
    }
}

export = new Bot();