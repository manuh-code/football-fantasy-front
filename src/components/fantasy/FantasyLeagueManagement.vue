<template>
    <div class="fantasy-league-management">
        <div class="max-w-7xl mx-auto">
            <!-- Header Section -->
            <div class="mb-8">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-3">
                            <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <v-icon name="hi-solid-cog" class="w-6 h-6 text-white" />
                            </div>
                            Scoring Rules Management
                        </h2>
                        <p class="text-gray-600 dark:text-gray-400 text-lg">
                            Configure rules and conditions for your league's scoring system
                        </p>
                    </div>
                </div>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="flex flex-col items-center justify-center py-16">
                <div class="relative">
                    <div class="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 dark:border-purple-900 border-t-purple-600 dark:border-t-purple-400"></div>
                    <div class="absolute inset-0 flex items-center justify-center">
                        <v-icon name="hi-solid-cog" class="w-6 h-6 text-purple-600 dark:text-purple-400 animate-pulse" />
                    </div>
                </div>
                <p class="mt-6 text-gray-600 dark:text-gray-400 font-medium">Loading scoring rules...</p>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10 border-2 border-red-200 dark:border-red-800 rounded-2xl p-6 mb-6">
                <div class="flex items-start gap-4">
                    <div class="flex-shrink-0">
                        <div class="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                            <v-icon name="hi-solid-exclamation-circle" class="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                    </div>
                    <div class="flex-1">
                        <h3 class="text-lg font-semibold text-red-900 dark:text-red-200 mb-1">Loading error</h3>
                        <p class="text-red-800 dark:text-red-300">{{ error }}</p>
                    </div>
                </div>
            </div>

            <!-- Rules List -->
            <div v-else class="space-y-6">
                <!-- Info Banner -->
                <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
                    <div class="flex items-start gap-3">
                        <div class="flex-shrink-0 mt-0.5">
                            <v-icon name="hi-solid-information-circle" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div class="flex-1">
                            <p class="text-sm text-blue-900 dark:text-blue-200 font-medium">
                                <strong>Rule types:</strong> {{ totalRuleTypes }} 
                                <span class="mx-2">•</span>
                                <strong>Total configurations:</strong> {{ totalRules }}
                            </p>
                            <p class="text-sm text-blue-800 dark:text-blue-300 mt-1">
                                Configure points for each rule type by position. Click "⚙️" to edit optional conditions.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Rules Table -->
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
                    <!-- Desktop Table View (hidden on mobile) -->
                    <div class="hidden md:block overflow-x-auto max-h-[calc(100vh-300px)] overflow-y-auto">
                        <div class="min-w-[800px]">
                            <!-- Header Row (Sticky) -->
                            <div class="sticky top-0 z-10 grid grid-cols-[250px_repeat(4,1fr)] bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-700 dark:to-purple-800 shadow-md">
                                <div class="p-4 border-r border-purple-500 dark:border-purple-600">
                                    <div class="flex items-center gap-2">
                                        <v-icon name="hi-solid-lightning-bolt" class="w-5 h-5 text-white" />
                                        <span class="text-sm font-bold text-white">Rule Type</span>
                                    </div>
                                </div>
                                <div 
                                    v-for="position in ['goalkeeper', 'defender', 'midfielder', 'attacker']" 
                                    :key="position"
                                    class="p-4 border-r border-purple-500 dark:border-purple-600 last:border-r-0"
                                >
                                    <div class="flex items-center justify-center gap-2">
                                        <v-icon name="hi-solid-user-group" class="w-4 h-4 text-white" />
                                        <span class="text-sm font-bold text-white">
                                            {{ getPositionName(position) }}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <!-- Table Body -->
                            <div class="divide-y divide-gray-200 dark:divide-gray-700">
                                <div 
                                    v-for="(ruleRow, rowIndex) in rulesByTypeAndCondition" 
                                    :key="`${ruleRow.ruleUuid}_${rowIndex}`"
                                    class="grid grid-cols-[250px_repeat(4,1fr)] hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                                >
                                    <!-- Rule Type Name -->
                                    <div class="p-4 border-r border-gray-200 dark:border-gray-700 flex items-center gap-3">
                                        <div class="flex-1 min-w-0">
                                            <p class="text-sm font-bold text-gray-900 dark:text-white truncate">
                                                {{ ruleRow.ruleName }}
                                            </p>
                                            <p v-if="ruleRow.conditionLabel" class="text-xs text-purple-600 dark:text-purple-400 font-medium">
                                                {{ ruleRow.conditionLabel }}
                                            </p>
                                            <p v-if="ruleRow.ruleCode" class="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                                {{ ruleRow.ruleCode }}
                                            </p>
                                        </div>
                                    </div>

                                    <!-- Position Cells -->
                                    <div 
                                        v-for="position in ['goalkeeper', 'defender', 'midfielder', 'attacker']" 
                                        :key="`${rowIndex}-${position}`"
                                        class="p-3 border-r border-gray-200 dark:border-gray-700 last:border-r-0"
                                    >
                                        <div v-if="ruleRow.positions.has(position)" class="space-y-2">
                                            <!-- Specific condition info (if exists, e.g. "Every 2" for this position) -->
                                            <div v-if="ruleRow.positions.get(position)?.conditionInfo" class="text-xs font-medium text-center text-purple-600 dark:text-purple-400 mb-1">
                                                {{ ruleRow.positions.get(position)?.conditionInfo }}
                                            </div>
                                            
                                            <!-- Points Input -->
                                            <div class="relative">
                                                <input
                                                    :id="`points-${rowIndex}-${position}`"
                                                    v-model.number="ruleRow.positions.get(position)!.rule.points"
                                                    type="number"
                                                    class="w-full px-3 py-2 pl-8 text-center text-base font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                                    :class="{
                                                        'border-green-400 dark:border-green-500': ruleRow.positions.get(position)!.rule.points > 0,
                                                        'border-red-400 dark:border-red-500': ruleRow.positions.get(position)!.rule.points < 0,
                                                    }"
                                                    placeholder="0"
                                                />
                                                <div class="absolute left-2.5 top-1/2 -translate-y-1/2">
                                                    <v-icon name="hi-solid-hashtag" class="w-4 h-4 text-gray-400" />
                                                </div>
                                            </div>

                                            <!-- Condition Button -->
                                            <button
                                                v-if="ruleRow.positions.get(position)!.rule.hasCondition"
                                                @click="openConditionModal(ruleRow.positions.get(position)!.globalIndex)"
                                                type="button"
                                                class="w-full px-2 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-sm"
                                            >
                                                <v-icon name="hi-solid-adjustments" class="w-3.5 h-3.5" />
                                                <span>Edit condition</span>
                                            </button>
                                            <div 
                                                v-else 
                                                class="w-full px-2 py-1.5 rounded-md text-xs font-medium text-gray-400 dark:text-gray-500 text-center bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-300 dark:border-gray-700"
                                            >
                                                No condition
                                            </div>
                                        </div>
                                        <div v-else class="flex items-center justify-center h-full text-gray-400 dark:text-gray-600">
                                            <span class="text-xs">—</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Mobile Card View (visible only on mobile) -->
                    <div class="md:hidden">
                        <!-- Sticky Position Header for Mobile -->
                        <div class="sticky top-0 z-10 bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-700 dark:to-purple-800 px-4 py-3 shadow-md">
                            <div class="grid grid-cols-2 gap-2">
                                <div 
                                    v-for="position in ['goalkeeper', 'defender', 'midfielder', 'attacker']" 
                                    :key="`header-${position}`"
                                    class="flex items-center justify-center gap-1.5 py-1"
                                >
                                    <v-icon name="hi-solid-user-group" class="w-3.5 h-3.5 text-white flex-shrink-0" />
                                    <span class="text-xs font-bold text-white truncate">
                                        {{ getPositionName(position) }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Scrollable Content -->
                        <div class="max-h-[calc(100vh-350px)] overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
                            <div 
                                v-for="(ruleRow, rowIndex) in rulesByTypeAndCondition" 
                                :key="`${ruleRow.ruleUuid}_${rowIndex}_mobile`"
                                class="p-4"
                            >
                            <!-- Rule Type Header -->
                            <div class="mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <v-icon name="hi-solid-lightning-bolt" class="w-5 h-5 text-white" />
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <h3 class="text-base font-bold text-gray-900 dark:text-white truncate">
                                            {{ ruleRow.ruleName }}
                                        </h3>
                                        <p v-if="ruleRow.conditionLabel" class="text-xs text-purple-600 dark:text-purple-400 font-medium">
                                            {{ ruleRow.conditionLabel }}
                                        </p>
                                        <p v-if="ruleRow.ruleCode" class="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                            {{ ruleRow.ruleCode }}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <!-- Positions Grid for Mobile -->
                            <div class="grid grid-cols-2 gap-3">
                                <div 
                                    v-for="position in ['goalkeeper', 'defender', 'midfielder', 'attacker']" 
                                    :key="`${rowIndex}-${position}-mobile`"
                                    class="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3 border-2 transition-all"
                                    :class="ruleRow.positions.has(position) 
                                        ? 'border-gray-200 dark:border-gray-700' 
                                        : 'border-dashed border-gray-300 dark:border-gray-600 opacity-50'"
                                >
                                    <div v-if="ruleRow.positions.has(position)" class="space-y-2.5">
                                        <!-- Position Name -->
                                        <div class="flex items-center gap-2">
                                            <v-icon name="hi-solid-user-group" class="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                            <span class="text-xs font-bold text-gray-700 dark:text-gray-300">
                                                {{ getPositionName(position) }}
                                            </span>
                                        </div>

                                        <!-- Specific condition info (if exists) -->
                                        <div v-if="ruleRow.positions.get(position)?.conditionInfo" class="text-xs font-medium text-center text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 rounded px-2 py-1">
                                            {{ ruleRow.positions.get(position)?.conditionInfo }}
                                        </div>

                                        <!-- Points Input -->
                                        <div class="relative">
                                            <input
                                                :id="`points-mobile-${rowIndex}-${position}`"
                                                v-model.number="ruleRow.positions.get(position)!.rule.points"
                                                type="number"
                                                class="w-full px-3 py-2 pl-8 text-center text-lg font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                                :class="{
                                                    'border-green-400 dark:border-green-500': ruleRow.positions.get(position)!.rule.points > 0,
                                                    'border-red-400 dark:border-red-500': ruleRow.positions.get(position)!.rule.points < 0,
                                                }"
                                                placeholder="0"
                                            />
                                            <div class="absolute left-2.5 top-1/2 -translate-y-1/2">
                                                <v-icon name="hi-solid-hashtag" class="w-4 h-4 text-gray-400" />
                                            </div>
                                        </div>

                                        <!-- Condition Button -->
                                        <button
                                            v-if="ruleRow.positions.get(position)!.rule.hasCondition"
                                            @click="openConditionModal(ruleRow.positions.get(position)!.globalIndex)"
                                            type="button"
                                            class="w-full px-2 py-2 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-sm"
                                        >
                                            <v-icon name="hi-solid-adjustments" class="w-3.5 h-3.5" />
                                            <span>Edit cond.</span>
                                        </button>
                                        <div 
                                            v-else 
                                            class="w-full px-2 py-1.5 rounded-lg text-xs font-medium text-gray-400 dark:text-gray-500 text-center bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-300 dark:border-gray-700"
                                        >
                                            Sin condición
                                        </div>
                                    </div>
                                    <div v-else class="flex flex-col items-center justify-center py-4 text-gray-400 dark:text-gray-600">
                                        <v-icon name="hi-solid-ban" class="w-5 h-5 mb-1" />
                                        <span class="text-xs">Not applicable</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>

                <!-- Condition Modal -->
                <Transition name="modal">
                    <div 
                        v-if="showConditionModal && selectedRuleIndex !== null"
                        @click.self="closeConditionModal"
                        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm"
                    >
                        <div class="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col">
                            <!-- Modal Header -->
                            <div class="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
                                <div class="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                    <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <v-icon name="hi-solid-filter" class="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <h3 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
                                            Configure Condition
                                        </h3>
                                        <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                                            {{ getSelectedRuleInfo() }}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    @click="closeConditionModal"
                                    type="button"
                                    class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                                >
                                    <v-icon name="hi-solid-x" class="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>

                            <!-- Modal Body -->
                            <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
                                <!-- Info sobre la condición actual -->
                                <div v-if="ruleConditions[selectedRuleIndex]?.selectedCondition" class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 sm:p-5">
                                    <div class="flex items-start gap-3">
                                        <div class="flex-shrink-0 mt-0.5">
                                            <v-icon name="hi-solid-information-circle" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div class="flex-1">
                                            <p class="text-sm font-bold text-blue-900 dark:text-blue-200 mb-1">
                                                Condition type: {{ ruleConditions[selectedRuleIndex].selectedCondition?.name }}
                                            </p>
                                            <p class="text-sm text-blue-800 dark:text-blue-300">
                                                {{ ruleConditions[selectedRuleIndex].selectedCondition?.description }}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <!-- Campos editables de la condición -->
                                <div 
                                    v-if="ruleConditions[selectedRuleIndex]?.selectedCondition"
                                    class="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 rounded-xl p-4 sm:p-5 border-2 border-purple-100 dark:border-purple-900/30 space-y-3 sm:space-y-4"
                                >
                                    <div class="flex items-center gap-2 mb-4">
                                        <v-icon name="hi-solid-pencil-alt" class="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                        <h4 class="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                                            Condition values
                                        </h4>
                                    </div>

                                    <!-- Fields -->
                                    <div
                                        v-for="field in ruleConditions[selectedRuleIndex].selectedCondition?.fields || []"
                                        :key="field.key"
                                        class="space-y-1.5 sm:space-y-2"
                                    >
                                        <label :for="`modal-field-${field.key}`" class="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                            {{ field.label }}
                                            <span v-if="field.required" class="text-red-500 text-sm sm:text-base">*</span>
                                        </label>

                                        <!-- Boolean Field -->
                                        <div v-if="field.type === 'boolean'" class="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
                                            <input
                                                :id="`modal-field-${field.key}`"
                                                v-model="ruleConditions[selectedRuleIndex].conditionValues[field.key]"
                                                type="checkbox"
                                                class="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer"
                                            />
                                            <label :for="`modal-field-${field.key}`" class="text-xs sm:text-sm text-gray-700 dark:text-gray-300 cursor-pointer flex-1">
                                                {{ field.helpText }}
                                            </label>
                                        </div>

                                        <!-- Number Field -->
                                        <div v-else-if="field.type === 'number'" class="relative">
                                            <input
                                                :id="`modal-field-${field.key}`"
                                                v-model.number="ruleConditions[selectedRuleIndex].conditionValues[field.key]"
                                                type="number"
                                                :placeholder="field.placeholder || 'Enter a value'"
                                                :min="field.validation?.min"
                                                :max="field.validation?.max"
                                                :step="field.validation?.step || 1"
                                                class="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                            />
                                            <p v-if="field.helpText" class="mt-1.5 sm:mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                <v-icon name="hi-solid-information-circle" class="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                                {{ field.helpText }}
                                            </p>
                                        </div>

                                        <!-- String Field -->
                                        <div v-else-if="field.type === 'string'" class="relative">
                                            <input
                                                :id="`modal-field-${field.key}`"
                                                v-model="ruleConditions[selectedRuleIndex].conditionValues[field.key]"
                                                type="text"
                                                :placeholder="field.placeholder || 'Enter text'"
                                                class="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                            />
                                            <p v-if="field.helpText" class="mt-1.5 sm:mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                <v-icon name="hi-solid-information-circle" class="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                                {{ field.helpText }}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Modal Footer -->
                            <div class="flex items-center justify-end gap-3 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                <button
                                    @click="closeConditionModal"
                                    type="button"
                                    class="px-5 sm:px-6 py-2 sm:py-2.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm sm:text-base font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </Transition>
            </div>

            <!-- Action Buttons -->
            <div v-if="!loading && !error" class="mt-8 sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t-2 border-gray-200 dark:border-gray-700 p-6 -mx-6 rounded-t-2xl">
                <div class="flex items-center justify-end gap-4">
                    <button
                        @click="resetForm"
                        type="button"
                        class="group px-8 py-3.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                        <span class="flex items-center gap-2">
                            <v-icon name="hi-solid-x" class="w-5 h-5" />
                            Cancel
                        </span>
                    </button>
                    <button
                        @click="saveScoreRules"
                        :disabled="saving"
                        type="button"
                        class="group relative px-8 py-3.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                        <span v-if="saving" class="flex items-center gap-3">
                            <div class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                            <span>Saving...</span>
                        </span>
                        <span v-else class="flex items-center gap-2">
                            <v-icon name="hi-solid-save" class="w-5 h-5" />
                            <span>Save Rules</span>
                        </span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
/* eslint-disable no-undef */
import { ref, onMounted, onUnmounted, PropType, computed } from 'vue';
import { FantasyLeagueScoringRules, FantasyRule } from '@/interfaces/fantasy/leagues/FantasyLeagueScoringRules';
import { FantasyConditionsRulesResponse, FantasyConditionRuleDefinition } from '@/interfaces/fantasy/leagues/FantasyConditionsRulesResponse';
import { ScoreRulePayload, ScoreRuleItem } from '@/interfaces/fantasy/score/ScoreRulePayload';
import { catalogService } from '@/services/catalog/CatalogService';
import { fantasyLeagueService } from '@/services/fantasy/leagues/FantasyLeagueService';
import { useToast } from '@/composables/useToast';

// Props
const props = defineProps({
    scoringData: {
        type: Array as PropType<FantasyLeagueScoringRules[]>,
        required: true
    },
    leagueUuid: {
        type: String,
        required: true
    }
});

// Emits
const emit = defineEmits<{
    (e: 'saved'): void;
    (e: 'cancel'): void;
}>();

// Composables
const toast = useToast();

// State
const loading = ref(false);
const saving = ref(false);
const error = ref('');
const conditionsRules = ref<FantasyConditionsRulesResponse>([]);

// Usar directamente scoring_rules que ya viene agrupado por posición
const positionGroups = ref<FantasyLeagueScoringRules[]>([]);

// Crear una estructura plana de todas las reglas para mostrar fila por fila
interface RuleRow {
    ruleName: string;
    ruleCode: string;
    ruleUuid: string;
    conditionLabel: string; // Etiqueta descriptiva del rango/condición
    positions: Map<string, {
        positionName: string;
        positionCode: string;
        positionUuid: string;
        rule: FantasyRule;
        globalIndex: number;
        conditionInfo?: string; // Información específica de la condición para esta posición
    }>;
}

const rulesByTypeAndCondition = computed(() => {
    const grouped = new Map<string, RuleRow>();
    let globalIndex = 0;
    
    positionGroups.value.forEach((group) => {
        group.rules.forEach((rule) => {
            const typeKey = rule.type?.code || rule.type?.uuid || 'unknown';
            const positionKey = group.position?.code || group.position?.uuid || 'unknown';
            
            // Analizar la condición
            let conditionType = '';
            let conditionValue: string | number | null = null;
            let conditionInfo = '';
            
            if (rule.condition) {
                try {
                    const conditionStr = typeof rule.condition === 'string' 
                        ? rule.condition 
                        : JSON.stringify(rule.condition);
                    const parsedCondition = typeof rule.condition === 'string'
                        ? JSON.parse(conditionStr)
                        : rule.condition;
                    
                    if (parsedCondition.range) {
                        // Para RANGE: agrupar por rango específico (crea filas separadas)
                        conditionType = 'range';
                        conditionValue = `${parsedCondition.range.min}_${parsedCondition.range.max}`;
                        conditionInfo = `${parsedCondition.range.min} - ${parsedCondition.range.max}`;
                    } else if (parsedCondition.every !== undefined) {
                        // Para EVERY: NO agrupar por valor, permitir diferentes valores por posición
                        conditionType = 'every';
                        conditionInfo = `Every ${parsedCondition.every}`;
                    } else if (parsedCondition.exact !== undefined) {
                        // Para EXACT: agrupar por valor exacto
                        conditionType = 'exact';
                        conditionValue = parsedCondition.exact;
                        conditionInfo = `Exactly ${parsedCondition.exact}`;
                    }
                } catch (e) {
                    console.error('Error parsing condition:', e);
                }
            }
            
            // Si hay cambios en ruleConditions, actualizar conditionInfo desde ahí
            if (ruleConditions.value[globalIndex]?.selectedCondition && ruleConditions.value[globalIndex]?.conditionValues) {
                const conditionState = ruleConditions.value[globalIndex];
                const values = conditionState.conditionValues;
                
                // Detectar tipo de condición desde los fieldGroups
                if (conditionState.selectedCondition) {
                    const fieldGroups = [...new Set(
                        conditionState.selectedCondition.fields
                            .filter(f => f.fieldGroup)
                            .map(f => f.fieldGroup)
                            .filter((group): group is string => group !== undefined)
                    )];
                    
                    if (fieldGroups.includes('range') && values.min !== undefined && values.max !== undefined) {
                        conditionInfo = `${values.min} - ${values.max}`;
                    } else if (values.every !== undefined) {
                        conditionInfo = `Every ${values.every}`;
                    } else if (values.exact !== undefined) {
                        conditionInfo = `Exactly ${values.exact}`;
                    }
                }
            }
            
            // Crear clave única:
            // - Para RANGE: tipo + rango (crea múltiples filas para diferentes rangos)
            // - Para EVERY: solo tipo (una sola fila, diferentes valores por posición)
            // - Para EXACT: tipo + valor exacto
            let uniqueKey = typeKey;
            let rowConditionLabel = '';
            
            if (conditionType === 'range' && conditionValue) {
                uniqueKey = `${typeKey}_range_${conditionValue}`;
                rowConditionLabel = `Range: ${conditionInfo}`;
            } else if (conditionType === 'exact' && conditionValue !== null) {
                uniqueKey = `${typeKey}_exact_${conditionValue}`;
                rowConditionLabel = conditionInfo;
            } else if (conditionType === 'every') {
                uniqueKey = `${typeKey}_every`;
                rowConditionLabel = ''; // No mostrar label general para every
            }
            
            // Crear o actualizar la fila
            if (!grouped.has(uniqueKey)) {
                grouped.set(uniqueKey, {
                    ruleName: rule.type?.name || 'No type',
                    ruleCode: rule.type?.code || '',
                    ruleUuid: rule.type?.uuid || '',
                    conditionLabel: rowConditionLabel,
                    positions: new Map()
                });
            }
            
            const ruleRow = grouped.get(uniqueKey);
            if (ruleRow) {
                ruleRow.positions.set(positionKey, {
                    positionName: group.position?.name || 'No position',
                    positionCode: group.position?.code || '',
                    positionUuid: group.position?.uuid || '',
                    rule,
                    globalIndex,
                    conditionInfo: conditionInfo || undefined
                });
            }
            
            globalIndex++;
        });
    });
    
    return Array.from(grouped.values());
});

// Extraer todas las reglas en un array plano para facilitar el acceso por índice
const allRules = computed(() => {
    const rules: Array<{ rule: FantasyRule; positionIndex: number; ruleIndex: number }> = [];
    positionGroups.value.forEach((group, positionIndex) => {
        group.rules.forEach((rule, ruleIndex) => {
            rules.push({ rule, positionIndex, ruleIndex });
        });
    });
    return rules;
});

// Total de reglas
const totalRules = computed(() => allRules.value.length);

// Total de tipos de reglas (ahora incluye las variaciones por condición)
const totalRuleTypes = computed(() => rulesByTypeAndCondition.value.length);

// Modal state
const showConditionModal = ref(false);
const selectedRuleIndex = ref<number | null>(null);

// Helper para obtener nombre de posición en español
const getPositionName = (positionCode: string): string => {
    const names: Record<string, string> = {
        'goalkeeper': 'Goalkeeper',
        'defender': 'Defender',
        'midfielder': 'Midfielder',
        'attacker': 'Attacker'
    };
    return names[positionCode] || positionCode;
};

// Abrir modal de condición
const openConditionModal = (index: number) => {
    selectedRuleIndex.value = index;
    showConditionModal.value = true;
};

// Cerrar modal de condición
const closeConditionModal = () => {
    showConditionModal.value = false;
    selectedRuleIndex.value = null;
};

// Manejar tecla ESC para cerrar modal
const handleEscapeKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && showConditionModal.value) {
        closeConditionModal();
    }
};

// Obtener información de la regla seleccionada
const getSelectedRuleInfo = (): string => {
    if (selectedRuleIndex.value === null) return '';
    
    const ruleData = allRules.value[selectedRuleIndex.value];
    if (!ruleData) return '';
    
    const positionGroup = positionGroups.value[ruleData.positionIndex];
    return `${ruleData.rule.type?.name || 'No type'} - ${positionGroup.position?.name || 'No position'}`;
};

// Condition state for each rule
interface RuleConditionState {
    enabled: boolean;
    selectedConditionCode: string;
    selectedCondition: FantasyConditionRuleDefinition | null;
    conditionValues: Record<string, unknown>;
}

const ruleConditions = ref<RuleConditionState[]>([]);

// Initialize conditions state
const initializeConditionsState = () => {
    ruleConditions.value = allRules.value.map(({ rule }) => {
        const state: RuleConditionState = {
            enabled: false,
            selectedConditionCode: '',
            selectedCondition: null,
            conditionValues: {}
        };

        // Si la regla tiene una condición, la parseamos
        if (rule.condition && typeof rule.condition === 'string' && rule.condition.trim() !== '') {
            try {
                const parsedCondition = JSON.parse(rule.condition);
                
                // Detectar automáticamente el tipo de condición basándose en las claves
                const conditionKeys = Object.keys(parsedCondition);
                if (conditionKeys.length > 0) {
                    const matchingCondition = conditionsRules.value.find(cond => {
                        // Verificar si las claves del JSON coinciden con los fieldGroups
                        const fieldGroups = [...new Set(cond.fields.filter(f => f.fieldGroup).map(f => f.fieldGroup))];
                        
                        // Si tiene fieldGroups, buscar por grupos (ej: range, exact, every)
                        if (fieldGroups.length > 0) {
                            return conditionKeys.some(key => fieldGroups.includes(key));
                        }
                        
                        // Si no tiene fieldGroups, verificar por claves directas
                        const fieldKeys = cond.fields.map(f => f.key);
                        return conditionKeys.every(key => fieldKeys.includes(key));
                    });

                    if (matchingCondition) {
                        state.enabled = true;
                        state.selectedConditionCode = matchingCondition.code;
                        state.selectedCondition = matchingCondition;
                        
                        // Aplanar valores si están agrupados
                        const flattenedValues: Record<string, unknown> = {};
                        Object.entries(parsedCondition).forEach(([key, value]) => {
                            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                                // Si es un objeto (como range: {min: 0, max: 5.9}), aplanar
                                Object.entries(value as Record<string, unknown>).forEach(([nestedKey, nestedValue]) => {
                                    flattenedValues[nestedKey] = nestedValue;
                                });
                            } else {
                                flattenedValues[key] = value;
                            }
                        });
                        
                        state.conditionValues = flattenedValues;
                    }
                }
            } catch (e) {
                console.error('Error parsing condition:', e);
            }
        } else if (rule.condition && typeof rule.condition === 'object') {
            // Si la condición ya es un objeto
            const conditionKeys = Object.keys(rule.condition);
            if (conditionKeys.length > 0) {
                const matchingCondition = conditionsRules.value.find(cond => {
                    const fieldGroups = [...new Set(cond.fields.filter(f => f.fieldGroup).map(f => f.fieldGroup))];
                    
                    if (fieldGroups.length > 0) {
                        return conditionKeys.some(key => fieldGroups.includes(key));
                    }
                    
                    const fieldKeys = cond.fields.map(f => f.key);
                    return conditionKeys.every(key => fieldKeys.includes(key));
                });

                if (matchingCondition) {
                    state.enabled = true;
                    state.selectedConditionCode = matchingCondition.code;
                    state.selectedCondition = matchingCondition;
                    
                    // Aplanar valores si están agrupados
                    const flattenedValues: Record<string, unknown> = {};
                    Object.entries(rule.condition as Record<string, unknown>).forEach(([key, value]) => {
                        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                            Object.entries(value as Record<string, unknown>).forEach(([nestedKey, nestedValue]) => {
                                flattenedValues[nestedKey] = nestedValue;
                            });
                        } else {
                            flattenedValues[key] = value;
                        }
                    });
                    
                    state.conditionValues = flattenedValues;
                }
            }
        }

        return state;
    });
};

// Build condition JSON
const buildConditionJson = (index: number): string => {
    if (!ruleConditions.value[index].selectedCondition) {
        return '';
    }

    const values = ruleConditions.value[index].conditionValues;
    const condition = ruleConditions.value[index].selectedCondition;
    
    // Verificar si los campos tienen fieldGroup
    const fieldGroups = [...new Set(
        condition.fields
            .filter(f => f.fieldGroup)
            .map(f => f.fieldGroup)
            .filter((group): group is string => group !== undefined)
    )];
    
    if (fieldGroups.length > 0) {
        // Reconstruir estructura agrupada (ej: {range: {min: 0, max: 5.9}})
        const conditionObj: Record<string, Record<string, unknown>> = {};
        
        fieldGroups.forEach(group => {
            const groupFields = condition.fields.filter(f => f.fieldGroup === group);
            const groupValues: Record<string, unknown> = {};
            
            groupFields.forEach(field => {
                const value = values[field.key];
                if (value !== null && value !== undefined && value !== '') {
                    groupValues[field.key] = value;
                }
            });
            
            if (Object.keys(groupValues).length > 0) {
                conditionObj[group] = groupValues;
            }
        });
        
        return Object.keys(conditionObj).length > 0 ? JSON.stringify(conditionObj) : '';
    } else {
        // Estructura plana (ej: {every: 2})
        const conditionObj: Record<string, unknown> = {};

        Object.keys(values).forEach(key => {
            const value = values[key];
            if (value !== null && value !== undefined && value !== '') {
                conditionObj[key] = value;
            }
        });

        return Object.keys(conditionObj).length > 0 ? JSON.stringify(conditionObj) : '';
    }
};

// Load conditions rules
const loadConditionsRules = async () => {
    try {
        conditionsRules.value = await catalogService.getConditionsRules();
    } catch (err) {
        console.error('Error loading conditions rules:', err);
        error.value = 'Error loading condition rules';
        toast.error('Error loading available conditions');
    }
};

// Save score rules
const saveScoreRules = async () => {
    try {
        saving.value = true;
        error.value = '';

        // Construir el payload desde positionGroups
        const scoreRulesItems: ScoreRuleItem[] = [];
        
        allRules.value.forEach(({ rule }, globalIndex) => {
            scoreRulesItems.push({
                type_uuid: rule.type?.uuid || '',
                position_uuid: rule.position?.uuid || '',
                points: rule.points,
                condition: buildConditionJson(globalIndex)
            });
        });

        const payload: ScoreRulePayload = {
            score_rules: scoreRulesItems
        };

        await fantasyLeagueService.updateScoreRules(payload, props.leagueUuid);
        
        toast.success('Scoring rules updated successfully');
        emit('saved');
    } catch (err) {
        console.error('Error saving score rules:', err);
        error.value = 'Error saving scoring rules';
        toast.error('Error saving rules');
    } finally {
        saving.value = false;
    }
};

// Reset form
const resetForm = () => {
    emit('cancel');
};

// Initialize
onMounted(async () => {
    loading.value = true;
    
    try {
        // Cargar reglas de condiciones
        await loadConditionsRules();
        
        // Copiar los grupos de scoring (ya vienen agrupados por posición)
        positionGroups.value = JSON.parse(JSON.stringify(props.scoringData || []));
        
        // Marcar qué reglas tienen condición basándose en si condition no es null/vacío
        positionGroups.value.forEach(group => {
            group.rules.forEach(rule => {
                // Una regla tiene condición si el campo condition no está vacío
                if (rule.condition !== null && rule.condition !== undefined) {
                    if (typeof rule.condition === 'string') {
                        rule.hasCondition = rule.condition.trim() !== '';
                    } else if (typeof rule.condition === 'object') {
                        rule.hasCondition = Object.keys(rule.condition as Record<string, unknown>).length > 0;
                    } else {
                        rule.hasCondition = true;
                    }
                } else {
                    rule.hasCondition = false;
                }
            });
        });
        
        // Inicializar estado de condiciones
        initializeConditionsState();
        
        // Agregar listener para tecla ESC
        document.addEventListener('keydown', handleEscapeKey);
    } catch (err) {
        console.error('Error initializing component:', err);
        error.value = 'Error initializing component';
    } finally {
        loading.value = false;
    }
});

// Cleanup al desmontar
onUnmounted(() => {
    document.removeEventListener('keydown', handleEscapeKey);
});
</script>

<style scoped>
/* Animaciones personalizadas */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Aplicar animaciones */
.fantasy-league-management {
  animation: fadeIn 0.3s ease-out;
}

.group {
  animation: slideInUp 0.4s ease-out backwards;
}

.group:nth-child(1) { animation-delay: 0.05s; }
.group:nth-child(2) { animation-delay: 0.1s; }
.group:nth-child(3) { animation-delay: 0.15s; }
.group:nth-child(4) { animation-delay: 0.2s; }
.group:nth-child(5) { animation-delay: 0.25s; }

/* Animación para rule type groups */
.rule-type-group {
  animation: slideInUp 0.5s ease-out backwards;
}

.rule-type-group:nth-child(2) { animation-delay: 0.1s; }
.rule-type-group:nth-child(3) { animation-delay: 0.2s; }
.rule-type-group:nth-child(4) { animation-delay: 0.3s; }
.rule-type-group:nth-child(5) { animation-delay: 0.4s; }

/* Mejoras visuales para inputs */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  appearance: textfield;
  -moz-appearance: textfield;
}

/* Hover effects mejorados */
.group:hover {
  transform: translateY(-2px);
}

/* Focus visible para accesibilidad */
button:focus-visible,
input:focus-visible,
select:focus-visible {
  outline: 2px solid #9333ea;
  outline-offset: 2px;
}

/* Transiciones suaves */
* {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Estilos para botones con efectos */
.group\/btn:hover {
  transform: scale(1.02);
}

.group\/btn:active {
  transform: scale(0.98);
}

/* Scrollbar personalizado */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgb(156 163 175 / 0.5);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgb(156 163 175 / 0.7);
}

/* Dark mode scrollbar */
.dark ::-webkit-scrollbar-thumb {
  background: rgb(75 85 99 / 0.5);
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: rgb(75 85 99 / 0.7);
}

/* Animación para el sticky footer */
.sticky {
  backdrop-filter: blur(8px);
}

/* Efectos de gradiente animados */
@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.bg-gradient-to-r {
  background-size: 200% 200%;
}

/* Reducir movimiento para usuarios que lo prefieran */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  .group:hover {
    transform: none;
  }
}

/* Sticky Header Styles */
.sticky {
  backdrop-filter: blur(8px);
}

/* Smooth scrolling for table containers */
.overflow-y-auto {
  scroll-behavior: smooth;
}

/* Custom scrollbar for table containers */
.overflow-y-auto::-webkit-scrollbar {
  width: 10px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgb(243 244 246 / 1);
  border-radius: 5px;
}

.dark .overflow-y-auto::-webkit-scrollbar-track {
  background: rgb(31 41 55 / 1);
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgb(156 163 175 / 0.7);
  border-radius: 5px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgb(156 163 175 / 1);
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgb(75 85 99 / 0.7);
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgb(75 85 99 / 1);
}

/* Modal Transition Styles */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div,
.modal-leave-to > div {
  opacity: 0;
}

/* Desktop: scale from center */
@media (min-width: 640px) {
  .modal-enter-from > div,
  .modal-leave-to > div {
    transform: scale(0.95);
  }
}

/* Mobile: slide from bottom */
@media (max-width: 639px) {
  .modal-enter-from > div,
  .modal-leave-to > div {
    transform: translateY(100%);
  }
}
</style>