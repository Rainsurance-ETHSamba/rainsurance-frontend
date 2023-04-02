// import '../styles/globals.css'
import React, { useLayoutEffect, useEffect, useState }from 'react';
import {DappkitProviderCtx, defaulDappkitProvider} from '../context';
import Link from 'next/link';
import { Icon, HorizontalNav } from '@taikai/rocket-kit';
import NavBar from '@/components/NavBar';
import { Button } from '@taikai/rocket-kit';
import { ethers } from 'ethers';
import InsuranceAbi from '../utils/RainInsurance.json';
import useAddress from "../hooks/useAddress";

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
  const { address = "" } = useAddress();
  // const policies = [];

  // need to call get policies twice to get policy 2 and 3
  const getPolicies = async () => {
    console.log("getPolicies")
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const tempInsuranceContract = new ethers.Contract(
            process.env.NEXT_PUBLIC_INSURANCE_CONTRACT_ADDRESS!,
            InsuranceAbi.abi,
            provider.getSigner(),
    );
    setInsuranceContract(tempInsuranceContract)

    console.log("address: ", address)

    let data = await tempInsuranceContract.getAllPolicies(address)

    console.log("getAllPolicies");
    const _policies = [];
    data.forEach((_policy) => {
      const startDate = parseInt(_policy[0])
      const endDate = parseInt(_policy[1])
      const lat = _policy[2]
      const long = _policy[3]
      const precip = parseInt(_policy[4])
      const insuredAmount = ethers.utils.formatUnits(_policy[5], 6)
      const premium = ethers.utils.formatUnits(_policy[6], 6)
      const policyId = parseInt(_policy[7])
      _policies.push({startDate, endDate, lat, long, precip, insuredAmount, premium, policyId})
    });
    console.log(_policies);
    setPolicies(_policies)
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
    if(address) {
      getPolicies()
    }
  }, [address])


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
          const formattedStartDate = new Date(policy.startDate).toISOString().slice(0, 10)
          const formattedEndDate = new Date(policy.endDate).toISOString().slice(0, 10)
          return (
            <div style={{display: "flex", border: "1px black solid", flexDirection: "column", padding: "5px", borderRadius: "3px"}} key={i}>
              <h2>
                Coverage: ${policy.insuredAmount}<br/>
                Premium: ${policy.premium}
              </h2>
              <h3>
                Start: {formattedStartDate}<br/>
                End: {formattedEndDate}
              </h3>
              <div style={{width: "100%", display: "flex", justifyContent: "center"}}>
                <Button
                  ariaLabel="Make A Claim"
                  className="button"
                  color="purple500"
                  txtColor="white"
                  value="Make A Claim"
                  variant="solid"
                  action={() => makeClaim(policy.policyId)}
                />
              </div>
            </div>
          )
        })
      }
    </div>
    
  );
}