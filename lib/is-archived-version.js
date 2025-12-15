const patterns = require('../lib/patterns')
const { deprecated } = require('../lib/enterprise-server-releases')

module.exports = function isArchivedVersion (req) {
  // Determine which path to check
  const pathToCheck = patterns.assetPaths.test(req.path)
    ? req.get('referrer')
    : req.path

  if (!pathToCheck) {
    return {}
  }

  // Check if any enterprise version pattern exists
  const hasEnterpriseVersion =
    patterns.getEnterpriseVersionNumber.test(pathToCheck) ||
    patterns.getEnterpriseServerNumber.test(pathToCheck)

  if (!hasEnterpriseVersion) {
    return {}
  }

  // Extract enterprise version safely
  let requestedVersion = null
  let match = null

  if (pathToCheck.includes('enterprise-server@')) {
    match = patterns.getEnterpriseServerNumber.exec(pathToCheck)
  } else {
    match = patterns.getEnterpriseVersionNumber.exec(pathToCheck)
  }

  if (!match || !match[1]) {
    return {}
  }

  requestedVersion = match[1]

  // Return early if version is not deprecated
  if (!deprecated.includes(requestedVersion)) {
    return {}
  }

  return {
    isArchived: true,
    requestedVersion
  }
}
