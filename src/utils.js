import train  from './data/datasets/BTCUSDT_4h.json'
import test from './data/datasets/ETCBTC_4h.json'
import * as _ from 'lodash'

export const getData = (pair) => {
    const rawData = pair === 'train' ? train : test
    return rawData.map(cur => +cur.close).filter(v => v)
}

export const sigmoid = (x) => (1 / (1 + Math.exp(-x)))

export const getState = (data, t, n) => {
    let d = t - n + 1
    let block
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
        res.push(sigmoid(block[i + 1] - block[i]))
    }
    return res
}

export const percent = (x, y) => {
    return Math.ceil((x * 100) / y)
}