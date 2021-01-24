export interface Product {
    description: string;
    development_cost: string;
    evaluator: string;
    evaluator_reward: string;
    exists: boolean;
    expertise: string;
    funders: string[];
    is_done: boolean;
    manager: string;
    remaining_development_funding: string;
    remaining_funding: string;
    state: number;
}

export const ProductKeys = [
    "description","development_cost","evaluator","evaluator_reward",
    "exists","expertise","funders","is_done","manager","remaining_development_funding",
    "remaining_funding","state"
]