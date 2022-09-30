import React from 'react'
import './HomeComponent.css'
import HeaderComponent from '../HeaderComponent/HeaderComponent'
import FooterComponent from '../FooterComponent/FooterComponent';

export default function HomeComponent() {

    return (
        <div className="homeDiv">
            <HeaderComponent/>
            <div className="container-fluid homeDivHolder">
                <h1 id="homeDivMainHeading">Coordination DAO for<br/> Boosted ve Yields</h1>
                <p id="homeDivSubHeading">Earn boosted ve and rewards for depositing liquidity</p>
            </div>
            <FooterComponent/>
        </div>
    )
}