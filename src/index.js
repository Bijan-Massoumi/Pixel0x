
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
        this.state = {
            color: props.color,
        }
    }

    componentWillReceiveProps(nextProps) {
        this.hoverTemp = nextProps.color;
        this.setState({color: nextProps.color});
    }

    hoverLeave(){
        this.setState({color: this.hoverTemp});
        this.props.squareLeft();
    }

    hoverEnter(){
        this.hoverTemp = this.state.color;
        this.setState({color: "#D3D3D3"});
        this.props.squareEntered();
    }

    render() {
         return (<div className="square"
                style={{backgroundColor: this.state.color}}
                onMouseLeave = {() => this.hoverLeave()}
                onMouseEnter = {() => this.hoverEnter()}
                onClick = { () => this.props.onClick()}>
                          {}
                 </div>);
             }
}


class BitMap extends React.Component {

    constructor(props) {
        super(props);
        this.numRows=20;
        this.numCols=20;
        this.hasChanged = false;
        this.state = {
            squares: Array(this.numRows*this.numCols).fill(null),
        }
    }


    shouldComponentUpdate(nextProps, nextState){
        if (this.hasChanged) {
            this.hasChanged = false;
            return true;
        }
        return false
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

                 allEvents.get((err,logs) => {
                     const squares = this.state.squares.slice();
                     for (let i = 0; i < logs.length; i++) {
                         let elem = logs[i].args;
                         squares[elem.pixelNumber.c[0]] = new PixelElement("#000000", elem.amountPaid.c[0]);
                    }
                    this.hasChanged = true;
                    this.setState({squares: squares})
                 })

                 contractInstance.allEvents({
                     fromBlock: 'latest',
                     toBlock:'latest'
                  }).watch((err,res) => {
                      let elem = res.args;
                      let pixelNum = elem.pixelNumber.c[0];
                      const squares = this.state.squares.slice();
                      squares[pixelNum]= new PixelElement("#000000", elem.amountPaid.c[0]);
                      this.hasChanged = true;
                      this.setState({squares: squares});
                })
            })
        })
        .catch(() => {
            console.log('Error finding web3.');
        })
    }

    purchasePixel(pixelNum) {
        web3.eth.getAccounts((error, accounts) => {
            let contractInstance;
            storageInstance.deployed().then((instance) => {
                contractInstance = instance;
                return contractInstance.set(pixelNum,1,{value: 100000000000000000,from: accounts[0]});
            }).then((res) =>{
                console.log(res.valueOf());
            });
        });
    }

    squareEntered(pixelNum) {
        let amount = this.state.squares[pixelNum] ? this.state.squares[pixelNum].amountPaid: 0;
        let infoText = "Highest Bid is currently:" + web3.fromWei(amount, 'ether') + " ether.";
        this.props.onPixelHover(infoText)
    }

    squareLeft(pixelNum) {
        this.props.onPixelHover("");
    }

    renderSquare(pixelNum) {
        return <Square
            color = {this.state.squares[pixelNum] ? this.state.squares[pixelNum].color: null}
            paid = {this.state.squares[pixelNum] ? this.state.squares[pixelNum].amountPaid: null}
            onClick = {() => this.purchasePixel(pixelNum)}
            squareEntered = {() => this.squareEntered(pixelNum)}
            squareLeft = {() =>  this.squareLeft(pixelNum)}
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
            <div className = "game-board">
            {
                this.renderBoard()
            }
            </div>
        );
    }
}

class Canvas extends React.Component {

    constructor(props) {
        super(props);
        this.state={
            boardInfo: ""
        }
    }

    handleInfoChange = (boardInfo) =>{
        this.setState({boardInfo: boardInfo});
    }

    render() {
        return (
            <div className = "game">
                <BitMap onPixelHover = {this.handleInfoChange} />
                <div className = "row">
                    <div className="large-6 columns game-info">
                        {this.state.boardInfo}
                    </div>
                    <div className="large-6 columns input">
                        {"blah"}
                    </div>
                </div>
            </div>
       );
    }
}


class PixelElement {
    constructor(color, amountPaid) {
        this.color = color;
        this.amountPaid = amountPaid;
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
   <App />,
  document.getElementById('root')
);
