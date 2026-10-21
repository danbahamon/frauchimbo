import { PrintSheet, ShareModal } from './components/chrome'
import { Shell } from './screens/Shell'
import { Onboarding } from './screens/Onboarding'
import { Provider, useStore } from './state'

function Frame() {
  const { data } = useStore()
  return (
    <>
      <div className={data.profile ? 'app studio' : 'app solo'}>
        {data.profile ? <Shell /> : <main className="stage"><div className="sheet"><Onboarding /></div></main>}
      </div>
      <PrintSheet />
      <ShareModal />
    </>
  )
}

export function App() {
  return (
    <Provider>
      <Frame />
    </Provider>
  )
}
