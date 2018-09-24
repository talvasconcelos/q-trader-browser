import React, { Component } from "react"
import Agent from '../agent/agent'
import * as utils from '../utils'
import _ from 'lodash'

const MAX_MEM = 2048

class Evaluate extends Component{
    // constructor(props) {
    //     super(props)
    //     this.state = {
    //         data: null,
    //         model_list: null
    //     }
    // }
    state = {
        
    }

    getStartInfo = async () => {
        await this.setState({
            data: utils.getData('test'),
            agent: new Agent(null, true)
        })
        return
    }

    evaluate = async () => {
        
        const {data, agent} = this.state
        const l = data.length - 1
        
        console.log(agent.modelLayers)

        // for (let t = 0; t < l; t++) {
            
        // }
                

    //     for (let e = 0; e < episode_count + 1; e++) {
    //         console.log('Episode ' + e + '/' + episode_count)
    //         let state = utils.getState(data, 0, window_size + 1)

    //         let total_profit = 0
    //         agent.inventory = []
    //         let total_trades = 0
            
    //         for (let t = 0; t < l; t++) {
    //             this.setState({
    //                 data_l: utils.percent(t, l)
    //             })

    //             const action = agent.action(state)

    //             //sit
    //             const next_state = utils.getState(data, t + 1, window_size + 1)
    //             let reward = 0.25

    //             //buy
    //             if(action === 1 && agent.inventory.length === 0) {
    //                 reward += 0.5
    //                 agent.inventory.push(data[t])
                    
    //             } else if(action === 2 && agent.inventory.length > 0) { //sell
    //                 let bought_price = agent.inventory.shift(0)
    //                 let _profit = data[t] - bought_price
    //                 let pct = (_profit / bought_price)

    //                 reward = _profit <= 0 ? -1 : pct <= 0.1 ? 0.5 : 1//_.max([_profit, 0])
    //                 total_profit += _profit
    //                 reward += total_profit > buy_hold ? 1 : -1
                    
    //                 total_trades++
        
    //                 // console.log('Buy: ' + data[t])
    //                 // console.log('Sell: ' + data[t] + ' | Profit: ' + _profit.toFixed(2))
    //             }

                
    //             let done = t === (l - 1)

    //             if(agent.memory.length > MAX_MEM - 1) {
    //                 agent.memory.shift()
    //             }
    //             agent.memory.push([state, action, reward, next_state, done])
    //             state = next_state

    //             if(done) {
    //                 this.setState({
    //                     metrics: [_.last(agent.model_loss), _.last(agent.model_accuracy)],
    //                     episode: this.state.episode + 1,
    //                     data_l: 0
    //                 })
    //                 console.log(`-------------Ep: ${e}------------`)
    //                 console.log('Total Profit:', total_profit.toFixed(2), 'Trades:', total_trades)
    //                 console.log('Vs Buy/Hold:', (total_profit - buy_hold).toFixed(2), buy_hold)
    //                 console.log('Loss:', _.last(agent.model_loss), 'Accuracy:', _.last(agent.model_accuracy))
    //                 console.log('--------------------------------')
    //             }

    //         }

    //         await agent.expReplay(batch_size)

    //         if(e !== 0 && e % 10 === 0) {
    //             await agent.model.save(`indexeddb://modelBH-ep_${e}`)
    //             //await agent.model.save(`downloads://modelBH-ep_${e}`)
    //         }
            
    //     }
    //     await agent.model.save('downloads://modelBH-4h')
    //     this.setState({disabled: !this.state.disabled})
    //     console.log('Done training!')
    }

    

    handleClick = async () => {
        await this.getStartInfo()
        this.setState({disabled: !this.state.disabled})
        this.evaluate()
    }

    render() {
        const {data_l, metrics} = this.state
                
        return(
            <div>
                <h1>Evaluate!!</h1>
                <div>
                    <button className={`btn ${this.state.disabled ? 'loading' : null}`} onClick={this.handleClick}>Evalutate</button>
                </div>
                <div className='mt-2'>
                    <p>Data Points</p>
                    <div className="bar">
                        <div className="bar-item" role="progressbar" style={{ width: data_l + '%' }} aria-valuemin="0" aria-valuemax='100'></div>
                    </div>
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