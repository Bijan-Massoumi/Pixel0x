
import getWeb3 from './utils/getWeb3'
import SimpleStorageContract from '../build/contracts/SimpleStorage.json'
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './foundation.min.css';

let storageInstance;
let web3;


class Square extends React.Component {

    constructor(props) {
        super(props);
        this.hoverTemp=null;
        this.state={
            color: props.color
        }
    }

    componentWillReceiveProps(nextProps) {
        this.hoverTemp = nextProps.color;
        this.setState({color: nextProps.color});

    }

    hoverLeave(){
        this.setState({color: this.hoverTemp});
    }

    hoverEnter(){
        this.hoverTemp = this.state.color;
        this.setState({color: "#D3D3D3"});
    }

    render() {
         return (<div className="square"
                style={{backgroundColor: this.state.color}}
                onMouseLeave={() => this.hoverLeave()}
                onMouseEnter ={() => this.hoverEnter()}
                onClick = { () => this.props.onClick()}>
                          {}
                 </div>);
             }
}

class Board extends React.Component {

    constructor(props) {
        super(props);
        this.numRows=20;
        this.numCols=20;
        this.state={
            squares: Array(this.numRows*this.numCols).fill(null),
        }
    }

    componentDidMount() {
        getWeb3
        .then(results => {
            web3 = results.web3
            // Instantiate contract once web3 provided.
            const contract = require('truffle-contract');
            storageInstance = contract(SimpleStorageContract);
            storageInstance.setProvider(web3.currentProvider);


            storageInstance.deployed().then((contractInstance) => {
                const allEvents = contractInstance.allEvents({
                    fromBlock: 0,
                     toBlock:'latest'
                 });
                 console.log("here")
                 allEvents.watch((err,res) => {
                     let pixelNum = res.args.pixelNumber.c[0];
                     const squares = this.state.squares.slice();
                     squares[pixelNum]="#000000";
                     this.setState({squares: squares});
                })
            })
        })
        .catch(() => {
            console.log('Error finding web3.');
        })
    }

    handleClick(pixelNum) {
        web3.eth.getAccounts((error, accounts) => {
            let contractInstance;
            storageInstance.deployed().then((instance) => {
                contractInstance = instance;
                return contractInstance.set(pixelNum,1,{from: accounts[0]});
            }).then((res) =>{
                console.log(res.valueOf());
            });
        });
    }

    renderSquare(pixelNum) {
        return <Square
            color = {this.state.squares[pixelNum]}
            onClick = {() => this.handleClick(pixelNum)}
            />;

    }

    renderRow(rowNum, numCols) {
        return Array.apply(null, {length: numCols}).map(Number.call, Number).map( (n) => {
            let newSquare = this.renderSquare((rowNum * this.numCols) + n);
            return newSquare;
        });
    }

    renderBoard() {
        return Array.apply(null, {length: this.numRows}).map(Number.call, Number).map((n) => {
            let row = (
                <div className="board-row">
                {
                   this.renderRow(n,this.numCols)
                }
                </div>
            );
            return row
        });
    }
    render() {
        return (
          <div>
          {
              this.renderBoard()
          }
         </div>
       );
    }
}

class PixelMap extends React.Component {
    constructor(props) {
        super(props);
    }


    render() {
        return (
          <div className="game">
            <div className="game-board">
              <Board />
            </div>
            <div className="game-info">
              <div>{/* status */}</div>
              <ol>{/* TODO */}</ol>
            </div>
          </div>
        );
      }
}

class App extends React.Component {
    render() {
        return (
            <div className="main-outer">
                <div className= "main-middle">
                    <div className = "main-container">
                        <div className="row">
                            <div className = "large-12 columns">
                                <PixelMap />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

ReactDOM.render(
   <App />,
  document.getElementById('root')
);
