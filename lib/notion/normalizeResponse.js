/**
 * Normalize notion-client response to handle different data formats.
 * Some versions return { value: blockData }, others return { value: { value: blockData } }.
 */
function normalizeRecordMap (recordMap) {
  if (!recordMap) return recordMap

  const result = { ...recordMap }

  if (result.block) {
    result.block = normalizeEntries(result.block)
  }
  if (result.collection) {
    result.collection = normalizeEntries(result.collection)
  }
  if (result.collection_view) {
    result.collection_view = normalizeEntries(result.collection_view)
  }

  return result
}

function normalizeEntries (entries) {
  if (!entries) return {}
  const normalized = {}
  for (const [key, entry] of Object.entries(entries)) {
    if (entry?.value?.value?.id) {
      // Double nested: { spaceId, value: { value: actualData } }
      normalized[key] = { value: entry.value.value, role: entry.role }
    } else {
      normalized[key] = entry
    }
  }
  return normalized
}

export { normalizeRecordMap }
