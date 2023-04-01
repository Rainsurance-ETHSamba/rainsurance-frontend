import '../styles/globals.css'
import type { AppProps } from 'next/app'
import React, { useReducer, useState } from 'react';
import Link from 'next/link';
import {DappkitProviderCtx, defaulDappkitProvider} from '../context';
import { ethers } from 'ethers';

import { 
  Icon, 
  HorizontalNav, 
  Button,
  ModalDrawer,
  ModalFooter
} from '@taikai/rocket-kit';

import Destination from '@/components/form/Destination';
import Duration from '@/components/form/Duration';
import Coverage from '@/components/form/Coverage';
import CalculateButton from '@/components/form/CalculateButton';
import { RAIN_DATA } from "../utils/rainData"
import FormModal from '@/components/form/FormModal';

import { chainDict } from "./constants/networks";
import { dappConfig } from "./config";
import ConnectWalletButton from '@/components/ConnectWalletButton';


function MyApp({ Component, pageProps }: AppProps) {
 
  return (
    <DappkitProviderCtx.Provider value={defaulDappkitProvider}>
        {/* <Component {...pageProps} /> */}
        {/* <HorizontalNav
          items={[
            <li key="0" className="active">
              <Link href="/apply">
                <a>Apply For Protection</a>
              </Link>
            </li>,
            <li key="0">
              <Link href="/my-coverage">
                <a>Apply For Protection</a>
              </Link>
            </li>,
            <li key="1"><a href="#0">My Plans</a></li>,
          ]}
        /> */}
      <Form />
    </DappkitProviderCtx.Provider>
  );
}

type DurationType = {
  arrival: Date,
  departure: Date
}

type ActionType = {
  type: 'arrival' | 'departure',
  nextArrival?: Date,
  nextDeparture?: Date
}

export type PremiumTypes = {
  destination: string, 
  duration: {arrival: Date, departure: Date}, 
  coverage: number
}

function Form() {
  const [destination, setDestination] = useState("");
  const [lat, setLat] = useState("");
  const [long, setLong] = useState("");
  const [coverage, setCoverage] = useState(0);
  const [premium, setPremium] = useState(0);
  const [modal, setModal] = useState(false);
  const [dailyPrec, setDailyPrec] = useState(0);

  const handleDuration = (state: DurationType, action: ActionType) => {
    switch(action.type) {
      case 'arrival':
        return {
          arrival: action.nextArrival,
          departure: state.departure
        }
      case 'departure':
        return {
          arrival: state.arrival,
          departure: action.nextDeparture
        }
    }
  }

  const [duration, dispatchDuration] = useReducer(handleDuration, {arrival: null, departure: null})

  const calculatePremium = ({destination, duration, coverage}: PremiumTypes) => {
    // taking the month of start date of the trip to use as the basis for calculating premium
    const month = new Date(duration.arrival).getMonth()
    const probOfRain = RAIN_DATA[`${destination}`][month].prob
    const tempDailyProb = probOfRain / 30

    const tripStart = new Date(duration.arrival).getTime()
    const tripEnd = new Date(duration.departure).getTime()

    const tripLength = (tripEnd - tripStart) / (1000 * 60 * 60 * 24)

    const adjustedProb = tempDailyProb * tripLength
    const calculatedPremium = parseFloat((adjustedProb * coverage + 10).toFixed(2))

    const tempDailyPrec = Math.ceil(RAIN_DATA[`${destination}`][month].volume / 30) 
    setDailyPrec(tempDailyPrec)
    
    setPremium(calculatedPremium)
    setModal(true)
  }

  const getPremiumArgs = () => {
    return { destination, duration, coverage };
  };

  const closeModal = () => {
    setModal(false)
  }

  return(
    <div style={{display: "flex", alignItems: "center", flexDirection: "column"}}>
      <ConnectWalletButton />
      <Destination 
        setDestination={setDestination} 
        setLat={setLat}
        setLong={setLong}
      />
      <Duration dispatchDuration={dispatchDuration} />
      <Coverage setCoverage={setCoverage}/>
      <CalculateButton
        getPremiumArgs={getPremiumArgs}
        calculatePremium={() => calculatePremium({destination, duration, coverage})}
      />
      <FormModal 
        closeModal={closeModal}
        modal={modal}
        duration={duration}
        coverage={coverage}
        premium={premium}
        lat={lat}
        long={long}
        dailyPrec={dailyPrec}
      />
    </div>
  )
}

export default MyApp
