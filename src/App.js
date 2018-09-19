import React, { Component } from "react"

// import "./scss/app.scss"

import Train from './containers/train'

class App extends Component {

  componentDidMount() {
    
  }

  render() {
    return (
      <div>
        <div className="container">
          <div className="columns">
            <div className="column col-12">
              <Train window='10' episode='100' />
            </div>
          </div>
        </div>        
      </div>
    )
  }
}

export default App