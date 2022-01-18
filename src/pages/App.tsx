import './snow.css'

import {
  OpenClaimAddressModalAndRedirectToSwap,
  RedirectPathToHomeOnly,
  RedirectPathToSwapOnly,
  RedirectToSwap
} from './Swap/redirects'
import React, { Suspense } from 'react'
import {
  RedirectDuplicateTokenIds,
  RedirectOldAddLiquidityPathStructure,
  RedirectToAddLiquidity
} from './AddLiquidity/redirects'
import { Route, Switch } from 'react-router-dom'
import { useModalOpen, useToggleModal } from '../state/application/hooks'

import AddLiquidity from './AddLiquidity'
import AddressClaimModal from '../components/claim/AddressClaimModal'
import { ApplicationModal } from '../state/application/actions'
import DarkModeQueryParamReader from '../theme/DarkModeQueryParamReader'
import GraphQLProvider from './../graphql'
import Guides from './Guides'
import Header from '../components/Header'
import Home from './Home'
import Staking from './Staking'
import Manage from './Pools/Manage'
import MigrateV1 from './MigrateV1'
import MigrateV1Exchange from './MigrateV1/MigrateV1Exchange'
import Polling from '../components/Header/Polling'
// import Pool from './Pool'
import PoolFinder from './PoolFinder'
import Pools from './Pools'
import Popups from '../components/Popups'
import { RedirectOldRemoveLiquidityPathStructure } from './RemoveLiquidity/redirects'
import RemoveLiquidity from './RemoveLiquidity'
import RemoveV1Exchange from './MigrateV1/RemoveV1Exchange'
import SideMenu from '../components/SideMenu'
import Swap from './Swap'
import Transfer from './Transfer'
import URLWarning from '../components/Header/URLWarning'
import Vote from './Vote'
import VotePage from './Vote/VotePage'
import Web3ReactManager from '../components/Web3ReactManager'
import ZeroGravityInfo from './Launchpad/Info';
import SkyLaunchKyc from './Launchpad/Kyc';
import ZeroGravityList from './Launchpad';
import styled from 'styled-components'
import { QueryClientProvider, QueryClient, Query } from 'react-query';

const AppWrapper = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
  overflow-x: hidden;
  overflow-y: hidden;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: column;
`};
`

const HeaderWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  justify-content: space-between;
`

const BodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: 0px;
  align-items: center;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 10;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 0px 16px 16px 16px;
  `};
  z-index: 1;
`

function TopLevelModals() {
  const open = useModalOpen(ApplicationModal.ADDRESS_CLAIM)
  const toggle = useToggleModal(ApplicationModal.ADDRESS_CLAIM)

  return <AddressClaimModal isOpen={open} onDismiss={toggle} />
}

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 0, // on failure, do not repeat the request
			refetchOnWindowFocus: false,
			refetchOnReconnect: false,
		},
	},
});

export default function App() {
  return (
    <Suspense fallback={null}>
      <QueryClientProvider client={queryClient}>
        <GraphQLProvider>
          <Route component={DarkModeQueryParamReader} />
          <AppWrapper>
            <SideMenu />
            <div className="snow-bg"></div>
            <div className="bg-darken"></div>

            <BodyWrapper>
              <URLWarning />
              <HeaderWrapper>
                <Header />
              </HeaderWrapper>
              <Popups />
              <Polling />
              <TopLevelModals />
              <Web3ReactManager>
                <Switch>
                  <Route exact strict path="/home" component={Home} />
                  <Route exact strict path="/swap" component={Swap} />
                  <Route exact strict path="/stake" component={Staking} />
                  <Route exact strict path="/claim" component={OpenClaimAddressModalAndRedirectToSwap} />
                  <Route exact strict path="/swap/:outputCurrency" component={RedirectToSwap} />
                  <Route exact strict path="/send" component={RedirectPathToSwapOnly} />
                  <Route exact strict path="/find" component={PoolFinder} />
                  <Route exact strict path="/pools" component={Pools} />
                  <Route exact strict path="/guides" component={Guides} />
                  <Route exact strict path="/vote" component={Vote} />
                  <Route exact strict path="/create" component={RedirectToAddLiquidity} />
                  <Route exact path="/add" component={AddLiquidity} />
                  <Route exact path="/add/:currencyIdA" component={AddLiquidity} />
                  <Route exact path="/add/:currencyIdA/:currencyIdB" component={AddLiquidity} />
                  <Route exact path="/create" component={AddLiquidity} />
                  <Route exact path="/create/:currencyIdA" component={RedirectOldAddLiquidityPathStructure} />
                  <Route exact path="/create/:currencyIdA/:currencyIdB" component={RedirectDuplicateTokenIds} />
                  <Route exact strict path="/remove/v1/:address" component={RemoveV1Exchange} />
                  <Route exact strict path="/remove/:tokens" component={RedirectOldRemoveLiquidityPathStructure} />
                  <Route exact strict path="/remove/:currencyIdA/:currencyIdB" component={RemoveLiquidity} />
                  <Route exact strict path="/remove" component={RemoveLiquidity} />
                  <Route exact strict path="/migrate/v1" component={MigrateV1} />
                  <Route exact strict path="/migrate/v1/:address" component={MigrateV1Exchange} />
                  <Route exact strict path="/manage/:currencyIdA/:currencyIdB" component={Manage} />
                  <Route exact strict path="/vote/:id" component={VotePage} />
                  <Route exact strict path="/transfer" component={Transfer} />
                  <Route exact strict path="/launchpad" component={ZeroGravityList} />
                  <Route exact strict path="/launchpad/kyc" component={SkyLaunchKyc} />
                  <Route exact strict path="/launchpad/:idoURL" component={ZeroGravityInfo} />
                  <Route exact strict path="/launchpad/:idoURL/kyc" component={SkyLaunchKyc} />
                  <Route component={RedirectPathToHomeOnly} />
                </Switch>
              </Web3ReactManager>
            </BodyWrapper>
          </AppWrapper>
        </GraphQLProvider>
      </QueryClientProvider>
    </Suspense>
  )
}
