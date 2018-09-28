import React, { Component } from "react"
import Agent from '../agent/agent'
import * as utils from '../utils'

class Evaluate extends Component{
    state = {}

    getStartInfo = async () => {
        await this.setState({
            data: utils.getData('test'),
            agent: new Agent(null, true, `model-1h`)
        })
        this.evaluate()
    }

    evaluate = async () => {
        await this.state.agent.model
        console.log(`Start evaluation`)        
        const {agent, data} = this.state
        
        const l = data.close.length - 1
        const window_size = agent.stateSize
        const buy_hold = (data.close[l] - data.close[0])

        let state = utils.getState(data, 0, window_size + 1)

        let total_profit = 0
        let total_losses = 0
        let total_trades = 0
        agent.inventory = []
        

        for (let t = 0; t < l; t++) {

            const action = agent.action(state)
            //console.log(action)
            const next_state = utils.getState(data, t + 1, window_size + 1)

            //buy
            if (action === 1 && agent.inventory.length === 0) {
                console.log('Buy: ' + data.close[t])
                agent.inventory.push(data.close[t])
            
            //sell
            } else if (action === 2 && agent.inventory.length > 0) { 
                let bought_price = agent.inventory.shift(0)
                let _profit = data.close[t] - bought_price
                
                console.log('Sell: ' + data.close[t] + ' | Profit: ' + _profit.toFixed(2))                
                total_profit += _profit                
                if(_profit < 0) {
                    total_losses += _profit
                }
                total_trades++

            }
            
            state = next_state

            let done = t === (l - 1)
            
            if (done) {
                console.log(`--------------------------------`)
                console.log('Total Profit:', total_profit.toFixed(2), 'Total Losses: ', total_losses.toFixed(2))
                console.log('Vs Buy/Hold:', (total_profit - buy_hold).toFixed(2), buy_hold)
                console.log('Trades: ', total_trades)
                console.log('--------------------------------')
            }
            
        }
    }

    

    handleClick = () => {
        this.getStartInfo()
        // this.setState({disabled: !this.state.disabled})
        
    }

    render() {
                        
        return(
            <div>
                <h1>Evaluate!!</h1>
                <div>
                    <button className={`btn ${this.state.disabled ? 'loading' : null}`} onClick={this.handleClick}>Evalutate</button>
                </div>
                                
                {/* <div>
                    <p>{`Loss: ${metrics[0] || 0}`}</p>
                    <p>{`Acc: ${metrics[1] || 0}`}</p>
                </div> */}
            </div>  
        )
    }
}

export default Evaluate