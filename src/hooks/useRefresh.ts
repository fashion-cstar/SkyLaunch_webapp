import { useContext } from 'react'
import { RefreshContext } from 'contexts/RefreshContext'

const useRefresh = () => {
  const { fast, slow, middle } = useContext(RefreshContext)
  return { fastRefresh: fast, slowRefresh: slow, middleRefresh: middle }
}

export default useRefresh