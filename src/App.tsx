import { Layer, Stage, Text } from 'react-konva'

function App() {
  return (
    <div className="flex h-full flex-col bg-neutral-100">
      <header className="border-b border-neutral-200 bg-white px-4 py-3">
        <h1 className="text-lg font-semibold text-neutral-900">Splitshot</h1>
      </header>
      <main className="flex flex-1 items-center justify-center">
        <Stage width={480} height={270} className="rounded border border-neutral-300 bg-white shadow-sm">
          <Layer>
            <Text text="Splitshot scaffold ready" x={20} y={20} fontSize={18} fill="#404040" />
          </Layer>
        </Stage>
      </main>
    </div>
  )
}

export default App
