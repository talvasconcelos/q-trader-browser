import * as tf from "@tensorflow/tfjs"
const _ = require('lodash')

export default class Agent{
    constructor(stateSize, is_eval = false, modelName = '') {
        this.stateSize = stateSize
        this.actionSize = 3
        this.memory = []
        this.inventory = []
        this.modelName = modelName
        this.eval = is_eval

        this.gamma = 0.95
        this.epsilon = 1.0
        this.epsilonMin = 0.01
        this.epsilonDecay = 0.995

        this.model_loss = []
        this.model_accuracy = []

        this.model = is_eval ? tf.loadModel('models/' + modelName) : this._model()
    }

    _model() {
        const model = tf.sequential()
        model.add(tf.layers.dense({
            units: 64,
            inputDim:  this.stateSize,
            activation: 'relu'
        }))
        model.add(tf.layers.dense({units: 32, activation: 'relu'}))
        model.add(tf.layers.dense({units: 8, activation: 'relu'}))
        model.add(tf.layers.dense({units: this.actionSize, activation: 'linear'}))
        model.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'meanSquaredError',
            metrics: ['accuracy']
        })

        return model
    }

    action(state) {
        return tf.tidy(() => {
            if(!this.eval && Math.random() <= this.epsilon){
                return _.random(this.actionSize)
            }
    
            state = tf.tensor(state).reshape([-1, this.stateSize])
            let options = this.model.predict(state).dataSync()
            // console.log(tf.argMax(options).dataSync()[0])
            return tf.argMax(options).dataSync()[0]
        })
    }

    async expReplayEp() {
        for (let i = 0; i < this.memory.length; i++) {
            let [state, action, reward, next_state, done] = this.memory[i]

            state = tf.tensor(state).reshape([-1, this.stateSize])
            next_state = tf.tensor(next_state).reshape([-1, this.stateSize])

            let target = reward

            if (!done) {
                let predictNext = this.model.predict(next_state)
                target = reward + this.gamma * predictNext.argMax().dataSync()[0]
            }

            let target_f = this.model.predict(state).dataSync()
            target_f[action] = target
            target_f = tf.tensor2d(target_f, [1, this.actionSize])//.reshape([1,3])

            await this.model.fit(state, target_f, {
                epochs: 1,
                callbacks: {
                    onEpochEnd: async (epochs, logs) => {
                        if (i === this.memory.length - 1) {
                            this.model_loss.push(logs.loss)
                            this.model_accuracy.push(logs.acc)
                        }
                    }
                }
            })

            state.dispose()
            next_state.dispose()
            target_f.dispose()

            await tf.nextFrame()
        }
    }

    async expReplay(batchSize) {

        let miniBatch = _.sampleSize(this.memory, batchSize)
        // let range = _.sampleSize(this.memory, batchSize)
        // range.map(cur => miniBatch.push(cur))
        

        // for (let i = 0; i < range.length; i++) {
        //     miniBatch.push(this.memory[i])
        // }
                

        for (let j = 0; j < miniBatch.length; j++) {
            let [state, action, reward, next_state, done] = miniBatch[j]
            state = tf.tensor(state).reshape([-1, this.stateSize])
            next_state = tf.tensor(next_state).reshape([-1, this.stateSize])

            let target = reward

            if (!done) {
                let predictNext = this.model.predict(next_state)
                target = reward + this.gamma * predictNext.argMax().dataSync()[0]
            }

            let target_f = this.model.predict(state).dataSync()
            target_f[action] = target
            target_f = tf.tensor2d(target_f, [1, this.actionSize])//.reshape([1,3])
            
            await this.model.fit(state, target_f, {
                epochs: 1,
                callbacks: {
                    onEpochEnd: async (epochs, logs) => {
                        this.model_loss.push(logs.loss)
                        this.model_accuracy.push(logs.acc)
                    }
                }
            })
            
            state.dispose()
            next_state.dispose()
            target_f.dispose()

            await tf.nextFrame()
        }

        if (this.epsilon > this.epsilonMin) {
            this.epsilon *= this.epsilonDecay
        }

    }
}
