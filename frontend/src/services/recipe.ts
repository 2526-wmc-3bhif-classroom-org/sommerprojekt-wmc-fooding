import { authService } from './auth'

export interface Recipe {
  recipe_id?: number
  user_id?: number
  title: string
  instructions: string
}

export interface RecipeIngredient {
  product_id: number
  quantity: number
  name?: string
  default_unit?: string
}

export interface RecipeWithIngredients extends Recipe {
  ingredients: RecipeIngredient[]
}

const API_URL = 'http://127.0.0.1:3000/recipes'

