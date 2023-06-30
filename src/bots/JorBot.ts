import { Gamestate, BotSelection} from '../models/gamestate';

class Bot {
    debug:boolean = true

    RPSDW: BotSelection[] = ['R', 'P', 'S', 'D', 'W'];
    RPSW: BotSelection[] = ['R', 'P', 'S', 'W'];
    RPSD: BotSelection[] = ['R', 'P', 'S', 'D'];
    RPS: BotSelection[] = ['R', 'P', 'S']
    dynamiteLeft:number = 100
    firstMove = true

    totalRounds = 1000
    roundNumber = 0

    movesHistoryToCheck = 50

    responseToMoves = {
        'R':{'R':0, 'P':0, 'S':0, 'D':0, 'W':0},
        'P':{'R':0, 'P':0, 'S':0, 'D':0, 'W':0},
        'S':{'R':0, 'P':0, 'S':0, 'D':0, 'W':0},
        'D':{'R':0, 'P':0, 'S':0, 'D':0, 'W':0},
        'W':{'R':0, 'P':0, 'S':0, 'D':0, 'W':0}
    }

    basicGameWinRules = [
        ['R','S'],['R','W'],
        ['P','R'],['P','W'],
        ['S','P'],['S','W'],
        ['D','S'],['D','R'],['D','P'],
        ['W','D'],

    ]


    makeMove(gamestate: Gamestate): BotSelection {
        this.roundNumber += 1
        //let move = this.getSemiRandomMove()
        let move = this.getMoveInSequence()

        let patternMove = this.getPattern(gamestate)
        //if no pattern has been detected...
        if(!patternMove){
            //check other bot's strategy with past 50 results
            if(this.roundNumber>1){
                this.getRespToEachMove(gamestate)
                move = this.getOptimalMoves()
            }
        } else{
            move = patternMove
        }

        if(move === 'D') this.dynamiteLeft-=1
        process.stdout.write(move)
        return move
    }

    seqNum = 0
    pattern:BotSelection[] = ["R","P","S","R","P","S","R","P","S","P","P","P","P"]
    getMoveInSequence() {
        //if (this.debug) console.log("using pattern")
        this.seqNum = this.seqNum<=this.pattern.length ? this.seqNum + 1 : 0
            return this.pattern[this.seqNum]
    }

    getSemiRandomMove(){
        if(this.dynamiteLeft>0) return this.RPSD[Math.floor(Math.random()*this.RPSD.length)]
        else if(this.totalRounds - this.dynamiteLeft<=0) return "D"
        else return this.RPS[Math.floor(Math.random()*this.RPS.length)]
    }

    getRespToEachMove(gamestate:Gamestate){
        let histLen = gamestate.rounds.length
        if(gamestate.rounds.length<this.movesHistoryToCheck){
            let p1Move = gamestate.rounds[histLen-1].p1
            let p2Move = gamestate.rounds[histLen-1].p2
            this.responseToMoves[p1Move][p2Move] += 1
        }else {
            //reset history and check last 50 rounds
            this.responseToMoves = {
                'R':{'R':0, 'P':0, 'S':0, 'D':0, 'W':0},
                'P':{'R':0, 'P':0, 'S':0, 'D':0, 'W':0},
                'S':{'R':0, 'P':0, 'S':0, 'D':0, 'W':0},
                'D':{'R':0, 'P':0, 'S':0, 'D':0, 'W':0},
                'W':{'R':0, 'P':0, 'S':0, 'D':0, 'W':0}
            }

            //we only look at the last round of the gamestate as this is called each round
            for(let i = 0; i < this.movesHistoryToCheck; i++){
                let p1Move = gamestate.rounds[histLen-i-1].p1
                let p2Move = gamestate.rounds[histLen-i-1].p2
                this.responseToMoves[p1Move][p2Move] += 1
                //console.log(p1Move,p2Move,this.responseToMoves[p1Move][p2Move])
            }
        }


    }

    getPattern(gamestate):BotSelection{
        let roundLen = gamestate.rounds.length

        for(let patternLen = 25; patternLen > 1; patternLen--){

            if(gamestate.rounds.length>patternLen*3){
                let foundPattern = false
                for(let i = 1; i <= patternLen; i++){
                    // console.log(gamestate.rounds[roundLen - i].p2)
                    // console.log(gamestate.rounds[roundLen - i - patternLen].p2)
                    // console.log(gamestate.rounds[roundLen - i].p2)
                    // console.log(gamestate.rounds[roundLen - i - 2*patternLen].p2)
                    if(gamestate.rounds[roundLen - i].p2!=gamestate.rounds[roundLen - i - patternLen].p2
                        || gamestate.rounds[roundLen - i].p2!=gamestate.rounds[roundLen - i - 2*patternLen].p2){
                        foundPattern = false
                        break
                    } else{
                        foundPattern = true
                    }
                }
                if(foundPattern){
                    let p2NextMove = gamestate.rounds[roundLen-patternLen - 2].p2

                    for(let [p1Move,p2Move] of this.basicGameWinRules as [BotSelection, BotSelection][]){
                        if(p2Move==p2NextMove&&p1Move!='D'){
                            if (this.debug) console.log("pattern found: ",p2NextMove," next: play ",p1Move,". p2 before: ",gamestate.rounds[roundLen -1].p2)
                            return p1Move
                        }
                    }
                }
            } else{
                if (this.debug) console.log("no check for",patternLen)
            }
        }

    }

    getOptimalMoves():BotSelection{
        let winningMoves:[string,string][] = []

        //get likely responses
        let likelyResponses = {'R':'', 'P':'', 'S':'', 'D':'',}
        let wlCount:{[K in BotSelection]: number} = {
            'R':0,
            'P':0,
            'S':0,
            'D':0,
            'W':0
        }

        for(let [p1Move,p2Moves] of Object.entries(this.responseToMoves)) {
            //check winning move
            let mostProbable = 0
            for(let [p2Move,count] of Object.entries(p2Moves)){
                if(mostProbable<count){
                    likelyResponses[p1Move]=p2Move
                }

                for(let winningRule of this.basicGameWinRules){
                    //console.log([p1Move,p2Move],winningRule)
                    if(winningRule[0]==p1Move&&winningRule[1]==p2Move){
                        wlCount[p1Move] += count
                    } else if(winningRule[0]==p2Move&&winningRule[1]==p1Move) {
                        wlCount[p1Move] -= count
                    }
                }
            }
        }
        if(this.debug) console.log(wlCount)

        let maxScore = -Infinity
        let optimalMove:BotSelection[] = []
        for(let[p1Move,score] of Object.entries(wlCount) as [BotSelection, number][]){

            if(p1Move=='D'&&this.dynamiteLeft==0){
                continue
            }

            if(score>maxScore){
                optimalMove = [p1Move]
                maxScore = score
            } else if(score == maxScore){
                optimalMove.push(p1Move)
            }
        }

        //if winningMoves is greater than 1, get the move that is least likely to fail

        return optimalMove[Math.floor(Math.random()*optimalMove.length)]
    }



}

export = new Bot();