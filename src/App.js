import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import Navigation from './components/Navigation';


import RealEstate from './abis/RealEstate.json';
import Escrow from './abis/Escrow.json';
import config from './config.json';


function App() {
  const [acct, setAcct] = useState(null);
  const [provider, setProvider] = useState(null);
  const [homes,setHomes] = useState([]);

  const loadBlockchain = async()=>{
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);
    const network = await provider.getNetwork();

    const realEstate = new ethers.Contract(config[network.chainId].realEstate.address,RealEstate,provider);
    // const escrow = new ethers.Contract(config[network.chainId].escrow.address,Escrow,provider);

    const totalSupply = await realEstate.totalSupply();
    ;
    
    for(let i=1;i<=totalSupply;i++){
      const uri = await realEstate.tokenURI(i);
      console.log(uri)
      const res = await fetch(uri);  
      const data = await res.json();
      setHomes(home=>[...home,data]);
    }
    console.log(homes);


    window.ethereum.on('accountsChanged', async()=>{
      const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
      const account = ethers.utils.getAddress(accounts[0]);
      setAcct(account);
    })
  }


  useEffect(()=>{
    loadBlockchain();
  },[acct])

  return (
    <div>
        <Navigation acct={acct} setAcct={setAcct}/>
        <div>
          {homes.map((home)=>{
            return (
              <div>
                <div>
                  <img src={home.image} alt="" />
                </div>
                <div>
                  <h1>{home.name}</h1>
                  <h2>{home.attributes[0].value}</h2>
                  <p>{home.description}</p>
                  <h3>{home.address}</h3>

                </div>



              </div>


            )
          })}
        </div>
    </div>
  );
}

export default App;
