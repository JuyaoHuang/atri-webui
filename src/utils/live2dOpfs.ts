interface CachedMeta {
  sourceUrl?: string
}

interface Live2DResourceTarget {
  path: string
  url: string
}

interface LoadLive2dFilesOptions {
  modelId: string
  settingsUrl: string
  settingsPath: string
}

type StorageManagerWithDirectory = StorageManager & {
  getDirectory?: () => Promise<FileSystemDirectoryHandle>
}

type FileSystemDirectoryHandleWithValues = FileSystemDirectoryHandle & {
  values?: () => AsyncIterable<FileSystemHandle>
}

const OPFS_ROOT_DIRECTORY = 'atri-live2d-opfs'
const META_FILE_NAME = '__meta.json'

function getStorageManager() {
  if (typeof navigator === 'undefined' || !navigator.storage) {
    return null
  }

  return navigator.storage as StorageManagerWithDirectory
}

function supportsOpfs() {
  return typeof getStorageManager()?.getDirectory === 'function'
}

async function getCacheRoot(create = true): Promise<FileSystemDirectoryHandle | null> {
  const storageManager = getStorageManager()
  if (!storageManager?.getDirectory) {
    return null
  }

  const root = await storageManager.getDirectory()
  return await root.getDirectoryHandle(OPFS_ROOT_DIRECTORY, { create })
}

function normalizePosixPath(path: string) {
  const parts = path.replace(/\\/g, '/').split('/')
  const stack: string[] = []

  for (const part of parts) {
    if (!part || part === '.') {
      continue
    }

    if (part === '..') {
      stack.pop()
      continue
    }

    stack.push(part)
  }

  return stack.join('/')
}

function dirnamePosix(path: string) {
  const normalized = normalizePosixPath(path)
  const parts = normalized.split('/')
  parts.pop()
  return parts.join('/')
}

function basenamePosix(path: string) {
  const normalized = normalizePosixPath(path)
  const parts = normalized.split('/')
  return parts[parts.length - 1] || 'file'
}

function resolveStorePath(baseDir: string, relativePath: string) {
  if (/^[a-z]+:/i.test(relativePath) || relativePath.startsWith('//')) {
    return null
  }

  return normalizePosixPath(baseDir ? `${baseDir}/${relativePath}` : relativePath)
}

async function resolveDirectory(root: FileSystemDirectoryHandle, path: string): Promise<FileSystemDirectoryHandle> {
  let currentDirectory = root
  const parts = normalizePosixPath(path).split('/').filter(Boolean)

  for (const part of parts) {
    currentDirectory = await currentDirectory.getDirectoryHandle(part, { create: true })
  }

  return currentDirectory
}

async function writeFile(root: FileSystemDirectoryHandle, filePath: string, content: Blob | string) {
  const normalizedPath = normalizePosixPath(filePath)
  const parts = normalizedPath.split('/')
  const fileName = parts.pop()
  if (!fileName) {
    return
  }

  const directoryPath = parts.join('/')
  const directoryHandle = await resolveDirectory(root, directoryPath)
  const fileHandle = await directoryHandle.getFileHandle(fileName, { create: true })
  const writable = await fileHandle.createWritable()
  await writable.write(content)
  await writable.close()
}

async function readDirectoryRecursive(dir: FileSystemDirectoryHandle, pathPrefix: string): Promise<File[]> {
  const files: File[] = []
  const iterator = (dir as FileSystemDirectoryHandleWithValues).values?.()
  if (!iterator) {
    return files
  }

  for await (const entry of iterator) {
    if (entry.kind === 'file') {
      const fileHandle = entry as FileSystemFileHandle
      const file = await fileHandle.getFile()
      if (file.name === META_FILE_NAME) {
        continue
      }

      Object.defineProperty(file, 'webkitRelativePath', {
        value: pathPrefix ? `${pathPrefix}/${file.name}` : file.name,
      })
      files.push(file)
      continue
    }

    const nestedFiles = await readDirectoryRecursive(
      entry as FileSystemDirectoryHandle,
      pathPrefix ? `${pathPrefix}/${entry.name}` : entry.name,
    )
    files.push(...nestedFiles)
  }

  return files
}

async function readMeta(dirHandle: FileSystemDirectoryHandle) {
  try {
    const metaHandle = await dirHandle.getFileHandle(META_FILE_NAME, { create: false })
    const metaFile = await metaHandle.getFile()
    return JSON.parse(await metaFile.text()) as CachedMeta
  }
  catch {
    return null
  }
}

function createRelativeFile(relativePath: string, content: Blob | string, type?: string) {
  const file = content instanceof Blob
    ? new File([content], basenamePosix(relativePath), { type: content.type || type })
    : new File([content], basenamePosix(relativePath), { type })

  Object.defineProperty(file, 'webkitRelativePath', {
    value: normalizePosixPath(relativePath),
  })

  return file
}

function collectResourceTargets(settingsUrl: string, settingsPath: string, settingsData: Record<string, unknown>) {
  const targets = new Map<string, Live2DResourceTarget>()
  const settingsStorePath = normalizePosixPath(settingsPath)
  const baseDirectory = dirnamePosix(settingsStorePath)

  const addTarget = (rawPath: unknown) => {
    if (typeof rawPath !== 'string' || !rawPath.trim()) {
      return
    }

    const storePath = resolveStorePath(baseDirectory, rawPath)
    if (!storePath) {
      return
    }

    targets.set(storePath, {
      path: storePath,
      url: new URL(rawPath, settingsUrl).toString(),
    })
  }

  const fileReferences = (settingsData.FileReferences ?? settingsData.fileReferences ?? {}) as Record<string, unknown>
  addTarget(fileReferences.Moc)
  addTarget(fileReferences.Moc3)
  addTarget(fileReferences.Physics)
  addTarget(fileReferences.Pose)
  addTarget(fileReferences.UserData)
  addTarget(fileReferences.DisplayInfo)

  const textures = (fileReferences.Textures ?? settingsData.textures) as unknown[]
  textures?.forEach(texture => addTarget(texture))

  const expressions = (fileReferences.Expressions ?? settingsData.expressions) as Array<Record<string, unknown>>
  expressions?.forEach(expression => addTarget(expression?.File))

  const motions = (fileReferences.Motions ?? settingsData.motions) as Record<string, Array<Record<string, unknown>>>
  Object.values(motions ?? {}).forEach(group => {
    group?.forEach(motion => {
      addTarget(motion?.File)
      addTarget(motion?.Sound)
    })
  })

  return Array.from(targets.values())
}

async function fetchLive2dFiles(settingsUrl: string, settingsPath: string) {
  const settingsResponse = await fetch(settingsUrl)
  if (!settingsResponse.ok) {
    throw new Error(`Failed to fetch Live2D settings: ${settingsResponse.status}`)
  }

  const settingsText = await settingsResponse.text()
  const settingsData = JSON.parse(settingsText) as Record<string, unknown>
  const resourceTargets = collectResourceTargets(settingsUrl, settingsPath, settingsData)

  const files = [
    createRelativeFile(settingsPath, settingsText, 'application/json'),
  ]

  for (const target of resourceTargets) {
    const response = await fetch(target.url)
    if (!response.ok) {
      throw new Error(`Failed to fetch Live2D resource: ${target.path} (${response.status})`)
    }

    files.push(createRelativeFile(target.path, await response.blob()))
  }

  return files
}

async function getCachedFiles(modelId: string, sourceUrl: string) {
  if (!supportsOpfs()) {
    return null
  }

  try {
    const root = await getCacheRoot(false)
    if (!root) {
      return null
    }

    const modelDirectory = await root.getDirectoryHandle(modelId, { create: false })
    const meta = await readMeta(modelDirectory)
    if (meta?.sourceUrl && meta.sourceUrl !== sourceUrl) {
      return null
    }

    const files = await readDirectoryRecursive(modelDirectory, '')
    return files.length > 0 ? files : null
  }
  catch {
    return null
  }
}

async function saveCachedFiles(modelId: string, files: File[], sourceUrl: string) {
  if (!supportsOpfs()) {
    return
  }

  try {
    const root = await getCacheRoot(true)
    if (!root) {
      return
    }

    const modelDirectory = await root.getDirectoryHandle(modelId, { create: true })

    for (const file of files) {
      const relativePath = file.webkitRelativePath || file.name
      await writeFile(modelDirectory, relativePath, file)
    }

    await writeFile(modelDirectory, META_FILE_NAME, JSON.stringify({ sourceUrl } satisfies CachedMeta))
  }
  catch (error) {
    console.error('[OPFS] Failed to save Live2D cache:', error)
  }
}

export async function loadLive2dFilesWithOpfs(options: LoadLive2dFilesOptions) {
  const cachedFiles = await getCachedFiles(options.modelId, options.settingsUrl)
  if (cachedFiles) {
    return cachedFiles
  }

  const files = await fetchLive2dFiles(options.settingsUrl, options.settingsPath)
  await saveCachedFiles(options.modelId, files, options.settingsUrl)
  return files
}

export async function clearLive2dOpfsCache() {
  const storageManager = getStorageManager()
  if (!storageManager?.getDirectory) {
    return
  }

  try {
    const root = await storageManager.getDirectory()
    await root.removeEntry(OPFS_ROOT_DIRECTORY, { recursive: true })
  }
  catch (error) {
    console.error('[OPFS] Failed to clear cache:', error)
  }
}
