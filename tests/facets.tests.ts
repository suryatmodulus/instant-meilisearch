import { searchClient, dataset } from './assets/utils'

describe('Instant MeiliSearch Browser test', () => {
  beforeAll(async () => {
    try {
      await searchClient.MeiliSearchClient.deleteIndex('movies')
    } catch (e) {
      // movies does not exist
    }
    await searchClient.MeiliSearchClient.index(
      'movies'
    ).updateAttributesForFaceting(['genres'])
    const moviesUpdate = await searchClient.MeiliSearchClient.index(
      'movies'
    ).addDocuments(dataset)
    await searchClient.MeiliSearchClient.index('movies').waitForPendingUpdate(
      moviesUpdate.updateId
    )
  })

  test('Test one facet on facetsFilters', async () => {
    const response = await searchClient.search([
      {
        indexName: 'movies',
        params: {
          query: '',
          facetFilters: ['genres:Adventure'],
        },
      },
    ])
    const hits = response.results[0].hits
    expect(hits.length).toEqual(1)
    expect(hits[0].title).toEqual('Star Wars')
  })

  test('Test multiple on facetsFilters', async () => {
    const response = await searchClient.search([
      {
        indexName: 'movies',
        params: {
          query: '',
          facetFilters: ['genres:Comedy', 'genres:Crime'],
        },
      },
    ])
    const hits = response.results[0].hits
    expect(hits.length).toEqual(2)
    expect(hits[0].title).toEqual('Ariel')
  })

  test('Test multiple nested on facetsFilters', async () => {
    const params = {
      indexName: 'movies',
      params: {
        query: '',
        facetFilters: [['genres:action', 'genres:Thriller'], 'genres:crime'],
      },
    }
    const response = await searchClient.search([params])
    const hits = response.results[0].hits
    expect(hits[0].title).toEqual('Judgment Night')
  })
})
