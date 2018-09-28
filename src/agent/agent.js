import * as tf from "@tensorflow/tfjs"
const _ = require('lodash')

export default class Agent {
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

        this.model = is_eval ? this.loadModel(modelName) : this._model()
    }

    async clearModels() {
        const list = await tf.io.listModels()
        Object.keys(list).map(m => tf.io.removeModel(m))
    }

    async loadModel(name) {
        name = `indexeddb://${name}`
        const list = await tf.io.listModels()
        if(name in list){
            console.log(`Loading existing model...`)
            const model = await tf.loadModel(name)
            console.log(`Model loaded...`)
            this.stateSize = model.layers[0].input.shape[1]
            this.model = model
        } else {
            throw new Error(`Cannot find model at ${name}.`)
        }
    }

    async listModels() {
        const list = await tf.io.listModels()
        return Object.keys(list)
    }



    _model() {
        const model = tf.sequential()
        model.add(tf.layers.dense({
            units: 32,
            inputShape: [this.stateSize],
            //inputDim:  this.stateSize,
            activation: 'relu'
        }))
        model.add(tf.layers.dense({
            units: 16,
            activation: 'relu'
        }))
        model.add(tf.layers.dense({
            units: 8,
            activation: 'relu'
        }))
        model.add(tf.layers.leakyReLU())
        model.add(tf.layers.dense({
            units: this.actionSize,
            activation: 'linear'
        }))
        model.compile({
            optimizer: tf.train.adam(),
            loss: 'meanSquaredError',
            metrics: ['accuracy']
        })

        //model.summary()

        return model
    }

    action(state) {
        return tf.tidy(() => {
            if (!this.eval && Math.random() <= this.epsilon) {
                return _.random(this.actionSize - 1)
            }

            let _state = tf.tensor(state).reshape([-1, this.stateSize])
            let options = this.model.predict(_state).dataSync()
            
            //console.log(tf.argMax(options).dataSync()[0])
            return tf.argMax(options).dataSync()[0]
        })
    }

    async updateFrame() {
        return await tf.nextFrame()
    }

    async expReplay(batchSize) {

        const miniBatch = _.sampleSize(this.memory, batchSize)

        let X = []
        let Y = []

        await miniBatch.map(mem => {

            let [state, action, reward, next_state, done] = mem
            //console.log(state)
            let target = reward

            let _state = tf.tensor(state).reshape([-1, this.stateSize])
            let _next_state = tf.tensor(next_state).reshape([-1, this.stateSize])

            if (!done) {
                let predictNext = this.model.predict(_next_state).dataSync()
                target = reward + this.gamma * tf.max(predictNext).dataSync()[0]
            }
            let target_f = this.model.predict(_state).dataSync()
            target_f[action] = target
            //console.log(target_f, action, target)

            _state.dispose()
            _next_state.dispose()

            X.push(state)
            Y.push(Array.from(target_f))

            return true
        })
        //console.log(X.slice(0, 11))
        X = tf.tensor(X).reshape([-1, this.stateSize])
        Y = tf.tensor2d(Y)

        // X.print()
        // this.model.predict(X).print()

        await this.model.fit(X, Y, {
            epochs: 5,
            //batchSize,
            callbacks: {
                // onBatchEnd: async (batch, logs) => {
                //     console.log(`Batch: ${batch} | Loss: ${logs.loss} | Acc: ${logs.acc}`)
                //     await tf.nextFrame()
                // },
                onEpochEnd: async (epoch, logs) => {
                    this.model_loss.push(logs.loss)
                    this.model_accuracy.push(logs.acc)
                    console.log(`Loss: ${logs.loss} | Acc: ${logs.acc}`)
                    // console.log(`${logs.val_loss} ${logs.val_acc}`)
                    await tf.nextFrame()
                }
            }
        })


        if (this.epsilon > this.epsilonMin) {
            this.epsilon *= this.epsilonDecay
        }

        X.dispose()
        Y.dispose()

    }
}