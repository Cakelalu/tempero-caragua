interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const userCache = new Map<string, CacheEntry<any>>()

const TTL_MS = 60 * 1000 // 1 minuto de cache

export const getCachedUserByEmail = async (
  email: string,
  fetchFn: () => Promise<any | null>
): Promise<any | null> => {
  const now = Date.now()
  const cached = userCache.get(email)

  if (cached && cached.expiresAt > now) {
    return cached.data
  }

  const data = await fetchFn()

  if (data) {
    userCache.set(email, { data, expiresAt: now + TTL_MS })
  }

  return data
}

export const invalidateUserCache = (email: string) => {
  userCache.delete(email)
}

export const clearUserCache = () => {
  userCache.clear()
}
