import { config as BLOG } from '@/lib/server/config'

import { idToUuid } from 'notion-utils'
import dayjs from 'dayjs'
import api from '@/lib/server/notion-api'
import getAllPageIds from './getAllPageIds'
import getPageProperties from './getPageProperties'
import filterPublishedPosts from './filterPublishedPosts'
import { normalizeRecordMap } from './normalizeResponse'

/**
 * @param {{ includePages: boolean }} - false: posts only / true: include pages
 */
export async function getAllPosts ({ includePages = false }) {
  const id = idToUuid(BLOG.notionPageId)

  let response
  try {
    response = normalizeRecordMap(await api.getPage(id))
  } catch (e) {
    console.error('Failed to fetch Notion page:', e.message)
    return []
  }

  const collection = Object.values(response.collection)[0]?.value
  const collectionQuery = response.collection_query
  const collectionView = response.collection_view
  const block = response.block
  const schema = collection?.schema

  const rawMetadata = block[id]?.value
  const collectionId = rawMetadata?.collection_id
  const viewIds = rawMetadata?.view_ids

  // Check Type
  if (
    rawMetadata?.type !== 'collection_view_page' &&
    rawMetadata?.type !== 'collection_view'
  ) {
    console.log(`pageId "${id}" is not a database, type: ${rawMetadata?.type}`)
    return []
  }

  // Construct Data
  const pageIds = getAllPageIds(collectionQuery, collectionId, collectionView, viewIds) || []
  const data = []
  for (let i = 0; i < pageIds.length; i++) {
    const id = pageIds[i]
    const properties = (await getPageProperties(id, block, schema)) || null
    if (!properties) continue

    // Add fullwidth to properties
    properties.fullWidth = block[id]?.value?.format?.page_full_width ?? false
    // Convert date (with timezone) to unix milliseconds timestamp
    properties.date = (
      properties.date?.start_date
        ? dayjs.tz(properties.date?.start_date)
        : dayjs(block[id]?.value?.created_time)
    ).valueOf()

    data.push(properties)
  }

  // remove all the the items doesn't meet requirements
  const posts = filterPublishedPosts({ posts: data, includePages })

  // Sort by date
  if (BLOG.sortByDate) {
    posts.sort((a, b) => b.date - a.date)
  }
  return posts
}
