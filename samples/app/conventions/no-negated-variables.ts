declare const items: string[]

export const isEmpty = items.length === 0
export const notificationCount = items.length
export const isNotFound = items.includes('404')
