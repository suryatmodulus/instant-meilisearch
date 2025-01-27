import {
  SearchContext,
  MeiliSearch,
  MeiliSearchResponse,
  SearchCacheInterface,
  MeiliSearchParams,
} from '../../types'
import { cacheFilters, assignMissingFilters } from './filters'

/**
 * @param  {ResponseCacher} cache
 */
export function SearchResolver(cache: SearchCacheInterface) {
  return {
    /**
     * @param  {SearchContext} searchContext
     * @param  {MeiliSearchParams} searchParams
     * @param  {MeiliSearch} client
     * @returns {Promise}
     */
    searchResponse: async function (
      searchContext: SearchContext,
      searchParams: MeiliSearchParams,
      client: MeiliSearch
    ): Promise<MeiliSearchResponse<Record<string, any>>> {
      // Create key with relevant informations
      const key = cache.formatKey([
        searchParams,
        searchContext.indexUid,
        searchContext.query,
      ])
      const entry = cache.getEntry(key)

      // Request is cached.
      if (entry) return entry

      // Cache filters: todo components
      const filterCache = cacheFilters(searchParams?.filter)

      // Make search request
      const searchResponse = await client
        .index(searchContext.indexUid)
        .search(searchContext.query, searchParams)

      // Add facets back into facetsDistribution
      searchResponse.facetsDistribution = assignMissingFilters(
        filterCache,
        searchResponse.facetsDistribution
      )

      // Cache response
      cache.setEntry<MeiliSearchResponse>(key, searchResponse)
      return searchResponse
    },
  }
}
