import React, { useState } from 'react'
import { ethers } from 'ethers';


const Navigation = ({acct, setAcct}) => {

  const [connected, setConnected] = useState(false);
  
  const connectWallet = async () => {
    const accounts = await window.ethereum.request({method: 'eth_requestAccounts'},[]);
    const account = ethers.utils.getAddress(accounts[0]);
    
    setConnected(true);
    setAcct(account);
  }
  const disconnectHandler = async() => {
    setConnected(false);
    setAcct(null);
  }

  return (
    <nav className='max-h-[150px] font-bold px-20 py-5 border-b-2 flex items-center justify-around'>
        <div className='flex items-center gap-4'>
            <img src="https://cdn-icons-png.freepik.com/512/585/585474.png" className='h-20 w-20' alt="logo" />
            <h1 className='text-4xl'>Real Estate</h1>   
        </div>
        
        <ul className='flex flex-row text-2xl gap-10'>
            <li>Buy</li>
            <li>Rent</li>
            <li>Sell</li>
        </ul>
        <button className="bg-slate-200 px-4 py-3 rounded-xl" onClick={connected ? disconnectHandler : connectWallet}>
            {connected ? "Disconnect Wallet" : "Connect Wallet"}
        </button>
          <h4 className="wal-add">{connected && `${acct.slice(0,6)}...${acct.slice(-4)}`}</h4>
    </nav>
  )
}

export default Navigation;