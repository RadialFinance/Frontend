import React,{useContext,useState,useEffect} from 'react';
import './PoolVotingComponent.css';
import RadialLogo from '../../../assets/images/smallLogo.png';
import ArrowLogo from '../../../assets/images/ExpandArrow.svg';
import ClaimContext from '../../ClaimContext';
import AppContext from '../../AppContext';
import poolBribeManagerContractAbi from '../../../artifacts/PoolBribeManager.json';
import configSC from '../../../artifacts/smartcontractConfig.json';
import { allWeekWhichUserVoted, rdlLatestWeekClaimed, rdlLockDataStore } from '../../../stores/apistore';
import FtmIncentivesComponent from './FtmIncentivesComponent';
import RdlRewardsComponent from './RdlRewardsComponent';
import BigNumber from 'bignumber.js';
import { totalClaimableDataStore } from '../../../stores/dataStore';
const starttime = configSC.starttime;

const getTime = () =>{
  return Math.floor( Date.now() / 1000 );
}

const getWeek = () =>{
  let time = getTime();
  return (time - starttime)/604800;
}

export default function PoolVotingComponent() {
    const claimContext = useContext(ClaimContext);
    const appContext = useContext(AppContext);
    const [expandedStatus,setExpandedStatus] = useState(false);
    const [poolBribeManagerContract,setPoolBribeManagerContract] = useState(null);
    const lockedRdlValue = rdlLockDataStore((state)=>state.rdlLock);
    const setRdlLockedData = rdlLockDataStore((state)=>state.setRdlLockData);
    const [totalFtmIncentive,setTotalFtmIncentives] = useState(0);
    const [totalUsdValue,setTotalUsdValue] = useState(0);
    const [weeksList,setWeeksList] = useState([]);
    const [tokensList,setTokenList] = useState([]);
    const setTotalClaimable = totalClaimableDataStore((state)=>state.setTotalClaimable);
    const [rdlRewardsWeeks,setRdlRewardsWeek] = useState([]);
    const [totalRdlRewards,setTotalRdlRewards] = useState(0);
    const [rdlUsdPrice,setRdlUsdPrice] = useState(0);
    const [poolVotingUsdValue,setPoolVotingUsdValue] = useState([]);
  
    useEffect(()=>{
      if(claimContext?.poolListIncentive.length>0){
        let incenitveTokens = [];
        let incentiveWeeks = [];
        let _total_ftm_incentive = 0;
        claimContext?.poolListIncentive[0]?.forEach((_value) => {
          incenitveTokens.push(_value.token);
          incentiveWeeks.push(parseFloat(_value.week));
          if(_value.amount !== "0" && isFinite(_value.incentive.toFixed(18))){
            _total_ftm_incentive = BigNumber(_total_ftm_incentive).plus(BigNumber(_value.incentive))

          }
        })
        setTotalFtmIncentives(_total_ftm_incentive);
        setWeeksList(old => [...old,... new Set(incentiveWeeks)]);
        setTokenList(old => [...old,... new Set(incenitveTokens)]);
      }
    },[claimContext?.poolListIncentive]);
  
  
    useEffect(()=>{
      let _ftmUsd = parseFloat(claimContext?.cryptoPrices["FTM"])*parseFloat(totalFtmIncentive);
      console.log(totalFtmIncentive);
      if(isNaN(_ftmUsd) === false && totalFtmIncentive !== 0){
        setTotalUsdValue(_ftmUsd);
        if(_ftmUsd!==null){
          setTotalClaimable(parseFloat(BigNumber(_ftmUsd).div(BigNumber(10).pow(18)).toFixed(18)));
          setPoolVotingUsdValue(_old=>[..._old,parseFloat(BigNumber(_ftmUsd).div(BigNumber(10).pow(18)).toFixed(18))])
        }
      }
    },[claimContext?.cryptoPrices,totalFtmIncentive]);

  useEffect(()=>{
    if(appContext?.currentAccount !== null){
        // Fetch lockedRdlValue & lockedRdlFtmValue
        setRdlLockedData(appContext?.currentAccount);
    }
  },[appContext?.currentAccount])

  /// Fetch RDL rewards
  useEffect(()=>{
    if(appContext?.web3 !== null){
        let currentWeek = Math.floor(getWeek());
        const localPoolBribeManagerContract = new appContext.web3.eth.Contract(poolBribeManagerContractAbi,configSC.poolBribeManagerAddress);
        setPoolBribeManagerContract(localPoolBribeManagerContract);
        if(appContext?.web3.currentProvider.selectedAddress !== undefined){
            console.log(appContext?.web3.currentProvider.selectedAddress);
            let rdlData = async()=>{
              let weeks_list = [];
              let rdlLatestWeekClaimedData = await rdlLatestWeekClaimed(appContext?.web3.currentProvider.selectedAddress);
              console.log(rdlLatestWeekClaimedData.data.rdlrewards);
              let week = 0;
              if(rdlLatestWeekClaimedData.data.rdlrewards.length > 0){
                week = parseInt(rdlLatestWeekClaimedData?.data?.rdlrewards[0]?.week)
              }
              let allWeekWhichUserVotedData = await allWeekWhichUserVoted(week,currentWeek,appContext?.web3.currentProvider.selectedAddress);
              if(allWeekWhichUserVotedData.data.votes.length>0){
                for await (const weekData of allWeekWhichUserVotedData.data.votes){
                  if(weeks_list.includes(parseInt(weekData.week)) === false){
                    weeks_list.push(parseInt(weekData.week));
                  }
                }
              }
              console.log(weeks_list);
              return weeks_list;
            }

            rdlData().then((_data)=>{
              setRdlRewardsWeek(_old => [..._old,..._data]);
              let total_rdl_claim = 0
              localPoolBribeManagerContract.methods.getRDLToClaim(appContext?.web3.currentProvider.selectedAddress,_data).call().then((value)=>{
                console.log(value);
                value.forEach(data=>{
                  total_rdl_claim = BigNumber(total_rdl_claim).plus(BigNumber(data))
                })
                console.log(BigNumber(total_rdl_claim).div(BigNumber(10).pow(18)).toFixed(18));
                setTotalRdlRewards(total_rdl_claim);
              })
            });
        }
    }
  },[appContext?.web3])


  useEffect(()=>{
    let _rdlUsd = parseFloat(claimContext?.cryptoPrices["FTM"])*parseFloat(claimContext?.cryptoPrices["RDL"]);
    if(isNaN(_rdlUsd) === false){
        console.log(totalRdlRewards);
        let rdlValueInUsd = parseFloat(_rdlUsd)*parseFloat(BigNumber(totalRdlRewards).div(BigNumber(10).pow(18)).toFixed(18))
        setRdlUsdPrice(rdlValueInUsd);
        setTotalClaimable(rdlValueInUsd);
        setPoolVotingUsdValue(_old=>[..._old,rdlValueInUsd])
    }
  },[totalRdlRewards,claimContext?.cryptoPrices])


  return <div className='container solidPoolsDiv'>
      <div className="row mt-3 claimRowHolder" onClick={()=>setExpandedStatus(expandedStatus => !expandedStatus)}>
          <div className="col pt-2">
                <img src={RadialLogo} alt="radial" width={30} height={30} style={{borderRadius:'50px'}} /> 
                <span style={{marginLeft:'10px',fontSize:'1.2rem',fontWeight:'bold'}}>
                    Pool Voting
                </span>
          </div>
          <div className="col">
                <h6 className='claimRowHeader'>Earned (USD value)</h6>
                <h6 className='claimRowSubHeader'>${poolVotingUsdValue.length > 0 ? Math.trunc((poolVotingUsdValue.reduce((a, b) => a + b, 0))*1000)/1000 : "0.000"}</h6>
          </div>
          <div className="col"></div>
          <div className="col claimActionColumn">
                    <div style={{paddingTop:"5px"}}> {
                      expandedStatus ?
                      <img  src={ArrowLogo} style={{transform:"rotateZ(-180deg)"}} alt="expand" />:
                      <img  src={ArrowLogo}  alt="expand" />
                    }
                    </div>
          </div>
      </div>
      {
        expandedStatus ? 
          <div className="expandedSolidPool mt-3">
          <div className="row mt-3" style={{paddingLeft:'13px'}}>
            <div className="col">
              <p>Token</p>
            </div>
            <div className="col">
              <p>Earned (USD value)</p>
            </div>
            <div className="col"></div>
            <div className="col"></div>
          </div>
          <RdlRewardsComponent
          rdlRewardsWeeks={rdlRewardsWeeks}
          totalRdlRewards={totalRdlRewards}
          rdlUsdPrice={rdlUsdPrice}
          />
          <FtmIncentivesComponent 
          totalFtmIncentive={totalFtmIncentive} 
          totalUsdValue={totalUsdValue}
          weeksList={weeksList}
          tokensList={tokensList} />
        </div>
        :null
      }
  </div>
}
