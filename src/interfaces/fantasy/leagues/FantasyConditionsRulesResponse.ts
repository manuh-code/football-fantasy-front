export interface FantasyConditionRuleValidation {
	min?: number;
	max?: number;
	step?: number;
	greaterThan?: string;
	errorMessages?: Record<string, string> | string[];
}

export interface FantasyConditionRuleField {
	key: string;
	label: string;
	type: string;
	inputType: string;
	required: boolean;
	placeholder?: string;
	helpText?: string;
	default?: boolean | number | string | null;
	fieldGroup?: string;
	validation?: FantasyConditionRuleValidation;
}

export interface FantasyConditionRuleDefinition {
	code: string;
	name: string;
	description: string;
	type: string;
	category: string;
	deprecated?: boolean;
	fields: FantasyConditionRuleField[];
	example: Record<string, unknown> | null;
	example_description: string;
	use_cases: string[];
	json_example: Record<string, unknown>;
}

export type FantasyConditionsRulesResponse = FantasyConditionRuleDefinition[];
