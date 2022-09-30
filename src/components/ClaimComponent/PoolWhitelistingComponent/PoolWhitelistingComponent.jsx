import React,{useContext, useEffect, useState} from 'react';
import './PoolWhitelistingComponent.css';
import RadialLogo from '../../../assets/images/smallLogo.png';
import AppContext from '../../AppContext';
import whiteListingBribeManagerAbi from '../../../artifacts/WhitelistingBribeManager.json';
import configSC from '../../../artifacts/smartcontractConfig.json';
import Swal from 'sweetalert2';
import ClaimContext from '../../ClaimContext';
import BigNumber from 'bignumber.js';
import toast, { Toaster } from 'react-hot-toast';
import { totalClaimableDataStore } from '../../../stores/dataStore';

export default function PoolWhitelistingComponent() {
  const appContext = useContext(AppContext);
  const claimContext = useContext(ClaimContext);
  const [whitelistBribeManagerContract,setWhitelistBribeManagerContract] = useState(null);
  const [totalIncentive,setTotalIncentives] = useState(0);
  const [totalUsdValue,setTotalUsdValue] = useState(0);
  const [weeksList,setWeeksList] = useState([]);
  const [tokensList,setTokenList] = useState([]);
  const setTotalClaimable = totalClaimableDataStore((state)=>state.setTotalClaimable);

  useEffect(()=>{
    if(claimContext?.whiteListIncentives.length>0){
      let incenitveTokens = [];
      let incentiveWeeks = [];
      let total_incentive = 0;
      console.log(claimContext?.whiteListIncentives[0]);
      claimContext?.whiteListIncentives[0]?.forEach((_value) => {
        console.log(_value);
        incenitveTokens.push(_value.token);
        incentiveWeeks.push(_value.week);
        if(_value.amount !== "0" && isFinite(_value.incentive.toFixed(18))){
            total_incentive = BigNumber(total_incentive).plus(BigNumber(_value.incentive));
        }
      })
      setTotalIncentives(total_incentive);
      setWeeksList(old => [...old,...incentiveWeeks]);
      setTokenList(old => [...old,...incenitveTokens]);
    }
  },[claimContext?.whiteListIncentives]);


  useEffect(()=>{
    let _ftmUsd = parseFloat(claimContext?.cryptoPrices["FTM"])*parseFloat(totalIncentive);
    console.log(claimContext?.cryptoPrices)
    if(isNaN(_ftmUsd) === false && _ftmUsd !==null){
        setTotalUsdValue(_ftmUsd);
        setTotalClaimable(parseFloat(BigNumber(_ftmUsd).div(BigNumber(10).pow(18)).toFixed(18)));
    }
  },[claimContext?.cryptoPrices,totalIncentive]);

  useEffect(()=>{
    if(appContext?.web3 !== null){
      const localWhitelistBribeManagerContract = new appContext.web3.eth.Contract(whiteListingBribeManagerAbi,configSC.whitelistingBribeManagerAddress);
      setWhitelistBribeManagerContract(localWhitelistBribeManagerContract);
    }
  },[appContext?.web3])

  let claimAllFtmIncentves = () => {
    console.log(tokensList,weeksList);
    const tx = whitelistBribeManagerContract.methods.claimBribes(tokensList,weeksList).send({
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

  return (
    <div className='container solidPoolsDiv'>
    <Toaster/>
    <div className="row mt-3 poolWhiteListingHolder">
        <div className="col pt-2">
              <img src={RadialLogo} alt="radial" width={30} height={30} style={{borderRadius:'50px'}} /> 
              <span style={{marginLeft:'10px',fontSize:'1.2rem',fontWeight:'bold'}}>
                  Pool Whitelisting
              </span>
        </div>
        <div className="col">
              <h6 className='claimRowHeader'>Earned (USD value)</h6>
              <h6 className='claimRowSubHeader'>${BigNumber(totalUsdValue).div(BigNumber(10).pow(18)).toFixed(3)}</h6>
        </div>
        <div className="col">
                <h6 className='claimRowHeader'>FTM incentives</h6>
                <h6 className='claimRowSubHeader'>{BigNumber(totalIncentive).div(BigNumber(10).pow(18)).toFixed(3)}</h6>
        </div>
        <div className="col d-flex justify-content-end">
            {
                appContext?.currentAccount !== null && BigNumber(totalIncentive).isZero() === false ?
                <div>
                  <button className='claimAllPoolButton' onClick={(e)=>{claimAllFtmIncentves();e.stopPropagation()}} style={{marginRight:'0px'}}>Claim All</button>
                </div> :
                <div>
                  <button disabled className='disabledClaimAllPoolButton' style={{marginRight:'0px'}}>Claim All</button> 
                </div>
            }
        </div>
    </div>
    </div>
  )

}
