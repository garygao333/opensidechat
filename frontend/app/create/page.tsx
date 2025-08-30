'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PhotoIcon, PlusIcon } from '@heroicons/react/24/outline'
import FadeContent from '../components/FadeContent'
import { useAuth } from '../../contexts/AuthContext'
import { db, storage } from '../../lib/firebase'
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage'

export default function CreatePostPage() {
  const [content, setContent] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const { user } = useAuth()
  const router = useRouter()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB')
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file')
        return
      }

      setError('')
      setImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImage(null)
    setImagePreview(null)
    setError('')
    setUploadProgress(0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !content.trim()) {
      setError('Please enter some content for your post')
      return
    }

    setLoading(true)
    setError('')
    setUploadProgress(0)

    try {
      let imageUrl = ''

      if (image) {
        const imageRef = ref(storage, `posts/${Date.now()}_${image.name}`)
        
        // Use uploadBytesResumable for progress tracking
        const uploadTask = uploadBytesResumable(imageRef, image)
        
        // Wait for upload to complete with progress tracking
        await new Promise((resolve, reject) => {
          uploadTask.on('state_changed',
            (snapshot) => {
              // Track upload progress
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              setUploadProgress(Math.round(progress))
            },
            (error) => {
              console.error('Upload error:', error)
              reject(error)
            },
            async () => {
              // Upload completed successfully
              try {
                imageUrl = await getDownloadURL(uploadTask.snapshot.ref)
                resolve(imageUrl)
              } catch (error) {
                reject(error)
              }
            }
          )
        })
      }

      // Create the post
      await addDoc(collection(db, 'posts'), {
        content: content.trim(),
        imageUrl: imageUrl || null,
        authorId: user.uid,
        upvotes: 0,
        downvotes: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })

      // Reset form and navigate
      setContent('')
      setImage(null)
      setImagePreview(null)
      setUploadProgress(0)
      router.push('/discover')
    } catch (error: any) {
      console.error('Error creating post:', error)
      setError(error.message || 'Failed to create post. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Slim Sidebar */}
      <div className="fixed left-0 top-0 h-full w-16 bg-gray-900 border-r border-gray-800 z-50 flex flex-col items-center py-4">
        <div className="flex flex-col gap-4">
          <button
            onClick={() => router.push('/discover')}
            className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center text-white hover:bg-gray-600 transition-colors"
            title="Discover"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
          </button>
          <button
            onClick={() => router.push('/create')}
            className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white hover:bg-purple-700 transition-colors"
            title="Create Post"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => router.push('/settings')}
            className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center text-white hover:bg-gray-600 transition-colors"
            title="Settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="ml-16 p-6">
        <FadeContent delay={200}>
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">Create Post</h1>
              <p className="text-gray-400">Share your thoughts anonymously with UPenn students</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Display */}
              {error && (
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-red-300 text-sm">
                  {error}
                </div>
              )}

              {/* Upload Progress */}
              {loading && uploadProgress > 0 && uploadProgress < 100 && (
                <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">Uploading image...</span>
                    <span className="text-sm text-gray-400">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Text Content */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  What's on your mind?
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write something..."
                  rows={6}
                  className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none resize-none"
                  maxLength={500}
                />
                <div className="text-right text-xs text-gray-500 mt-1">
                  {content.length}/500
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Add an image (optional)
                </label>
                
                {!imagePreview ? (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer bg-gray-900 hover:bg-gray-800 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <PhotoIcon className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="text-sm text-gray-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                ) : (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => router.push('/discover')}
                  className="flex-1 bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!content.trim() || loading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  {loading ? 'Posting...' : 'Post Anonymously'}
                </button>
              </div>
            </form>
          </div>
        </FadeContent>
      </main>
    </div>
  )
}