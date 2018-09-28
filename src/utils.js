import train  from './data/datasets/BTCUSDT_1h.json'
import test from './data/datasets/ETCBTC_1h.json'
import * as _ from 'lodash'

export const getData = (pair) => {
    const data = pair === 'train' ? train : test
    let open = data.map(v => +v.open).filter(v => v)
    let high = data.map(v => +v.high).filter(v => v)
    let close = data.map(v => +v.close).filter(v => v)
    let low = data.map(v => +v.low).filter(v => v)
    let volume = data.map(v => +v.volume).filter(v => v)
    return {open, high, close, low, volume}
}

export const calcTime = (miliseconds) => {
    var days, hours, minutes, seconds, total_hours, total_minutes, total_seconds;

    total_seconds = parseInt(Math.floor(miliseconds / 1000), 10);
    total_minutes = parseInt(Math.floor(total_seconds / 60), 10);
    total_hours = parseInt(Math.floor(total_minutes / 60), 10);
    days = parseInt(Math.floor(total_hours / 24), 10);

    seconds = parseInt(total_seconds % 60, 10);
    minutes = parseInt(total_minutes % 60, 10);
    hours = parseInt(total_hours % 24, 10);

    return `${days} Days, ${hours} Hours, ${minutes} minutes, ${seconds} seconds.`
}

export const sigmoid = (x) => (1 / (1 + Math.exp(-x)))
export const tanh = (x) => (Math.tanh(x))

// const rotationalFactor = (high, low) => {
//     return high.map((cur, i) => {
//         if(i > 0){
//             let highScore, lowScore
//             switch (true) {
//                 case high[i] > high[i - 1]:
//                     highScore = 0.5
//                     break;
//                 case high[i] < high[i - 1]:
//                     highScore = -0.5
//                     break;
//                 default:
//                     highScore = 0
//             }
//             switch (true) {
//                 case low[i] > low[i - 1]:
//                     lowScore = 0.5
//                     break;
//                 case low[i] < low[i - 1]:
//                     lowScore = -0.5
//                     break;
//                 default:
//                     lowScore = 0
//             }
//             return highScore + lowScore
//         }
//         return 0
//     })
// }

export const getState = (rawData, t, n) => {
    const data = rawData.close
    let d = t - n + 1
    let block
    //let RT = await rotationalFactor(rawData.high, rawData.low)
    
    if(d >= 0){
        block = data.slice(d, t + 1)
    } else {
        //let x = Math.abs(d)
        let pad = _.fill(Array(Math.abs(d)), 0)
        let _data = data.slice(0, t + 1)
        block = [...pad, ..._data]
    }
    let res = []
    for (let i = 0; i < n - 1; i++) {
        res.push(tanh(block[i + 1] - block[i]))
        //res.push(sigmoid(block[i + 1] - block[i]))
    }
    //console.log(res)
    return res
}

export const percent = (x, y) => {
    return Math.ceil((x * 100) / y)
}