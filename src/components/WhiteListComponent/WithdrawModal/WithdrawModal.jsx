import React,{useState,useEffect,useContext} from 'react'
import './WithdrawModal.css'
import Select from 'react-select';
import whiteListBribeManagerAbi from '../../../artifacts/WhitelistingBribeManager.json';
import poolBribeManagerContractAbi from '../../../artifacts/PoolBribeManager.json';
import configSC from '../../../artifacts/smartcontractConfig.json';
import AppContext from '../../AppContext';
import lpPoolAbi from '../../../artifacts/Token.json';
import BigNumber from 'bignumber.js';
import toast, { Toaster } from 'react-hot-toast';

function WithdrawModal(props) {
    const appContext = useContext(AppContext);
    const [whiteListBribeManagerContract,setWhiteListBribeManagerContract] = useState(null);
    const [poolBribeManagerContract,setPoolBribeManagerContract] = useState(null);
    const [pool,setPool] = useState([]);
    const [week,setWeek] = useState([]);
    const [selectedPool, setSelectedPool] = useState(null);
    const [selectedWeek, setSelectedWeek] = useState(null);
    const [incentive,setIncentive] = useState(null);


    useEffect(()=>{
        if(appContext?.web3 !== null){
            let _poolList = {};
            let _weekList = {}
            props?.incentivesList.forEach((pool)=>{
                console.log(pool);
                (async()=>{
                    if(_poolList.hasOwnProperty(pool.pool) === false){
                        _poolList[pool.pool] = "_";
                        let localLpPoolContract = new appContext.web3.eth.Contract(lpPoolAbi,pool.pool);
                        let pool_name = await localLpPoolContract.methods.name().call();
                        let _data = {"label":pool_name,"value":pool.pool};
                        setPool(_pool=>[..._pool,_data])
                    }
                    if(_weekList.hasOwnProperty(pool.week) === false){
                        _weekList[pool.week] = "-" 
                        let _data = {"label":pool.week,"value":pool.week}
                        setWeek(_week=>[...week,_data])
                    }
                })();
            })
            if(props?.pageType === "whitelist"){
                const localWhiteListBribeManagerContract = new appContext.web3.eth.Contract(whiteListBribeManagerAbi,configSC.whitelistingBribeManagerAddress);
                setWhiteListBribeManagerContract(localWhiteListBribeManagerContract);
            }
            else if (props?.pageType === "poolvoting"){
                const localPoolBribeManagerContract = new appContext.web3.eth.Contract(poolBribeManagerContractAbi,configSC.poolBribeManagerAddress);
                setPoolBribeManagerContract(localPoolBribeManagerContract);
            }

        }      
    },[appContext?.web3,props?.pageType]);

    useEffect(()=>{
        if(props?.pageType === "whitelist"){
            if(selectedPool !== null && selectedWeek !== null){
                const localWhiteListBribeManagerContract = new appContext.web3.eth.Contract(whiteListBribeManagerAbi,configSC.whitelistingBribeManagerAddress);
                localWhiteListBribeManagerContract.methods.bribes(appContext?.currentAccount,selectedPool?.value,selectedWeek?.value).call().then((_incentive)=>{
                    setIncentive(_incentive)
                });
            }
        }
        else if(props?.pageType === "poolvoting"){
            if(selectedPool !== null && selectedWeek !== null){
                const localPoolBribeManagerContract = new appContext.web3.eth.Contract(poolBribeManagerContractAbi,configSC.poolBribeManagerAddress);
                localPoolBribeManagerContract.methods.bribes(appContext?.currentAccount,selectedPool?.value,selectedWeek?.value).call().then((_incentive)=>{
                    setIncentive(_incentive)
                });
            }
        }

    },[selectedPool,selectedWeek,props?.pageType])

    let withdrawIncentives = () => {
        if(props?.pageType === "whitelist"){
            const tx = whiteListBribeManagerContract.methods.withdraw(selectedPool.value,selectedWeek.value).send({
                from: appContext.currentAccount,
            });
    
            tx.on("transactionHash", () => {
                toast.loading("Transaction in progress",{position:'top-center'})
            });
    
            tx.on("confirmation", (confirmationNumber, receipt) => {
                if(confirmationNumber === 4){
                    toast.remove();
                    toast.success("Transaction successful",{position:'top-center'});
                    props?.setWithdrawModalIsOpen(false);
                }
            });

            tx.on("error", (error)=>{
                toast.remove();
                toast.error("Transaction failed",{position:'top-center'});
            });
        }
        else if (props?.pageType === "poolvoting"){
            const tx = poolBribeManagerContract.methods.withdraw(selectedPool.value,selectedWeek.value).send({
                from: appContext.currentAccount
            });
    
            tx.on("transactionHash", () => {
                toast.loading("Transaction in progress",{position:'top-center'})
            });
    
            tx.on("confirmation", (confirmationNumber, receipt) => {
                if(confirmationNumber === 4){
                    toast.remove();
                    toast.success("Transaction successful",{position:'top-center'});
                    props?.setWithdrawModalIsOpen(false);
                }
            });
                        
            tx.on("error", (error)=>{
                toast.remove();
                toast.error("Transaction failed",{position:'top-center'});
            });
        }

    }

    return (
    <>
    <div className="darkBG" onClick={() => props.setWithdrawModalIsOpen(false)} />
    <div className="centered">
        <div className="withdrawModalPopUp">
            <div style={{fontSize:'1.5rem',fontWeight:'bold',textAlign:'center'}}>WITHDRAW INCENTIVES</div>
            <div style={{textAlign:'center',fontSize:'1rem',paddingTop:'15px'}}>Select pool and week to withdraw incentives.</div>
            <div className="row mt-4">
                <div className="col-3">
                    <div style={{textAlign:'left',paddingTop:'5px',fontWeight:'bold'}}>
                        Pool:
                    </div>
                </div>
                <div className="col-9">
                    <Select options={pool} onChange={setSelectedPool} className="poolsDropDown" />
                </div>
            </div>
            <div className="row mt-3">
                <div className="col-3" style={{textAlign:'left',paddingTop:'5px',fontWeight:'bold'}}>
                Week:
                </div>
                <div className="col-9">
                    <Select options={week} onChange={setSelectedWeek} className="poolsDropDown" />
                </div>
            </div>
            <div className="row mt-3">
                <div className="col-4" style={{textAlign:'left',paddingTop:'5px',fontWeight:'bold'}}>
                Incentives:
                </div>
                <div className="col-8" style={{paddingTop:'5px'}}>
                    {
                        incentive !== null ?
                        (BigNumber(incentive)/BigNumber(10).pow(18)).toFixed(4):
                        '--'
                    }
                </div>
            </div>
            <div className="d-flex justify-content-center mt-4">
                <button className='withdrawIncentiveBtn' onClick={()=>{withdrawIncentives()}}>WITHDRAW</button>
            </div>
        </div>
    </div>
    </>
    )
}

export default WithdrawModal