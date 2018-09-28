import React, { Component } from "react"
import Agent from '../agent/agent'
import * as utils from '../utils'
import _ from 'lodash'

const MAX_MEM = 10000

class Train extends Component{
    constructor(props) {
        super(props)
        this.state = {
            data: null,
            episode_count: +this.props.episode,
            window_size: +this.props.window,
            disabled: false,
            metrics: [],
            episode: 0
        }
    }

    train = async () => {
        this.setState({
            disabled: !this.state.disabled
        })
        await this.state.agent.updateFrame()
        this.state.agent.clearModels()
        const {data, episode_count, window_size, agent} = this.state
        
        const l = data.close.length - 1
        const buy_hold = (data.close[l] - data.close[0])
        const batch_size = 2048
        const times = []
                

        for (let e = 0; e < episode_count + 1; e++) {
            const start = Date.now()
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
                if(action === 1 && agent.inventory.length === 0) {
                    agent.inventory.push(data.close[t])
                    
                } else if(action === 2 && agent.inventory.length > 0) { //sell
                    let bought_price = agent.inventory.shift(0)
                    let _profit = data.close[t] - bought_price
                    let pct = (_profit / bought_price)

                    //reward = _.max([pct, 0])
                    reward = utils.tanh(pct)
                    total_profit += _profit
                    //reward += total_profit > buy_hold ? 1 : -1
                    total_trades++
                    
                    // console.log('Buy: ' + data[t])
                    // console.log('Sell: ' + data[t] + ' | Profit: ' + _profit.toFixed(2))
                }
                
                let done = t === (l - 1)

                if(agent.memory.length > MAX_MEM - 1) {
                    agent.memory.shift()
                }
                agent.memory.push([state, action, reward, next_state, done])
                state = next_state

                // if(e !== 0 && e % 5 === 0){
                //     await agent.expReplay(batch_size)
                // }

                if(done) {
                    this.setState({
                        metrics: [_.last(agent.model_loss), _.last(agent.model_accuracy)],
                        episode: this.state.episode + 1
                    })
                    console.log(`-------------Ep: ${e}------------`)
                    console.log('Total Profit:', total_profit.toFixed(8), 'Trades:', total_trades)
                    console.log('Vs Buy/Hold:', (total_profit - buy_hold).toFixed(8), buy_hold)
                    console.log('Loss:', _.last(agent.model_loss), 'Accuracy:', _.last(agent.model_accuracy))
                    console.log('--------------------------------')
                }

            }
            //await agent.expReplay(128)

            if (e % 5 === 0) {
                await agent.expReplay(batch_size)
            }
                      
            //await agent.expReplay(batch_size)
            
            if(e % 20 === 0) {
                await agent.model.save(`indexeddb://model-ep_${e}`)
            }
            const executionTime = Date.now() - start
            times.push(executionTime)
            const meanTime = arr => arr.reduce((c, p) => c + p, 0) / arr.length
            console.log(`Episode execution took: ${executionTime}ms`)
            console.log(`Estimated time to finish train: ${utils.calcTime(meanTime(times) * (episode_count - e))}`)
        }
        await agent.model.save('indexeddb://model-1h')
        
        this.setState({disabled: !this.state.disabled})
        console.log('Done training!')
    }

    handleClick = () => {
        this.train()
    }

    componentDidMount() {
        this.setState({
            data: utils.getData('train'),
            agent: new Agent(this.state.window_size)
        })
    }

    render() {
        const {metrics} = this.state        
        
        return(
            <div>
                <h1>hello!!</h1>
                <div>
                    <button className={`btn ${this.state.disabled ? 'loading' : null}`} onClick={this.handleClick}>Train</button>
                </div>
                <div className="bar">
                    <div className="bar-item" role="progressbar" style={{ width: utils.percent(this.state.episode, this.state.episode_count) + '%' }} aria-valuemin="0" aria-valuemax={this.state.episode_count}></div>
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