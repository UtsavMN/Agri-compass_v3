export interface DiseaseDetectionResult {
  disease: string;
  confidence: number;
  description: string;
  treatment: string;
  prevention: string;
}

export class DiseaseDetector {
  private readonly HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/';
  private readonly PLANT_DISEASE_MODEL = 'microsoft/DialoGPT-medium';

  async detectDisease(): Promise<DiseaseDetectionResult> {
    try {
      throw new Error('AI Plant Disease Model is currently unavailable.');
    } catch (error) {
      console.error('Disease detection error:', error);
      return {
        disease: 'Unable to detect',
        confidence: 0,
        description: 'Plant disease detection model is currently offline. Please consult a local agricultural extension officer.',
        treatment: 'Consult a local agricultural expert or Raitha Samparka Kendra.',
        prevention: 'Regular crop monitoring and proper soil moisture management.'
      };
    }
  }

  async getDiseaseInfo(diseaseName: string): Promise<DiseaseDetectionResult | null> {
    const diseaseDatabase: { [key: string]: DiseaseDetectionResult } = {
      'leaf spot': {
        disease: 'Leaf Spot Disease',
        confidence: 1.0,
        description: 'Fungal disease causing circular spots on leaves.',
        treatment: 'Apply copper-based fungicide and remove severely affected leaves.',
        prevention: 'Improve air circulation and avoid overhead sprinkler watering.'
      },
      'powdery mildew': {
        disease: 'Powdery Mildew',
        confidence: 1.0,
        description: 'Fungal disease with white powdery growth on leaf surfaces.',
        treatment: 'Use wettable sulfur sprays and ensure proper plant spacing.',
        prevention: 'Avoid damp foliage and improve sunlight penetration.'
      },
      'blight': {
        disease: 'Late Blight',
        confidence: 1.0,
        description: 'Serious fungal infection affecting solanaceous crops like potatoes and tomatoes.',
        treatment: 'Remove infected plants immediately and apply recommended fungicide.',
        prevention: 'Use certified disease-free seeds and implement 3-year crop rotation.'
      }
    };

    return diseaseDatabase[diseaseName.toLowerCase()] || null;
  }
}

export const diseaseDetector = new DiseaseDetector();
