import React, { useEffect, useState } from 'react';
import { AppDispatch } from 'state'
import { ButtonOutlined } from 'components/Button'
import { CgCheckO } from 'react-icons/cg';
import PageContainer from 'components/PageContainer';
import styled from 'styled-components';
import { Title, PageHeader } from '../../theme'
// import { useUserId, useJwtToken } from 'state/fundraising/hooks'
import { setIsFormSent } from 'state/fundraising/actions'
import { useDispatch } from 'react-redux'
import { useActiveWeb3React } from '../../hooks'

const BgWrapper = styled.div`
  background: #1c1c1c;
  box-shadow: inset 2px 2px 5px rgba(255, 255, 255, 0.095);
  backdrop-filter: blur(28px);
  border-radius: 44px;
  margin-bottom: 2rem;
  padding: 30px;
  width: 100%;
  position: relative;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    border-radius: 16px;
    padding: 20px;
  `};
`

const Disclaimer = styled.div`
  color: rgba(255,255,255,.85);
  font-size: .9rem;
  background: rgba(0,0,0,.25);
  border-radius: 44px;
  padding: 2rem;
  margin-bottom: 2rem;
`

const H3 = styled.div`
  display: block;
  color: #fff;
  font-size: 1rem;
  text-align: center;
  padding: 2rem;
  @media (max-width: 764px) {
    color: #fff;
    font-size: 1.25rem;
  }
`

const Row = styled.div`
  display: flex;
  flex-direction: column;
  h6 {
    margin-bottom: 10px;
  }
  input {
    color: #FFFFFF;
    position: relative;
    font-weight: 600;
    outline: none;
    border: none;
    flex: 1 1 auto;
    background: transparent;
    padding: 0px 15px;
    border-radius: 12px;
    font-size: 22px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-appearance: textfield;
    background: rgba(0,0,0,.25);
    height: 48px;
  }
`
export default function SkyLaunchKyc() {
  const dispatch = useDispatch<AppDispatch>()
  const { library, account, chainId } = useActiveWeb3React()
  const [formSent, setFormSent] = useState(false)  
  const [emailState, setEmailState] = useState('')    
  const handleEmailState = (input: any) => {
    const val = input.target.value;
    setEmailState(val);
  }
  // const userId = useUserId()
  // const jwtToken = useJwtToken()
  const [userId, setUserId] = useState<string | undefined | null>()
  const [walletState, setWalletState] = useState('')
  const handleWalletState = (input: any) => {
    const val = input.target.value;
    setWalletState(val);
  }

  const [blockpass, setBlockpass] = useState()

  useEffect(() => {
    if (account){
        setUserId(localStorage.getItem('userId'))
    }else{
        setUserId(undefined)
    }
}, [account])

  useEffect(() => {
    if (window && userId) {
      loadBlockpassWidget()
    }
  }, [userId])


  const loadBlockpassWidget = () => {
    if (window) {
      const win: any = window
      const blockpass = new win.BlockpassKYCConnect(
        'public_kyc__testnet_10705',
        { refId: userId }
      )

      blockpass.startKYCConnect()

      blockpass.on('KYCConnectSuccess', () => {
        //add code that will trigger when data have been sent.
        console.log('KYCConnectSuccess')
        setFormSent(true)
        dispatch(setIsFormSent({ isFormSent: true }))
      })

      blockpass.on('KYCConnectLoad', () => {
        //add code that will trigger when the iframe is loaded.
        //ex: stop loading animation
      })

      blockpass.on('KYCConnectCancel', () => {
        //add code that will trigger when the workflow is aborted. ex:
        //alert('Cancelled!')
      })
    }
  }

  const handleSubmit = () => {
  }

  return (
    <>
      <PageHeader>
        <Title>KYC</Title>
      </PageHeader>
      <PageContainer>
        <div style={{ maxWidth: '500px', width: '100%', margin: 'auto' }}>
          <Disclaimer>
            <p>When you click the link below you will be redirected to our KYC verification partner. Please ensure that the wallet address you provide during the KYC is the one you would like to use on our platform.</p>
            <p>We update our system once a day. When you are connected with a wallet address which has been verified, you will be able to participate in our IDO platform.</p>
          </Disclaimer>
          <BgWrapper>
            {!formSent && <>
              <Row>
                <ButtonOutlined id="blockpass-kyc-connect" className="green" onClick={handleSubmit} disabled={!userId}>KYC</ButtonOutlined>
              </Row>
            </>}

            {formSent &&
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <CgCheckO style={{ fontSize: '4rem', marginTop: '2rem' }} />
                <H3>Thank you for submitting, we'll be in touch.</H3>
              </div>
            }
          </BgWrapper>
        </div>
      </PageContainer>
    </>
  )
}
