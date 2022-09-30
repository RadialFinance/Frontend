import React, { useContext,useEffect, useState } from 'react'
import './FarmPoolComponent.css';
import AppContext from '../AppContext';
import HeaderComponent from '../HeaderComponent/HeaderComponent';
import FooterComponent from '../FooterComponent/FooterComponent';
import Logo from '../../assets/images/smallLogo.png'
import USDC from '../../assets/images/USDC.svg';
import ETH from '../../assets/images/ETH.svg';
import FRAX from '../../assets/images/FRAX.svg';
import YFI from '../../assets/images/YFI.svg';
import MIM from '../../assets/images/MIM.svg';
import wFTM from '../../assets/images/wFTM.svg';
import TOMB from '../../assets/images/TOMB.svg';
import SUSHI from '../../assets/images/SUSHI.svg';
import BTC from '../../assets/images/BTC.png'
import gWBTC from '../../assets/images/GWBTC.png';
import xBOO from '../../assets/images/BOO.jpg';
import xSCREAM from '../../assets/images/SCREAM.jpg';
import LQDR from '../../assets/images/LQDR.jpg';
import xTAROT from '../../assets/images/TAROT.png';
import xCREDIT from '../../assets/images/CREDIT.png';
import fBEETS from '../../assets/images/BEETS.png';
import SPIRIT from '../../assets/images/SPIRIT.jpg';
import WeVE from '../../assets/images/WEVE.png';
import HND from '../../assets/images/HND.png';
import DAI from '../../assets/images/DAI.png';
import GEIST from '../../assets/images/GEIST.png';
import OXD from '../../assets/images/OXD.png';
import IB from '../../assets/images/IB.png';
import MULTI from '../../assets/images/MULTI.png';
import SYN from '../../assets/images/SYN.png';
import gOHM from '../../assets/images/GOHM.jpg';
import EXOD from '../../assets/images/EXOD.png';
import { radialAbi } from '../../artifacts/radial';
import { tokenAbi } from '../../artifacts/tokens';
import config from '../../artifacts/config.json';
import Swal from 'sweetalert2';
import BigNumber from "bignumber.js";


export default function FarmPoolComponent() {
    const [pool,setPool] = useState('');
    const appContext = useContext(AppContext);
    const [tokenContract,setTokenContract] = useState(null);
    const [radialContract,setRadialContract] = useState(null);
    const [withdrawValue,setWithdrawValue] = useState('');
    const [stakedAmount, setStakedAmount] = useState('0');

    useEffect(()=>{
        if(appContext.web3 !== null){
            let poolTemp = window.location.href.split('/');
            let poolName = poolTemp[poolTemp.length-1];
            setPool(poolName);
            if(poolName !== undefined){
                console.log(config[poolName]?.address);
                const localTokenContract = new appContext.web3.eth.Contract(tokenAbi,config[poolName]?.address);
                const localRadialContract = new appContext.web3.eth.Contract(radialAbi,config.masterChef);
                setTokenContract(localTokenContract);
                setRadialContract(localRadialContract);
                if(appContext?.currentAccount!==null){
                    localRadialContract.methods.userInfo(config[poolName].poolId, appContext.currentAccount).call().then((info) => {
                        console.log(info);
                        const amount = BigNumber(info.amount).div(BigNumber(10).pow(config[poolName].decimals)).toString();
                        setStakedAmount(amount);
                    });
                }
            }
        }
    },[appContext?.web3,appContext?.currentAccount]);

    useEffect(()=>{
        let poolTemp = window.location.href.split('/');
        let poolName = poolTemp[poolTemp.length-1];
        if(poolName !== undefined){
            setPool(poolName);
            if(appContext.web3) {
                const localTokenContract = new appContext.web3.eth.Contract(tokenAbi,config[poolName]?.address);
                const localRadialContract = new appContext.web3.eth.Contract(radialAbi,config.masterChef);
                setTokenContract(localTokenContract);
                setRadialContract(localRadialContract);
                if(appContext?.currentAccount !== null){
                    localRadialContract.methods.userInfo(config[poolName].poolId, appContext.currentAccount).call().then((info) => {
                        console.log(info);
                        const amount = BigNumber(info.amount).div(BigNumber(10).pow(config[poolName].decimals)).toString();
                        setStakedAmount(amount);
                    });
                }
            }
        }

    },[]);// eslint-disable-line react-hooks/exhaustive-deps

    const approveTransaction = () =>{
        let hasAllowance = false;
        tokenContract.methods.allowance(appContext.currentAccount, config.masterChef).call().then((allowance) => {
            if(allowance !== "0") {
                Swal.fire('Allowance exists');
                hasAllowance = true;
            }
        }).then(() => {
            if(hasAllowance) {
                return;
            }

            const tx = tokenContract.methods.approve(config.masterChef,"0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff").send({
                from: appContext.currentAccount
            });
    
            tx.on("transactionHash", () => {
                // TODO: Popup to show pending tx
                Swal.fire({title:'Transaction in progress',confirmButtonColor:'#F1CBA6'});
            });
    
            tx.on("receipt", () => {
                Swal.fire({title:'Transaction successful',confirmButtonColor:'#F1CBA6'});
            });
        });
    };

    const withdrawTransaction = (amount) => {
        amount = BigNumber(amount).times(BigNumber(10).pow(config[pool].decimals)).toFixed(0);
        const tx = radialContract.methods.withdraw(config[pool].poolId, amount).send({
            from: appContext.currentAccount
        });

        tx.on("trasactionHash", () => {
            // TODO: Popup to show pending tx
            Swal.fire({title:'Transaction in progress',confirmButtonColor:'#F1CBA6'});
        });

        tx.on("receipt", () => {
             // TODO: Popup to show withdrawal was successful
             Swal.fire({title:'Withdrawal successful',confirmButtonColor:'#F1CBA6'});
             radialContract.methods.userInfo(config[pool].poolId, appContext.currentAccount).call().then((info) => {
                console.log(info);
                const amount = BigNumber(info.amount).div(BigNumber(10).pow(config[pool].decimals)).toString();
                setStakedAmount(amount);
            });
        });
    }

    return (
        <div className='farmPoolDiv'>
            <HeaderComponent/>
            <div className="farmPoolInnerDiv container ">
                <img src={Logo} style={{width:'60px',height:'60px',borderRadius:'50px'}} alt="logo" />
                <h1 id='farmPoolHeading' className='mt-3'>{pool} Pool</h1>
                <h4 id='farmPoolSubHeading'>Deposit {pool} and earn $RDL</h4>
                <div className="row mt-5">
                    <div className="col-6">
                        <div className="poolCard">
                            {
                                {
                                    'USDC':<img src={USDC} style={{width:'60px',height:'60px',borderRadius:'50px'}} alt="logo" />,
                                    'ETH':<img src={ETH} style={{width:'60px',height:'60px',borderRadius:'50px'}} alt="logo" />,
                                    'FRAX':<img src={FRAX} style={{width:'60px',height:'60px',borderRadius:'50px'}} alt="logo" />,
                                    'YFI':<img src={YFI} style={{width:'60px',height:'60px',borderRadius:'50px'}} alt="logo" />,
                                    'MIM':<img src={MIM} style={{width:'60px',height:'60px',borderRadius:'50px'}} alt="logo" />,
                                    'wFTM':<img src={wFTM} style={{width:'60px',height:'60px',borderRadius:'50px'}} alt="logo" />,
                                    'TOMB':<img src={TOMB} style={{width:'60px',height:'60px',borderRadius:'50px'}} alt="logo" />,
                                    'SUSHI':<img src={SUSHI} style={{width:'60px',height:'60px',borderRadius:'50px'}} alt="logo" />,
                                    'gWBTC':<img src={gWBTC} style={{width:'60px',height:'60px',borderRadius:'50px'}} alt="logo" />,
                                    'BTC':<img src={BTC} style={{width:'60px',height:'60px',borderRadius:'50px'}} alt="logo" />,
                                    'xBOO':<img src={xBOO} style={{width:'60px',height:'60px',borderRadius:'50px'}} alt="logo" />,
                                    'xSCREAM':<img src={xSCREAM} style={{width:'60px',height:'60px',borderRadius:'50px'}} alt="logo" />,
                                    'LQDR':<img src={LQDR} style={{width:'60px',height:'60px',borderRadius:'50px'}} alt="logo" />,
                                    'xTAROT':<img src={xTAROT} style={{width:'60px',height:'60px',borderRadius:'50px'}} alt="logo" />,
                                    'xCREDIT':<img src={xCREDIT} style={{width:'60px',height:'60px',borderRadius:'50px'}} alt="logo" />,
                                    'fBEETS':<img src={fBEETS} style={{width:'60px',height:'60px',borderRadius:'50px'}} alt="logo" />,
                                    'SPIRIT':<img src={SPIRIT} style={{width:'60px',height:'60px',borderRadius:'50px'}} alt="logo" />,
                                    'gETH':<img src={ETH} style={{width:'60px',height:'60px',borderRadius:'50px'}} alt="logo" />,
                                    'WeVE':<img src={WeVE} style={{width:'60px',height:'60px',borderRadius:'50px'}} alt="logo" />,
                                    'HND':<img src={HND} style={{width:'60px',height:'60px',borderRadius:'50px'}} alt="logo" />,
                                    'yvWFTM':<img src={wFTM} style={{width:'60px',height:'60px',borderRadius:'50px'}} alt="logo" />,
                                    'yvUSDC':<img src={USDC} style={{width:'60px',height:'60px',borderRadius:'50px'}} alt="logo" />,
                                    'yvDAI':<img src={DAI} style={{width:'60px',height:'60px',borderRadius:'50px'}} alt="logo" />,
                                    'yvMIM':<img src={MIM} style={{width:'60px',height:'60px',borderRadius:'50px'}} alt="logo" />,
                                    'yvWETH':<img src={ETH} style={{width:'60px',height:'60px',borderRadius:'50px'}} alt="logo" />,
                                    'yvYFI':<img src={YFI} style={{width:'60px',height:'60px',borderRadius:'50px'}} alt="logo" />,
                                    'GEIST':<img src={GEIST} style={{width:'60px',height:'60px',borderRadius:'50px'}} alt="logo" />,
                                    'OXD':<img src={OXD} style={{width:'60px',height:'60px',borderRadius:'50px'}} alt="logo" />,
                                    'BOO':<img src={xBOO} style={{width:'60px',height:'60px',borderRadius:'50px'}} alt="logo" />,
                                    'IB':<img src={IB} style={{width:'60px',height:'60px',borderRadius:'50px'}} alt="logo" />,
                                    'BEETS':<img src={fBEETS} style={{width:'60px',height:'60px',borderRadius:'50px'}} alt="logo" />,
                                    'SCREAM':<img src={xSCREAM} style={{width:'60px',height:'60px',borderRadius:'50px'}} alt="logo" />,
                                    'FXS':<img src={FRAX} style={{width:'60px',height:'60px',borderRadius:'50px'}} alt="logo" />,
                                    'MULTI':<img src={MULTI} style={{width:'60px',height:'60px',borderRadius:'50px'}} alt="logo" />,
                                    'SYN':<img src={SYN} style={{width:'60px',height:'60px',borderRadius:'50px'}} alt="logo" />,
                                    'gOHM':<img src={gOHM} style={{width:'60px',height:'60px',borderRadius:'50px'}} alt="logo" />,
                                    'EXOD':<img src={EXOD} style={{width:'60px',height:'60px',borderRadius:'50px'}} alt="logo" />,
                                }[pool]
                            }
                            <h1 className='poolCardHeader'>
                                {BigNumber(stakedAmount).decimalPlaces(6).toString()}
                            </h1>
                            <h6 className='poolCardSubHeader'>
                                {pool} Staked
                            </h6>
                            <button disabled className='poolCardButtonDisabled' onClick={()=> approveTransaction()}>
                                    Approve {pool}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="row mt-5" style={{width:'400px'}}>
                    <div className='withdrawFormHolder'>
                        <div className="row">
                            <div className="col-10">
                                <input className='mt-2 mb-3' required placeholder='Enter the withdraw amount' type="number" id="withdrawInputField" value={withdrawValue} onChange={e=> setWithdrawValue(e.target.value)}/>
                            </div>
                            <div className="col-2">
                                <button className='maxButton' style={{marginLeft:'20px'}} onClick={()=>setWithdrawValue(stakedAmount)}>Max</button>
                            </div>
                        </div>
                        {
                            appContext?.currentAccount === null ?                        
                            <button disabled id="harvestWithdrawButton" onClick={() => withdrawTransaction(withdrawValue)}>
                                Withdraw
                            </button> :
                            <button id="harvestWithdrawButton" onClick={() => withdrawTransaction(withdrawValue)}>
                                Withdraw
                            </button>
                        }

                    </div>
                </div>
            </div>
            <div style={{height:'5vh'}}>

            </div>
            <FooterComponent/>
        </div>
    )
}
