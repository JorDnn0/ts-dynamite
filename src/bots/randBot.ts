import { Gamestate, BotSelection} from '../models/gamestate';

class Bot {
    RPSDW: BotSelection[] = ['R', 'P', 'S', 'D', 'W'];
    RPSW: BotSelection[] = ['R', 'P', 'S', 'W'];
    RPSD: BotSelection[] = ['R', 'P', 'S', 'D'];
    RPS: BotSelection[] = ['R', 'P', 'S']
    dynamiteLeft:number = 100
    firstMove = true

    totalRounds = 1000
    roundNumber = 0

    movesHistoryToCheck = 50


    getSemiRandomMove(){
        if(this.dynamiteLeft>0) return this.RPSD[Math.floor(Math.random()*this.RPSD.length)]
        else if(this.totalRounds - this.dynamiteLeft<=0) return "D"
        else return this.RPS[Math.floor(Math.random()*this.RPS.length)]
    }

    makeMove(gamestate: Gamestate): BotSelection {
        this.roundNumber += 1
        let move = this.getSemiRandomMove()

        if(move === 'D') this.dynamiteLeft-=1
        return move
    }


}

export = new Bot();