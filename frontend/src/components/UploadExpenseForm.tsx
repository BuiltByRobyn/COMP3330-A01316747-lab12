import { useState } from 'react'

interface UploadExpenseFormProps {
  expenseId: number
  onSuccess?: () => void
}

export function UploadExpenseForm({ expenseId, onSuccess }: UploadExpenseFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string>('')
  const [uploading, setUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError('') 
    }
  }

  // 🔧 Fixed: Added async keyword
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('') // Clear previous error
    
    if (!file) {
      setError('Please select a file')
      return
    }

    setUploading(true)

    try {
      const signResponse = await fetch('/api/upload/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ filename: file.name, type: file.type }),
      })

      if (!signResponse.ok) {
        throw new Error('Failed to get upload URL')
      }

      const { uploadUrl, key } = await signResponse.json()

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file')
      }

      const updateResponse = await fetch(`/api/expenses/${expenseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ fileKey: key }),
      })

      if (!updateResponse.ok) {
        throw new Error('Failed to update expense')
      }

      // ✅ Success! Reset form
      setFile(null)
      if (onSuccess) onSuccess()
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="receipt" className="block text-sm font-medium mb-1">
          Upload Receipt
        </label>
        <input
          id="receipt"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="mt-1 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {file && (
          <p className="mt-1 text-sm text-gray-600">
            Selected: {file.name}
          </p>
        )}
      </div>

      {/* ✨ Step 3: Inline Error Display */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* ✨ Step 3: Loading Spinner + Disabled State */}
      <button
        type="submit"
        disabled={!file || uploading}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed transition"
      >
        {uploading ? (
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Uploading…
          </span>
        ) : (
          'Upload Receipt'
        )}
      </button>
    </form>
  )
}