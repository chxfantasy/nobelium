import { NotionAPI } from 'notion-client'
import { config as BLOG } from '@/lib/server/config'

const client = new NotionAPI({
  authToken: BLOG.notionAccessToken || null,
  userTimeZone: BLOG.timezone || 'Asia/Shanghai'
})

export default client
