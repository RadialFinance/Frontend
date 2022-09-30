import React, { useEffect, useState } from 'react'
import { useContext } from 'react';
import AppContext from '../../AppContext';
import ClaimContext from '../../ClaimContext';
import ReactTooltip from "react-tooltip";
import InfoIcon from '../../../assets/images/info.svg';
import RadialLogo from '../../../assets/images/smallLogo.png';
import configSC from '../../../artifacts/smartcontractConfig.json';
import lpManagerAbi from '../../../artifacts/LPManager.json';
import depositorAbi from '../../../artifacts/Depositor.json';
import BigNumber from 'bignumber.js';
import toast, { Toaster } from 'react-hot-toast';

function IndividualPoolsComponent(props) {
    let appContext = useContext(AppContext);
    let claimContext = useContext(ClaimContext);

    const [lpManagerContract,setLpManagerContract] = useState('');
    const [solidEarned,setSolidEarned] = useState(0);
    const [solidUsdPrice,setSolidUsdPrice] = useState(0);

    useEffect(()=>{
        let _solidUsd = parseFloat(claimContext?.cryptoPrices["FTM"])*parseFloat(claimContext?.cryptoPrices["SOLID"]);
        if(isNaN(_solidUsd) === false){
            setSolidUsdPrice(_solidUsd);
        }
    },[claimContext?.cryptoPrices]);

    useEffect(() => {
        if(appContext.web3 !== null){
            const localLpManagerContract = new appContext.web3.eth.Contract(lpManagerAbi,configSC.LPManagerAddress);
            setLpManagerContract(localLpManagerContract);
        }
    }, [appContext?.web3,appContext?.currentAccount]);

    const claimSolidPool = (poolAddress) => {
        let poolAddressArray = [`${poolAddress}`];
        console.log(poolAddressArray)
        const tx = lpManagerContract.methods.claimSolidRewards(poolAddressArray).send({
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

    const returnDecimalValue = (_value) =>{
        return BigNumber(_value).div(BigNumber(10).pow(18))
    }

    return (
    <div className="row poolRow" >
    <div className="col-3 listCol">
    <Toaster/>
        <div className="d-flex">
            <div>
                <img src={RadialLogo} alt="logo" style={{width:'25px',height:'25px',borderRadius:'50px'}} />
            </div>
            <div className='d-flex'>
                <div className='listText' style={{paddingLeft:'5px'}}>{props.pool.poolname}</div>
                    {
                        props.pool.poolname === "VolatileV1 AMM - WFTM/RDL"  ?
                        <div>
                            <img src={InfoIcon} alt="Info" style={{marginLeft:'5px'}} width={20} height={20} data-tip data-for="registerTip" />
                            <ReactTooltip id="registerTip" place="right" effect="solid">
                                The earnings include the boosted SOLID RDL/wFTM <br/> earned from both locking and staking RDL/wFTM LP tokens.
                            </ReactTooltip>
                        </div>:null
                    }
            </div>
        </div>
    </div>
    <div className="col-4 listCol">
        <div className="row">
            <p className='listText'>{Math.trunc((returnDecimalValue(props?.pool.solidearned))*100000000)/100000000} SOLID {solidUsdPrice === 0? "($0)": "($"+((Math.trunc((returnDecimalValue(props?.pool.solidearned))*100000000)/100000000)*solidUsdPrice).toFixed(2)+")"}</p>
        </div>
    </div>
    <div className="col listCol">
        <div className="row">
            
        </div>
    </div>
    <div className="col listCol">
        <div className="d-flex justify-content-end">
          {
            appContext?.currentAccount !== null && parseFloat(props?.pool.solidearned) !== 0 ?
            <button className="claimIndividualPoolButton" onClick={(e)=>{claimSolidPool(props?.pool.pool);e.stopPropagation()}} >Claim</button>:
            <button disabled className="disabledClaimIndividualPoolButton">Claim</button> 

          }
        </div>
    </div>
    </div>
  )
}

export default IndividualPoolsComponent