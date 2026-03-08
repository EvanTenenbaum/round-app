'use client'
export default function CirclesPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My circles</h1>
        <button className="bg-[#E8733A] text-white font-semibold px-4 py-2 rounded-xl text-sm hover:bg-[#C55A25] transition-colors">
          + Create circle
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
        <div className="text-4xl mb-3">⭕</div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">No circles yet</h2>
        <p className="text-gray-500 text-sm max-w-xs mx-auto mb-6">
          Create a circle or join one with an invite code to get started.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button className="bg-[#E8733A] text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-[#C55A25] text-sm">
            Create a circle
          </button>
          <button className="border border-gray-200 text-gray-700 font-medium px-5 py-2.5 rounded-xl hover:bg-gray-50 text-sm">
            Enter invite code
          </button>
        </div>
      </div>
    </div>
  )
}
