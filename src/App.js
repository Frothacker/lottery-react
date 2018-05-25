import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import web3 from './web3';
import lottery from './lottery';
// allows us to communicate with the contract on rinkeby test network with the
// interface(ABI) has created in ./lottery (local to the react app)
//compared to calling into ganache that we used for running mocha tests. 
 
// Difference between test and our app is:
// the test file deploys and calls into ganache, 
// which gives us the ABI to communicate with our contract on ganache
// However our app deploys in deploy.js, 
//    and out react app cannot access the ABI created by that deployment,
//        because they're in two different folders 
//        (info transfer between them isn't supported)
//
//  so to communicate to the already deployed contract, 
//    we re-create the ABI (in ./lottery)

//  now we can call through the metamask provider (from ./web), 
//  using the ABI natively generated in our app. 
//              
//  we had to natively generate it becasue we can't acess the ABI
//  created by the deploy file because our app is made in a different folder.  
//    


class App extends Component {
  state = {
    manager: '',
    players: [],
    balance: '',
    value: '', 
    message: ''
  };

  async componentDidMount() {
    const manager = await lottery.methods.manager().call();  
    const players = await lottery.methods.getPlayers().call();
    //no need to specify an adress to call from because 
    //metamask automaticaly uses the first address in your adresses.
    const balance = await web3.eth.getBalance(lottery.options.address);

    this.setState({ manager, players, balance });
  }

  onSubmit = async (event) => {
    event.preventDefault();

    this.setState({ message: 'Waiting on transaction success...'}); 
    
    const accounts = await web3.eth.getAccounts();
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei(this.state.value, 'ether')
    });
    this.setState({ message: 'You have been entered!'});
  };


  onClick = async (event) => {
    event.preventDefault();

    this.setState({ message: 'Waiting on transaction success...' });
    const jackpot = await web3.eth.getBalance(lottery.options.address); 
    const accounts = await web3.eth.getAccounts();
    await lottery.methods.pickWinner().send({
      from: accounts[0]
    });
    const winner = await lottery.methods.getWinner().call();
    this.setState({ message: winner + ' has won ' + web3.utils.fromWei(jackpot, 'ether') + ' ether!'});
  };
  
  render() {
    return (
      <div>
        <h2>Lottery Contract</h2>
        <p>This contract is managed by {this.state.manager}</p>
        <p>There are currently {this.state.players.length} people entered, 
        competing for {web3.utils.fromWei(this.state.balance, 'ether')} ether. </p>
        
        <hr />

        <form onSubmit={this.onSubmit} > 
          <h4>Want to try your luck?</h4>
          <div> 
            <label>Amount of ether to enter</label>
            <input 
              value = {this.state.value}
              onChange = {event => this.setState({ value: event.target.value }) }
            />
          </div>
          <button>Enter</button>
        </form> 

        <hr />

        <h4>Time to pick a winner?</h4>
        <button onClick= {this.onClick}>Pick Winner</button>

        <hr />
        <h4>{this.state.message}</h4> 
        
         
      </div>
    );
  }
}

export default App;
