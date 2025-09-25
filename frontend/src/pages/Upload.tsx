import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { 
  Upload as UploadIcon, 
  File, 
  Lock, 
  CheckCircle, 
  AlertCircle,
  X,
  FileArchive,
  Loader2,
  Shield,
  Database
} from 'lucide-react'
import { uploadFile } from '@/services/api'
import toast from 'react-hot-toast'

interface UploadedFile {
  file: File
  password?: string
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
  taskId?: string
  error?: string
  result?: {
    credentials: number
    systems: number
  }
}

export default function Upload() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      status: 'pending' as const,
      progress: 0
    }))
    
    setUploadedFiles(prev => [...prev, ...newFiles])
    setIsDragging(false)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip'],
      'application/x-rar-compressed': ['.rar'],
      'application/x-7z-compressed': ['.7z']
    },
    multiple: true,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false)
  })

  const handlePasswordChange = (index: number, password: string) => {
    setUploadedFiles(prev => prev.map((file, i) => 
      i === index ? { ...file, password } : file
    ))
  }

  const handleUpload = async (index: number) => {
    const fileData = uploadedFiles[index]
    if (!fileData) return

    setUploadedFiles(prev => prev.map((file, i) => 
      i === index ? { ...file, status: 'uploading', progress: 0 } : file
    ))

    try {
      const result = await uploadFile(
        fileData.file,
        fileData.password,
        (progress) => {
          setUploadedFiles(prev => prev.map((file, i) => 
            i === index ? { ...file, progress } : file
          ))
        }
      )

      setUploadedFiles(prev => prev.map((file, i) => 
        i === index ? { 
          ...file, 
          status: 'processing', 
          progress: 100,
          taskId: result.task_id 
        } : file
      ))

      toast.success('File uploaded successfully! Processing...')

      // Simulate processing completion (in real app, you'd poll for status)
      setTimeout(() => {
        setUploadedFiles(prev => prev.map((file, i) => 
          i === index ? { 
            ...file, 
            status: 'completed',
            result: {
              credentials: Math.floor(Math.random() * 1000) + 100,
              systems: Math.floor(Math.random() * 100) + 10
            }
          } : file
        ))
        toast.success('Processing completed!')
      }, 3000)

    } catch (error) {
      setUploadedFiles(prev => prev.map((file, i) => 
        i === index ? { 
          ...file, 
          status: 'error',
          error: error instanceof Error ? error.message : 'Upload failed'
        } : file
      ))
      toast.error('Upload failed')
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase()
    return <FileArchive className="h-8 w-8 text-primary-400" />
  }

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'pending':
        return <File className="h-5 w-5 text-dark-400" />
      case 'uploading':
      case 'processing':
        return <Loader2 className="h-5 w-5 text-primary-400 animate-spin" />
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-400" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-400" />
    }
  }

  const getStatusColor = (status: UploadedFile['status']) => {
    switch (status) {
      case 'pending':
        return 'text-dark-400'
      case 'uploading':
      case 'processing':
        return 'text-primary-400'
      case 'completed':
        return 'text-green-400'
      case 'error':
        return 'text-red-400'
    }
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold gradient-text mb-2">
            Upload Stealer Logs
          </h1>
          <p className="text-dark-400 text-lg">
            Upload and process stealer log archives for analysis
          </p>
        </motion.div>

        {/* Upload Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div
            {...getRootProps()}
            className={`
              relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer
              ${isDragActive || isDragging
                ? 'border-primary-400 bg-primary-500/10 scale-105'
                : 'border-dark-600 hover:border-dark-500 hover:bg-dark-800/30'
              }
            `}
          >
            <input {...getInputProps()} />
            
            <motion.div
              animate={{ 
                scale: isDragActive || isDragging ? 1.1 : 1,
                rotate: isDragActive || isDragging ? 5 : 0
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <UploadIcon className={`
                h-16 w-16 mx-auto mb-4 transition-colors duration-300
                ${isDragActive || isDragging ? 'text-primary-400' : 'text-dark-500'}
              `} />
            </motion.div>
            
            <h3 className="text-xl font-semibold text-white mb-2">
              {isDragActive ? 'Drop files here' : 'Upload Stealer Log Archives'}
            </h3>
            
            <p className="text-dark-400 mb-4">
              Drag and drop your files here, or click to browse
            </p>
            
            <div className="flex items-center justify-center space-x-4 text-sm text-dark-500">
              <span className="flex items-center space-x-1">
                <FileArchive className="h-4 w-4" />
                <span>.zip</span>
              </span>
              <span className="flex items-center space-x-1">
                <FileArchive className="h-4 w-4" />
                <span>.rar</span>
              </span>
              <span className="flex items-center space-x-1">
                <FileArchive className="h-4 w-4" />
                <span>.7z</span>
              </span>
            </div>

            {/* Animated background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-transparent to-primary-500/5 rounded-xl"
              animate={{
                x: isDragActive || isDragging ? ['-100%', '100%'] : 0,
              }}
              transition={{
                duration: 2,
                repeat: isDragActive || isDragging ? Infinity : 0,
                ease: "linear"
              }}
            />
          </div>
        </motion.div>

        {/* Uploaded Files */}
        <AnimatePresence>
          {uploadedFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <h2 className="text-xl font-semibold text-white mb-4">
                Uploaded Files ({uploadedFiles.length})
              </h2>

              {uploadedFiles.map((fileData, index) => (
                <motion.div
                  key={`${fileData.file.name}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className="card"
                >
                  <div className="flex items-start space-x-4">
                    {/* File Icon */}
                    <div className="flex-shrink-0">
                      {getFileIcon(fileData.file.name)}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium text-white truncate">
                          {fileData.file.name}
                        </h3>
                        
                        <div className="flex items-center space-x-2">
                          <div className={`flex items-center space-x-1 ${getStatusColor(fileData.status)}`}>
                            {getStatusIcon(fileData.status)}
                            <span className="text-sm font-medium capitalize">
                              {fileData.status}
                            </span>
                          </div>
                          
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeFile(index)}
                            className="text-dark-400 hover:text-red-400 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-dark-400 mb-4">
                        <span>{(fileData.file.size / (1024 * 1024)).toFixed(2)} MB</span>
                        <span>•</span>
                        <span>{fileData.file.type || 'Archive'}</span>
                      </div>

                      {/* Password Input */}
                      {fileData.status === 'pending' && (
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Lock className="h-4 w-4 text-dark-400" />
                              <label className="text-sm text-dark-400">
                                Password (optional)
                              </label>
                            </div>
                            <input
                              type="password"
                              placeholder="Enter archive password if required"
                              value={fileData.password || ''}
                              onChange={(e) => handlePasswordChange(index, e.target.value)}
                              className="input-field w-full"
                            />
                          </div>
                          
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleUpload(index)}
                            className="btn-primary mt-6"
                          >
                            Upload
                          </motion.button>
                        </div>
                      )}

                      {/* Progress Bar */}
                      {(fileData.status === 'uploading' || fileData.status === 'processing') && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-dark-400">
                              {fileData.status === 'uploading' ? 'Uploading...' : 'Processing...'}
                            </span>
                            <span className="text-sm text-dark-400">
                              {fileData.progress}%
                            </span>
                          </div>
                          <div className="w-full bg-dark-700 rounded-full h-2">
                            <motion.div
                              className="bg-primary-500 h-2 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${fileData.progress}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Results */}
                      {fileData.status === 'completed' && fileData.result && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="grid grid-cols-2 gap-4"
                        >
                          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <div className="flex items-center space-x-2 mb-1">
                              <Shield className="h-4 w-4 text-green-400" />
                              <span className="text-sm font-medium text-green-400">Credentials</span>
                            </div>
                            <p className="text-lg font-bold text-white">
                              {fileData.result.credentials.toLocaleString()}
                            </p>
                          </div>
                          
                          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <div className="flex items-center space-x-2 mb-1">
                              <Database className="h-4 w-4 text-blue-400" />
                              <span className="text-sm font-medium text-blue-400">Systems</span>
                            </div>
                            <p className="text-lg font-bold text-white">
                              {fileData.result.systems.toLocaleString()}
                            </p>
                          </div>
                        </motion.div>
                      )}

                      {/* Error */}
                      {fileData.status === 'error' && fileData.error && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            <AlertCircle className="h-4 w-4 text-red-400" />
                            <span className="text-sm font-medium text-red-400">Error</span>
                          </div>
                          <p className="text-sm text-red-300">{fileData.error}</p>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12 card"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Upload Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-dark-400">
            <div>
              <h4 className="font-medium text-white mb-2">Supported Formats</h4>
              <ul className="space-y-1">
                <li>• ZIP archives (.zip)</li>
                <li>• RAR archives (.rar)</li>
                <li>• 7-Zip archives (.7z)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Processing</h4>
              <ul className="space-y-1">
                <li>• Files are processed automatically</li>
                <li>• Password-protected archives supported</li>
                <li>• Large files may take several minutes</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
