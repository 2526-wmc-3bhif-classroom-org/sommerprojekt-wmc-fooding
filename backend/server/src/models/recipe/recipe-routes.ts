import * as express from "express";
import { StatusCodes } from "http-status-codes";
import { RecipeService } from "./recipe-service";
import { isAuthenticated, AuthRequest } from "../../middleware/auth-handlers";

export const recipeRouter = express.Router();
const recipeService = new RecipeService();

recipeRouter.post("/", isAuthenticated, (req, res) => {
    try {
        const payload = (req as AuthRequest).payload;
        const userId = payload?.user?.id;
        if (!userId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
        }

        const { title, instructions, ingredients } = req.body;

        if (!title || !instructions) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Title and instructions are required" });
        }

        const recipeId = recipeService.createRecipe(userId, title, instructions, ingredients || []);

        res.status(StatusCodes.CREATED).json({ 
            message: "Recipe created successfully", 
            recipeId 
        });
    } catch (error) {
        console.error("Error creating recipe:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to create recipe" });
    }
});

recipeRouter.get("/", isAuthenticated, (req, res) => {
    try {
        const payload = (req as AuthRequest).payload;
        const userId = payload?.user?.id;
        if (!userId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
        }

        const recipes = recipeService.getRecipesByUser(userId);
        res.status(StatusCodes.OK).json(recipes);
    } catch (error) {
        console.error("Error fetching recipes:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch recipes" });
    }
});

recipeRouter.get("/suggestions", isAuthenticated, (req, res) => {
    try {
        const payload = (req as AuthRequest).payload;
        const userId = payload?.user?.id;
        if (!userId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
        }

        const suggestions = recipeService.getRecipesSuggestedByInventory(userId);
        res.status(StatusCodes.OK).json(suggestions);
    } catch (error) {
        console.error("Error fetching recipe suggestions:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch recipe suggestions" });
    }
});

recipeRouter.get("/:id", isAuthenticated, (req, res) => {
    try {
        const payload = (req as AuthRequest).payload;
        const userId = payload?.user?.id;
        if (!userId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
        }

        const recipeId = parseInt(req.params.id);
        if (isNaN(recipeId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid recipe ID" });
        }

        const recipe = recipeService.getRecipeById(recipeId);
        if (!recipe) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Recipe not found" });
        }

        if (recipe.user_id !== userId) {
            return res.status(StatusCodes.FORBIDDEN).json({ message: "Access denied" });
        }

        res.status(StatusCodes.OK).json(recipe);
    } catch (error) {
        console.error("Error fetching recipe:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch recipe" });
    }
});

recipeRouter.put("/:id", isAuthenticated, (req, res) => {
    try {
        const payload = (req as AuthRequest).payload;
        const userId = payload?.user?.id;
        if (!userId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
        }

        const recipeId = parseInt(req.params.id);
        if (isNaN(recipeId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid recipe ID" });
        }

        const recipe = recipeService.getRecipeById(recipeId);
        if (!recipe) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Recipe not found" });
        }

        if (recipe.user_id !== userId) {
            return res.status(StatusCodes.FORBIDDEN).json({ message: "Access denied" });
        }

        const { title, instructions } = req.body;
        recipeService.updateRecipe(recipeId, { title, instructions });

        res.status(StatusCodes.OK).json({ message: "Recipe updated successfully" });
    } catch (error) {
        console.error("Error updating recipe:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to update recipe" });
    }
});

recipeRouter.delete("/:id", isAuthenticated, (req, res) => {
    try {
        const payload = (req as AuthRequest).payload;
        const userId = payload?.user?.id;
        if (!userId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
        }

        const recipeId = parseInt(req.params.id);
        if (isNaN(recipeId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid recipe ID" });
        }

        const recipe = recipeService.getRecipeById(recipeId);
        if (!recipe) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Recipe not found" });
        }

        if (recipe.user_id !== userId) {
            return res.status(StatusCodes.FORBIDDEN).json({ message: "Access denied" });
        }

        recipeService.deleteRecipe(recipeId);
        res.status(StatusCodes.OK).json({ message: "Recipe deleted successfully" });
    } catch (error) {
        console.error("Error deleting recipe:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to delete recipe" });
    }
});

recipeRouter.post("/:id/ingredients", isAuthenticated, (req, res) => {
    try {
        const payload = (req as AuthRequest).payload;
        const userId = payload?.user?.id;
        if (!userId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
        }

        const recipeId = parseInt(req.params.id);
        if (isNaN(recipeId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid recipe ID" });
        }

        const recipe = recipeService.getRecipeById(recipeId);
        if (!recipe) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Recipe not found" });
        }

        if (recipe.user_id !== userId) {
            return res.status(StatusCodes.FORBIDDEN).json({ message: "Access denied" });
        }

        const { productId, quantity } = req.body;
        if (!productId || !quantity) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Product ID and quantity are required" });
        }

        recipeService.addIngredientToRecipe(recipeId, productId, quantity);
        res.status(StatusCodes.CREATED).json({ message: "Ingredient added successfully" });
    } catch (error) {
        console.error("Error adding ingredient:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to add ingredient" });
    }
});

recipeRouter.delete("/:id/ingredients/:productId", isAuthenticated, (req, res) => {
    try {
        const payload = (req as AuthRequest).payload;
        const userId = payload?.user?.id;
        if (!userId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
        }

        const recipeId = parseInt(req.params.id);
        const productId = parseInt(req.params.productId);

        if (isNaN(recipeId) || isNaN(productId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid ID" });
        }

        const recipe = recipeService.getRecipeById(recipeId);
        if (!recipe) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Recipe not found" });
        }

        if (recipe.user_id !== userId) {
            return res.status(StatusCodes.FORBIDDEN).json({ message: "Access denied" });
        }

        recipeService.removeIngredientFromRecipe(recipeId, productId);
        res.status(StatusCodes.OK).json({ message: "Ingredient removed successfully" });
    } catch (error) {
        console.error("Error removing ingredient:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to remove ingredient" });
    }
});

recipeRouter.put("/:id/ingredients/:productId", isAuthenticated, (req, res) => {
    try {
        const payload = (req as AuthRequest).payload;
        const userId = payload?.user?.id;
        if (!userId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
        }

        const recipeId = parseInt(req.params.id);
        const productId = parseInt(req.params.productId);

        if (isNaN(recipeId) || isNaN(productId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid ID" });
        }

        const recipe = recipeService.getRecipeById(recipeId);
        if (!recipe) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Recipe not found" });
        }

        if (recipe.user_id !== userId) {
            return res.status(StatusCodes.FORBIDDEN).json({ message: "Access denied" });
        }

        const { quantity } = req.body;
        if (!quantity) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Quantity is required" });
        }

        recipeService.updateIngredientQuantity(recipeId, productId, quantity);
        res.status(StatusCodes.OK).json({ message: "Ingredient quantity updated successfully" });
    } catch (error) {
        console.error("Error updating ingredient:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to update ingredient" });
    }
});

recipeRouter.post("/:id/shopping-list", isAuthenticated, (req, res) => {
    try {
        const payload = (req as AuthRequest).payload;
        const userId = payload?.user?.id;
        if (!userId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
        }

        const recipeId = parseInt(req.params.id);
        if (isNaN(recipeId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid recipe ID" });
        }

        const recipe = recipeService.getRecipeById(recipeId);
        if (!recipe) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Recipe not found" });
        }

        if (recipe.user_id !== userId) {
            return res.status(StatusCodes.FORBIDDEN).json({ message: "Access denied" });
        }

        recipeService.addMissingIngredientsToShoppingList(recipeId, userId);
        res.status(StatusCodes.OK).json({ message: "Missing ingredients added to shopping list" });
    } catch (error) {
        console.error("Error adding to shopping list:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to add to shopping list" });
    }
});
