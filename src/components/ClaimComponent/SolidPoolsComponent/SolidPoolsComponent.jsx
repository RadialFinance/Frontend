import React,{useContext,useState,useEffect} from 'react';
import './SolidPoolsComponent.css';
import RadialLogo from '../../../assets/images/smallLogo.png';
import ArrowLogo from '../../../assets/images/ExpandArrow.svg';
import ClaimContext from '../../ClaimContext';
import AppContext from '../../AppContext';
import { tokenAbi } from '../../../artifacts/tokens';
import config from '../../../artifacts/config.json';
import configSC from '../../../artifacts/smartcontractConfig.json';
import lpManagerAbi from '../../../artifacts/LPManager.json';
import BigNumber from 'bignumber.js';
import toast, { Toaster } from 'react-hot-toast';

import IndividualPoolsComponent from './IndividualPoolsComponent';
import { totalClaimableDataStore } from '../../../stores/dataStore';

export default function SolidPoolsComponent() {
    const claimContext = useContext(ClaimContext);
    const appContext = useContext(AppContext);
    const [expandedStatus,setExpandedStatus] = useState(false);
    const [showMoreStatus,setShowMoreStatus] = useState(false);
    const [tokenContract,setTokenContract] = useState('');
    const [lpManagerContract,setLpManagerContract] = useState('');
    const [claimablePoolArray,setClaimablePoolArray] = useState([]);
    const [totalSolid,setTotalSolid] = useState(0);
    const [solidUsdPrice,setSolidUsdPrice] = useState(0);
    const setTotalClaimable = totalClaimableDataStore((state)=>state.setTotalClaimable);

    const returnDecimalValue = (_value) =>{
      return BigNumber(_value).div(BigNumber(10).pow(18))
    }

    useEffect(()=>{
      let _solidUsd = parseFloat(claimContext?.cryptoPrices["FTM"])*parseFloat(claimContext?.cryptoPrices["SOLID"]);
      if(isNaN(_solidUsd) === false){
          setSolidUsdPrice(_solidUsd);
      }
    },[claimContext?.cryptoPrices]);

    useEffect(()=>{
      let _solidUsdValue = ((Math.trunc((returnDecimalValue(totalSolid))*100000000)/100000000)*solidUsdPrice).toFixed(10);
      if(parseFloat(_solidUsdValue)!==null){
        setTotalClaimable(parseFloat(_solidUsdValue))
      }
    },[totalSolid,solidUsdPrice])

    useEffect(() => {
      if(appContext.web3 !== null){
          setClaimablePoolArray([]);
          const localTokenContract = new appContext.web3.eth.Contract(tokenAbi,config.testAddress);
          setTokenContract(localTokenContract);
          const localLpManagerContract = new appContext.web3.eth.Contract(lpManagerAbi,configSC.LPManagerAddress);
          setLpManagerContract(localLpManagerContract);
          if(claimContext?.poolsList.length>0){
            claimContext?.poolsList[0].forEach((_pool)=>{
              setClaimablePoolArray(_addy => [..._addy,_pool.pool]);
            })
          }
      }
    }, [appContext?.web3,appContext?.currentAccount,claimContext?.poolsList]);


    useEffect(()=>{
        if(claimContext?.poolsList.length>0){
          console.log(claimContext?.poolsList[0]);
          let value = 0;
          claimContext?.poolsList[0].forEach((_data)=>{
            value = BigNumber(value).plus(BigNumber(_data.solidearned));
            console.log(value)
          });
          setTotalSolid(value);
        }


    },[claimContext?.poolsList])



    const showMore = () =>{
        setShowMoreStatus(showMoreStatus => !showMoreStatus);
    };

    const claimAllSolidPools = () => {
      console.log(claimablePoolArray);
      const tx = lpManagerContract.methods.claimSolidRewards(claimablePoolArray).send({
          from: appContext.currentAccount
      });

      tx.on("transactionHash", () => {
        toast.loading("Transaction in progress",{position:'top-center'})
      });

      tx.on("confirmation", (confirmationNumber, receipt) => {
          if(confirmationNumber === 4){
              toast.remove();
              toast.success("Transaction successful",{position:'top-center'})
          }
      });

      tx.on("error", (error)=>{
          toast.remove();
          toast.error("Transaction failed",{position:'top-center'});
      });
    }

  return <div className='container solidPoolsDiv'>
      <div className="row mt-3 claimRowHolder" onClick={()=>{setExpandedStatus(expandedStatus => !expandedStatus)}}>
          <div className="col pt-2">
                <img src={RadialLogo} alt="radial" width={30} height={30} style={{borderRadius:'50px'}} /> 
                <span style={{marginLeft:'10px',fontSize:'1.2rem',fontWeight:'bold'}}>
                    Solid Pools
                </span>
          </div>
          <div className="col">
                <h6 className='claimRowHeader'>Earned (USD value)</h6>
                <h6 className='claimRowSubHeader'>{((Math.trunc((returnDecimalValue(totalSolid))*100000000)/100000000)*solidUsdPrice).toFixed(3)}</h6>
          </div>
          <div className="col">
          </div>
          <div className="col claimActionColumn">
              {
                  appContext?.currentAccount !== null && BigNumber(totalSolid).isZero() === false ?
                  <div>
                    <button className='claimAllPoolButton' onClick={(e)=>{claimAllSolidPools();e.stopPropagation()}} style={{marginRight:'10px'}}>Claim All</button>
                    {
                      expandedStatus ?
                      <img  src={ArrowLogo} style={{transform:"rotateZ(-180deg)"}} alt="expand" />:
                      <img  src={ArrowLogo}  alt="expand" />
                    }
                  </div> :
                  <div>
                    <button disabled className='disabledClaimAllPoolButton' style={{marginRight:'10px'}}>Claim All</button> 
                    {
                      expandedStatus ?
                      <img  src={ArrowLogo} style={{transform:"rotateZ(-180deg)"}} alt="expand" />:
                      <img  src={ArrowLogo}  alt="expand" />
                    }
                  </div>
              }
          </div>
      </div>
      {
        expandedStatus ? 
        <div className="expandedSolidPool">

          {
            claimContext?.poolsList?.length > 0 ?
            claimContext?.poolsList[0].length === 0 ? <p style={{fontWeight:'bold',textAlign:'center',marginTop:'20px'}}>No pools found</p>:           
            <div className="row mt-3" style={{paddingLeft:'13px'}}>
              <div className="col-3">
                <p>Pool Name</p>
              </div>
              <div className="col">
                <p>Earned (USD value)</p>
              </div>
              <div className="col"></div>

              <div className="col"></div>
            </div>
            :<p style={{fontWeight:'bold',textAlign:'center',marginTop:'20px'}}>No pools found</p>
          }
           {
                claimContext?.poolsList?.length > 0 ?
                claimContext?.poolsList[0].map((pool,index)=>(
                        index > 1 && showMoreStatus === false ? <div key={index}></div> :
                        <div key={index}>
                            <IndividualPoolsComponent pool={pool} />
                        </div>
                )) : null
            }
            {
              claimContext?.poolsList?.length>0 ?
              claimContext?.poolsList[0]?.length>2? 
              <div className="row d-flex justify-content-center">
              {
                  !showMoreStatus ?                 
                      <p className='showMoreButton' onClick={()=>{showMore()}}>Show all pools</p>
                  : 
                      <p className='showMoreButton' onClick={()=>{showMore()}}>Hide some pools</p>
              }
              </div>:null
              :null
            }

        </div>
        
        :
        <div></div>
      }

  </div>
}
