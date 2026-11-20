import { ImageSlot } from './components/ImageSlot'
import { ComparisonView } from './components/ComparisonView'

function App() {
  return (
    <div className="flex h-full flex-col bg-neutral-100">
      <header className="border-b border-neutral-200 bg-white px-4 py-3">
        <h1 className="text-lg font-semibold text-neutral-900">Splitshot</h1>
      </header>
      <main className="flex flex-1 flex-col items-start gap-6 overflow-auto p-6">
        <div className="mx-auto flex gap-6">
          <ImageSlot slot="A" label="Expected" />
          <ImageSlot slot="B" label="Actual" />
        </div>
        <ComparisonView />
      </main>
    </div>
  )
}

export default App
