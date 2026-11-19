import { ImageSlot } from './components/ImageSlot'

function App() {
  return (
    <div className="flex h-full flex-col bg-neutral-100">
      <header className="border-b border-neutral-200 bg-white px-4 py-3">
        <h1 className="text-lg font-semibold text-neutral-900">Splitshot</h1>
      </header>
      <main className="flex flex-1 items-center justify-center gap-6">
        <ImageSlot slot="A" label="Expected" />
        <ImageSlot slot="B" label="Actual" />
      </main>
    </div>
  )
}

export default App
