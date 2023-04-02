import { ModalDrawer, ModalFooter, Button } from "@taikai/rocket-kit"
import { useEffect, useState } from "react";
import { ERC20 } from "@taikai/dappkit";
import { Web3Connection } from "@taikai/dappkit";
import { useWeb3 } from "@/hooks/useWeb3";
import { BigNumber, ethers } from "ethers";
import UsdcAbi from '../../utils/Usdc.json';
import InsuranceAbi from '../../utils/RainInsurance.json';

declare global {
    interface Window{
        ethereum: any
    }
  }

interface FormModalProps {
    premium: number;
    duration: {arrival: Date, departure: Date};
    coverage: number;
    lat: string;
    long: string;
    dailyPrec: number;
    modal: boolean;
    closeModal: () => void;
}

export default function FormModal({closeModal, modal, premium, coverage, duration, lat, long, dailyPrec}: FormModalProps) {

    return(
        <div>
            <ModalDrawer
                closeValue="Close"
                footer={
                    <ModalButtons 
                        closeModal={closeModal}
                        modal={modal}
                        premium={premium}
                        coverage={coverage}
                        duration={duration}
                        lat={lat}
                        long={long}
                        dailyPrec={dailyPrec}
                    />
                }
                hide={closeModal}
                isShowing={modal}
                title="Calculated Premium"
            >
                <p>Using the data from your trip details we&apos;ve calculated the premium for your trip to be: </p>
                {premium}
            </ModalDrawer>
      </div>
    )
}

function ModalButtons({ closeModal, premium, duration, coverage, lat, long, dailyPrec }: FormModalProps) {
    const [usdcContract, setUsdcContract] = useState<ethers.Contract>();
    const [insuranceContract, setInsuranceContract] = useState<ethers.Contract>();
    const [approving, setIsApproving] = useState(false);
    const [applying, setApplying] = useState(false);
    const [value, setValue] = useState<BigNumber>(BigNumber.from(0));
            
    const handleApproveTransaction = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const tempUsdcContract = new ethers.Contract(
                process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS!,
                UsdcAbi.abi,
                provider.getSigner(),
        );
        setUsdcContract(tempUsdcContract)
        tempUsdcContract.approve(process.env.NEXT_PUBLIC_INSURANCE_CONTRACT_ADDRESS, 1000000)
        setIsApproving(true)
    }

    const getMyPolicy = () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const tempInsuranceContract = new ethers.Contract(
                process.env.NEXT_PUBLIC_INSURANCE_CONTRACT_ADDRESS!,
                InsuranceAbi.abi,
                provider.getSigner(),
        );
        setInsuranceContract(tempInsuranceContract)

        const start = new Date(duration.arrival).getTime()
        const end = new Date(duration.departure).getTime()

        const premiumBigNumber = ethers.utils.parseUnits(premium.toString(), 6)
        const coverageBigNumber = ethers.utils.parseUnits(coverage.toString(), 6)
        const parameters = [start, end, lat, long, dailyPrec, coverageBigNumber, premiumBigNumber]
        console.log("parameters: ", parameters)
        tempInsuranceContract.applyForPolicy(parameters)
        setApplying(true)


        // struct Policy {
        //     uint256 startDate;
        //     uint256 endDate;
        //     string lat;
        //     string long;
        //     uint256 precipitation;
        //     uint256 insuredAmount;
        //     uint256 premiumAmount;
        // }

        // ["16803446049","16803618849","-22.970357","-43.183659","10","200","10"]
    }

    useEffect(() => {

        const onApproval = (owner: string, spender: string, value: BigNumber) => {
          console.log(`Approval event arrived, owner: ${owner}, spender: ${spender}, value: ${value}`);
          setValue(value);
          setIsApproving(false);
        };
    
        if (usdcContract) {
            usdcContract.on('Approval', onApproval);
        }
    
        return () => {
          if (usdcContract) {
            usdcContract.off('Approval', onApproval);
          }
        }
    }, [usdcContract])
    

    return(
        <ModalFooter closeAction={closeModal} closeValue="Close">
            {value ? 
                <Button 
                    type="submit" 
                    value={"Get My Policy" }
                    action={getMyPolicy}
                />
                :
                <Button 
                    type="submit" 
                    value={approving ? "Approving..." : "Approve"}
                    action={handleApproveTransaction}
                />
            }
            
            
        </ModalFooter>
    )
}