import { idToUuid } from 'notion-utils'

export default function getAllPageIds (collectionQuery, collectionId, collectionView, viewIds) {
  if (!collectionQuery && !collectionView) {
    return []
  }

  let pageIds = []

  // Try using viewIds with collectionQuery first (like NotionNext)
  try {
    if (collectionId && viewIds && viewIds.length > 0 && collectionQuery?.[collectionId]) {
      const ids = collectionQuery[collectionId][viewIds[0]]?.collection_group_results?.blockIds
      if (ids && ids.length > 0) {
        return [...ids]
      }
    }
  } catch (e) {
    // fallback to other methods
  }

  // Fallback: iterate all views in collectionQuery
  try {
    if (collectionQuery) {
      const pageSet = new Set()
      const queryValues = collectionId
        ? Object.values(collectionQuery[collectionId] || {})
        : Object.values(Object.values(collectionQuery)[0] || {})

      queryValues.forEach(view => {
        view?.blockIds?.forEach(id => pageSet.add(id))
        view?.collection_group_results?.blockIds?.forEach(id => pageSet.add(id))
      })
      pageIds = [...pageSet]
    }
  } catch (e) {
    // fallback
  }

  // Fallback: use page_sort from collection_view if collectionQuery returned nothing
  if (pageIds.length === 0 && collectionView && viewIds && viewIds.length > 0) {
    try {
      for (const viewId of viewIds) {
        const view = collectionView[viewId]?.value
        if (view?.page_sort && view.page_sort.length > 0) {
          pageIds = [...view.page_sort]
          break
        }
      }
    } catch (e) {
      // fallback
    }
  }

  return pageIds
}
