import { json } from '@sveltejs/kit'
import type { RequestHandler } from '@sveltejs/kit'

import english from '../words/english/words.json'

export const GET: RequestHandler = ({ url }) => {
  // const limit = Number(url.searchParams.get('limit'))
  const words = english.words.slice(0, 20).sort(() => .5 - Math.random())
  return json(words)
}
