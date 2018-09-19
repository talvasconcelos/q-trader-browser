import React, { Component } from "react"
import Agent from '../agent/agent'
import * as utils from '../utils'
import _ from 'lodash'
// import {data} from '../data/dataset'

const MAX_MEM = 1000

class Train extends Component{
    constructor(props) {
        super(props)
        this.state = {
            data: null,
            episode_count: +this.props.episode,
            window_size: +this.props.window,
            disabled: false,
            metrics: [],
            episode: 0,
            data_l: 0
        }
    }

    train = async () => {
        const {data, episode_count, window_size, agent, data_l} = this.state
        const l = data.length - 1
        const batch_size = 32
        

        for (let e = 0; e < episode_count + 1; e++) {
            console.log('Episode ' + e + '/' + episode_count)
            let state = utils.getState(data, 0, window_size + 1)

            let total_profit = 0
            agent.inventory = []
            let total_trades = 0

            // data.map(async (cur,i) => {
            //     const action = agent.action(state)

            //     //sit
            //     const next_state = utils.getState(data, i + 1, window_size + 1)
            //     let reward = 0

            //     //buy
            //     if (action === 1 && agent.inventory.length === 0) {
            //         agent.inventory.push(cur)
            //         // console.log('Buy: ' + data[t])
            //     } else if (action === 2 && agent.inventory.length > 0) { //sell
            //         let bought_price = agent.inventory.shift(0)
            //         let _profit = cur - bought_price
            //         let pct = (_profit / bought_price)
            //         reward = _profit <= 0 ? 0 : pct <= 0.1 ? pct * 10 : pct * 100//_.max([_profit, 0])
            //         total_profit += isNaN(_profit) ? 0 : _profit
            //         total_trades++
            //         // console.log('Sell: ' + data[t] + ' | Profit: ' + _profit.toFixed(2))
            //     }

            //     let done = i === (data.length - 1)

            //     if (agent.memory.length > MAX_MEM) {
            //         agent.memory.shift()
            //     }

            //     agent.memory.push([state, action, reward, next_state, done])
            //     state = next_state

            //     if (done) {
            //         console.log('--------------------------------')
            //         console.log('Total Profit:', total_profit.toFixed(2), 'Trades:', total_trades)
            //         console.log('Loss:', _.last(agent.model_loss), 'Accuracy:', _.last(agent.model_accuracy))
            //         console.log('--------------------------------')
            //     }

            //     if (agent.memory.length > batch_size) {
            //         await agent.expReplay(batch_size)
            //         this.setState({ metrics: [_.last(agent.model_loss), _.last(agent.model_accuracy)] })
            //         // console.log(_.last(agent.model_loss), _.last(agent.model_accuracy))
            //     }
            //     this.setState({ data_l: i })
            // })
            
            for (let t = 0; t < l; t++) {
                const action = agent.action(state)

                //sit
                const next_state = utils.getState(data, t + 1, window_size + 1)
                let reward = 0

                //buy
                if(action === 1 && agent.inventory.length === 0) {
                    agent.inventory.push(data[t])
                    // console.log('Buy: ' + data[t])
                } else if(action === 2 && agent.inventory.length > 0) { //sell
                    let bought_price = agent.inventory.shift(0)
                    let _profit = data[t] - bought_price
                    let pct = (_profit / bought_price)
                    reward = _profit <= 0 ? 0 : pct <= 0.1 ? pct * 10 : pct * 100//_.max([_profit, 0])
                    total_profit += isNaN(_profit) ? 0 : _profit
                    total_trades++
                    // console.log('Sell: ' + data[t] + ' | Profit: ' + _profit.toFixed(2))
                }

                let done = t === (l - 1)

                if(agent.memory.length > MAX_MEM) {
                    agent.memory.shift()
                }
                agent.memory.push([state, action, reward, next_state, done])
                state = next_state

                if(done) {
                    console.log('--------------------------------')
                    console.log('Total Profit:', total_profit.toFixed(2), 'Trades:', total_trades)
                    console.log('Loss:', _.last(agent.model_loss), 'Accuracy:', _.last(agent.model_accuracy))
                    console.log('--------------------------------')
                }

                if (agent.memory.length > batch_size && action != 0) {
                    await agent.expReplay(batch_size)
                    this.setState({metrics: [_.last(agent.model_loss), _.last(agent.model_accuracy)]})
                    // console.log(_.last(agent.model_loss), _.last(agent.model_accuracy))
                }
                this.setState({ data_l: t })
            }
            // await agent.expReplayEp()
            this.setState({episode: this.state.episode + 1})
        }
        await agent.model.save('downloads://model01')
        this.setState({disabled: !this.state.disabled})
        console.log('Done train')
    }

    handleClick = () => {
        this.train()
        this.setState({disabled: !this.state.disabled})
    }

    componentDidMount() {
        this.setState({
            data: utils.getData().slice(-500),
            agent: new Agent(this.state.window_size)
        })
    }

    render() {
        const {data_l, metrics} = this.state
        return(
            <div>
                <h1>hello!!</h1>
                <div>
                    <button className={`btn ${this.state.disabled ? 'disabled' : null}`} onClick={this.handleClick}>success button</button>
                </div>
                
                <div className="bar bar-sm">
                    <div className="bar-item" role="progressbar" style={{ width: this.state.episode + '%' }} aria-valuenow={this.state.episode} aria-valuemin="0" aria-valuemax={this.state.episode_count}></div>
                </div>
                <p></p>
                <div className="bar bar-sm">
                    <div className="bar-item" role="progressbar" style={{ width: (data_l / 5) + '%' }} aria-valuenow={(data_l / 5)} aria-valuemin="0" aria-valuemax={this.state.data && this.state.data.length}></div>
                </div>
                <div>
                    <p>{`Loss: ${metrics[0] || 0}`}</p>
                    <p>{`Acc: ${metrics[1] || 0}`}</p>
                </div>
            </div>  
        )
    }
}

export default Train