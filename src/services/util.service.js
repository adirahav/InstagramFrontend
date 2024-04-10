export const utilService = {
    makeId,
    saveToStorage,
    loadFromStorage,
    timeAgo,
    timeRangeAgo,
    isValidEmail,
    isValidPhoneNumber,
    isValidUsername,
    isValidPassword,
    getPlatform,
    findRootParent,
    getMediaType
}

const PLATFORM = {
  MOBILE: "MOBILE",
  DESKTOP: "DESKTOP"
}

const MEDIA_WIDTH = {
  MOBILE: 767,
  DESKTOP: 768
}

function makeId(length = 5) {
    var text = ""
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
}

function saveToStorage(key, value) {
    localStorage[key] = JSON.stringify(value)
}

function loadFromStorage(key, defaultValue = null) {
    const value = localStorage[key] || defaultValue
    return JSON.parse(value)
}

function timeAgo(postAt, isLongFormat = false, activeAt = false) {
    const currentTime = Date.now()
    const postTime = new Date(postAt).getTime()
    const timeDifference = currentTime - postTime

    const seconds = Math.floor(timeDifference / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const weeks = Math.floor(days / 7)
    const months = Math.floor(weeks / 4)
    
    if (isLongFormat) {
      if (months > 0) {
        return months === 1 ? `1 month ago`: `${months} months ago`
      } else if (weeks > 0) {
        return weeks === 1 ? `1 week ago`: `${weeks} weeks ago`
      } else if (days > 0) {
        return days === 1 ? `1 day ago`: `${days} days ago`
      } else if (hours > 0) {
        return hours === 1 ? `1 hour ago`: `${hours} hours ago`
      } else if (minutes > 0) {
        return minutes === 1 ? `1 minute ago`: `${minutes} minutes ago`
      } else {
        return seconds === 1 
                  ? `1 second ago`
                  : seconds > 1 
                      ? `${seconds} seconds ago`
                      : 'Now'
      }
    }
    else if (activeAt) {
      if (months > 0) {
        return `Active ${months}mo ago`
      } else if (weeks > 0) {
        return `Active ${weeks}w ago`
      } else if (days > 0) {
        return `Active ${days}d ago`
      } else if (hours > 0) {
        return `Active ${hours}h ago`
      } else if (minutes > 0) {
        return `Active ${minutes}m ago`
      } else if (seconds > 0) {
        return `Active ${seconds}s ago`
      }
      else {
        return `Active now`
      }

    }
    else {
      if (months > 0) {
        return `${months}mo`
      } else if (weeks > 0) {
        return `${weeks}w`
      } else if (days > 0) {
        return `${days}d`
      } else if (hours > 0) {
        return `${hours}h`
      } else if (minutes > 0) {
        return `${minutes}m`
      } else if (seconds > 0) {
        return `${seconds}s`
      } else {
        return `Now`
      }
    }
    
}

function timeRangeAgo(postAt) {
    const currentTime = Date.now()
    const postTime = new Date(postAt).getTime()
    const timeDifference = currentTime - postTime

    const seconds = Math.floor(timeDifference / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const weeks = Math.floor(days / 7)
    
    const postDate = new Date(postAt)
    const currentMonth = new Date().getMonth()
    const postMonth = postDate.getMonth()
    const months = (currentMonth - postMonth) + 12 * (new Date().getFullYear() - postDate.getFullYear())

    if (months > 0) {
      return `Earlier`
    } else if (weeks > 0) {
      return `This month`
    } else if (days > 1) {
      return `This week`
    } else if (days > 0) {
      return `Yesterday`
    } else {
      return `Today`
    } 
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

function isValidPhoneNumber(phoneNumber) {
    const phoneRegex = /^\d{10}$/ 
    return phoneRegex.test(phoneNumber)
}

function isValidUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9](?!.*[._]{2})[a-zA-Z0-9._]{0,28}[a-zA-Z0-9]$/
    return usernameRegex.test(username)
}

function isValidPassword(password) {
    const lengthRequirement = password.length >= 6
    const containsLettersNumbersSymbols = /[a-zA-Z]+/.test(password) && /\d+/.test(password) && /\W+/.test(password)
    return lengthRequirement && containsLettersNumbersSymbols
}

function getPlatform() {
  return window.innerWidth <= MEDIA_WIDTH.MOBILE
              ? PLATFORM.MOBILE
              : PLATFORM.DESKTOP
}

function findRootParent(element) {
  let currentElement = element

  while (currentElement.parentElement) {
      currentElement = currentElement.parentElement
  }

  return currentElement
}

function getMediaType(fullURL) {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp']
  const videoExtensions = ['mp4', 'webm', 'ogg', 'avi', 'mov']

  const imageURL = fullURL.split('?')[0]
  const extension = imageURL.split('.').pop().toLowerCase()

  if (imageExtensions.includes(extension)) {
    return 'image'
  } else if (videoExtensions.includes(extension)) {
    return 'video'
  } else {
    return 'unknown'
  }
}