import React, { Component } from "react"
import Agent from '../agent/agent'
import * as utils from '../utils'
// import {data} from '../data/dataset'

const MAX_MEM = 5000

class Train extends Component{
    constructor(props) {
        super(props)
        this.state = {
            data: null,
            episode_count: +this.props.episode,
            window_size: +this.props.window,
            disabled: false
        }
    }

    train = async () => {
        const {data, episode_count, window_size, agent} = this.state
        const l = data.length - 1
        const batch_size = 32
        

        for (let e = 0; e < episode_count + 1; e++) {
            console.log('Episode ' + e + '/' + episode_count)
            let state = utils.getState(data, 0, window_size + 1)

            let total_profit = 0
            agent.inventory = []
            let total_trades = 0
            
            for (let t = 0; t < l; t++) {
                const action = agent.action(state)

                //sit
                const next_state = utils.getState(data, t + 1, window_size + 1)
                let reward = 0

                //buy
                if(action == 1 && agent.inventory.length === 0) {
                    agent.inventory.push(data[t])
                    // console.log('Buy: ' + data[t])
                } else if(action == 2 && agent.inventory.length > 0) { //sell
                    let bought_price = agent.inventory.shift(0)
                    let _profit = data[t] - bought_price
                    let pct = (_profit / bought_price)
                    reward = _profit <= 0 ? 0 : pct <= 0.1 ? pct * 10 : pct * 100//_.max([_profit, 0])
                    total_profit += isNaN(_profit) ? 0 : _profit
                    total_trades++
                    // console.log('Sell: ' + data[t] + ' | Profit: ' + _profit.toFixed(2))
                }

                let done = t == (l - 1)

                if(agent.memory.length > MAX_MEM) {
                    agent.memory.shift()
                }
                agent.memory.push([state, action, reward, next_state, done])
                state = next_state

                if(done) {
                    console.log('--------------------------------')
                    console.log('Total Profit:', total_profit.toFixed(2), 'Trades:', total_trades)
                    console.log('Loss:', agent.model_loss.slice(-1), 'Accuracy:', agent.model_accuracy.slice(-1))
                    console.log('--------------------------------')
                }

                if(agent.memory.length > batch_size) {
                    await agent.expReplay(batch_size)
                    // console.log(agent.model_loss, agent.model_accuracy)
                }
            }
        }
        this.setState({disabled: !this.state.disabled})
        console.log('Done train')
    }

    handleClick = () => {
        this.train()
        this.setState({disabled: !this.state.disabled})
    }

    componentDidMount() {
        this.setState({
            data: utils.getData().slice(0, 500),
            agent: new Agent(this.state.window_size)
        })
    }

    render() {
        return(
            <div>
                <h1>hello!!</h1>
                <button className={`btn ${this.state.disabled ? 'disabled' : null}`} onClick={this.handleClick}>success button</button>
            </div>            
        )
    }
}

export default Train