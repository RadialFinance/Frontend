import {
  HashRouter,
  Routes,
  Route
} from "react-router-dom";
import '../node_modules/bootstrap/dist/js/bootstrap.min.js';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { useState,useEffect } from 'react';
import AppContext from './components/AppContext';
import HomeComponent from './components/HomeComponent/HomeComponent';
import FarmsComponent from "./components/FarmsComponent/FarmsComponent";
import FarmPoolComponent from "./components/FarmsComponent/FarmPoolComponent";
import ClaimRdlComponent from "./components/ClaimRdlComponent/ClaimRdlComponent";
import ClaimComponent from "./components/ClaimComponent/ClaimComponent";
import Web3 from 'web3';
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import StakeComponent from "./components/StakeComponent/StakeComponent";
import VotePoolComponent from "./components/VoteComponent/VotePoolComponent";
import WhiteListComponent from "./components/WhiteListComponent/WhiteListComponent";




function App() {

  const [currentAccount, setCurrentAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [chainId, setChainId] = useState(0);

  // Web3modal instance
  let web3Modal;

  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        rpc: {
          250: "https://rpc.ankr.com/fantom/",
        }
      }
    }
  };


  const init = async() => {
        web3Modal = new Web3Modal({
            network: "fantom", 
            cacheProvider: true, 
            providerOptions
        });
  };
  init();


  const fetchAccountData = async (provider) => {
      // Get a Web3 instance for the wallet
      const _web3 = new Web3(provider);
      const chainId = await _web3.eth.getChainId();
      if(chainId === 250){
          setChainId(chainId);
      }else{
          try{
              await window.ethereum.request({
                  method: 'wallet_switchEthereumChain',
                  params: [{ chainId: '0xFA' }],
              });
              return;
          }
          catch(switchError){
              if (switchError.code === 4902) {
                  try {
                    await window.ethereum.request({
                      method: 'wallet_addEthereumChain',
                      params: [{ 
                          chainId: '0xFA', 
                          nativeCurrency: {
                              name: 'Fantom token',
                              symbol: 'FTM',
                              decimals: 18,
                          },
                          chainName: 'Fantom Opera',  
                          rpcUrls: ['https://rpc.ankr.com/fantom/'],
                          blockExplorerUrls:['https://ftmscan.com/']
                      }],
                    });
                  } catch (addError) {
                    alert('There was an issue adding the fantom network, please try again.')
                    return;
                  }
              }
          }

      }
      const accounts = await _web3.eth.getAccounts();
      setCurrentAccount(accounts[0]);
      setWeb3(_web3);
    };

    const refreshAccountData = async (provider) => {
        await fetchAccountData(provider);
    };

    const connect = async () => {
        if (window.ethereum === undefined) {
          console.log('Need to install MetaMask');
          alert('Please install MetaMask browser extension to interact');
          return;
        }

        let _provider;

        try {   
            _provider = await web3Modal.connect();
        } catch (e) {
            console.log("Could not get a wallet connection", e);
            return;
        }

        setProvider(_provider);


        if (_provider) {
        // Subscribe to accounts change
        _provider.on("accountsChanged", (accounts) => {
            fetchAccountData(_provider);
            console.log("accountsChanged");
        });

        // Subscribe to chainId change
        _provider.on("chainChanged", (chainId) => {
            fetchAccountData(_provider);
            setChainId(chainId);
            console.log("chainChanged");
        });

        // Subscribe to session disconnection
        _provider.on("disconnect", (code, reason) => {
            console.log(code, reason);
            console.log("disconnect");
            web3Modal.clearCachedProvider();
        });

        await refreshAccountData(_provider);
        }
  };

  async function disconnect() {
    await web3Modal.clearCachedProvider();
    setCurrentAccount(null);
    setProvider(null);
    setWeb3(null);
    setChainId(0);
  }
  
  useEffect(() => {
    (async () => {
      if(web3 === null){
        let _web3 = new Web3("https://rpc.ankr.com/fantom");
        setWeb3(_web3);
      }
      if(localStorage.getItem("WEB3_CONNECT_CACHED_PROVIDER")){
        setWeb3(null);
        await connect();
      }
    })()
    // eslint-disable-next-line
  },[]);

  const appSettings = {
    currentAccount,
    web3,
    provider,
    chainId,
    fetchAccountData,
    refreshAccountData,
    connect,
    disconnect
  };



  return (
    <HashRouter>
      <AppContext.Provider value={appSettings}>
        <div className="App">
              <Routes>
                <Route path="/" element={<HomeComponent />} />
                <Route path="/farms" element={<FarmsComponent /> } />
                <Route path="/farms/:poolname" element={<FarmPoolComponent /> } />    
                <Route path="claimRDL" element={<ClaimRdlComponent /> } />     
                <Route path="/stake" element={<StakeComponent/>} />       
                <Route path="vote/pools" element={<VotePoolComponent /> } />    
                <Route path="vote/whitelist" element={<WhiteListComponent /> } /> 
                <Route path="/claim" element={<ClaimComponent/>} />  
                <Route path="*" element={<HomeComponent />} />        
              </Routes>
          </div>
      </AppContext.Provider>
    </HashRouter>
  );
}

export default App;