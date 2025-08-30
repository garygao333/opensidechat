//settings page

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PlusIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'
import FadeContent from '../components/FadeContent'
import { useAuth } from '../../contexts/AuthContext'

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [showConfirmLogout, setShowConfirmLogout] = useState(false)

  // handle logout

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  if (!user) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-black">
      {/* sidebar */}
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
            className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center text-white hover:bg-gray-600 transition-colors"
            title="Create Post"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => router.push('/settings')}
            className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white hover:bg-purple-700 transition-colors"
            title="Settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </button>
        </div>
      </div>

      {/* main content */}
      <main className="ml-16 p-6">
        <FadeContent delay={200}>
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
              <p className="text-gray-400">Manage your account</p>
            </div>

            <div className="space-y-6">
              {/* account information */}
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4">Account Information</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                    <div className="bg-gray-800 rounded-lg p-3 text-gray-300">
                      {user.email}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">User ID</label>
                    <div className="bg-gray-800 rounded-lg p-3 text-gray-500 text-sm font-mono">
                      {user.uid}
                    </div>
                  </div>
                </div>
              </div>

              {/* about the sidechat */}
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4">About OpenSideChat</h2>
                <div className="space-y-3 text-gray-400">
                  <p>Open-source anonymous posting platform for Penn students</p>
                  <p>• Share thoughts and experiences anonymously</p>
                  <p>• Comment and vote on posts from other fellow students</p>
                  <p>• Forever free with no ads</p>
                  <div className="pt-3 border-t border-gray-700">
                    <p className="text-sm text-gray-500">
                      Only verified Penn email addresses can access this platform<br/>
                      (@upenn.edu, @sas.upenn.edu, @seas.upenn.edu, @wharton.upenn.edu)
                    </p>
                  </div>
                </div>
              </div>

              {/* privacy info */}
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4">Privacy & Safety</h2>
                <div className="space-y-3 text-gray-400">
                  <p>• All posts are anonymous</p>
                  <p>• Be respectful of others and don't post anything inappropriate</p>
                  <p>• Developed for Penn Spark Red team technical application</p>
                </div>
              </div>

              {/* logout */}
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4">Account Actions</h2>
                
                {!showConfirmLogout ? (
                  <button
                    onClick={() => setShowConfirmLogout(true)}
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    Logout
                  </button>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-300">Are you sure you want to logout?</p>
                    <div className="flex gap-3">
                      <button
                        onClick={handleLogout}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Yes, Logout
                      </button>
                      <button
                        onClick={() => setShowConfirmLogout(false)}
                        className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </FadeContent>
      </main>
    </div>
  )
}