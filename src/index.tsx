import 'inter-ui'
import './i18n'
import './index.css'
import React, { StrictMode } from 'react'
import ThemeProvider, { FixedGlobalStyle, ThemedGlobalStyle } from './theme'
import { Web3ReactProvider, createWeb3ReactRoot } from '@web3-react/core'

import App from './pages/App'
import ApplicationUpdater from './state/application/updater'
import Blocklist from './components/Blocklist'
import { HashRouter } from 'react-router-dom'
import ListsUpdater from './state/lists/updater'
import MulticallUpdater from './state/multicall/updater'
import { NetworkContextName } from './constants'
import { Provider } from 'react-redux'
import ReactDOM from 'react-dom'
import TransactionUpdater from './state/transactions/updater'
import UserUpdater from './state/user/updater'
import getLibrary from './utils/getLibrary'
import store from './state'
import { RefreshContextProvider } from './contexts/RefreshContext'

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName)

// if (window.location.hostname.includes('zero')) {
//   window.location.href = window.location.href.replace('zero', '0');
// }

if ('ethereum' in window) {
  ;(window.ethereum as any).autoRefreshOnNetworkChange = false
}

function Updaters() {
  return (
    <>
      {/*<ListsUpdater />*/}
      <UserUpdater />
      <ApplicationUpdater />
      <TransactionUpdater />
      <MulticallUpdater />
    </>
  )
}

ReactDOM.render(
  <StrictMode>
    <FixedGlobalStyle />
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ProviderNetwork getLibrary={getLibrary}>
        <RefreshContextProvider>
          <Blocklist>
            <Provider store={store}>
              <Updaters />
              <ThemeProvider>
                <ThemedGlobalStyle />
                <HashRouter>
                  <App />
                </HashRouter>
              </ThemeProvider>
            </Provider>
          </Blocklist>
        </RefreshContextProvider>
      </Web3ProviderNetwork>
    </Web3ReactProvider>
  </StrictMode>,
  document.getElementById('root')
)
