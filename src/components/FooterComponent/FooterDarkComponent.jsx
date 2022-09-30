import React from 'react';
import './FooterComponent.css';
import Medium from '../../assets/images/MediumDark.svg';
import Twitter from '../../assets/images/TwitterDark.svg';
import Discord from '../../assets/images/DiscordDark.svg';
import LogoGrey from '../../assets/images/LogoGrey.svg';
import DocsLogo from '../../assets/images/fileDark.svg';


export default function FooterDarkComponent() {
    return (
        <div className='footerDiv container'>
            <div className="row">
                <div className="col-3">
                    <a href="https://medium.com/@radial.finance" target="blank">
                        <img src={Medium} className='footerLogos' alt="logo" />
                    </a>
                </div>
                <div className="col-3">
                    <a href="https://twitter.com/RadialFinance" target="blank">
                        <img src={Twitter} className='footerLogos' alt="logo" />
                    </a>
                </div>
                <div className="col-3">
                    <a target="blank" href="https://discord.gg/radial">
                        <img src={Discord} className='footerLogos' alt="logo" />
                    </a>
                </div>
                <div className="col-3">
                    <a target="blank" href="https://docs.radialfinance.org/">
                        <img src={DocsLogo} className='footerLogosDoc' alt="logo" />
                    </a>
                </div>
            </div>
            <div className="row mt-4">
                    <img src={LogoGrey} style={{paddingLeft:'20px'}} alt="logo" />
            </div>
        </div>
    )
}
