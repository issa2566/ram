/**
 * VehicleModel Controller
 * Handles HTTP requests for vehicle models
 */

const VehicleModel = require('../models/VehicleModel');

class VehicleModelController {
  /**
   * Get all models for a specific marque
   * GET /api/vehicleModels/:marque
   */
  static async getModelsByMarque(req, res) {
    try {
      const { marque } = req.params;
      
      if (!marque) {
        return res.status(400).json({
          success: false,
          message: 'Marque parameter is required'
        });
      }

      const decodedMarque = decodeURIComponent(marque);
      const models = await VehicleModel.findByMarque(decodedMarque);
      
      res.status(200).json({
        success: true,
        count: models.length,
        marque: decodedMarque,
        data: models
      });
    } catch (error) {
      console.error('Error getting models by marque:', error.message);
      res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }
  }

  /**
   * Get all vehicle models
   * GET /api/vehicleModels
   */
  static async getAll(req, res) {
    try {
      const models = await VehicleModel.findAll();
      
      res.status(200).json({
        success: true,
        count: models.length,
        data: models
      });
    } catch (error) {
      console.error('Error getting all models:', error.message);
      res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }
  }

  /**
   * Get a vehicle model by ID
   * GET /api/vehicleModels/id/:id
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const model = await VehicleModel.findById(id);
      
      if (!model) {
        return res.status(404).json({
          success: false,
          message: 'Modèle non trouvé'
        });
      }
      
      res.status(200).json({
        success: true,
        data: model
      });
    } catch (error) {
      console.error('Error getting model by ID:', error.message);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur',
        error: error.message
      });
    }
  }

  /**
   * Create a new vehicle model
   * POST /api/vehicleModels
   */
  static async create(req, res) {
    try {
      const { marque, model, description, image } = req.body;
      
      // Validation
      if (!marque || !marque.trim()) {
        return res.status(400).json({
          success: false,
          message: 'La marque est requise'
        });
      }
      
      if (!model || !model.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Le modèle est requis'
        });
      }

      const newModel = await VehicleModel.create({
        marque: marque.trim(),
        model: model.trim(),
        description: description?.trim() || null,
        image: image || null
      });
      
      res.status(201).json({
        success: true,
        message: 'Modèle ajouté avec succès !',
        data: newModel
      });
    } catch (error) {
      console.error('Error creating vehicle model:', error.message);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création du modèle',
        error: error.message
      });
    }
  }

  /**
   * Update a vehicle model
   * PUT /api/vehicleModels/:id
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { model, description, image } = req.body;
      
      const existingModel = await VehicleModel.findById(id);
      if (!existingModel) {
        return res.status(404).json({
          success: false,
          message: 'Modèle non trouvé'
        });
      }

      const updatedModel = await VehicleModel.update(id, {
        model: model?.trim(),
        description: description?.trim(),
        image
      });
      
      res.status(200).json({
        success: true,
        message: 'Modèle mis à jour avec succès',
        data: updatedModel
      });
    } catch (error) {
      console.error('Error updating vehicle model:', error.message);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour',
        error: error.message
      });
    }
  }

  /**
   * Delete a vehicle model
   * DELETE /api/vehicleModels/:id
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      
      const existingModel = await VehicleModel.findById(id);
      if (!existingModel) {
        return res.status(404).json({
          success: false,
          message: 'Modèle non trouvé'
        });
      }

      const deletedModel = await VehicleModel.delete(id);
      
      res.status(200).json({
        success: true,
        message: 'Modèle supprimé avec succès',
        data: {
          id: deletedModel.id,
          model: deletedModel.model
        }
      });
    } catch (error) {
      console.error('Error deleting vehicle model:', error.message);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression',
        error: error.message
      });
    }
  }
}

module.exports = VehicleModelController;

