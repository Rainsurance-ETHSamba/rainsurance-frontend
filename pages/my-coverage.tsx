// import '../styles/globals.css'
import React, { useLayoutEffect, useEffect, useState }from 'react';
import {DappkitProviderCtx, defaulDappkitProvider} from '../context';
import Link from 'next/link';
import { Icon, HorizontalNav } from '@taikai/rocket-kit';
import NavBar from '@/components/NavBar';
import { Button } from '@taikai/rocket-kit';
import { ethers } from 'ethers';
import InsuranceAbi from '../utils/RainInsurance.json';

const dummyData = [
  {
    coverage: "$200",
    dates: "04/10/2023-04/14/2023"
  },
  {
    coverage: "$350",
    dates: "04/15/2023-04/19/2023"
  }
]

export default function MyCoverage() {
  const [insuranceContract, setInsuranceContract] = useState();
  const [policies, setPolicies] = useState([]);
  // const policies = [];

  // need to call get policies twice to get policy 2 and 3
  const getPolicies = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const tempInsuranceContract = new ethers.Contract(
            process.env.NEXT_PUBLIC_INSURANCE_CONTRACT_ADDRESS,
            InsuranceAbi.abi,
            provider.getSigner(),
    );
    setInsuranceContract(tempInsuranceContract)

    let data = await tempInsuranceContract.policies(3)

    const startDate = ethers.utils.formatUnits(data[0], 1)
    const endDate = ethers.utils.formatUnits(data[1], 1)
    const lat = data[2]
    const long = data[3]
    const precip = ethers.utils.formatUnits(data[4], 1)
    const insuredAmount = ethers.utils.formatUnits(data[5], 6)
    const premium = ethers.utils.formatUnits(data[6], 6)

    const policy = {
      startDate: startDate,
      endDate: endDate, 
      lat: lat, 
      long: long, 
      precip: precip, 
      insuredAmount: insuredAmount, 
      premium: premium
    }

    setPolicies(policies.concat(policy))
  }

  const makeClaim = async (i: number) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const tempInsuranceContract = new ethers.Contract(
            process.env.NEXT_PUBLIC_INSURANCE_CONTRACT_ADDRESS,
            InsuranceAbi.abi,
            provider.getSigner(),
    );
    setInsuranceContract(tempInsuranceContract)

    const data = await tempInsuranceContract.fireClaim(i)
    console.log("data: ", data)
  }

  useEffect(() => {
    getPolicies()
  }, [])


  return (
    <div style={{
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      borderRadius: "4px", 
      rowGap: "5px", 
    }}
    >
      <h1>
        My Policies:
      </h1>
      {
        policies.map((policy, i) => {
          const dateOptions = { month: '2-digit', day: '2-digit', year: 'numeric' };
          console.log(policy)
          const formattedStartDate = new Date(Math.ceil(policy.startDate)).toLocaleDateString('en-US', dateOptions);
          const formattedEndDate = new Date(Math.ceil(policy.endDate)).toLocaleDateString('en-US', dateOptions);
          return (
            <div style={{display: "flex", border: "1px black solid", flexDirection: "column", padding: "5px", borderRadius: "3px"}} key={i}>
              <h2>Coverage: ${policy.insuredAmount}</h2>
              <h3>Premium: ${policy.premium}</h3>
              <h3>{formattedStartDate} - {formattedEndDate}</h3>
              <div style={{width: "100%", display: "flex", justifyContent: "center"}}>
                <Button
                  ariaLabel="Make A Claim"
                  className="button"
                  color="purple500"
                  txtColor="white"
                  value="Make A Claim"
                  variant="solid"
                  action={() => makeClaim(3)}
                />
              </div>
            </div>
          )
        })
      }
    </div>
    
  );
}