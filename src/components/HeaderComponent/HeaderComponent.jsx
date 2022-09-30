import React, { useContext } from 'react'
import Logo from '../../../src/assets/images/Logo.svg'
import { Link } from "react-router-dom";
import AppContext from '../AppContext';
import './HeaderComponent.css';



export default function HeaderComponent() {
    const appContext = useContext(AppContext);

    return (
            <nav className="navbar navbar-expand-lg navbar-dark">
                <div className="container-fluid navBarHolder">

                    <Link className="navbar-brand" to="/">
                        <img src={Logo} alt="logo"/>
                    </Link>

                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarText">
                  
                            <ul className="navbar-nav m-auto">
                                <li className="nav-item">
                                    <Link className="nav-link nav-link-active" to="/stake">STAKE</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link nav-link-active" to="/claim">CLAIM</Link>
                                </li>
                                <li className="nav-item dropdown">
                                    <div className="nav-link nav-link-active dropdown-toggle" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        VOTE
                                    </div>
                                    <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                                        <li>
                                            <Link className="dropdown-item" to="/vote/pools">POOLS</Link>
                                        </li>
                                        <li>
                                            <Link className="dropdown-item" to="/vote/whitelist">WHITELIST</Link>
                                        </li>
                                    </ul>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link nav-link-active" to="/farms">FARMS</Link>
                                </li>
                                <li className="nav-item dropdown">
                                    <div className="nav-link nav-link-active dropdown-toggle" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        $RDL
                                    </div>
                                    <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                                        <li>
                                            <Link className="dropdown-item" to="/claimRDL">AIRDROP</Link>
                                        </li>
                                    </ul>
                                </li>
                                <li className="nav-item dropdown">
                                    <div className="nav-link nav-link-active dropdown-toggle"  id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        MORE
                                    </div>
                                    <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                                        <li>
                                            <a className="dropdown-item" target="blank" href="https://twitter.com/RadialFinance">Twitter</a>
                                        </li>
                                        <li>
                                            <a className="dropdown-item" target="blank" href="https://discord.gg/radial">Discord</a>
                                        </li>
                                        <li>
                                            <a className="dropdown-item" target="blank" href="https://docs.radialfinance.org/">Documentation</a>
                                        </li>
                                        <li>
                                            <a className="dropdown-item" target="blank" href="https://medium.com/@radial.finance">Blog</a>
                                        </li>
                                    </ul>
                                </li>
                            </ul> 
                            <div>
                                <button className='connectWalletButton' onClick={appContext.connect}>
                                    {
                                        appContext.currentAccount == null ? 'Connect wallet' : 
                                        appContext.chainId === 250 ? 
                                        appContext.currentAccount?.slice(0,6)+'...'+appContext.currentAccount?.slice(appContext.currentAccount?.length-4)
                                        :'Wrong network' 
                                    }
                                </button>                
                            </div>
                    </div>
                    {
                        appContext.currentAccount !== null ?
                        <div onClick={()=>{appContext.disconnect()}} id="signoutBtn"></div>:
                        null
                    }
                </div>
            </nav>
    )
}
