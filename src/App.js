import React, { Component } from "react"

// import "./scss/app.scss"

import Train from './containers/train'
import Evaluate from './containers/evaluate'

class App extends Component {

  componentDidMount() {
    
  }

  render() {
    return (
      <div>
        <div className="container">
          <div className="columns">
            <div className="column col-12">
              <Train window='4' episode='500' />
              <Evaluate></Evaluate>
            </div>
          </div>
        </div>        
      </div>
    )
  }
}

export default App