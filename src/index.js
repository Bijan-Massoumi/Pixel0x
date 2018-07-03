import Canvas from "./Canvas.js"
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './foundation.min.css';

class App extends React.Component {
    render() {
        return (
            <div className="main-outer">
                <div className= "main-middle">
                    <div className="main-container">
                        <div className="row">
                            <div className="large-12 columns">
                                <Canvas />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

ReactDOM.render(
    <App/>,
    document.getElementById('root')
);
