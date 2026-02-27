import api from '@/lib/server/notion-api'
import { normalizeRecordMap } from './normalizeResponse'

export async function getPostBlocks (id) {
  const pageBlock = await api.getPage(id)
  return normalizeRecordMap(pageBlock)
}
