<template>
    <div v-if="showPagination" class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
            <!-- Mobile Pagination -->
            <div class="flex-1 flex justify-between sm:hidden">
                <button
                    :disabled="currentPage <= 1"
                    @click="changePage(currentPage - 1)"
                    class="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    Previous
                </button>
                <button
                    :disabled="currentPage >= lastPage"
                    @click="changePage(currentPage + 1)"
                    class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    Next
                </button>
            </div>

            <!-- Desktop Pagination -->
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <!-- Results Info -->
                <div>
                    <p class="text-sm text-gray-700 dark:text-gray-300">
                        Showing
                        <span class="font-medium">{{ from }}</span>
                        to
                        <span class="font-medium">{{ to }}</span>
                        of
                        <span class="font-medium">{{ total }}</span>
                        {{ resultsLabel }}
                    </p>
                </div>

                <!-- Page Navigation -->
                <div>
                    <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <!-- Previous Button -->
                        <button
                            @click="changePage(currentPage - 1)"
                            :disabled="currentPage <= 1"
                            class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            <span class="sr-only">Previous</span>
                            <v-icon name="hi-solid-chevron-left" class="h-5 w-5" />
                        </button>

                        <!-- Page Numbers -->
                        <template v-for="page in pageNumbers" :key="page">
                            <button
                                v-if="page !== '...'"
                                @click="changePage(page as number)"
                                :class="[
                                    'relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors',
                                    page === currentPage
                                        ? 'z-10 bg-blue-50 dark:bg-blue-900/50 border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                                ]">
                                {{ page }}
                            </button>
                            <span
                                v-else
                                class="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300">
                                ...
                            </span>
                        </template>

                        <!-- Next Button -->
                        <button
                            @click="changePage(currentPage + 1)"
                            :disabled="currentPage >= lastPage"
                            class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            <span class="sr-only">Next</span>
                            <v-icon name="hi-solid-chevron-right" class="h-5 w-5" />
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, defineProps, defineEmits, withDefaults } from 'vue'

// Props
interface PaginationProps {
    currentPage: number
    lastPage: number
    from: number
    to: number
    total: number
    resultsLabel?: string
}

const props = withDefaults(defineProps<PaginationProps>(), {
    resultsLabel: 'results'
})

// Emits
const emit = defineEmits<{
    'page-change': [page: number]
}>()

// Computed
const showPagination = computed(() => {
    return props.total > 0 && props.lastPage > 1
})

const pageNumbers = computed((): (number | string)[] => {
    const pages: (number | string)[] = []
    const current = props.currentPage
    const last = props.lastPage

    if (last <= 7) {
        // Show all pages if 7 or fewer
        for (let i = 1; i <= last; i++) {
            pages.push(i)
        }
    } else {
        // Show smart pagination for more than 7 pages
        if (current <= 4) {
            // Show first 5 pages, ellipsis, last page
            for (let i = 1; i <= 5; i++) {
                pages.push(i)
            }
            pages.push('...')
            pages.push(last)
        } else if (current >= last - 3) {
            // Show first page, ellipsis, last 5 pages
            pages.push(1)
            pages.push('...')
            for (let i = last - 4; i <= last; i++) {
                pages.push(i)
            }
        } else {
            // Show first page, ellipsis, current-1, current, current+1, ellipsis, last page
            pages.push(1)
            pages.push('...')
            for (let i = current - 1; i <= current + 1; i++) {
                pages.push(i)
            }
            pages.push('...')
            pages.push(last)
        }
    }

    return pages
})

// Methods
const changePage = (page: number) => {
    if (page >= 1 && page <= props.lastPage && page !== props.currentPage) {
        emit('page-change', page)
    }
}
</script>

<style scoped>
/* Additional responsive improvements */
@media (max-width: 640px) {
    .pagination-container {
        padding: 1rem;
    }
}
</style>
