import React,{useContext,useEffect,useState} from 'react';
import AppContext from '../../AppContext';
import ClaimContext from '../../ClaimContext';
import RadialLogo from '../../../assets/images/smallLogo.png';
import poolBribeManagerContractAbi from '../../../artifacts/PoolBribeManager.json';
import configSC from '../../../artifacts/smartcontractConfig.json';
import toast, { Toaster } from 'react-hot-toast';
import { rdlLatestWeekClaimed } from '../../../stores/apistore';
import BigNumber from 'bignumber.js';


function FtmIncentivesComponent(props) {
    let appContext = useContext(AppContext);
    let claimContext = useContext(ClaimContext);
    const [poolBribeManagerContract,setPoolBribeManagerContract] = useState(null);

    useEffect(()=>{
        if(appContext?.web3 !== null){
          const localPoolBribeManagerContract = new appContext.web3.eth.Contract(poolBribeManagerContractAbi,configSC.poolBribeManagerAddress);
          setPoolBribeManagerContract(localPoolBribeManagerContract);
        }
    },[appContext?.web3])

    let claimFtmIncentives = () =>{
        let weekList = props?.weeksList;
        let tokenList = props?.tokensList;
        console.log(props?.weeksList,props?.tokensList);
        const tx = poolBribeManagerContract.methods.claimBribes(tokenList,weekList).send({
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
    <div className="row poolRow">
        <div className="col listCol">
            <Toaster/>
            <div className="row">
                <div className="col-2">
                    <img src={RadialLogo} alt="logo" style={{width:'25px',height:'25px',borderRadius:'50px'}} />
                </div>
                <div className="col-6">
                    <p className='listText'>FTM incentives</p>
                </div>
            </div>
        </div>
        <div className="col listCol">
            { BigNumber(props?.totalFtmIncentive).div(BigNumber(10).pow(18)).toFixed(18) !== null ? BigNumber(props?.totalFtmIncentive).div(BigNumber(10).pow(18)).toFixed(3) : "0" } FTM
            (${BigNumber(props?.totalUsdValue).div(BigNumber(10).pow(18)).toFixed(18) !== null ? BigNumber(props?.totalUsdValue).div(BigNumber(10).pow(18)).toFixed(3) : "0"})
        </div>
        <div className="col listCol">

        </div>
        <div className="col listCol">
            <div className="d-flex justify-content-end">
            {
                appContext?.currentAccount !== null && BigNumber(props?.totalFtmIncentive).isZero() === false ?
                <button className="claimIndividualPoolButton" onClick={(e)=>{claimFtmIncentives();e.stopPropagation()} }>Claim</button>:
                <button disabled className="disabledClaimIndividualPoolButton">Claim</button>
            }
            </div>
        </div>
    </div>
  )
}

export default FtmIncentivesComponent