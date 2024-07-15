import { StatusCodes } from 'http-status-codes'
import { URL } from 'node:url'
import { Store, StoreScope } from 'src/workflow-worker/activepieces/pieces-framework/src'
import { DeleteStoreEntryRequest, FlowId, PutStoreEntryRequest, StoreEntry } from 'src/workflow-worker/activepieces/shared/src'
import { FetchError, StorageError } from '../helper/execution-errors'

export const createStorageService = ({ engineToken, apiUrl }: CreateStorageServiceParams): StorageService => {
    return {
        async get(key: string): Promise<StoreEntry | null> {
            const url = buildUrl(apiUrl, key)

            try {
                const response = await fetch(url, {
                    headers: {
                        Authorization: `Bearer ${engineToken}`,
                    },
                })

                if (!response.ok) {
                    return await handleResponseError({
                        key,
                        response,
                    })
                }

                return await response.json()
            }
            catch (e) {
                return handleFetchError({
                    url,
                    cause: e,
                })
            }
        },

        async put(request: PutStoreEntryRequest): Promise<StoreEntry | null> {
            const url = buildUrl(apiUrl)

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${engineToken}`,
                    },
                    body: JSON.stringify(request),
                })

                if (!response.ok) {
                    return await handleResponseError({
                        key: request.key,
                        response,
                    })
                }

                return await response.json()
            }
            catch (e) {
                return handleFetchError({
                    url,
                    cause: e,
                })
            }
        },

        async delete(request: DeleteStoreEntryRequest): Promise<null> {
            const url = buildUrl(apiUrl, request.key)

            try {
                const response = await fetch(url, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${engineToken}`,
                    },
                })

                if (!response.ok) {
                    await handleResponseError({
                        key: request.key,
                        response,
                    })
                }

                return null
            }
            catch (e) {
                return handleFetchError({
                    url,
                    cause: e,
                })
            }
        },
    }
}

export function createContextStore({ apiUrl, prefix, flowId, engineToken }: { apiUrl: string, prefix: string, flowId: FlowId, engineToken: string }): Store {
    return {
        async put<T>(key: string, value: T, scope = StoreScope.FLOW): Promise<T> {
            const modifiedKey = createKey(prefix, scope, flowId, key)
            await createStorageService({ apiUrl, engineToken }).put({
                key: modifiedKey,
                value,
            })
            return value
        },
        async delete(key: string, scope = StoreScope.FLOW): Promise<void> {
            const modifiedKey = createKey(prefix, scope, flowId, key)
            await createStorageService({ apiUrl, engineToken }).delete({
                key: modifiedKey,
            })
        },
        async get<T>(key: string, scope = StoreScope.FLOW): Promise<T | null> {
            const modifiedKey = createKey(prefix, scope, flowId, key)
            const storeEntry = await createStorageService({ apiUrl, engineToken }).get(modifiedKey)
            if (storeEntry === null) {
                return null
            }
            return storeEntry.value as T
        },
    }
}

function createKey(prefix: string, scope: StoreScope, flowId: FlowId, key: string): string {
    switch (scope) {
        case StoreScope.PROJECT:
            return prefix + key
        case StoreScope.FLOW:
            return prefix + 'flow_' + flowId + '/' + key
    }
}

const buildUrl = (apiUrl: string, key?: string): URL => {
    const url = new URL(`${apiUrl}v1/store-entries`)

    if (key) {
        url.searchParams.set('key', key)
    }

    return url
}

const handleResponseError = async ({ key, response }: HandleResponseErrorParams): Promise<null> => {
    if (response.status === StatusCodes.NOT_FOUND.valueOf()) {
        return null
    }

    const cause = await response.text()
    throw new StorageError(key, cause)
}

const handleFetchError = ({ url, cause }: HandleFetchErrorParams): never => {
    throw new FetchError(url.toString(), cause)
}

type CreateStorageServiceParams = {
    engineToken: string
    apiUrl: string
}

type StorageService = {
    get(key: string): Promise<StoreEntry | null>
    put(request: PutStoreEntryRequest): Promise<StoreEntry | null>
    delete(request: DeleteStoreEntryRequest): Promise<null>
}

type HandleResponseErrorParams = {
    key: string
    response: Response
}

type HandleFetchErrorParams = {
    url: URL
    cause: unknown
}