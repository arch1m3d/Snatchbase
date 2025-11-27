import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Image as ImageIcon, X, ZoomIn, Download, Calendar, FileImage } from 'lucide-react'
import { FileItem, fetchFileContent } from '../services/api'
import toast from 'react-hot-toast'

interface ScreenshotGalleryProps {
  files: FileItem[]
  isLoading: boolean
}

const ScreenshotGallery: React.FC<ScreenshotGalleryProps> = ({ files, isLoading }) => {
  const [selectedImage, setSelectedImage] = useState<FileItem | null>(null)
  const [imageContent, setImageContent] = useState<string | null>(null)
  const [loadingImage, setLoadingImage] = useState(false)

  // Filter image files
  const imageFiles = files.filter(file => {
    const ext = file.file_name.toLowerCase().split('.').pop()
    return ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'].includes(ext || '')
  })

  const handleImageClick = async (file: FileItem) => {
    try {
      setLoadingImage(true)
      setSelectedImage(file)

      const data = await fetchFileContent(file.id)

      if (data.content) {
        setImageContent(data.content)
      } else {
        toast.error('No image content available')
        setSelectedImage(null)
      }
    } catch (error) {
      console.error('Failed to load image:', error)
      toast.error('Failed to load image')
      setSelectedImage(null)
    } finally {
      setLoadingImage(false)
    }
  }

  const handleDownload = async (file: FileItem) => {
    try {
      const data = await fetchFileContent(file.id)

      if (data.content) {
        const blob = new Blob([data.content], { type: 'image/png' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = file.file_name
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Image downloaded')
      } else {
        toast.error('No image content to download')
      }
    } catch (error) {
      console.error('Failed to download image:', error)
      toast.error('Failed to download image')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div
            key={i}
            className="bg-dark-800 border border-dark-700 rounded-lg aspect-square animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (imageFiles.length === 0) {
    return (
      <div className="text-center py-20">
        <ImageIcon className="h-16 w-16 text-dark-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No screenshots found</h3>
        <p className="text-dark-400">This device has no image files</p>
      </div>
    )
  }

  return (
    <>
      {/* Gallery Summary */}
      <div className="bg-dark-800 border border-dark-700 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-dark-400">Total Images</p>
            <p className="text-3xl font-bold text-white mt-1">{imageFiles.length}</p>
          </div>
          <FileImage className="h-10 w-10 text-primary-500" />
        </div>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {imageFiles.map((file) => (
          <motion.div
            key={file.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            className="group relative bg-dark-800 border border-dark-700 rounded-lg overflow-hidden aspect-square cursor-pointer"
            onClick={() => handleImageClick(file)}
          >
            {/* Placeholder/Thumbnail */}
            <div className="absolute inset-0 flex items-center justify-center bg-dark-700/50">
              <ImageIcon className="h-12 w-12 text-dark-500" />
            </div>

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-xs text-white font-medium truncate">
                  {file.file_name}
                </p>
                <p className="text-xs text-dark-400 mt-1">
                  {formatFileSize(file.file_size)}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDownload(file)
                }}
                className="p-2 bg-dark-800/90 hover:bg-dark-700 rounded-lg transition-colors"
              >
                <Download className="h-4 w-4 text-white" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => {
              setSelectedImage(null)
              setImageContent(null)
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-6xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => {
                  setSelectedImage(null)
                  setImageContent(null)
                }}
                className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-white" />
              </button>

              {/* Image container */}
              <div className="bg-dark-800 border border-dark-700 rounded-lg overflow-hidden">
                {loadingImage ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
                  </div>
                ) : imageContent ? (
                  <div className="relative">
                    <img
                      src={`data:image/png;base64,${btoa(imageContent)}`}
                      alt={selectedImage.file_name}
                      className="w-full h-auto max-h-[70vh] object-contain"
                      onError={() => {
                        toast.error('Failed to display image')
                        setSelectedImage(null)
                        setImageContent(null)
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-96">
                    <p className="text-dark-400">Unable to load image</p>
                  </div>
                )}

                {/* Image info */}
                <div className="p-4 border-t border-dark-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{selectedImage.file_name}</p>
                      <p className="text-sm text-dark-400 mt-1">
                        {formatFileSize(selectedImage.file_size)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDownload(selectedImage)}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default ScreenshotGallery
