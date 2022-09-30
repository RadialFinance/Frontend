import React,{useState,useEffect,useContext} from 'react';
import './ClaimRdlComponent.css';
import HeaderComponent from '../HeaderComponent/HeaderComponent';
import FooterComponent from '../FooterComponent/FooterComponent';
import Logo from '../../assets/images/smallLogo.png';
import AppContext from '../AppContext';
import BigNumber from "bignumber.js";
import { radialVestingContractAbi } from '../../artifacts/radialVestingContract';
import radialVestingConfig from '../../artifacts/radialVestingConfig.json';
import Swal from 'sweetalert2';

export default function ClaimRdlComponent() {
    const appContext = useContext(AppContext);
    const[radialContract,setRadialContract] = useState(null);
    const[claimedRdl,setClaimedRdl] = useState('0.00');
    const[availableRdl,setAvailableRdl] = useState('0.00');
    const[vested,setVested] = useState('0.00');
    const[toVest,setToVest] = useState('0.00');

    const setData = (data) => {
        let currentUnixTimestap = ~~(+new Date() / 1000);
        data.amount = BigNumber(data.amount);
        data.lastClaim = parseFloat(data.lastClaim);
        data.start = parseFloat(data.start);
        data.end = parseFloat(data.end);
        let localLastClaim;
        if(data.amount.toString() === "0") {
            setClaimedRdl(0);
            setAvailableRdl(0);
            setVested(0);
            return;
        }
        if(data.lastClaim === 0){
            localLastClaim = data.start;
        }else{
            localLastClaim = data.lastClaim;
        }
        const claimed = data.amount.times((localLastClaim - data.start)/(data.end - localLastClaim));
        setClaimedRdl(claimed.div(BigNumber(10).pow(18)).decimalPlaces(4).toString());
        const available = data.amount.times((currentUnixTimestap - localLastClaim)/(data.end - localLastClaim));
        setAvailableRdl(available.div(BigNumber(10).pow(18)).toString());
        const toVest = data.amount.plus(claimed);
        setToVest(toVest.div(BigNumber(10).pow(18)).decimalPlaces(4).toString());
        const vested = available.plus(claimed);
        setVested(vested.div(BigNumber(10).pow(18)).decimalPlaces(4).toString());

    }

    useEffect(()=>{
        if(appContext?.web3){
            let localContract = new appContext.web3.eth.Contract(radialVestingContractAbi,radialVestingConfig.radialVestingContractAddress, {
                transactionConfirmationBlocks: 5
            });
            setRadialContract(localContract);
            if(appContext?.currentAccount !== null){
                localContract.methods.vest(appContext?.currentAccount).call().then(setData);
            }
        }
    },[appContext?.web3,appContext?.currentAccount]);
    

    const claimRdl = () => {
        if(appContext.web3){
            const tx = radialContract.methods.claim().send({
                from: appContext?.currentAccount
            });

            tx.on("transactionHash", () => {
                Swal.fire({title:'Transaction in progress',confirmButtonColor:'#F1CBA6'});
            });

            tx.on("confirmation", (confirmationNumber) => {
                // eslint-disable-next-line
                if(confirmationNumber == 5) {
                    Swal.fire({title:'Transaction successful',confirmButtonColor:'#F1CBA6'});
                    radialContract.methods.vest(appContext.currentAccount).call().then(setData);
                }
            });
        }
    }


  return (
      <div className='claimRdlMainDiv'>
          <HeaderComponent/>
          <div className="claimRdlInnerDiv">
                <div className="claimRdlCard">
                    <div className="d-flex justify-content-center pt-5">
                        <img src={Logo} width={50} height={50} style={{borderRadius:'50%'}} alt="logo" />
                    </div>
                    <div className="d-flex justify-content-center pt-3">
                        <h1 className='rdlTotal'>{vested} vested</h1>
                    </div>
                    <div className="d-flex justify-content-center">
                        <h5 className='rdlClaimSubHeading'>/ {toVest} RDL Total</h5>
                    </div>
                    <div className="row mt-5">
                        <div className="col-6">
                            <h5 className='rdlValues'>Available : <span style={{fontWeight:'bold'}}>{BigNumber(availableRdl).decimalPlaces(4).toString()} RDL</span>  </h5>
                        </div>
                        <div className="col-6 pl-4">
                            <h5 className='rdlValues'>Claimed :  <span style={{fontWeight:'bold'}}>{claimedRdl} RDL</span></h5>
                        </div>
                    </div>
                    <div className="d-flex justify-content-center mt-5 pb-5">
                        {
                            // eslint-disable-next-line
                            !appContext?.currentAccount || (availableRdl) == "0" ? 
                            <button className='claimRdlButtonDisabled' disabled>Claim RDL</button>:
                            <button onClick={()=>claimRdl()} className='claimRdlButton'>Claim RDL</button>
                        }
                    </div>
                </div>
          </div>
          <FooterComponent/>
      </div>
  );
}
