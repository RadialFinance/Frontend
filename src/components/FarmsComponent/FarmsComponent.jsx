import React from 'react';
import './FarmsComponent.css';

import HeaderComponent from '../HeaderComponent/HeaderComponent';
import FooterComponent from '../FooterComponent/FooterComponent';
import Logo from '../../assets/images/smallLogo.png';
import USDCLogo from '../../assets/images/USDC.svg';
import EthLogo from '../../assets/images/ETH.svg';
import FraxLogo from '../../assets/images/FRAX.svg';
import YfiLogo from '../../assets/images/YFI.svg';
import MimLogo from '../../assets/images/MIM.svg';
import wFTMLogo from '../../assets/images/wFTM.svg';
import TOMBLogo from '../../assets/images/TOMB.svg';
import SUSHILogo from '../../assets/images/SUSHI.svg';
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

import { Link } from 'react-router-dom'; 

export default function FarmsComponent() {

    return (
        <div className='farmsDiv'>
            <HeaderComponent/>
                <div className="farmsInnerDiv container">
                    <div className="farmOverView">
                        <img src={Logo} style={{width:'90px',height:'90px',borderRadius:'50%'}} alt="logo" />
                        <h3 id="farmOverviewHeader">Select a farm</h3>
                        <p id="farmOverviewSubHead">Earn RDL tokens by providing liquidity.</p>
                    </div>
                    <div className="farmsList container">
                        <div className="row">
                            <div className="col-4">
                                <div className="farmCard">
                                    <img src={USDCLogo} width={60} height={60} alt="usdc"/>
                                    <h3 className='cardHeading'>USDC pool</h3>
                                    <h6 className='cardSubHeading mt-3'>Deposit USDC</h6>
                                    <h6 className='cardSubHeading'>Earn $RDL</h6>
                                    <Link className='selectFarmButton' to="/farms/USDC">Select</Link>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="farmCard">
                                    <img src={EthLogo} width={60} height={60} alt="eth"/>
                                    <h3 className='cardHeading'>ETH pool</h3>
                                    <h6 className='cardSubHeading mt-3'>Deposit ETH</h6>
                                    <h6 className='cardSubHeading'>Earn $RDL</h6>
                                    <Link className='selectFarmButton' to="/farms/ETH">Select</Link>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="farmCard">
                                    <img src={FraxLogo} width={60} height={60} alt="frax"/>
                                    <h3 className='cardHeading'>FRAX pool</h3>
                                    <h6 className='cardSubHeading mt-3'>Deposit FRAX</h6>
                                    <h6 className='cardSubHeading'>Earn $RDL</h6>
                                     <Link className='selectFarmButton' to="/farms/FRAX">Select</Link>
                                </div>
                            </div>
                        </div>
                        <div className="row mt-3">
                            <div className="col-4">
                                <div className="farmCard">
                                    <img src={YfiLogo} width={60} height={60} alt="yfi"/>
                                    <h3 className='cardHeading'>YFI pool</h3>
                                    <h6 className='cardSubHeading mt-3'>Deposit YFI</h6>
                                    <h6 className='cardSubHeading'>Earn $RDL</h6>
                                     <Link className='selectFarmButton' to="/farms/YFI">Select</Link>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="farmCard">
                                    <img src={MimLogo} width={60} height={60} alt="mim"/>
                                    <h3 className='cardHeading'>MIM pool</h3>
                                    <h6 className='cardSubHeading mt-3'>Deposit MIM</h6>
                                    <h6 className='cardSubHeading'>Earn $RDL</h6>
                                     <Link className='selectFarmButton' to="/farms/MIM">Select</Link>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="farmCard">
                                    <img src={wFTMLogo} width={60} height={60} alt="wftm"/>
                                    <h3 className='cardHeading'>wFTM pool</h3>
                                    <h6 className='cardSubHeading mt-3'>Deposit wFTM</h6>
                                    <h6 className='cardSubHeading'>Earn $RDL</h6>
                                     <Link className='selectFarmButton' to="/farms/wFTM">Select</Link>
                                </div>
                            </div>
                        </div>
                        <div className="row mt-3">
                            <div className="col-4">
                                <div className="farmCard">
                                    <img src={TOMBLogo} width={80} height={80} alt="tomb"/>
                                    <h3 className='cardHeading'>TOMB pool</h3>
                                    <h6 className='cardSubHeading mt-3'>Deposit TOMB</h6>
                                    <h6 className='cardSubHeading'>Earn $RDL</h6>
                                     <Link className='selectFarmButton' to="/farms/TOMB">Select</Link>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="farmCard">
                                    <img src={SUSHILogo} width={60} height={60} alt="sushi"/>
                                    <h3 className='cardHeading'>SUSHI pool</h3>
                                    <h6 className='cardSubHeading mt-3'>Deposit SUSHI</h6>
                                    <h6 className='cardSubHeading'>Earn $RDL</h6>
                                     <Link className='selectFarmButton' to="/farms/SUSHI">Select</Link>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="farmCard">
                                    <img src={BTC} width={60} height={60} alt="btc"/>
                                    <h3 className='cardHeading'>BTC pool</h3>
                                    <h6 className='cardSubHeading mt-3'>Deposit BTC</h6>
                                    <h6 className='cardSubHeading'>Earn $RDL</h6>
                                     <Link className='selectFarmButton' to="/farms/BTC">Select</Link>
                                </div>
                            </div>
                        </div>
                        <div className="row mt-3">
                            <div className="col-4">
                                <div className="farmCard">
                                    <img src={gWBTC} style={{borderRadius:'50%'}} width={60} height={60} alt="gwbtc"/>
                                    <h3 className='cardHeading'>gWBTC pool</h3>
                                    <h6 className='cardSubHeading mt-3'>Deposit gWBTC</h6>
                                    <h6 className='cardSubHeading'>Earn $RDL</h6>
                                     <Link className='selectFarmButton' to="/farms/gWBTC">Select</Link>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="farmCard">
                                    <img src={xBOO} style={{borderRadius:'50%'}} width={60} height={60} alt="xBOO"/>
                                    <h3 className='cardHeading'>xBOO pool</h3>
                                    <h6 className='cardSubHeading mt-3'>Deposit xBOO</h6>
                                    <h6 className='cardSubHeading'>Earn $RDL</h6>
                                     <Link className='selectFarmButton' to="/farms/xBOO">Select</Link>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="farmCard">
                                    <img src={xSCREAM} style={{borderRadius:'50%'}} width={60} height={60} alt="xSCREAM"/>
                                    <h3 className='cardHeading'>xSCREAM pool</h3>
                                    <h6 className='cardSubHeading mt-3'>Deposit xSCREAM</h6>
                                    <h6 className='cardSubHeading'>Earn $RDL</h6>
                                     <Link className='selectFarmButton' to="/farms/xSCREAM">Select</Link>
                                </div>
                            </div>
                        </div>
                        <div className="row mt-3">
                            <div className="col-4">
                                <div className="farmCard">
                                    <img src={LQDR} style={{borderRadius:'50%'}} width={60} height={60} alt="LQDR"/>
                                    <h3 className='cardHeading'>LQDR pool</h3>
                                    <h6 className='cardSubHeading mt-3'>Deposit LQDR</h6>
                                    <h6 className='cardSubHeading'>Earn $RDL</h6>
                                     <Link className='selectFarmButton' to="/farms/LQDR">Select</Link>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="farmCard">
                                    <img src={xTAROT} style={{borderRadius:'50%'}} width={60} height={60} alt="xTAROT"/>
                                    <h3 className='cardHeading'>xTAROT pool</h3>
                                    <h6 className='cardSubHeading mt-3'>Deposit xTAROT</h6>
                                    <h6 className='cardSubHeading'>Earn $RDL</h6>
                                     <Link className='selectFarmButton' to="/farms/xTAROT">Select</Link>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="farmCard">
                                    <img src={xCREDIT} style={{borderRadius:'50%'}} width={60} height={60} alt="xCREDIT"/>
                                    <h3 className='cardHeading'>xCREDIT pool</h3>
                                    <h6 className='cardSubHeading mt-3'>Deposit xCREDIT</h6>
                                    <h6 className='cardSubHeading'>Earn $RDL</h6>
                                     <Link className='selectFarmButton' to="/farms/xCREDIT">Select</Link>
                                </div>
                            </div>
                        </div>
                        <div className="row mt-3">
                            <div className="col-4">
                                <div className="farmCard">
                                    <img src={fBEETS} style={{borderRadius:'50%'}} width={60} height={60} alt="fBEETS"/>
                                    <h3 className='cardHeading'>fBEETS pool</h3>
                                    <h6 className='cardSubHeading mt-3'>Deposit fBEETS</h6>
                                    <h6 className='cardSubHeading'>Earn $RDL</h6>
                                     <Link className='selectFarmButton' to="/farms/fBEETS">Select</Link>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="farmCard">
                                    <img src={SPIRIT} style={{borderRadius:'50%'}} width={60} height={60} alt="SPIRIT"/>
                                    <h3 className='cardHeading'>SPIRIT pool</h3>
                                    <h6 className='cardSubHeading mt-3'>Deposit SPIRIT</h6>
                                    <h6 className='cardSubHeading'>Earn $RDL</h6>
                                     <Link className='selectFarmButton' to="/farms/SPIRIT">Select</Link>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="farmCard">
                                    <img src={WeVE} style={{borderRadius:'50%'}} width={60} height={60} alt="WeVE"/>
                                    <h3 className='cardHeading'>WeVE pool</h3>
                                    <h6 className='cardSubHeading mt-3'>Deposit WeVE</h6>
                                    <h6 className='cardSubHeading'>Earn $RDL</h6>
                                     <Link className='selectFarmButton' to="/farms/WeVE">Select</Link>
                                </div>
                            </div>
                        </div>
                        <div className="row mt-3">
                            <div className="col-4">
                                <div className="farmCard">
                                    <img src={HND} style={{borderRadius:'50%'}} width={60} height={60} alt="HND"/>
                                    <h3 className='cardHeading'>HND pool</h3>
                                    <h6 className='cardSubHeading mt-3'>Deposit HND</h6>
                                    <h6 className='cardSubHeading'>Earn $RDL</h6>
                                     <Link className='selectFarmButton' to="/farms/HND">Select</Link>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="farmCard">
                                    <img src={EthLogo} style={{borderRadius:'50%'}} width={60} height={60} alt="gETH"/>
                                    <h3 className='cardHeading'>gETH pool</h3>
                                    <h6 className='cardSubHeading mt-3'>Deposit gETH</h6>
                                    <h6 className='cardSubHeading'>Earn $RDL</h6>
                                     <Link className='selectFarmButton' to="/farms/gETH">Select</Link>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="farmCard">
                                    <img src={wFTMLogo} style={{borderRadius:'50%'}} width={60} height={60} alt="yvWFTM"/>
                                    <h3 className='cardHeading'>yvWFTM pool</h3>
                                    <h6 className='cardSubHeading mt-3'>Deposit yvWFTM</h6>
                                    <h6 className='cardSubHeading'>Earn $RDL</h6>
                                     <Link className='selectFarmButton' to="/farms/yvWFTM">Select</Link>
                                </div>
                            </div>
                        </div>
                        <div className="row mt-3">
                            <div className="col-4">
                                <div className="farmCard">
                                    <img src={USDCLogo} style={{borderRadius:'50%'}} width={60} height={60} alt="yvUSDC"/>
                                    <h3 className='cardHeading'>yvUSDC pool</h3>
                                    <h6 className='cardSubHeading mt-3'>Deposit yvUSDC</h6>
                                    <h6 className='cardSubHeading'>Earn $RDL</h6>
                                     <Link className='selectFarmButton' to="/farms/yvUSDC">Select</Link>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="farmCard">
                                    <img src={DAI} style={{borderRadius:'50%'}} width={60} height={60} alt="yvDAI"/>
                                    <h3 className='cardHeading'>yvDAI pool</h3>
                                    <h6 className='cardSubHeading mt-3'>Deposit yvDAI</h6>
                                    <h6 className='cardSubHeading'>Earn $RDL</h6>
                                     <Link className='selectFarmButton' to="/farms/yvDAI">Select</Link>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="farmCard">
                                    <img src={MimLogo} style={{borderRadius:'50%'}} width={60} height={60} alt="yvMIM"/>
                                    <h3 className='cardHeading'>yvMIM pool</h3>
                                    <h6 className='cardSubHeading mt-3'>Deposit yvMIM</h6>
                                    <h6 className='cardSubHeading'>Earn $RDL</h6>
                                     <Link className='selectFarmButton' to="/farms/yvMIM">Select</Link>
                                </div>
                            </div>
                        </div>
                        <div className="row mt-3">
                            <div className="col-4">
                                <div className="farmCard">
                                    <img src={EthLogo} style={{borderRadius:'50%'}} width={60} height={60} alt="yvWETH"/>
                                    <h3 className='cardHeading'>yvWETH pool</h3>
                                    <h6 className='cardSubHeading mt-3'>Deposit yvWETH</h6>
                                    <h6 className='cardSubHeading'>Earn $RDL</h6>
                                     <Link className='selectFarmButton' to="/farms/yvWETH">Select</Link>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="farmCard">
                                    <img src={YfiLogo} style={{borderRadius:'50%'}} width={60} height={60} alt="yvYFI"/>
                                    <h3 className='cardHeading'>yvYFI pool</h3>
                                    <h6 className='cardSubHeading mt-3'>Deposit yvYFI</h6>
                                    <h6 className='cardSubHeading'>Earn $RDL</h6>
                                     <Link className='selectFarmButton' to="/farms/yvYFI">Select</Link>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="farmCard">
                                    <img src={BTC} style={{borderRadius:'50%'}} width={60} height={60} alt="yvWBTC"/>
                                    <h3 className='cardHeading'>yvWBTC pool</h3>
                                    <h6 className='cardSubHeading mt-3'>Deposit yvWBTC</h6>
                                    <h6 className='cardSubHeading'>Earn $RDL</h6>
                                     <Link className='selectFarmButton' to="/farms/yvWBTC">Select</Link>
                                </div>
                            </div>
                        </div>
                        <div className="row mt-3">
                            <div className="col-4">
                                <div className="farmCard">
                                    <img src={GEIST} style={{borderRadius:'50%'}} width={60} height={60} alt="GEIST"/>
                                    <h3 className='cardHeading'>GEIST pool</h3>
                                    <h6 className='cardSubHeading mt-3'>Deposit GEIST</h6>
                                    <h6 className='cardSubHeading'>Earn $RDL</h6>
                                     <Link className='selectFarmButton' to="/farms/GEIST">Select</Link>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="farmCard">
                                    <img src={OXD} style={{borderRadius:'50%'}} width={60} height={60} alt="OXD"/>
                                    <h3 className='cardHeading'>OXD pool</h3>
                                    <h6 className='cardSubHeading mt-3'>Deposit OXD</h6>
                                    <h6 className='cardSubHeading'>Earn $RDL</h6>
                                     <Link className='selectFarmButton' to="/farms/OXD">Select</Link>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="farmCard">
                                    <img src={xBOO} style={{borderRadius:'50%'}} width={60} height={60} alt="BOO"/>
                                    <h3 className='cardHeading'>BOO pool</h3>
                                    <h6 className='cardSubHeading mt-3'>Deposit BOO</h6>
                                    <h6 className='cardSubHeading'>Earn $RDL</h6>
                                     <Link className='selectFarmButton' to="/farms/BOO">Select</Link>
                                </div>
                            </div>
                        </div>
                        <div className="row mt-3">
                            <div className="col-4">
                                <div className="farmCard">
                                    <img src={IB} style={{borderRadius:'50%'}} width={60} height={60} alt="IB"/>
                                    <h3 className='cardHeading'>IB pool</h3>
                                    <h6 className='cardSubHeading mt-3'>Deposit IB</h6>
                                    <h6 className='cardSubHeading'>Earn $RDL</h6>
                                     <Link className='selectFarmButton' to="/farms/IB">Select</Link>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="farmCard">
                                    <img src={fBEETS} style={{borderRadius:'50%'}} width={60} height={60} alt="BEETS"/>
                                    <h3 className='cardHeading'>BEETS pool</h3>
                                    <h6 className='cardSubHeading mt-3'>Deposit BEETS</h6>
                                    <h6 className='cardSubHeading'>Earn $RDL</h6>
                                     <Link className='selectFarmButton' to="/farms/BEETS">Select</Link>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="farmCard">
                                    <img src={xSCREAM} style={{borderRadius:'50%'}} width={60} height={60} alt="SCREAM"/>
                                    <h3 className='cardHeading'>SCREAM pool</h3>
                                    <h6 className='cardSubHeading mt-3'>Deposit SCREAM</h6>
                                    <h6 className='cardSubHeading'>Earn $RDL</h6>
                                     <Link className='selectFarmButton' to="/farms/SCREAM">Select</Link>
                                </div>
                            </div>
                        </div>
                        <div className="row mt-3">
                            <div className="col-4">
                                <div className="farmCard">
                                    <img src={FraxLogo} style={{borderRadius:'50%'}} width={60} height={60} alt="FXS"/>
                                    <h3 className='cardHeading'>FXS pool</h3>
                                    <h6 className='cardSubHeading mt-3'>Deposit FXS</h6>
                                    <h6 className='cardSubHeading'>Earn $RDL</h6>
                                     <Link className='selectFarmButton' to="/farms/FXS">Select</Link>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="farmCard">
                                    <img src={MULTI} style={{borderRadius:'50%'}} width={60} height={60} alt="MULTI"/>
                                    <h3 className='cardHeading'>MULTI pool</h3>
                                    <h6 className='cardSubHeading mt-3'>Deposit MULTI</h6>
                                    <h6 className='cardSubHeading'>Earn $RDL</h6>
                                     <Link className='selectFarmButton' to="/farms/MULTI">Select</Link>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="farmCard">
                                    <img src={SYN} style={{borderRadius:'50%'}} width={60} height={60} alt="SYN"/>
                                    <h3 className='cardHeading'>SYN pool</h3>
                                    <h6 className='cardSubHeading mt-3'>Deposit SYN</h6>
                                    <h6 className='cardSubHeading'>Earn $RDL</h6>
                                     <Link className='selectFarmButton' to="/farms/SYN">Select</Link>
                                </div>
                            </div>
                        </div>
                        <div className="row mt-3">
                            <div className="col-4">
                                <div className="farmCard">
                                    <img src={gOHM} style={{borderRadius:'50%'}} width={60} height={60} alt="gOHM"/>
                                    <h3 className='cardHeading'>gOHM pool</h3>
                                    <h6 className='cardSubHeading mt-3'>Deposit gOHM</h6>
                                    <h6 className='cardSubHeading'>Earn $RDL</h6>
                                     <Link className='selectFarmButton' to="/farms/gOHM">Select</Link>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="farmCard">
                                    <img src={EXOD} style={{borderRadius:'50%'}} width={60} height={60} alt="EXOD"/>
                                    <h3 className='cardHeading'>EXOD pool</h3>
                                    <h6 className='cardSubHeading mt-3'>Deposit EXOD</h6>
                                    <h6 className='cardSubHeading'>Earn $RDL</h6>
                                     <Link className='selectFarmButton' to="/farms/EXOD">Select</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            <FooterComponent/>
        </div>
    )
}
